"use client";

import { useEffect, useRef } from "react";
import type { JSX } from "react";

/* ── SceneDepth — the far side of the water strip ──────────────────────
   Pixel islands sit on the horizon, and the one at 82% carries a
   lighthouse whose beam sweeps the sky every six seconds. Two layers lean
   with the pointer (or drift slowly on touch) for depth. Fireflies hover
   over the water, a fish leaps now and then, and a shooting star crosses
   the sky. Everything is drawn low-res and hard-edged; reduced motion gets
   one still frame. ───────────────────────────────────────────────────── */

type Pt = [number, number];

/** One canvas pixel = 3 CSS px, so every dot is a hard square. */
const PX = 3;
/** Water line, as a fraction of the strip height from the top. */
const HORIZON = 0.45;
/** Throttle to ~30fps (a hair under, so 60Hz rAF ticks still land). */
const FRAME_MS = 1000 / 30 - 2;
/** Parallax travel in CSS px, and the bleed each side it needs. */
const FAR_SHIFT = 4;
const NEAR_SHIFT = 10;
const BLEED = NEAR_SHIFT + 2;
/** Keep the centre of the strip clear so the sun's reflection path reads. */
const CLEAR_FROM = 0.35;
const CLEAR_TO = 0.65;
/** The lighthouse stands on the near island at this fraction of the width. */
const LIGHTHOUSE_AT = 0.82;

const GOLD = "#FFD447";
const AMBER = "#EAAA22";
const CREAM = "#FFF9E8";
const WARM_BLACK = "#080909";
const DEEP = "#0a2c40";
const RIM = "#12405a";
const TEAL = "#2f6f86";
const MIST = "#5fa3b8";

/** An island on the horizon: centre and half-width as fractions of the strip
    width, and peak height as a fraction of the strip height. */
type Island = { c: number; w: number; h: number };

/** Farthest chain: dimmest, bluest, lowest. */
const FAR_ISLANDS: Island[] = [
  { c: 0.03, w: 0.06, h: 0.08 },
  { c: 0.12, w: 0.05, h: 0.05 },
  { c: 0.22, w: 0.07, h: 0.07 },
  { c: 0.71, w: 0.05, h: 0.06 },
  { c: 0.9, w: 0.07, h: 0.09 },
  { c: 0.98, w: 0.05, h: 0.06 },
];

/** Nearer chain: warm black with a teal rim on the top edge. */
const NEAR_ISLANDS: Island[] = [
  { c: 0.07, w: 0.08, h: 0.1 },
  { c: 0.19, w: 0.06, h: 0.06 },
  { c: LIGHTHOUSE_AT, w: 0.07, h: 0.06 },
  { c: 0.94, w: 0.05, h: 0.08 },
];

type Geo = {
  W: number;
  H: number;
  horizon: number;
  lx: number;
  lampY: number;
  farCache: HTMLCanvasElement;
  nearCache: HTMLCanvasElement;
};

type Firefly = { x: number; lift: number; ph: number; period: number; big: boolean };
type Fish = { t0: number; dur: number; x0: number; dir: 1 | -1 };
type Splash = { t0: number; x: number };
type Star = { t0: number; x0: number; y0: number; len: number; dur: number };

const rand = (a: number, b: number) => a + Math.random() * (b - a);

const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

function makeCanvas(W: number, H: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  return c;
}

function makeFireflies(): Firefly[] {
  const n = 6 + Math.floor(Math.random() * 5); // 6–10
  return Array.from({ length: n }, (_, i) => ({
    x: rand(0.04, 0.96),
    lift: rand(0.04, 0.22),
    ph: rand(0, Math.PI * 2),
    period: rand(3.5, 6.5),
    big: i % 3 === 0,
  }));
}

/** Column heights (in canvas rows) for a chain of islands, with the centre
    of the strip left empty. */
function islandRows(islands: Island[], W: number, H: number): Int16Array {
  const rows = new Int16Array(W);
  for (let x = 0; x < W; x++) {
    const f = (x + 0.5) / W;
    if (f > CLEAR_FROM && f < CLEAR_TO) continue;
    let top = 0;
    for (const isl of islands) {
      const d = Math.abs(f - isl.c) / isl.w;
      if (d < 1) top = Math.max(top, Math.round(isl.h * H * Math.sqrt(1 - d * d)));
    }
    rows[x] = top;
  }
  return rows;
}

/** Paint a chain of islands so each one sits on the horizon line. */
function paintIslands(
  ctx: CanvasRenderingContext2D,
  rows: Int16Array,
  horizon: number,
  body: string,
  rim: string | null,
) {
  ctx.fillStyle = body;
  for (let x = 0; x < rows.length; x++) {
    const h = rows[x];
    if (h > 0) ctx.fillRect(x, horizon - h, 1, h);
  }
  if (rim) {
    ctx.fillStyle = rim;
    for (let x = 0; x < rows.length; x++) {
      const h = rows[x];
      if (h > 0) ctx.fillRect(x, horizon - h, 1, 1);
    }
  }
}

