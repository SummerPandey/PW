"use client";

import { useEffect, useRef } from "react";

/* ────────────────────────────────────────────────────────────────────
   PixelWater — the night water under the Welcome panel.

   A low-res pixel canvas (1 canvas px = 3 CSS px, hard edges). Navy
   water in hard bands with an uneven teal crest on the horizon, teal
   glints drifting in perspective rows, a gold sunlight path, a V-wake
   behind the duck while it moves (a soft ring when it floats still),
   and ripple rings whenever it splashes. The background is pre-drawn
   on resize; only the moving parts are painted each frame.
   ──────────────────────────────────────────────────────────────────── */

type WaterProps = {
  duckX: number; // 0..100, duck's horizontal position in %
  duckVel: number; // signed, % per frame (smoothed)
  splash: number; // counter; each increment spawns a ripple ring at duckX
  reducedMotion: boolean;
};

const HORIZON = 0.45;
const WATERLINE = 0.76;
const CELL = 3; // one canvas pixel = 3 CSS px
const FRAME_MS = 1000 / 30 - 2; // ~30fps; the slack keeps a 60Hz screen from skipping to 24fps
const MAX_DT = 0.1; // seconds; keeps motion calm after a tab switch
const STATIC_TIME = 6; // frozen moment used for reduced motion
const SLOPE = 0.4; // wake arm slope (rows per column)
const MOVE_EPS = 0.05; // |duckVel| above this leaves a wake
const WAKE_EVERY = 0.18; // seconds between wake emissions while moving
const WAKE_LIFE = 1.5;
const MAX_WAKES = 16;
const RING_LIFE = 1.2;
const STILL_RING_LIFE = 1.6;
const STILL_RING_EVERY = 2.4;
const MAX_RINGS = 6;

// Palette (brief): night water, teal highlights, sunlight gold, cream.
const NIGHT_0 = "#04131c";
const NIGHT_1 = "#062030";
const NIGHT_2 = "#0a2c40";
const NIGHT_3 = "#12405a";
const TEAL_0 = "#2f6f86";
const TEAL_1 = "#5fa3b8";
const GOLD_0 = "#EAAA22";
const GOLD_1 = "#FFD447";
const CREAM = "#FFF9E8";

type Streak = {
  y: number;
  thick: number;
  d: number; // depth 0 (horizon) .. 1 (bottom)
  x0: number;
  len: number;
  speed: number; // cells per second
  phase: number;
  freq: number;
};

type Glint = {
  y: number;
  d: number;
  r: number; // -1..1 across the sunlight path
  len: number;
  phase: number;
  freq: number;
};

type Layout = {
  W: number;
  H: number;
  horizon: number;
  waterline: number;
  bg: HTMLCanvasElement;
  streaks: Streak[];
  glints: Glint[];
};

type Wake = { age: number; x: number; back: number }; // back: -1 trails left, 1 trails right

type Ring = {
  kind: "splash" | "still";
  x: number; // cells
  age: number;
  life: number;
  maxR: number; // cells, horizontal radius
};

