"use client";

import { memo, useCallback, useEffect, useId, useRef, useState } from "react";
import { Linkedin, Github, Mail, QrCode } from "lucide-react";
import { C, FONT, SERIF, RESUME_PDF, LINKEDIN, GITHUB, MAILTO, type Panel } from "./theme";
import { AboutPage } from "./AboutPage";
import { WorkPage } from "./WorkPage";
import { BootScreen, Confetti, Toast, Clock, Sprout, CodingDuck, useKonami, usePrefersReducedMotion } from "./fx";
import { DuckChat } from "./DuckChat";
import { PixelWater } from "./scene/PixelWater";
import { DuckFx, useDuckBody } from "./scene/DuckLife";
import { SceneDepth } from "./scene/SceneDepth";
import "../styles/welcome.css";

export type { Panel } from "./theme";

/* ────────────────────────────────────────────────────────────────────
   Portfolio — the shell of the site.

   Three full-screen panels sit side by side in a horizontal,
   snap-scrolling track:  [ About | Welcome | Works ].
   The site opens centered on Welcome, where scrolling down grows
   a coding duck; the clouds up top navigate left and right.
   ──────────────────────────────────────────────────────────────────── */

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Smoothstep from a to b: eases in and out of the hand-off instead of
    starting and stopping on a hard linear ramp. */
const ramp = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/* The heavy panels and scene layers only re-render when their own props
   change, not on every frame of scroll-to-grow (which re-renders the
   shell). Their props are all stable callbacks or primitives. */
const AboutPanel = memo(AboutPage);
const WorkPanel = memo(WorkPage);
const DuckChatPanel = memo(DuckChat);
const Boot = memo(BootScreen);
/* BootScreen does its own cross-fade and marks <html data-boot="done">;
   the headline entrance keys off that attribute in CSS, so the hand-off
   needs no React state at all. */
const noop = () => {};
const Water = memo(PixelWater);
const Depth = memo(SceneDepth);
const DuckEffects = memo(DuckFx);

/** Every panel is exactly one viewport, scrolling its own content. */
const panelStyle: React.CSSProperties = {
  flex: "0 0 100vw",
  width: "100vw",
  height: "100vh",
  overflowY: "auto",
  overflowX: "hidden",
  scrollSnapAlign: "start",
  // contains absolutely-positioned descendants (e.g. sr-only headings) so
  // they can't leak out and give the whole document a scrollbar
  position: "relative",
};

/* ── CursorGlow — a soft sun-glow that follows the pointer ─────────── */

function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return; // no cursor on touch
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // The light eases after the pointer instead of sticking to it — it
    // trails a touch, like sunlight through a window, and the loop parks
    // itself once it has caught up.
    let raf = 0;
    let x = 0;
    let y = 0;
    let cx = 0;
    let cy = 0;
    let placed = false;
    const apply = () => {
      cx += (x - cx) * 0.16;
      cy += (y - cy) * 0.16;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
      el.style.opacity = "1";
      raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.5 ? requestAnimationFrame(apply) : 0;
    };
    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!placed) {
        cx = x;
        cy = y;
        placed = true;
      }
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      el.style.opacity = "0";
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "320px",
        height: "320px",
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(234,170,34,0.13) 0%, rgba(234,170,34,0.05) 40%, rgba(234,170,34,0) 70%)",
        mixBlendMode: "screen",
        pointerEvents: "none",
        zIndex: 88,
        opacity: 0,
        transition: "opacity var(--dur-slow) var(--ease-out)",
        willChange: "transform",
      }}
    />
  );
}

const Glow = memo(CursorGlow);

/* ── CloudPuff — one painterly cloud, optionally with a label ──────── */

