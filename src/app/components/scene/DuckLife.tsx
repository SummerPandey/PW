"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

/* ────────────────────────────────────────────────────────────────────
   DuckLife.tsx — the duck's little bits of body language.

   useDuckBody: a damped spring leans the duck into its direction of
   travel, a small idle wiggle or hop breaks up the stillness, and
   bump() gives a squash-and-stretch hop. It writes the transform
   straight onto `target` (give it transform-origin at the feet), so the
   springing never re-renders the component that owns the duck.

   DuckFx: pixel droplets thrown off the water, and a "quack!" speech
   bubble above the duck's head.
   ──────────────────────────────────────────────────────────────────── */

/* ── Body motion ────────────────────────────────────────────────────── */

const LEAN_GAIN = 14; // degrees of lean per %/frame of velocity
const MAX_LEAN = 8; // never lean further than this
const WIGGLE_DEG = 3; // head-tilt wiggle amplitude

type Spring = { x: number; v: number };

/** One semi-implicit Euler step of a damped spring pulled toward `target`. */
function stepSpring(s: Spring, target: number, k: number, c: number, dt: number) {
  s.v += (k * (target - s.x) - c * s.v) * dt;
  s.x += s.v * dt;
}

const atRest = (s: Spring, target: number) => Math.abs(s.x - target) < 0.002 && Math.abs(s.v) < 0.01;

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Compose the duck's transform. Identity parts are dropped, so rest is "none". */
function buildTransform(rot: number, hop: number, sx: number, sy: number): string {
  const parts: string[] = [];
  if (round2(hop) !== 0) parts.push(`translateY(${round2(hop)}px)`);
  if (round2(rot) !== 0) parts.push(`rotate(${round2(rot)}deg)`);
  if (round2(sx) !== 1 || round2(sy) !== 1) parts.push(`scale(${round2(sx)}, ${round2(sy)})`);
  return parts.length ? parts.join(" ") : "none";
}

type DuckBodyApi = { wake: () => void; bump: () => void };

/**
 * Duck body motion. `vel` is signed % per frame (positive = moving right).
 * One rAF loop runs only while something is moving or animating, and pauses
 * while the tab is hidden. The element's style is only touched when the
 * rounded transform actually changes.
 */