type Sim = {
  t: number;
  lastFrame: number;
  wakeClock: number;
  stillClock: number;
  splash: number;
  wakes: Wake[];
  rings: Ring[];
  onScreen: boolean;
  rafId: number;
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/* Seeded PRNG so the layout never flickers between rebuilds. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* The static water body: bands, plus an uneven crest of bumps above the horizon. */
function buildBackground(W: number, H: number, horizon: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");
  if (!g) return c;

  const span = Math.max(1, H - horizon);
  for (let y = horizon; y < H; y++) {
    const t = (y - horizon) / span;
    g.fillStyle = t < 0.12 ? NIGHT_3 : t < 0.3 ? NIGHT_2 : t < 0.6 ? NIGHT_1 : NIGHT_0;
    g.fillRect(0, y, W, 1);
  }

  const rnd = mulberry32(7);
  for (let x = 0; x < W; ) {
    const run = Math.min(W - x, 3 + Math.floor(rnd() * 10));
    const h = rnd();
    if (h > 0.3) {
      g.fillStyle = TEAL_0;
      g.fillRect(x, horizon - 1, run, 1);
    }
    if (h > 0.8) {
      g.fillStyle = NIGHT_3;
      g.fillRect(x, horizon - 2, run, 1);
    }
    x += run;
  }
  return c;
}

function buildLayout(W: number, H: number): Layout {
  const horizon = Math.max(3, Math.round(H * HORIZON));
  const waterline = clamp(Math.round(H * WATERLINE), horizon + 1, H - 1);
  const span = Math.max(1, H - horizon);
  const rnd = mulberry32(1337);
  const streaks: Streak[] = [];
  const glints: Glint[] = [];

  for (let y = horizon + 1; y < H; y++) {
    const d = (y - horizon) / span;
    // Perspective: rows get sparser toward the viewer, and near rows are thicker.
    const spacing = d < 0.3 ? 2 : d < 0.65 ? 3 : 4;
    if ((y - horizon) % spacing !== 0) continue;
    const thick = d > 0.7 && y + 1 < H ? 2 : 1;

    const count = Math.max(2, Math.round(W / (24 + d * 60)));
    for (let i = 0; i < count; i++) {
      streaks.push({
        y,
        thick,
        d,
        x0: rnd() * W,
        len: Math.round(2 + d * d * 28 + rnd() * (2 + d * 6)),
        speed: (1.2 + d * 8) * (0.75 + rnd() * 0.5),
        phase: rnd() * Math.PI * 2,
        freq: 0.4 + rnd() * 0.8,
      });
    }

    const glintCount = 2 + Math.floor(d * 5);
    for (let i = 0; i < glintCount; i++) {
      glints.push({
        y,
        d,
        r: rnd() * 2 - 1,
        len: 2 + Math.floor(rnd() * (2 + d * 6)),
        phase: rnd() * Math.PI * 2,
        freq: 1.2 + rnd() * 2.2,
      });
    }
  }

  return { W, H, horizon, waterline, bg: buildBackground(W, H, horizon), streaks, glints };
}

/* Duck position in canvas cells. */
const duckCells = (duckX: number, W: number) => clamp(duckX / 100, 0, 1) * W;

function addRing(s: Sim, r: Omit<Ring, "age">) {
  if (s.rings.length >= MAX_RINGS) s.rings.shift();
  s.rings.push({ ...r, age: 0 });
}

/* Advance the simulation by dt seconds and react to the latest props. */
function step(s: Sim, L: Layout, p: WaterProps, dt: number) {
  s.t += dt;
  const cx = duckCells(p.duckX, L.W);

  // Each splash increment spawns a ripple (capped so a burst stays light).
  const fresh = Math.min(3, p.splash - s.splash);
  s.splash = p.splash;
  for (let i = 0; i < fresh; i++) {
    addRing(s, { kind: "splash", x: cx, life: RING_LIFE, maxR: clamp(L.W * 0.09, 14, 36) });
  }

  if (Math.abs(p.duckVel) > MOVE_EPS) {
    s.stillClock = 0;
    s.wakeClock += dt;
    if (s.wakeClock >= WAKE_EVERY) {
      s.wakeClock = 0;
      if (s.wakes.length >= MAX_WAKES) s.wakes.shift();
      s.wakes.push({ age: 0, x: cx, back: p.duckVel > 0 ? -1 : 1 });
    }
  } else {
    s.wakeClock = WAKE_EVERY; // first moving frame emits immediately
    s.stillClock += dt;
    if (s.stillClock >= STILL_RING_EVERY) {
      s.stillClock = 0;
      addRing(s, { kind: "still", x: cx, life: STILL_RING_LIFE, maxR: 9 });
    }
  }

  for (const w of s.wakes) w.age += dt;
  s.wakes = s.wakes.filter((w) => w.age < WAKE_LIFE);
  for (const r of s.rings) r.age += dt;
  s.rings = s.rings.filter((r) => r.age < r.life);
}

/* Paint one frame. Everything is drawn as 1x1 or short hard-edged runs. */
function paintFrame(g: CanvasRenderingContext2D, L: Layout, time: number, wakes: Wake[], rings: Ring[]) {
  const { W, H, horizon, waterline } = L;
  let cur = "";
  const fill = (c: string) => {
    if (c !== cur) {
      g.fillStyle = c;
      cur = c;
    }
  };
  const put = (x: number, y: number) => {
    if (x >= 0 && x < W && y >= horizon && y < H) g.fillRect(x, y, 1, 1);
  };

  g.clearRect(0, 0, W, H);
  g.drawImage(L.bg, 0, 0);

  // Teal glints: short runs that drift right and breathe in and out.
  for (const st of L.streaks) {
    const level = 0.5 + 0.5 * Math.sin(time * st.freq + st.phase) + st.d * 0.25;
    if (level < 0.62) continue;
    fill(level < 0.9 ? NIGHT_3 : level < 1.08 ? TEAL_0 : TEAL_1);

    const len = clamp(Math.round(st.len * (0.7 + 0.3 * Math.sin(time * 0.6 + st.phase))), 1, W);
    const x = Math.floor((((st.x0 + st.speed * time) % W) + W) % W);
    g.fillRect(x, st.y, Math.min(len, W - x), st.thick);
    if (x + len > W) g.fillRect(0, st.y, x + len - W, st.thick);
  }

  // Sunlight path: gold streaks centred on the frame, narrow at the horizon,
  // wide toward the viewer, each blinking on its own phase.
  const midX = W / 2;
  for (const gl of L.glints) {
    const v = Math.sin(time * gl.freq + gl.phase);
    if (v < 0.2) continue;
    fill(v > 0.75 ? GOLD_1 : GOLD_0);
    const halfW = 1.5 + gl.d * W * 0.085;
    const sway = Math.sin(time * 0.5 + gl.phase) * (0.5 + gl.d * 1.5);
    const start = Math.round(midX + gl.r * halfW + sway - gl.len / 2);
    const x0 = Math.max(0, start);
    const x1 = Math.min(W, start + gl.len);
    if (x1 > x0) g.fillRect(x0, gl.y, x1 - x0, 1);
  }

  // Duck wake: V-shaped arms trailing behind the duck, cream then teal, dithering out.
  for (const w of wakes) {
    const n = Math.min(16, Math.round(2 + w.age * 11));
    const dither = w.age > 1.0;
    fill(w.age < 0.35 ? CREAM : w.age < 0.9 ? TEAL_1 : TEAL_0);
    for (let i = 1; i <= n; i++) {
      if (dither && i % 2 === 0) continue;
      const x = Math.round(w.x + w.back * i);
      const dy = Math.round(i * SLOPE);
      put(x, waterline - dy);
      if (dy > 0) put(x, waterline + dy);
    }
  }

  // Ripple rings: flattened ellipses (about 4:1) on the waterline.
  for (const r of rings) {
    const k = r.age / r.life;
    const rx = Math.max(1, r.maxR * (1 - (1 - k) * (1 - k))); // ease-out growth
    const ry = Math.max(0.75, rx / 4);
    const dither = k > 0.7;
    const col =
      r.kind === "still" ? (k < 0.5 ? TEAL_0 : NIGHT_3) : k < 0.2 ? CREAM : k < 0.55 ? TEAL_1 : TEAL_0;
    fill(col);
    const n = clamp(Math.round((rx + ry) * 5), 16, 120);
    let lastX = NaN;
    let lastY = NaN;
    for (let j = 0; j < n; j++) {
      if (dither && j % 2 === 1) continue;
      const th = (j / n) * Math.PI * 2;
      const x = Math.round(r.x + Math.cos(th) * rx);
      const y = Math.round(waterline + Math.sin(th) * ry);
      if (x === lastX && y === lastY) continue;
      lastX = x;
      lastY = y;
      put(x, y);
    }
  }
}

function buildSceneCanvasSize(wrap: HTMLDivElement) {
  return {
    W: Math.max(8, Math.ceil(wrap.clientWidth / CELL)),
    H: Math.max(8, Math.ceil(wrap.clientHeight / CELL)),
  };
}

export function PixelWater(props: WaterProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const layoutRef = useRef<Layout | null>(null);
  const propsRef = useRef<WaterProps>(props);
  const sim = useRef<Sim>({
    t: 0,
    lastFrame: 0,
    wakeClock: WAKE_EVERY,
    stillClock: 0,
    splash: props.splash,
    wakes: [],
    rings: [],
    onScreen: true,
    rafId: 0,
  });

  const { reducedMotion } = props;

  // Keep the latest props in a ref so the rAF loop never restarts on change.
  useEffect(() => {
    propsRef.current = props;
  });

  // Size the low-res buffer to the strip and pre-draw the background.
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const resize = () => {
      if (wrap.clientWidth < 1 || wrap.clientHeight < 1) return;
      const { W, H } = buildSceneCanvasSize(wrap);
      canvas.width = W;
      canvas.height = H;
      canvas.style.width = `${W * CELL}px`;
      canvas.style.height = `${H * CELL}px`;
      canvas.style.visibility = "visible";

      const L = buildLayout(W, H);
      layoutRef.current = L;
      const g = canvas.getContext("2d");
      if (!g) return;
      g.imageSmoothingEnabled = false;
      const s = sim.current;
      if (propsRef.current.reducedMotion) paintFrame(g, L, STATIC_TIME, [], []);
      else paintFrame(g, L, s.t, s.wakes, s.rings);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  // Animation loop: runs only while on screen, tab visible, and motion allowed.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const s = sim.current;

    const shouldRun = () =>
      !propsRef.current.reducedMotion && s.onScreen && document.visibilityState === "visible";

    const tick = (now: number) => {
      s.rafId = 0;
      if (!shouldRun()) return;
      s.rafId = requestAnimationFrame(tick);
      if (s.lastFrame && now - s.lastFrame < FRAME_MS) return; // throttle to ~30fps

      const dt = s.lastFrame ? Math.min(MAX_DT, (now - s.lastFrame) / 1000) : 0;
      s.lastFrame = now;

      const L = layoutRef.current;
      const canvas = canvasRef.current;
      const g = canvas?.getContext("2d");
      if (!L || !g) return;

      step(s, L, propsRef.current, dt);
      paintFrame(g, L, s.t, s.wakes, s.rings);
    };

    const kick = () => {
      if (shouldRun()) {
        if (!s.rafId) s.rafId = requestAnimationFrame(tick);
      } else if (s.rafId) {
        cancelAnimationFrame(s.rafId);
        s.rafId = 0;
      }
    };

    const io = new IntersectionObserver(([entry]) => {
      s.onScreen = entry.isIntersecting;
      kick();
    });
    io.observe(wrap);
    document.addEventListener("visibilitychange", kick);

    // Reduced motion: one static frame, no loop.
    if (reducedMotion) {
      const L = layoutRef.current;
      const g = canvasRef.current?.getContext("2d");
      if (L && g) paintFrame(g, L, STATIC_TIME, [], []);
    }
    kick();

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", kick);
      if (s.rafId) cancelAnimationFrame(s.rafId);
      s.rafId = 0;
    };
  }, [reducedMotion]);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", imageRendering: "pixelated", visibility: "hidden" }}
      />
    </div>
  );
}