const CloudPuff = memo(function CloudPuff({ label }: { label?: string }) {
  const gradientId = useId();
  return (
    <svg
      viewBox="0 0 240 150"
      width="100%"
      style={{ display: "block", overflow: "visible", filter: "drop-shadow(0 12px 22px rgba(0,0,0,0.35))" }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#26231b" />
          <stop offset="1" stopColor="#0e0d0a" />
        </linearGradient>
      </defs>
      {/* overlapping puffs make the smoke body */}
      <g fill={`url(#${gradientId})`}>
        <ellipse cx="120" cy="98" rx="100" ry="36" />
        <circle cx="60" cy="80" r="36" />
        <circle cx="116" cy="58" r="46" />
        <circle cx="172" cy="76" r="36" />
        <circle cx="200" cy="94" r="24" />
      </g>
      {/* golden rim-light on top */}
      <ellipse className="cloud-rim" cx="100" cy="52" rx="30" ry="13" fill="rgba(234,170,34,0.22)" />
      {label && (
        <text
          x="120"
          y="92"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="22"
          fontWeight="700"
          fill="#FFF9E8"
          style={{ fontFamily: FONT, paintOrder: "stroke", stroke: "rgba(8,9,9,0.85)", strokeWidth: 3.5 }}
        >
          {label}
        </text>
      )}
    </svg>
  );
});

/* ── CloudBank — big overlapping clouds clustered across the top ─────
   They drift in as the duck pops in (g → 1). A few tuck behind
   the sun; the two labelled front clouds are the About/Works nav. ── */

type Cloud = {
  x: number; //  horizontal center, in % of the panel
  y: number; //  top offset, px
  w: number; //  width, px
  z: number; //  stacking layer
  d: number; //  appearance delay, as a slice of the drift-in
  s: number; //  float-bob duration, seconds
  label?: string;
  nav?: Panel;
};

// Order matters: earlier clouds sit further back, later ones draw on top.
const CLOUDS: Cloud[] = [
  // back row — small, high, behind everything
  { x: 6, y: 14, w: 230, z: 1, d: 0.22, s: 5.0 },
  { x: 20, y: 8, w: 220, z: 1, d: 0.24, s: 5.4 },
  { x: 34, y: 14, w: 240, z: 1, d: 0.26, s: 4.8 },
  { x: 50, y: 4, w: 230, z: 1, d: 0.28, s: 5.2 },
  { x: 66, y: 14, w: 240, z: 1, d: 0.26, s: 4.6 },
  { x: 80, y: 8, w: 220, z: 1, d: 0.24, s: 5.0 },
  { x: 94, y: 14, w: 230, z: 1, d: 0.22, s: 5.6 },
  // mid mass — big, clustered around the sun
  { x: 0, y: 50, w: 300, z: 1, d: 0.14, s: 4.4 },
  { x: 13, y: 56, w: 300, z: 1, d: 0.16, s: 4.8 },
  { x: 27, y: 52, w: 310, z: 1, d: 0.18, s: 5.0 },
  { x: 40, y: 58, w: 300, z: 1, d: 0.2, s: 4.6 },
  { x: 50, y: 46, w: 270, z: 1, d: 0.22, s: 5.2 },
  { x: 60, y: 58, w: 300, z: 1, d: 0.2, s: 4.4 },
  { x: 73, y: 52, w: 310, z: 1, d: 0.18, s: 4.9 },
  { x: 87, y: 56, w: 300, z: 1, d: 0.16, s: 4.7 },
  { x: 100, y: 50, w: 300, z: 1, d: 0.14, s: 5.1 },
  // front row — big, low, on top of the mass
  { x: 7, y: 102, w: 290, z: 1, d: 0.05, s: 5.4 },
  { x: 30, y: 110, w: 270, z: 1, d: 0.04, s: 4.2 },
  { x: 50, y: 106, w: 260, z: 1, d: 0.06, s: 5.0 },
  { x: 70, y: 110, w: 270, z: 1, d: 0.04, s: 4.6 },
  { x: 93, y: 102, w: 290, z: 1, d: 0.05, s: 5.2 },
  // nav clouds — front-most, labelled
  { x: 16, y: 104, w: 300, z: 3, d: 0, s: 4.0, label: "About me", nav: "about" },
  { x: 84, y: 104, w: 300, z: 3, d: 0, s: 4.6, label: "My work", nav: "works" },
];

function CloudBank({ g, goTo }: { g: number; goTo: (p: Panel) => void }) {
  const appear = clamp01((g - 0.16) / 0.32); // clouds drift in mid-growth

  return (
    <>
      {CLOUDS.map((cloud, i) => {
        const a = clamp01((appear - cloud.d) / (1 - cloud.d)); // this cloud's own fade
        // An ease-out landing, still scroll-linked: each cloud decelerates
        // into place instead of sliding in and stopping dead.
        const settle = 1 - (1 - a) ** 3;
        // Nav clouds slide in from their side; the rest drift down into place.
        const fromSide = cloud.x < 50 ? -1 : 1;
        const slide = cloud.label
          ? `translate(-50%, 0) translateX(${(fromSide * (1 - settle) * 130).toFixed(2)}px)`
          : `translate(-50%, ${((1 - settle) * -64).toFixed(2)}px)`;
        const nav = cloud.nav;

        return (
          // The slot carries the scroll-driven drift with no transition, so
          // every cloud tracks the sun 1:1. Hover and press live on the
          // .cloud-nav child, so the two never fight over one transform.
          <div
            key={i}
            aria-hidden={nav ? undefined : true}
            style={{
              position: "absolute",
              left: `${cloud.x}%`,
              top: `${cloud.y}px`,
              // Nav clouds carry a readable label — on a narrow phone a fixed
              // 300px puff centered at 16%/84% pushes the text past the edge,
              // so those two shrink with the viewport instead of clipping.
              width: cloud.label ? "clamp(150px, 40vw, 300px)" : `${cloud.w}px`,
              zIndex: cloud.z,
              opacity: a * 0.97,
              transform: slide,
              pointerEvents: "none",
            }}
          >
            {/* each cloud bobs at its own pace */}
            <div className="cloud-float" style={{ "--float": `${cloud.s}s` } as React.CSSProperties}>
              {nav ? (
                <div
                  className="cloud-nav"
                  role="button"
                  tabIndex={0}
                  // out of the tab order, the pointer's way and the
                  // accessibility tree until it has drifted in
                  inert={a < 0.6 || undefined}
                  aria-label={cloud.label}
                  onClick={() => goTo(nav)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      goTo(nav);
                    }
                  }}
                >
                  <CloudPuff label={cloud.label} />
                </div>
              ) : (
                <CloudPuff />
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}

/* ── LightFall — motes of sunlight drifting down like golden snow ────
   Hover (or tap) a mote and it lifts, rings and sparks into the
   cursor, then respawns up top. ── */

type MoteCfg = {
  left: number; // starting column, %
  size: number; // px
  opacity: number; // depth tier: dimmer = farther
  glow: boolean; // only the nearest tier glows
  tier: 0 | 1 | 2; // 0 = farthest
  fallDuration: number; // s
  fallDelay: number; // s (negative = already mid-fall)
  swayDuration: number; // s
  swayDelay: number; // s
};

/* Three depth tiers so the light reads as near and far, not one flat
   sheet: far motes are small, dim and slow; near ones big, bright and
   quick. Every tier stays at least 6px so each is still catchable. */
const MOTE_TIERS = [
  { size: [6, 8], opacity: 0.45, fall: [16, 20], glow: false },
  { size: [8, 11], opacity: 0.75, fall: [11, 14], glow: false },
  { size: [12, 14], opacity: 1, fall: [8, 10], glow: true },
] as const;

function spawnMote(midFall: boolean): MoteCfg {
  const tierIndex: MoteCfg["tier"] = Math.random() < 0.45 ? 0 : Math.random() < 0.65 ? 1 : 2;
  const tier = MOTE_TIERS[tierIndex];
  const pick = ([lo, hi]: readonly [number, number]) => lo + Math.random() * (hi - lo);
  return {
    left: 6 + Math.random() * 88,
    size: pick(tier.size),
    opacity: tier.opacity,
    glow: tier.glow,
    tier: tierIndex,
    fallDuration: pick(tier.fall),
    // On first render, scatter motes mid-fall; respawns start from the top.
    fallDelay: midFall ? -Math.random() * 18 : -Math.random() * 1.5,
    swayDuration: 3 + Math.random() * 3,
    swayDelay: -Math.random() * 4,
  };
}

/** Six sparks thrown off a caught mote, as unit vectors around a hexagon. */
const CATCH_SPARKS = [
  [0, -1],
  [0.87, -0.5],
  [0.87, 0.5],
  [0, 1],
  [-0.87, 0.5],
  [-0.87, -0.5],
] as const;
const SPARK_REACH = 20; // px

function Mote() {
  const [cfg, setCfg] = useState<MoteCfg | null>(null);
  const [caught, setCaught] = useState(false);

  // Spawn client-side only, so server and browser markup agree.
  useEffect(() => setCfg(spawnMote(true)), []);
  if (!cfg) return null;

  const catchIt = () => setCaught(true);
  const playState = caught ? "paused" : "running";

  return (
    // outer layer: the fall; middle layer: the sway; inner: the glowing dot
    <div
      style={{
        position: "absolute",
        left: `${cfg.left}%`,
        top: 0,
        animation: `mote-fall ${cfg.fallDuration}s linear ${cfg.fallDelay}s infinite`,
        animationPlayState: playState,
      }}
    >
      <div
        style={{
          animation: `mote-sway ${cfg.swayDuration}s ease-in-out ${cfg.swayDelay}s infinite`,
          animationPlayState: playState,
        }}
      >
        {/* the halo and sparks are siblings of the dot, not children, so
            they don't shrink away with it while it is absorbed */}
        <div style={{ position: "relative", width: `${cfg.size}px`, height: `${cfg.size}px` }}>
          <div
            className={caught ? "mote-dot is-caught" : "mote-dot"}
            data-tier={cfg.tier}
            // a mouse catches on contact; touch and pen catch on a tap
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse") catchIt();
            }}
            onPointerDown={catchIt}
            onAnimationEnd={(e) => {
              if (e.animationName === "mote-catch") {
                setCfg(spawnMote(false)); // respawn at the top
                setCaught(false);
              }
            }}
            style={{
              width: `${cfg.size}px`,
              height: `${cfg.size}px`,
              background: "radial-gradient(circle, rgba(255,212,71,0.9), rgba(234,170,34,0.45) 45%, transparent 72%)",
              boxShadow: cfg.glow ? "0 0 8px rgba(234,170,34,0.5)" : undefined,
              opacity: cfg.opacity,
            }}
          />
          {caught && (
            <>
              <span className="mote-halo" />
              {CATCH_SPARKS.map(([dx, dy], i) => (
                <span
                  key={i}
                  className="mote-spark"
                  style={{ "--dx": `${dx * SPARK_REACH}px`, "--dy": `${dy * SPARK_REACH}px` } as React.CSSProperties}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const LightFall = memo(function LightFall() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setCount(22);
  }, []);

  return (
    <div aria-hidden className="light-fall">
      {Array.from({ length: count }, (_, i) => (
        <Mote key={i} />
      ))}
    </div>
  );
});

/* ── Welcome — the center landing panel ──────────────────────────────
   Scrolling down (p: 0 → 1) pops in a coding duck while the sun rises
   and brightens and the headline fades away. The panel is 240vh
   tall with a sticky viewport, so the scene stays put while the
   scroll drives the animation. ──────────────────────────────────── */

/* ── WaterDuck — the duck floats on the water strip and can be pushed
   left/right by wheel, drag, touch, or arrow keys. Hold it against an
   edge and it paddles off to that page. ──────────────────────────── */

const DUCK_MIN_PCT = 8;
const DUCK_MAX_PCT = 92;

/** How long the duck has to lean on an edge before it sets off. Long
    enough that a stray flick of the wheel can't navigate for you. */
const EDGE_HOLD_MS = 560;

/** The duck outruns your cursor a little when dragged, so crossing the
    water doesn't take a swipe the full width of the screen. */
const DRAG_GAIN = 1.7;

/** Time constant of the scroll-to-grow follow. 96ms matches the old
    0.16-per-frame lerp at 60Hz, now independent of refresh rate. */
const GROWTH_TAU_MS = 96;

function WaterDuck({
  g,
  duckAwake,
  onDuckClick,
  goTo,
  active,
}: {
  g: number;
  duckAwake: boolean;
  onDuckClick: () => void;
  goTo: (p: Panel) => void;
  active: Panel;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const waterRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const [facing, setFacing] = useState<"left" | "right">("right");
  const [dragging, setDragging] = useState(false);
  const posRef = useRef(50);
  const dragStartXRef = useRef(0);
  const dragStartPosRef = useRef(50);
  const dragMovedRef = useRef(false);
  const draggingRef = useRef(false);
  const [atEdge, setAtEdge] = useState<Panel | null>(null);

  /* The duck's liveliness: a smoothed velocity (drives its lean, wake and
     flicked droplets) and two counters the scene effects listen to — every
     bump bumps `splash`, every bit of chatter bumps `quack`. */
  const [vel, setVel] = useState(0);
  const [splash, setSplash] = useState(0);
  const [quack, setQuack] = useState(0);
  const bodyRef = useRef<HTMLDivElement>(null);

  // The strip's width in px, so the arrows and the destination sign that
  // follow the duck can be clamped on screen (on a phone a fixed 96px
  // offset pushed them past the edge whenever the duck neared a shore).
  const [stripW, setStripW] = useState(0);
  useEffect(() => {
    const el = waterRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => setStripW(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const { bump } = useDuckBody({ vel, reducedMotion, target: bodyRef });

  // One shared throttle for the duck's chatter and splashing, so hammering
  // it (hover spam, ping-ponging off an edge) can't stack up bubbles.
  const lastQuackRef = useRef(-Infinity);
  const lastSplashRef = useRef(-Infinity);
  const chatter = useCallback(() => {
    const now = performance.now();
    if (now - lastQuackRef.current < 1600) return false;
    lastQuackRef.current = now;
    setQuack((n) => n + 1);
    return true;
  }, []);
  const splashDown = useCallback(() => {
    const now = performance.now();
    if (now - lastSplashRef.current < 350) return;
    lastSplashRef.current = now;
    setSplash((n) => n + 1);
  }, []);

  const move = useCallback((next: number) => {
    const clamped = Math.max(DUCK_MIN_PCT, Math.min(DUCK_MAX_PCT, next));
    setFacing((f) => (clamped > posRef.current ? "right" : clamped < posRef.current ? "left" : f));
    posRef.current = clamped;
    setPos(clamped);
    setAtEdge(clamped <= DUCK_MIN_PCT ? "about" : clamped >= DUCK_MAX_PCT ? "works" : null);
  }, []);

  // Track how fast the duck is paddling (% per frame, eased), so the scene
  // can lean it, trail a wake behind it, and flick water off its back.
  useEffect(() => {
    if (active !== "welcome" || reducedMotion) return;
    let raf = 0;
    let last = posRef.current;
    let lastT = 0;
    let smooth = 0;
    let published = 0;
    const tick = (t: number) => {
      // per 60Hz frame, whatever the screen's real refresh rate
      const frames = lastT ? Math.min(4, (t - lastT) / (1000 / 60)) : 1;
      lastT = t;
      const delta = (posRef.current - last) / Math.max(frames, 0.25);
      last = posRef.current;
      smooth += (delta - smooth) * 0.2;
      if (Math.abs(smooth) < 0.004) smooth = 0;
      // coarse steps: the springs downstream smooth it, and it keeps
      // WaterDuck from re-rendering on every frame while it paddles
      const rounded = Math.round(smooth * 20) / 20;
      if (rounded !== published) {
        published = rounded;
        setVel(rounded);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      setVel(0); // don't leave the duck frozen mid-lean when you leave the panel
    };
  }, [active, reducedMotion]);

  // Bumping into a shore: a splash, a hop, and a word about it.
  useEffect(() => {
    if (!atEdge) return;
    splashDown();
    chatter();
    bump();
  }, [atEdge, bump, chatter, splashDown]);

  // The duck lands with a splash the first time it pops onto the water.
  const landedRef = useRef(false);
  useEffect(() => {
    if (landedRef.current || g < 0.42) return;
    landedRef.current = true;
    setSplash((n) => n + 1);
  }, [g]);

  // Leaning on an edge sets off on the trip; pull away and it's called off.
  // A timer rather than an rAF ramp, so a throttled tab can't strand the
  // duck mid-charge — the bar below is animated by CSS to match.
  useEffect(() => {
    if (!atEdge) return;
    const trip = setTimeout(() => goTo(atEdge), EDGE_HOLD_MS);
    return () => clearTimeout(trip);
  }, [atEdge, goTo]);

  // Once you've left the welcome panel, float the duck back to the middle
  // so you don't come back to it parked against an edge, one nudge from
  // sending you away again.
  useEffect(() => {
    if (active === "welcome") return;
    posRef.current = 50;
    setPos(50);
    setAtEdge(null);
  }, [active]);

  // The duck watches the cursor, so it turns to look at you instead of
  // staring off one way until someone happens to paddle it.
  useEffect(() => {
    if (active !== "welcome") return;
    const el = waterRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      if (draggingRef.current) return; // mid-drag, the direction of travel wins
      const rect = el.getBoundingClientRect();
      const duckX = rect.left + (posRef.current / 100) * rect.width;
      const dx = e.clientX - duckX;
      if (Math.abs(dx) < 24) return; // dead zone, so it can't dither overhead
      setFacing(dx > 0 ? "right" : "left"); // same value re-renders nothing
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [active]);

  // React's synthetic onWheel is passive, so preventDefault() there is a no-op —
  // attach a real listener so a horizontal swipe over the water paddles the
  // duck. Vertical wheel/scroll is left alone so the page still scrolls
  // normally when the cursor happens to be over the duck.
  useEffect(() => {
    const el = waterRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; // vertical scroll — let the page handle it
      e.preventDefault();
      // Capped per notch so one hard trackpad flick can't shoot the duck
      // from the middle straight into an edge.
      move(posRef.current + Math.max(-3, Math.min(3, e.deltaX * 0.035)));
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [move]);

  // Pointer capture is deferred until movement actually happens — grabbing it
  // on pointerdown itself retargets the pointerup/click that follows a plain
  // click to this div instead of whatever was under the cursor (the duck's
  // own onClick), which silently ate every click-to-chat.
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    setDragging(true);
    dragMovedRef.current = false;
    dragStartXRef.current = e.clientX;
    dragStartPosRef.current = posRef.current;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || !waterRef.current) return;
    const dx = e.clientX - dragStartXRef.current;
    if (Math.abs(dx) > 4 && !dragMovedRef.current) {
      dragMovedRef.current = true;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // synthetic/test pointer ids can't be captured — dragging still works via this handler
      }
    }
    const pct = (dx / waterRef.current.clientWidth) * 100 * DRAG_GAIN;
    move(dragStartPosRef.current + pct);
  };

  const endDrag = () => {
    // let go mid-paddle and the duck settles back down with a splash
    if (draggingRef.current && dragMovedRef.current) splashDown();
    draggingRef.current = false;
    setDragging(false);
  };

  // Hovering the duck makes it hop and quack (not every twitch of the mouse).
  const onDuckHover = () => {
    if (draggingRef.current) return;
    if (chatter()) bump();
  };

  // Arrow keys paddle the duck as soon as you're back on the welcome panel —
  // no need to click it first to give it focus.
  useEffect(() => {
    if (active !== "welcome" || duckAwake) return;
    const onWindowKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        move(posRef.current - 4);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        move(posRef.current + 4);
      }
    };
    window.addEventListener("keydown", onWindowKey);
    return () => window.removeEventListener("keydown", onWindowKey);
  }, [active, duckAwake, move]);

  const handleActivate = () => {
    if (dragMovedRef.current) {
      dragMovedRef.current = false;
      return;
    }
    bump();
    splashDown();
    onDuckClick();
  };

  /* Arrow and sign placement: follow the duck, but never leave the strip.
     Before the strip is measured, fall back to plain percentages. */
  const duckPx = (pos / 100) * stripW;
  const arrowGap = Math.min(96, stripW * 0.22);
  const keepIn = (x: number, margin: number) => Math.max(margin, Math.min(stripW - margin, x));
  const signShift = stripW ? keepIn(duckPx, 60) - duckPx : 0;

  /* Everything that follows the duck moves on `transform` (composited),
     not `left` (layout). Before the strip is measured, fall back to plain
     percentages on `left`; that only happens while the strip is hidden. */
  const follow = (x: number, fallback: string, tail: string): React.CSSProperties =>
    stripW
      ? { left: 0, transform: `translate3d(${x.toFixed(1)}px, 0, 0) ${tail}` }
      : { left: fallback, transform: tail };
  // "transform 0s", not "none": it has to stay valid inside the arrows'
  // transition list, or a press would drop every transition on them
  const followTransition = dragging ? "transform 0s" : "transform 140ms var(--ease-out)";
  const leftArrowPos = follow(keepIn(duckPx - arrowGap, 23), `calc(${pos}% - 96px)`, "translate(-50%, 50%)");
  const rightArrowPos = follow(keepIn(duckPx + arrowGap, 23), `calc(${pos}% + 96px)`, "translate(-50%, 50%)");
  const duckPos = follow(duckPx, `${pos}%`, "translateX(-50%)");

  // The strip stays out of the way (pointer, tab order) until it has
  // faded in; the arrows likewise wait for their own fade.
  const waterIn = ramp(0.1, 0.4, g);
  const arrowsIn = ramp(0.3, 0.5, g);
  const stripLive = waterIn > 0.05;
  const arrowsLive = arrowsIn > 0.5;
  const arrowStyle: React.CSSProperties = {
    position: "absolute",
    bottom: "24%",
    transition: followTransition + ", scale var(--dur-fast) var(--ease-out)",
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    border: `2px solid ${C.leaf}`,
    color: C.leaf,
    fontSize: "16px",
    fontWeight: 700,
    lineHeight: 1,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: arrowsIn,
    pointerEvents: arrowsLive ? "auto" : "none",
    zIndex: 2,
  };

  /* Which shore the duck is drifting toward, and how close it is — drives
     the little destination sign above its head. */
  const heading =
    pos <= 32
      ? { side: "left" as const, label: "About me", nearness: clamp01((32 - pos) / 22) }
      : pos >= 68
        ? { side: "right" as const, label: "My work", nearness: clamp01((pos - 68) / 22) }
        : null;

  return (
    <div
      ref={waterRef}
      tabIndex={0}
      role="group"
      className="duck-strip"
      aria-label="The duck — scroll, drag, or use the arrow keys to paddle it across the water; hold it against the left edge for About me, the right edge for My work. Press Enter to chat with the duck."
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleActivate();
        }
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      inert={!stripLive || undefined}
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "var(--water-h)",
        // above the front row of clouds, which would otherwise paint over
        // the duck in a short browser window
        zIndex: 2,
        // no CSS transition here: the growth follow already eases this,
        // and a transition re-targeted every frame made the water trail
        // the headline
        opacity: waterIn,
        pointerEvents: stripLive ? "auto" : "none",
        // pan-y (not none): lets a touch swipe that starts on the duck still
        // scroll the page vertically. Horizontal drags aren't a native gesture
        // here, so they still reach onPointerMove uncontested.
        touchAction: "pan-y",
        cursor: dragging ? "grabbing" : "grab",
      }}
    >
      {/* the water itself — alive: drifting light, a sun path, the duck's wake */}
      <Water duckX={pos} duckVel={vel} splash={splash} reducedMotion={reducedMotion} paused={!stripLive} />

      {/* the world past the duck: far islands, a lighthouse, fireflies, the odd leaping fish */}
      <Depth reducedMotion={reducedMotion} paused={!stripLive} />

      {/* left/right hints — flank the duck. A click takes you straight
          there, same as leaning the duck against that edge would. */}
      <button
        className="water-arrow"
        aria-label="Go to About me"
        tabIndex={arrowsLive ? 0 : -1}
        onClick={() => {
          setFacing("left");
          goTo("about");
        }}
        style={{ ...arrowStyle, ...leftArrowPos }}
      >
        ←
      </button>
      <button
        className="water-arrow"
        aria-label="Go to My work"
        tabIndex={arrowsLive ? 0 : -1}
        onClick={() => {
          setFacing("right");
          goTo("works");
        }}
        style={{ ...arrowStyle, ...rightArrowPos }}
      >
        →
      </button>

      <div
        style={{
          position: "absolute",
          bottom: "24%",
          width: "min(190px, 38vw)",
          ...duckPos,
          transition: followTransition,
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        {/* where this heading takes you — fades in as the duck nears an
            edge, then fills while it leans on it */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            transform: `translateX(calc(-50% + ${signShift}px))`,
            marginBottom: "8px",
            width: "112px",
            padding: "6px 8px 5px",
            borderRadius: "10px",
            background: "rgba(8,9,9,0.82)",
            border: `1px solid ${atEdge ? C.leaf : C.border}`,
            opacity: heading ? 0.3 + 0.7 * heading.nearness : 0,
            transition: "opacity var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out)",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontSize: "10.5px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textAlign: "center",
              color: atEdge ? C.leaf : C.moss,
              transition: "color var(--dur-base) var(--ease-out)",
              whiteSpace: "nowrap",
            }}
          >
            {heading ? (heading.side === "left" ? `← ${heading.label}` : `${heading.label} →`) : null}
          </div>
          <div
            style={{
              height: "3px",
              marginTop: "5px",
              borderRadius: "2px",
              background: "rgba(255,249,232,0.14)",
              overflow: "hidden",
            }}
          >
            {/* fills toward the shore it is heading for; scaleX, not width,
                so the charge never relayouts */}
            <div
              style={{
                height: "100%",
                width: "100%",
                background: C.leaf,
                transform: `scaleX(${atEdge ? 1 : 0})`,
                transformOrigin: heading?.side === "left" ? "right" : "left",
                transition: atEdge
                  ? `transform ${EDGE_HOLD_MS}ms linear`
                  : "transform var(--dur-base) var(--ease-out)",
              }}
            />
          </div>
        </div>

        <div className={reducedMotion ? undefined : "duck-bob"} style={{ pointerEvents: "auto" }}>
          {/* body language: leans into its paddling, hops when poked, fidgets when idle */}
          <div ref={bodyRef} onPointerEnter={onDuckHover} style={{ transformOrigin: "50% 90%" }}>
            <CodingDuck
              p={g}
              awake={duckAwake}
              onActivate={handleActivate}
              facing={facing}
              resumeHref={RESUME_PDF}
            />
          </div>
        </div>
      </div>

      {/* splashes, flicked droplets, and the odd "quack!" */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }}>
        <DuckEffects duckX={pos} vel={vel} quack={quack} splash={splash} reducedMotion={reducedMotion} />
      </div>
    </div>
  );
}

function Welcome({
  goTo,
  p,
  duckAwake,
  onDuckClick,
  active,
}: {
  goTo: (p: Panel) => void;
  p: number;
  duckAwake: boolean;
  onDuckClick: () => void;
  active: Panel;
}) {
  const g = clamp01(p);
  const sunY = (-60 * g).toFixed(2);
  return (
    <div className="welcome" style={{ height: "240vh", position: "relative" }}>
      {/* the light-fall clip only applies once the water is actually there */}
      <div
        className={g > 0.1 ? "welcome-stage water-in" : "welcome-stage"}
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* sun — crowns the headline, then rises & brightens with scroll.
            A pre-blurred halo and a disc, both moved on the compositor:
            the light spreads as the sun climbs. */}
        <div
          aria-hidden
          className="welcome-halo"
          style={{
            transform: `translate3d(0, ${sunY}px, 0) scale(${(0.42 + 0.58 * g).toFixed(4)})`,
            opacity: 0.62 + 0.38 * g,
          }}
        />
        <div
          aria-hidden
          className="welcome-sun"
          style={{
            transform: `translate3d(0, ${sunY}px, 0) scale(${(0.5926 + 0.4074 * g).toFixed(4)})`,
            opacity: 0.86 + 0.14 * g,
          }}
        />

        {/* golden light drifting down from the sun */}
        <LightFall />

        {/* clouds cluster in as you scroll; the labelled ones navigate */}
        <CloudBank g={g} goTo={goTo} />

        {/* headline — fades fully away as the duck takes over */}
        <div
          style={{
            position: "relative",
            zIndex: 3,
            textAlign: "center",
            padding: "0 24px",
            transform: `translateY(calc(-6vh - ${(46 * g).toFixed(2)}px))`,
            opacity: 1 - ramp(0.04, 0.42, g),
            pointerEvents: g > 0.3 ? "none" : "auto",
          }}
        >
          <div
            className="wl"
            style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: C.wood }}
          >
            Hello, I&apos;m Summer Pandey
          </div>
          <h1
            className="serif"
            style={{
              fontFamily: SERIF,
              fontWeight: 600,
              fontSize: "clamp(44px, 7vw, 96px)",
              lineHeight: 1.04,
              color: C.dark,
              margin: "16px 0 0",
              letterSpacing: "-0.022em",
              textWrap: "balance",
            }}
          >
            {/* two lines, each rising on its own beat; the {" "} keeps the
                accessible name "Welcome to my room of ideas" */}
            <span className="wl wl-a wl-line">Welcome to my</span>{" "}
            <span className="wl wl-b wl-line">
              <span
                style={{
                  // sunlit to the last letter; `clone` repeats the full sweep on
                  // each line when the phrase wraps on a phone
                  backgroundImage: `linear-gradient(90deg, ${C.leaf}, ${C.sun})`,
                  WebkitBoxDecorationBreak: "clone",
                  boxDecorationBreak: "clone",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                room of ideas
              </span>
            </span>
          </h1>
          <p
            className="wl wl-c"
            style={{
              margin: "14px auto 0",
              maxWidth: "34em",
              fontFamily: FONT,
              fontSize: "clamp(14px, 1.6vw, 17px)",
              fontWeight: 600,
              lineHeight: 1.5,
              color: C.moss,
              letterSpacing: "0.01em",
              textWrap: "balance",
            }}
          >
            Software engineer &amp; AI/ML builder · CS + Data Science at Augustana
          </p>
          {/* out of the tab order once the headline has faded away */}
          <div className="wl wl-c hero-actions" inert={g > 0.3 || undefined}>
            <button type="button" className="btn-quiet btn-gold hero-action" onClick={() => goTo("works")}>
              See my work <span aria-hidden>→</span>
            </button>
            <a
              className="btn-quiet hero-action hero-action--ghost"
              href={RESUME_PDF}
              target="_blank"
              rel="noopener noreferrer"
            >
              Résumé <span aria-hidden>↗</span>
            </a>
          </div>
        </div>

        {/* water — the duck floats here and can be dragged/scrolled/keyed around */}
        <WaterDuck g={g} duckAwake={duckAwake} onDuckClick={onDuckClick} goTo={goTo} active={active} />

        {/* scroll cue — only before you start scrolling, then gone */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: "22px",
            zIndex: 5,
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: C.muted,
            opacity: 1 - ramp(0, 0.2, g),
            transform: `translateY(${(8 * ramp(0, 0.2, g)).toFixed(2)}px)`,
            pointerEvents: "none",
          }}
        >
          {/* arrives just after the headline, on the same entrance */}
          <span className="wl wl-cue" style={{ display: "inline-block" }}>
            <span className="scroll-cue-arrow" style={{ animationPlayState: g > 0.2 ? "paused" : "running" }}>
              ↓
            </span> scroll to grow
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Portfolio — wires the panels, nav, keyboard, and easter eggs ──── */

export function Portfolio() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const welcomeRef = useRef<HTMLElement>(null);
  const [confetti, setConfetti] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [active, setActive] = useState<Panel>("welcome");
  const [duckChatOpen, setDuckChatOpen] = useState(false);
  const openDuckChat = useCallback(() => setDuckChatOpen(true), []);
  const closeDuckChat = useCallback(() => setDuckChatOpen(false), []);
  const [qrOpen, setQrOpen] = useState(false);

  /* Panel changes are silent to assistive tech otherwise: announce each
     one (but not the initial panel) through a polite live region. */
  const [announce, setAnnounce] = useState("");
  const announcedOnce = useRef(false);
  useEffect(() => {
    if (!announcedOnce.current) {
      announcedOnce.current = true;
      return;
    }
    setAnnounce({ about: "About me", welcome: "Welcome", works: "My work" }[active] + " panel");
  }, [active]);

  /* Duck growth. The welcome panel's scroll position is the target; an
     rAF loop follows it on a time constant (not a per-frame lerp), so
     the duck glides in at the same speed at 60, 120 or 144Hz. */
  const [growth, setGrowth] = useState(0);
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef(0);
  const snapRef = useRef(false); // reduced motion: land on the target at once

  const ease = useCallback((t: number) => {
    // capped, so returning from a background tab can't jump
    const dt = lastTickRef.current ? Math.min(50, t - lastTickRef.current) : 1000 / 60;
    lastTickRef.current = t;
    const target = targetRef.current;
    const k = snapRef.current ? 1 : 1 - Math.exp(-dt / GROWTH_TAU_MS);
    let next = currentRef.current + (target - currentRef.current) * k;
    // Close enough — land exactly on target and stop the loop.
    if (Math.abs(target - next) < 0.0006) next = target;
    currentRef.current = next;
    setGrowth(next);
    if (next === target) {
      rafRef.current = null;
      lastTickRef.current = 0;
      return;
    }
    rafRef.current = requestAnimationFrame(ease);
  }, []);

  useEffect(() => {
    const el = welcomeRef.current;
    if (!el) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    snapRef.current = still.matches;
    const onMotionPref = () => {
      snapRef.current = still.matches;
    };
    still.addEventListener("change", onMotionPref);
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      targetRef.current = max > 0 ? el.scrollTop / max : 0;
      if (rafRef.current == null) rafRef.current = requestAnimationFrame(ease);
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      still.removeEventListener("change", onMotionPref);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [ease]);

  const goTo = useCallback((panel: Panel) => {
    const el = document.getElementById(`panel-${panel}`);
    el?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }, []);

  // Open centered on the welcome panel (instant, before paint).
  useEffect(() => {
    const center = () => {
      const scroller = scrollerRef.current;
      const welcome = document.getElementById("panel-welcome");
      if (scroller && welcome) scroller.scrollLeft = welcome.offsetLeft;
    };
    center();
    // Re-center once more after layout settles (fonts / boot screen).
    const raf = requestAnimationFrame(center);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Track which panel is in view, for nav highlighting.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const order: Panel[] = ["about", "welcome", "works"];
    const onScroll = () => {
      const i = Math.round(scroller.scrollLeft / scroller.clientWidth);
      setActive(order[Math.max(0, Math.min(2, i))]);
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, []);

  // Keyboard shortcuts: A → about, H → home, W → works.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "a" || e.key === "A") goTo("about");
      if (e.key === "w" || e.key === "W") goTo("works");
      if (e.key === "h" || e.key === "H") goTo("welcome");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo]);

  // Dismiss the QR popover on Escape or a click outside it.
  useEffect(() => {
    if (!qrOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setQrOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement)?.closest("[aria-label='Show site QR code'], [aria-label='Site QR code']")) {
        setQrOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [qrOpen]);

  // Konami code → leaf confetti + achievement toast.
  const unlock = useCallback(() => {
    setConfetti(true);
    setToast("ACHIEVEMENT UNLOCKED · KONAMI MASTER");
  }, []);
  useKonami(unlock);

  useEffect(() => {
    if (!confetti) return;
    const stopConfetti = setTimeout(() => setConfetti(false), 3800);
    return () => clearTimeout(stopConfetti);
  }, [confetti]);

  // Its own effect, independent of the confetti timer — sharing one effect
  // meant the confetti timeout flipping `confetti` to false re-ran this
  // effect and cancelled the still-pending toast timeout in its cleanup,
  // so the toast never went away.
  useEffect(() => {
    if (!toast) return;
    const hideToast = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(hideToast);
  }, [toast]);

  const navBtn = (panel: Panel): React.CSSProperties => ({
    background: "none",
    border: "none",
    cursor: "pointer",
    fontFamily: FONT,
    fontWeight: 700,
    fontSize: "13px",
    color: active === panel ? C.leaf : C.muted,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    transition: "color var(--dur-base) var(--ease-out)",
  });

  return (
    <div className="size-full" style={{ fontFamily: FONT, background: "transparent", height: "100vh", overflow: "hidden" }}>
      <a
        href="#panel-works"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          goTo("works");
          document.getElementById("panel-works")?.focus({ preventScroll: true });
        }}
      >
        Skip to my work
      </a>
      <Boot onDone={noop} />
      <Glow />
      <Confetti active={confetti} />
      <Toast text={toast} />
      <p className="sr-only" aria-live="polite" role="status">
        {announce}
      </p>
      <DuckChatPanel open={duckChatOpen} onClose={closeDuckChat} />

      {/* ── global top bar ── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: "rgba(8,9,9,0.82)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderBottom: `1px solid ${C.border}`,
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          padding: "0 24px",
          height: "54px",
        }}
      >
        <div style={{ justifySelf: "start", display: "flex", alignItems: "center", gap: "16px", position: "relative" }}>
          <button
            className="navlink"
            style={navBtn("about")}
            onClick={() => goTo("about")}
            aria-current={active === "about" ? "page" : undefined}
            aria-keyshortcuts="a"
          >
            ← About
          </button>
          <button
            onClick={() => setQrOpen((v) => !v)}
            aria-label="Show site QR code"
            aria-expanded={qrOpen}
            style={{
              color: qrOpen ? C.leaf : C.muted,
              display: "flex",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "color var(--dur-base) var(--ease-out)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.leaf)}
            onMouseLeave={(e) => (e.currentTarget.style.color = qrOpen ? C.leaf : C.muted)}
          >
            <QrCode size={16} />
          </button>
          {qrOpen && (
            <div
              role="dialog"
              aria-label="Site QR code"
              style={{
                position: "absolute",
                top: "calc(100% + 10px)",
                left: 0,
                background: C.panel,
                border: `1px solid ${C.border}`,
                borderRadius: "12px",
                padding: "14px",
                boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/site-qr.png" alt="QR code linking to summerpandey.com" width={120} height={120} style={{ borderRadius: "6px" }} />
              <span style={{ fontFamily: FONT, fontSize: "11px", color: C.muted, letterSpacing: "0.04em" }}>
                summerpandey.com
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => goTo("welcome")}
          aria-label="Home"
          aria-current={active === "welcome" ? "page" : undefined}
          aria-keyshortcuts="h"
          style={{
            justifySelf: "center",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          <span className="bob" style={{ display: "inline-flex" }}>
            <Sprout size={24} />
          </span>
          <Clock />
        </button>
        <div style={{ justifySelf: "end", display: "flex", alignItems: "center", gap: "18px" }}>
          <button
            className="navlink"
            style={navBtn("works")}
            onClick={() => goTo("works")}
            aria-current={active === "works" ? "page" : undefined}
            aria-keyshortcuts="w"
          >
            Works →
          </button>
          <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <a
              href={LINKEDIN}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              style={{ color: C.muted, display: "flex", transition: "color var(--dur-base) var(--ease-out)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.leaf)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
            >
              <Linkedin size={16} />
            </a>
            <a
              href={GITHUB}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              style={{ color: C.muted, display: "flex", transition: "color var(--dur-base) var(--ease-out)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.leaf)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
            >
              <Github size={16} />
            </a>
            <a
              href={MAILTO}
              aria-label="Email"
              style={{ color: C.muted, display: "flex", transition: "color var(--dur-base) var(--ease-out)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.leaf)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
            >
              <Mail size={16} />
            </a>
          </span>
        </div>
      </nav>

      {/* ── the horizontal panel track ── */}
      <div
        ref={scrollerRef}
        className="no-scrollbar"
        style={{
          display: "flex",
          height: "100vh",
          overflowX: "auto",
          overflowY: "hidden",
          scrollSnapType: "x mandatory",
        }}
      >
        <section id="panel-about" aria-label="About me" tabIndex={-1} style={panelStyle}>
          <AboutPanel goTo={goTo} />
        </section>
        <section id="panel-welcome" ref={welcomeRef} aria-label="Welcome" tabIndex={-1} style={panelStyle}>
          <Welcome
            goTo={goTo}
            p={growth}
            duckAwake={duckChatOpen}
            onDuckClick={openDuckChat}
            active={active}
          />
        </section>
        <section id="panel-works" aria-label="My work" tabIndex={-1} style={panelStyle}>
          <WorkPanel goTo={goTo} />
        </section>
      </div>

      {/* ── keyboard hint ── */}
      <div
        className="kbd-hint"
        aria-hidden
        style={{
          position: "fixed",
          bottom: "14px",
          left: "14px",
          zIndex: 70,
          opacity: active === "welcome" ? 1 : 0.7,
          transition: "opacity var(--dur-base) var(--ease-out)",
          fontFamily: FONT,
          fontSize: "11px",
          fontWeight: 600,
          color: "rgba(255,249,232,0.45)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <span className={active === "about" ? "kbd-key is-on" : "kbd-key"}>[A] About</span> ·{" "}
        <span className={active === "welcome" ? "kbd-key is-on" : "kbd-key"}>[H] Home</span> ·{" "}
        <span className={active === "works" ? "kbd-key is-on" : "kbd-key"}>[W] Works</span>
      </div>
    </div>
  );
}