/** Scanline-fill a triangle with hard pixel spans (no anti-aliasing). */
function fillTriangle(ctx: CanvasRenderingContext2D, p: [Pt, Pt, Pt], W: number, H: number) {
  const minY = Math.max(0, Math.floor(Math.min(p[0][1], p[1][1], p[2][1])));
  const maxY = Math.min(H - 1, Math.ceil(Math.max(p[0][1], p[1][1], p[2][1])));
  for (let y = minY; y <= maxY; y++) {
    const sy = y + 0.5;
    let xmin = Infinity;
    let xmax = -Infinity;
    for (let i = 0; i < 3; i++) {
      const [x1, y1] = p[i];
      const [x2, y2] = p[(i + 1) % 3];
      if ((y1 <= sy && y2 > sy) || (y2 <= sy && y1 > sy)) {
        const x = x1 + ((sy - y1) * (x2 - x1)) / (y2 - y1);
        xmin = Math.min(xmin, x);
        xmax = Math.max(xmax, x);
      }
    }
    if (xmin <= xmax) {
      const a = Math.max(0, Math.floor(xmin));
      const b = Math.min(W, Math.ceil(xmax));
      if (b > a) ctx.fillRect(a, y, b - a, 1);
    }
  }
}

export function SceneDepth({
  reducedMotion,
  paused = false,
}: {
  reducedMotion: boolean;
  /** True while the strip is faded out: the loop sleeps on a still-current frame. */
  paused?: boolean;
}): JSX.Element {
  const rootRef = useRef<HTMLDivElement>(null);
  const farRef = useRef<HTMLCanvasElement>(null);
  const nearRef = useRef<HTMLCanvasElement>(null);
  // Props are read through refs, so the loop never restarts on a prop change.
  const reducedRef = useRef(reducedMotion);
  const pausedRef = useRef(paused);
  const syncRef = useRef<() => void>(() => {});

  useEffect(() => {
    reducedRef.current = reducedMotion;
    pausedRef.current = paused;
    syncRef.current();
  }, [reducedMotion, paused]);

  useEffect(() => {
    const root = rootRef.current;
    const farCv = farRef.current;
    const nearCv = nearRef.current;
    if (!root || !farCv || !nearCv) return;
    const farCtx = farCv.getContext("2d");
    const nearCtx = nearCv.getContext("2d");
    if (!farCtx || !nearCtx) return;

    const coarse = window.matchMedia("(pointer: coarse)").matches;

    let geo: Geo | null = null;
    let raf = 0;
    let last = -Infinity;
    let onScreen = true;
    let mouseX = 0; // -1 (left edge of window) … 1 (right edge)
    let parFar = 0;
    let parNear = 0;

    const fireflies = makeFireflies();
    let fish: Fish | null = null;
    let splash: Splash | null = null;
    let star: Star | null = null;
    let nextFishAt = -1;
    let nextStarAt = -1;

    const build = () => {
      const cw = root.clientWidth;
      const ch = root.clientHeight;
      if (!cw || !ch) return;
      const W = Math.ceil((cw + BLEED * 2) / PX);
      const H = Math.ceil(ch / PX);
      const cssW = W * PX;
      const cssH = H * PX;
      for (const cv of [farCv, nearCv]) {
        cv.width = W;
        cv.height = H;
        cv.style.width = `${cssW}px`;
        cv.style.height = `${cssH}px`;
        cv.style.left = `${(cw - cssW) / 2}px`;
        cv.style.top = `${ch - cssH}px`;
      }
      farCtx.imageSmoothingEnabled = false;
      nearCtx.imageSmoothingEnabled = false;

      const horizon = Math.round(HORIZON * H);
      const farCache = makeCanvas(W, H);
      const nearCache = makeCanvas(W, H);
      const fc = farCache.getContext("2d");
      const nc = nearCache.getContext("2d");
      if (!fc || !nc) return;
      paintIslands(fc, islandRows(FAR_ISLANDS, W, H), horizon, DEEP, null);
      const nearRows = islandRows(NEAR_ISLANDS, W, H);
      paintIslands(nc, nearRows, horizon, WARM_BLACK, RIM);

      // Lighthouse: a six-row tower with a gallery, standing on the island.
      const lx = Math.min(W - 1, Math.floor(LIGHTHOUSE_AT * W));
      const top = horizon - nearRows[lx];
      nc.fillStyle = RIM;
      nc.fillRect(lx - 1, top - 7, 3, 1);
      nc.fillRect(lx, top - 6, 1, 6);

      geo = { W, H, horizon, lx, lampY: top - 8, farCache, nearCache };
    };

    const place = () => {
      farCv.style.transform = `translate3d(${parFar.toFixed(2)}px, 0, 0)`;
      nearCv.style.transform = `translate3d(${parNear.toFixed(2)}px, 0, 0)`;
    };

    /** Draw one frame. `still` is the reduced-motion frame: silhouettes and
        the lamp only, no parallax, beam, fish, stars or fireflies. */
    const render = (now: number, still: boolean) => {
      if (!geo) return;
      const { W, H, horizon, lx, lampY } = geo;
      const t = now / 1000;

      // Parallax: eased toward the pointer, or a slow drift on touch screens.
      if (still) {
        parFar = 0;
        parNear = 0;
      } else {
        const tf = coarse ? Math.sin((t * 2 * Math.PI) / 40) * FAR_SHIFT : mouseX * FAR_SHIFT;
        const tn = coarse ? Math.sin((t * 2 * Math.PI) / 52) * NEAR_SHIFT : mouseX * NEAR_SHIFT;
        parFar += (tf - parFar) * 0.08;
        parNear += (tn - parNear) * 0.08;
      }
      place();

      // Far layer: silhouettes, then a shooting star across the sky.
      farCtx.globalAlpha = 1;
      farCtx.clearRect(0, 0, W, H);
      farCtx.drawImage(geo.farCache, 0, 0);
      if (!still) {
        if (nextStarAt < 0) nextStarAt = t + rand(12, 20);
        if (!star && t >= nextStarAt) {
          star = { t0: t, x0: rand(0.1, 0.8) * W, y0: rand(0.03, 0.1) * H, len: 0.12 * W, dur: 0.9 };
          nextStarAt = t + rand(12, 20);
        }
        const s = star;
        if (s) {
          const u = (t - s.t0) / s.dur;
          if (u >= 1) {
            star = null;
          } else {
            const hx = s.x0 + u * s.len;
            const hy = s.y0 + u * s.len * 0.35;
            farCtx.fillStyle = CREAM;
            for (let i = 0; i < 7; i++) {
              farCtx.globalAlpha = (1 - i / 7) * 0.9;
              farCtx.fillRect(Math.round(hx - i), Math.round(hy - i * 0.35), 1, 1);
            }
            farCtx.globalAlpha = 1;
          }
        }
      }

      // Near layer: silhouettes, beam, lamp, then the life on the water.
      nearCtx.globalAlpha = 1;
      nearCtx.clearRect(0, 0, W, H);
      nearCtx.drawImage(geo.nearCache, 0, 0);

      if (!still) {
        // The lamp turns, so from the shore its beam sweeps sideways along the
        // horizon: it reaches out to one side, shrinks as it swings toward
        // you (the lamp flares), then reaches out the other way.
        const turn = Math.cos((t * 2 * Math.PI) / 6);
        const len = W * 0.2 * Math.abs(turn);
        if (len > 2) {
          const dir = turn >= 0 ? 1 : -1;
          const ox = lx + 0.5;
          const oy = lampY + 0.5;
          const spread = Math.max(1, len * 0.07);
          const tipY = oy - len * 0.03;
          nearCtx.fillStyle = `rgba(255, 212, 71, ${(0.05 + 0.08 * Math.abs(turn)).toFixed(3)})`;
          fillTriangle(
            nearCtx,
            [
              [ox, oy],
              [ox + dir * len, Math.min(horizon - 1, tipY + spread)],
              [ox + dir * len, tipY - spread],
            ],
            W,
            H,
          );
        }
      }

      // Lamp: a soft gold halo that breathes, with a cream core.
      // brightest when the turning lamp faces the viewer
      const facing = still ? 0 : 1 - Math.abs(Math.cos((t * 2 * Math.PI) / 6));
      const breathe = still ? 0.7 : Math.min(1, 0.55 + 0.6 * facing * facing);
      nearCtx.fillStyle = `rgba(255, 212, 71, ${(0.16 * breathe).toFixed(3)})`;
      nearCtx.fillRect(lx - 1, lampY - 1, 3, 3);
      nearCtx.fillStyle = `rgba(255, 212, 71, ${(0.55 * breathe + 0.2).toFixed(3)})`;
      nearCtx.fillRect(lx - 1, lampY, 3, 1);
      nearCtx.fillRect(lx, lampY - 1, 1, 3);
      nearCtx.fillStyle = CREAM;
      nearCtx.fillRect(lx, lampY, 1, 1);

      if (still) return;

      // Fireflies: slow drift just above the water, each blinking on and off.
      for (const f of fireflies) {
        const s = 0.5 + 0.5 * Math.sin((t * 2 * Math.PI) / f.period + f.ph);
        const a = smooth(0.35, 0.95, s);
        if (a < 0.02) continue;
        const x = Math.round((f.x + Math.sin(t * 0.09 + f.ph) * 0.025) * W);
        const y = Math.round(horizon - f.lift * H + Math.sin(t * 0.21 + f.ph * 1.3) * 1.2);
        nearCtx.globalAlpha = a;
        nearCtx.fillStyle = GOLD;
        nearCtx.fillRect(x, y, 1, 1);
        if (f.big) {
          nearCtx.globalAlpha = a * 0.35;
          nearCtx.fillStyle = AMBER;
          nearCtx.fillRect(x + 1, y, 1, 1);
        }
      }
      nearCtx.globalAlpha = 1;

      // A fish leaps on a parabola, its tangent setting the head direction.
      if (!fish && nextFishAt < 0) nextFishAt = t + rand(8, 15);
      if (!fish && t >= nextFishAt) {
        const x0 = Math.random() < 0.5 ? rand(0.15, 0.4) : rand(0.6, 0.88);
        const dur = rand(1.4, 1.8);
        fish = { t0: t, dur, x0, dir: x0 < 0.5 ? 1 : -1 };
        nextFishAt = t + dur + rand(8, 15);
      }
      const fs = fish;
      if (fs) {
        const u = (t - fs.t0) / fs.dur;
        if (u >= 1) {
          splash = { t0: t, x: Math.round((fs.x0 + fs.dir * 0.08) * W) };
          fish = null;
        } else {
          const span = fs.dir * 0.08 * W;
          const peak = 0.25 * H;
          const x = fs.x0 * W + span * u;
          const y = horizon - 1 - 4 * peak * u * (1 - u);
          const dxdu = span;
          const dydu = -4 * peak * (1 - 2 * u);
          const len = Math.hypot(dxdu, dydu) || 1;
          const vx = dxdu / len;
          const vy = dydu / len;
          nearCtx.fillStyle = GOLD;
          nearCtx.fillRect(Math.round(x + vx * 1.5), Math.round(y + vy * 1.5), 1, 1);
          nearCtx.fillStyle = AMBER;
          nearCtx.fillRect(Math.round(x), Math.round(y), 1, 1);
          nearCtx.fillRect(Math.round(x - vx * 1.5), Math.round(y - vy * 1.5), 1, 1);
        }
      }

      // Three-pixel splash where the fish comes back down.
      const sp = splash;
      if (sp) {
        const p = (t - sp.t0) / 0.5;
        if (p >= 1) {
          splash = null;
        } else {
          const f = Math.floor(p * 3);
          const pts: [number, number, string, number][] =
            f === 0
              ? [
                  [-1, -1, MIST, 1],
                  [0, -2, MIST, 1],
                  [1, -1, MIST, 1],
                ]
              : f === 1
                ? [
                    [-2, 0, MIST, 0.9],
                    [0, -1, MIST, 0.9],
                    [2, 0, MIST, 0.9],
                  ]
                : [
                    [-3, 1, MIST, 0.5],
                    [0, 0, TEAL, 0.6],
                    [3, 1, MIST, 0.5],
                  ];
          for (const [dx, dy, color, a] of pts) {
            nearCtx.globalAlpha = a;
            nearCtx.fillStyle = color;
            nearCtx.fillRect(sp.x + dx, horizon + dy, 1, 1);
          }
          nearCtx.globalAlpha = 1;
        }
      }
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < FRAME_MS) return;
      last = now;
      render(now, false);
    };

    const start = () => {
      if (raf) return;
      last = -Infinity;
      raf = requestAnimationFrame(loop);
    };

    const stop = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    /** Decide between the live loop, the still frame, or nothing at all. */
    const sync = () => {
      if (!geo) build();
      if (!geo) return;
      if (reducedRef.current) {
        stop();
        render(performance.now(), true);
        return;
      }
      if (pausedRef.current) {
        // parked while hidden, but with a current frame ready for the fade-in
        stop();
        render(performance.now(), false);
        return;
      }
      if (onScreen && document.visibilityState === "visible") start();
      else stop();
    };
    syncRef.current = sync;

    const onMove = (e: MouseEvent) => {
      mouseX = Math.max(-1, Math.min(1, (e.clientX / window.innerWidth) * 2 - 1));
    };
    const ro = new ResizeObserver(() => {
      build();
      sync();
    });
    ro.observe(root);
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    io.observe(root);
    document.addEventListener("visibilitychange", sync);
    if (!coarse) window.addEventListener("mousemove", onMove, { passive: true });

    sync();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("mousemove", onMove);
      syncRef.current = () => {};
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}
    >
      <canvas
        ref={farRef}
        style={{ position: "absolute", imageRendering: "pixelated", willChange: "transform" }}
      />
      <canvas
        ref={nearRef}
        style={{ position: "absolute", imageRendering: "pixelated", willChange: "transform" }}
      />
    </div>
  );
}