export function useDuckBody({
  vel,
  reducedMotion,
  target,
}: {
  vel: number;
  reducedMotion: boolean;
  target: RefObject<HTMLElement | null>;
}): { bump: () => void } {
  const velRef = useRef(vel);
  const apiRef = useRef<DuckBodyApi | null>(null);

  const bump = useCallback(() => apiRef.current?.bump(), []);

  // The loop, the idle timer and the springs. Torn down on unmount or when
  // reduced motion turns on.
  useEffect(() => {
    if (reducedMotion) {
      if (target.current) target.current.style.transform = "none";
      return;
    }

    const tilt: Spring = { x: 0, v: 0 };
    const sx: Spring = { x: 1, v: 0 };
    const sy: Spring = { x: 1, v: 0 };
    const hop: Spring = { x: 0, v: 0 };
    let bumpT = -1; // ms since bump() started, -1 when idle
    let wiggleT = -1; // seconds since the idle wiggle started, -1 when idle
    let lastStr: string | null = null; // null forces the first frame to publish
    let raf: number | null = null;
    let last = 0;
    let idleId: number | undefined;

    const tick = (ts: number) => {
      raf = null;
      if (document.hidden) return; // visibilitychange wakes the loop again
      const dt = last ? Math.min(0.034, (ts - last) / 1000) : 1 / 60;
      last = ts;

      // Lean into the direction of travel, spring-smoothed.
      const lean = Math.max(-MAX_LEAN, Math.min(MAX_LEAN, velRef.current * LEAN_GAIN));
      stepSpring(tilt, lean, 120, 15, dt);

      // Squash (1.12, 0.88) → stretch (0.94, 1.08) → settle to (1, 1).
      let sxT = 1;
      let syT = 1;
      if (bumpT >= 0) {
        bumpT += dt * 1000;
        if (bumpT < 110) {
          sxT = 1.12;
          syT = 0.88;
        } else if (bumpT < 220) {
          sxT = 0.94;
          syT = 1.08;
        }
      }
      stepSpring(sx, sxT, 260, 16, dt);
      stepSpring(sy, syT, 260, 16, dt);
      if (bumpT >= 0 && ((bumpT >= 220 && atRest(sx, 1) && atRest(sy, 1)) || bumpT > 1500)) bumpT = -1;

      // Idle head-tilt wiggle: a decaying sine on top of the lean.
      let wig = 0;
      if (wiggleT >= 0) {
        wiggleT += dt;
        wig = WIGGLE_DEG * Math.exp(-wiggleT * 4.5) * Math.sin(wiggleT * Math.PI * 2 * 3);
        if (wiggleT > 1.2) {
          wiggleT = -1;
          wig = 0;
        }
      }

      // Idle hop: a small spring bounce up and back.
      stepSpring(hop, 0, 320, 14, dt);

      const str = buildTransform(tilt.x + wig, hop.x, sx.x, sy.x);
      if (str !== lastStr) {
        lastStr = str;
        if (target.current) target.current.style.transform = str;
      }

      const settled =
        bumpT < 0 &&
        wiggleT < 0 &&
        atRest(tilt, lean) &&
        atRest(hop, 0) &&
        atRest(sx, 1) &&
        atRest(sy, 1);
      if (!settled) raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (raf === null && !document.hidden) raf = requestAnimationFrame(tick);
    };

    const bumpNow = () => {
      bumpT = 0;
      wake();
    };

    // Every 3–6 s, if the duck is still, do one small thing.
    const idle = () => {
      if (Math.abs(velRef.current) > 0.02) return;
      if (Math.random() < 0.5) wiggleT = 0;
      else hop.v = -55;
      wake();
    };
    const scheduleIdle = () => {
      idleId = window.setTimeout(() => {
        idle();
        scheduleIdle();
      }, 3000 + Math.random() * 3000);
    };
    scheduleIdle();

    const onVisibility = () => wake();
    document.addEventListener("visibilitychange", onVisibility);

    apiRef.current = { wake, bump: bumpNow };
    wake();

    return () => {
      apiRef.current = null;
      if (raf !== null) cancelAnimationFrame(raf);
      window.clearTimeout(idleId);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reducedMotion, target]);

  // Velocity changes wake the loop so the lean follows the duck.
  useEffect(() => {
    velRef.current = vel;
    apiRef.current?.wake();
  }, [vel]);

  return { bump };
}

/* ── Overlay effects ────────────────────────────────────────────────── */

const WATERLINE = 0.76; // duck waterline, as a fraction of strip height
const CANVAS_PX = 3; // one canvas pixel = 3 CSS px (pixel-art buffer)
const GRAVITY = 330; // canvas px per second²
const BUBBLE_MS = 1200;
const DROP_COLORS = ["#FFF9E8", "#FFF9E8", "#5fa3b8"]; // cream + teal highlight

type Drop = { x: number; y: number; vx: number; vy: number; life: number; s: number; color: string };

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Effects over the water strip: pixel droplets (a splash burst on `splash`,
 * occasional flicks off the back of the duck while it's moving), and a
 * "quack!" speech bubble on each `quack` increment.
 */
export function DuckFx({
  duckX,
  vel,
  quack,
  splash,
  reducedMotion,
}: {
  duckX: number;
  vel: number;
  quack: number;
  splash: number;
  reducedMotion: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropsRef = useRef<Drop[]>([]);
  const latestRef = useRef({ duckX, vel, reducedMotion });
  const wakeRef = useRef<() => void>(() => {});
  const prevQuack = useRef(quack);
  const prevSplash = useRef(splash);
  const [bubbleKey, setBubbleKey] = useState<number | null>(null);
  const hideBubble = useCallback(() => setBubbleKey(null), []);

  // Latest props, read by the rAF loop and the one-off effects below.
  useEffect(() => {
    latestRef.current = { duckX, vel, reducedMotion };
    wakeRef.current();
  }, [duckX, vel, reducedMotion]);

  // Pixel buffer follows the strip's size.
  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      canvas.width = Math.max(1, Math.round(width / CANVAS_PX));
      canvas.height = Math.max(1, Math.round(height / CANVAS_PX));
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, []);

  // Splash: a burst of 8–14 droplets from the waterline under the duck.
  useEffect(() => {
    if (splash === prevSplash.current) return;
    prevSplash.current = splash;
    const canvas = canvasRef.current;
    if (!canvas || latestRef.current.reducedMotion) return;
    const cx = (latestRef.current.duckX / 100) * canvas.width;
    const waterY = WATERLINE * canvas.height;
    const n = 8 + Math.floor(Math.random() * 7);
    for (let i = 0; i < n; i++) {
      dropsRef.current.push({
        x: cx + (Math.random() - 0.5) * 8,
        y: waterY,
        vx: (Math.random() - 0.5) * 90,
        vy: -(100 + Math.random() * 60),
        life: 1.1 + Math.random() * 0.4,
        s: Math.random() < 0.3 ? 2 : 1,
        color: pick(DROP_COLORS),
      });
    }
    wakeRef.current();
  }, [splash]);

  // Quack: a new bubble, keyed by the counter so each one animates fresh.
  useEffect(() => {
    if (quack === prevQuack.current) return;
    prevQuack.current = quack;
    setBubbleKey(quack);
  }, [quack]);

  // The pixel loop. Runs only while the strip is on screen and the tab is visible.
  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!root || !canvas || !ctx) return;

    if (reducedMotion) {
      dropsRef.current = [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    let raf: number | null = null;
    let last = 0;
    let onScreen = true;
    let dirty = false;

    const tick = (ts: number) => {
      raf = null;
      if (document.hidden || !onScreen) return;
      const dt = last ? Math.min(0.05, (ts - last) / 1000) : 1 / 60;
      last = ts;

      const { duckX: x, vel: v } = latestRef.current;
      const drops = dropsRef.current;
      const W = canvas.width;
      const H = canvas.height;
      const waterY = WATERLINE * H;

      // While the duck is really moving, now and then flick a droplet off its back.
      if (Math.abs(v) > 0.4 && Math.random() < 0.035) {
        const dir = v > 0 ? 1 : -1;
        const cx = (x / 100) * W;
        const n = Math.random() < 0.4 ? 2 : 1;
        for (let i = 0; i < n; i++) {
          drops.push({
            x: cx - dir * 5,
            y: waterY - 2,
            vx: -dir * (35 + Math.random() * 35),
            vy: -(70 + Math.random() * 50),
            life: 0.7,
            s: 1,
            color: pick(DROP_COLORS),
          });
        }
      }

      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.vy += GRAVITY * dt;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.life -= dt;
        if (d.life <= 0 || (d.vy > 0 && d.y >= waterY)) drops.splice(i, 1);
      }

      // Only touch the canvas when there is something to draw or clear.
      if (drops.length || dirty) {
        ctx.clearRect(0, 0, W, H);
        ctx.imageSmoothingEnabled = false;
        for (const d of drops) {
          ctx.fillStyle = d.color;
          ctx.fillRect(Math.round(d.x), Math.round(d.y), d.s, d.s);
        }
        dirty = drops.length > 0;
      }

      // Nothing in the air and the duck too slow to flick any: sleep until
      // a splash or a change of speed wakes the loop again.
      if (!drops.length && !dirty && Math.abs(v) <= 0.4) return;
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (raf === null && !document.hidden && onScreen) {
        last = 0;
        raf = requestAnimationFrame(tick);
      }
    };

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) start();
    });
    io.observe(root);

    const onVisibility = () => start();
    document.addEventListener("visibilitychange", onVisibility);

    wakeRef.current = start;
    start();
    return () => {
      wakeRef.current = () => {};
      if (raf !== null) cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reducedMotion]);

  return (
    <div ref={rootRef} aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          imageRendering: "pixelated",
        }}
      />
      {bubbleKey !== null && (
        <QuackBubble key={bubbleKey} duckX={duckX} reducedMotion={reducedMotion} onDone={hideBubble} />
      )}
    </div>
  );
}

/** A pixel-style speech bubble above the duck's head. Pops in, floats up, fades out. */
function QuackBubble({
  duckX,
  reducedMotion,
  onDone,
}: {
  duckX: number;
  reducedMotion: boolean;
  onDone: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    let anim: Animation | null = null;
    if (el && !reducedMotion && typeof el.animate === "function") {
      const frames: Keyframe[] = [
        { transform: "translateY(4px) scale(0.5)", opacity: 0 },
        { transform: "translateY(0) scale(1.12)", opacity: 1, offset: 0.15 },
        { transform: "translateY(0) scale(1)", opacity: 1, offset: 0.25 },
        { transform: "translateY(-3px) scale(1)", opacity: 1, offset: 0.7 },
        { transform: "translateY(-6px) scale(1)", opacity: 0 },
      ];
      anim = el.animate(frames, { duration: BUBBLE_MS, easing: "ease-out", fill: "forwards" });
    }
    const t = window.setTimeout(onDone, BUBBLE_MS);
    return () => {
      window.clearTimeout(t);
      anim?.cancel();
    };
  }, [reducedMotion, onDone]);

  return (
    <div
      style={{
        position: "absolute",
        left: `${duckX}%`,
        // just above the duck's head (and its "ask me something" tag): the
        // duck is min(190px, 38vw) wide and its art stands ~0.87× that tall
        bottom: "calc(24% + min(190px, 38vw) * 0.87 + 6px)",
        transform: "translateX(-50%)",
        pointerEvents: "none",
      }}
    >
      <div
        ref={ref}
        style={{
          position: "relative",
          opacity: reducedMotion ? 1 : 0,
          background: "#FFF9E8",
          color: "#080909",
          border: "2px solid #080909",
          borderRadius: 0,
          padding: "4px 9px 5px",
          fontFamily: "var(--font-quicksand), 'Quicksand', sans-serif",
          fontSize: 11,
          fontWeight: 700,
          lineHeight: 1.2,
          whiteSpace: "nowrap",
        }}
      >
        quack!
        {/* little tail, pointing down at the duck */}
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: "50%",
            bottom: -6,
            width: 8,
            height: 8,
            boxSizing: "border-box",
            background: "#FFF9E8",
            borderRight: "2px solid #080909",
            borderBottom: "2px solid #080909",
            transform: "translateX(-50%) rotate(45deg)",
          }}
        />
      </div>
    </div>
  );
}
