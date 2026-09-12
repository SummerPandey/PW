"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { C, FONT, SERIF, type Panel } from "./theme";
import { AboutPage } from "./AboutPage";
import { WorkPage } from "./WorkPage";
import { BootScreen, Confetti, Toast, Clock, Sprout, CodingDuck, useKonami, usePrefersReducedMotion } from "./fx";
import { DuckChat } from "./DuckChat";

export type { Panel } from "./theme";

/* ────────────────────────────────────────────────────────────────────
   Portfolio — the shell of the site.

   Three full-screen panels sit side by side in a horizontal,
   snap-scrolling track:  [ About | Welcome | Works ].
   The site opens centered on Welcome, where scrolling down grows
   a coding duck; the clouds up top navigate left and right.
   ──────────────────────────────────────────────────────────────────── */

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Every panel is exactly one viewport, scrolling its own content. */
const panelStyle: React.CSSProperties = {
  flex: "0 0 100vw",
  width: "100vw",
  height: "100vh",
  overflowY: "auto",
  overflowX: "hidden",
  scrollSnapAlign: "start",
};

/* ── CursorGlow — a soft sun-glow that follows the pointer ─────────── */

function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return; // no cursor on touch

    // Batch position updates into one transform per frame.
    let raf = 0;
    let x = 0;
    let y = 0;
    const apply = () => {
      raf = 0;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      el.style.opacity = "1";
    };
    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
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
        width: "180px",
        height: "180px",
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(234,170,34,0.32) 0%, rgba(234,170,34,0.14) 40%, rgba(234,170,34,0) 70%)",
        pointerEvents: "none",
        zIndex: 88,
        opacity: 0,
        transition: "opacity 0.35s ease",
        willChange: "transform",
      }}
    />
  );
}

/* ── CloudPuff — one painterly cloud, optionally with a label ──────── */

function CloudPuff({ label }: { label?: string }) {
  const gradientId = useId();
  return (
    <svg
      viewBox="0 0 240 150"
      width="100%"
      style={{ display: "block", overflow: "visible", filter: "drop-shadow(0 12px 22px rgba(0,0,0,0.35))" }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2e1f1c" />
          <stop offset="1" stopColor="#150c0b" />
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
      <ellipse cx="100" cy="52" rx="30" ry="13" fill="rgba(234,170,34,0.16)" />
      {label && (
        <text
          x="120"
          y="92"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily={FONT}
          fontSize="22"
          fontWeight="700"
          fill="#FFF9E8"
          style={{ paintOrder: "stroke", stroke: "rgba(10,5,4,0.85)", strokeWidth: 3.5 }}
        >
          {label}
        </text>
      )}
    </svg>
  );
}

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
        // Nav clouds slide in from their side; the rest drift down into place.
        const fromSide = cloud.x < 50 ? -1 : 1;
        const slide = cloud.label
          ? `translate(-50%, 0) translateX(${fromSide * (1 - a) * 130}px)`
          : `translate(-50%, ${(1 - a) * -64}px)`;

        return (
          <div
            key={i}
            onClick={cloud.nav ? () => goTo(cloud.nav as Panel) : undefined}
            role={cloud.nav ? "button" : undefined}
            aria-label={cloud.label}
            className={cloud.nav ? "btn-bounce" : undefined}
            style={{
              position: "absolute",
              left: `${cloud.x}%`,
              top: `${cloud.y}px`,
              width: `${cloud.w}px`,
              zIndex: cloud.z,
              opacity: a * 0.97,
              transform: slide,
              pointerEvents: cloud.nav && a > 0.6 ? "auto" : "none",
              cursor: cloud.nav ? "pointer" : "default",
            }}
          >
            {/* each cloud bobs at its own pace */}
            <div style={{ animation: `float-y ${cloud.s}s ease-in-out infinite` }}>
              <CloudPuff label={cloud.label} />
            </div>
          </div>
        );
      })}
    </>
  );
}

/* ── LightFall — motes of sunlight drifting down like golden snow ────
   Hover a mote and it pops into the cursor, then respawns up top. ── */

type MoteCfg = {
  left: number; // starting column, %
  size: number; // px
  fallDuration: number; // s
  fallDelay: number; // s (negative = already mid-fall)
  swayDuration: number; // s
  swayDelay: number; // s
};

function spawnMote(midFall: boolean): MoteCfg {
  return {
    left: 6 + Math.random() * 88,
    size: (5 + Math.random() * 7) * 1.2,
    fallDuration: 9 + Math.random() * 8,
    // On first render, scatter motes mid-fall; respawns start from the top.
    fallDelay: midFall ? -Math.random() * 18 : -Math.random() * 1.5,
    swayDuration: 3 + Math.random() * 3,
    swayDelay: -Math.random() * 4,
  };
}

function Mote() {
  const [cfg, setCfg] = useState<MoteCfg | null>(null);
  const [absorbing, setAbsorbing] = useState(false);

  // Spawn client-side only, so server and browser markup agree.
  useEffect(() => setCfg(spawnMote(true)), []);
  if (!cfg) return null;

  return (
    // outer layer: the fall; middle layer: the sway; inner: the glowing dot
    <div
      style={{
        position: "absolute",
        left: `${cfg.left}%`,
        top: 0,
        animation: `mote-fall ${cfg.fallDuration}s linear ${cfg.fallDelay}s infinite`,
        animationPlayState: absorbing ? "paused" : "running",
      }}
    >
      <div
        style={{
          animation: `mote-sway ${cfg.swayDuration}s ease-in-out ${cfg.swayDelay}s infinite`,
          animationPlayState: absorbing ? "paused" : "running",
        }}
      >
        <div
          onMouseEnter={() => setAbsorbing(true)}
          onAnimationEnd={(e) => {
            if (e.animationName === "mote-absorb") {
              setCfg(spawnMote(false)); // pop! respawn at the top
              setAbsorbing(false);
            }
          }}
          style={{
            width: `${cfg.size}px`,
            height: `${cfg.size}px`,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,212,71,0.9), rgba(234,170,34,0.45) 45%, transparent 72%)",
            boxShadow: "0 0 8px rgba(234,170,34,0.5)",
            pointerEvents: "auto",
            animation: absorbing ? "mote-absorb 0.5s cubic-bezier(0.34,1.7,0.5,1) forwards" : undefined,
          }}
        />
      </div>
    </div>
  );
}

function LightFall() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setCount(22);
  }, []);

  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 2 }}>
      {Array.from({ length: count }, (_, i) => (
        <Mote key={i} />
      ))}
    </div>
  );
}

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

  const move = useCallback((next: number) => {
    const clamped = Math.max(DUCK_MIN_PCT, Math.min(DUCK_MAX_PCT, next));
    setFacing((f) => (clamped > posRef.current ? "right" : clamped < posRef.current ? "left" : f));
    posRef.current = clamped;
    setPos(clamped);
    setAtEdge(clamped <= DUCK_MIN_PCT ? "about" : clamped >= DUCK_MAX_PCT ? "works" : null);
  }, []);

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
  // attach a real listener so scrolling over the water moves the duck instead
  // of scrolling the page, while the rest of the page scrolls normally.
  useEffect(() => {
    const el = waterRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      // Capped per notch so one hard trackpad flick can't shoot the duck
      // from the middle straight into an edge.
      move(posRef.current + Math.max(-3, Math.min(3, delta * 0.035)));
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [move]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    setDragging(true);
    dragMovedRef.current = false;
    dragStartXRef.current = e.clientX;
    dragStartPosRef.current = posRef.current;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // synthetic/test pointer ids can't be captured — dragging still works via the move handler
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || !waterRef.current) return;
    const dx = e.clientX - dragStartXRef.current;
    if (Math.abs(dx) > 4) dragMovedRef.current = true;
    const pct = (dx / waterRef.current.clientWidth) * 100;
    move(dragStartPosRef.current + pct);
  };

  const endDrag = () => {
    draggingRef.current = false;
    setDragging(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      move(posRef.current - 4);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      move(posRef.current + 4);
    }
  };

  const handleActivate = () => {
    if (dragMovedRef.current) {
      dragMovedRef.current = false;
      return;
    }
    onDuckClick();
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
      aria-label="The duck — scroll, drag, or use the arrow keys to paddle it across the water; hold it against the left edge for About me, the right edge for My work"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "clamp(160px, 26vw, 260px)",
        zIndex: 0,
        opacity: clamp01((g - 0.1) / 0.3),
        transition: "opacity 0.6s ease",
        touchAction: "none",
        outline: "none",
        cursor: dragging ? "grabbing" : "grab",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/moonlit-pixel-water.png"
        alt=""
        draggable={false}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center bottom",
          pointerEvents: "none",
          userSelect: "none",
        }}
      />

      {/* ripple, right under the duck's feet */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: "30%",
          left: `${pos}%`,
          transform: "translate(-50%, 50%)",
          width: "70px",
          height: "14px",
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(255,255,255,0.28), rgba(255,255,255,0) 70%)",
          pointerEvents: "none",
          animation: reducedMotion ? undefined : "ripple-pulse 2.6s ease-in-out infinite",
        }}
      />

      {/* left/right hints — flank the duck and nudge it the same way a key
          press does, so it's obvious at a glance what to do */}
      <button
        aria-label="Nudge the duck left, toward About me"
        onClick={() => move(posRef.current - 10)}
        style={{
          position: "absolute",
          bottom: "24%",
          left: `${pos}%`,
          transform: "translate(calc(-50% - 96px), 50%)",
          transition: dragging ? "none" : "left 0.14s linear",
          width: "38px",
          height: "38px",
          borderRadius: "50%",
          border: `2px solid ${C.leaf}`,
          background: "rgba(8,9,9,0.55)",
          color: C.leaf,
          fontSize: "16px",
          fontWeight: 700,
          lineHeight: 1,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: clamp01((g - 0.3) / 0.2),
          zIndex: 2,
        }}
      >
        ←
      </button>
      <button
        aria-label="Nudge the duck right, toward My work"
        onClick={() => move(posRef.current + 10)}
        style={{
          position: "absolute",
          bottom: "24%",
          left: `${pos}%`,
          transform: "translate(calc(-50% + 96px), 50%)",
          transition: dragging ? "none" : "left 0.14s linear",
          width: "38px",
          height: "38px",
          borderRadius: "50%",
          border: `2px solid ${C.leaf}`,
          background: "rgba(8,9,9,0.55)",
          color: C.leaf,
          fontSize: "16px",
          fontWeight: 700,
          lineHeight: 1,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: clamp01((g - 0.3) / 0.2),
          zIndex: 2,
        }}
      >
        →
      </button>

      <div
        style={{
          position: "absolute",
          bottom: "24%",
          left: `${pos}%`,
          width: "min(190px, 38vw)",
          transform: "translateX(-50%)",
          transition: dragging ? "none" : "left 0.14s linear",
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
            transform: "translateX(-50%)",
            marginBottom: "8px",
            width: "112px",
            padding: "6px 8px 5px",
            borderRadius: "10px",
            background: "rgba(8,9,9,0.82)",
            border: `1px solid ${atEdge ? C.leaf : C.border}`,
            opacity: heading ? 0.3 + 0.7 * heading.nearness : 0,
            transition: "opacity 0.25s ease, border-color 0.25s ease",
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
              transition: "color 0.25s ease",
              whiteSpace: "nowrap",
            }}
          >
            {heading?.side === "left" ? `← ${heading.label}` : `${heading?.label} →`}
          </div>
          <div style={{ height: "3px", marginTop: "5px", borderRadius: "2px", background: "rgba(255,249,232,0.14)" }}>
            <div
              style={{
                height: "100%",
                width: atEdge ? "100%" : "0%",
                borderRadius: "2px",
                background: C.leaf,
                transition: atEdge ? `width ${EDGE_HOLD_MS}ms linear` : "width 0.18s ease-out",
              }}
            />
          </div>
        </div>

        <div className={reducedMotion ? undefined : "duck-bob"} style={{ pointerEvents: "auto" }}>
          <CodingDuck
            p={g}
            awake={duckAwake}
            onActivate={handleActivate}
            facing={facing}
            resumeHref="/Summer_Pandey_Resume.pdf"
          />
        </div>
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
  return (
    <div style={{ height: "240vh", position: "relative" }}>
      <div
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
        {/* sun — crowns the headline, then rises & brightens with scroll */}
        <div
          style={{
            position: "absolute",
            top: `${44 - 26 * g}px`,
            left: "50%",
            transform: `translateX(-50%) scale(${0.8 + 0.55 * g})`,
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(255,212,71,${0.85 + 0.15 * g}), rgba(234,170,34,${0.55 + 0.45 * g}))`,
            boxShadow: `0 0 ${46 + 180 * g}px rgba(234,170,34,${0.28 + 0.4 * g})`,
            zIndex: 2,
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
            transform: `translateY(calc(-6vh - ${46 * g}px))`,
            opacity: Math.max(0, 1 - g * 2),
            pointerEvents: g > 0.3 ? "none" : "auto",
          }}
        >
          <div style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.32em", textTransform: "uppercase", color: C.wood }}>
            Hello, I&apos;m Summer
          </div>
          <h1
            className="serif"
            style={{
              fontFamily: SERIF,
              fontWeight: 600,
              fontSize: "clamp(40px, 7vw, 96px)",
              lineHeight: 1.02,
              color: C.dark,
              margin: "12px 0 0",
              letterSpacing: "0.01em",
            }}
          >
            Welcome to my
            <br />
            <span
              style={{
                background: `linear-gradient(90deg, ${C.leaf}, ${C.sun}, ${C.wood})`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
  room of ideas
            </span>
          </h1>
        </div>

        {/* water — the duck floats here and can be dragged/scrolled/keyed around */}
        <WaterDuck g={g} duckAwake={duckAwake} onDuckClick={onDuckClick} goTo={goTo} active={active} />

        {/* scroll cue — only before you start scrolling, then gone */}
        <div
          style={{
            position: "absolute",
            bottom: "22px",
            zIndex: 5,
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: C.muted,
            opacity: Math.max(0, 1 - g * 4),
            pointerEvents: "none",
          }}
        >
          ↓ scroll to grow
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

  /* Duck growth. The welcome panel's scroll position is the
     target; an rAF loop eases toward it so the duck glides in instead
     of snapping per wheel-notch. */
  const [growth, setGrowth] = useState(0);
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const ease = useCallback(() => {
    const target = targetRef.current;
    const current = currentRef.current;
    const next = current + (target - current) * 0.16;

    // Close enough — land exactly on target and stop the loop.
    if (Math.abs(target - next) < 0.0006) {
      currentRef.current = target;
      setGrowth(target);
      rafRef.current = null;
      return;
    }
    currentRef.current = next;
    setGrowth(next);
    rafRef.current = requestAnimationFrame(ease);
  }, []);

  useEffect(() => {
    const el = welcomeRef.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      targetRef.current = max > 0 ? el.scrollTop / max : 0;
      if (rafRef.current == null) rafRef.current = requestAnimationFrame(ease);
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
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

  // Konami code → leaf confetti + achievement toast.
  const unlock = useCallback(() => {
    setConfetti(true);
    setToast("ACHIEVEMENT UNLOCKED · KONAMI MASTER");
  }, []);
  useKonami(unlock);

  useEffect(() => {
    if (!confetti) return;
    const stopConfetti = setTimeout(() => setConfetti(false), 3800);
    const hideToast = setTimeout(() => setToast(null), 4200);
    return () => {
      clearTimeout(stopConfetti);
      clearTimeout(hideToast);
    };
  }, [confetti]);

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
    transition: "color 0.25s ease",
  });

  return (
    <div className="size-full" style={{ fontFamily: FONT, background: "transparent", height: "100vh", overflow: "hidden" }}>
      <BootScreen onDone={() => {}} />
      <CursorGlow />
      <Confetti active={confetti} />
      <Toast text={toast} />
      <DuckChat open={duckChatOpen} onClose={() => setDuckChatOpen(false)} />

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
          borderBottom: `1px solid ${C.border}`,
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          padding: "0 24px",
          height: "54px",
        }}
      >
        <button className="navlink btn-bounce" style={{ ...navBtn("about"), justifySelf: "start" }} onClick={() => goTo("about")}>
          ← About
        </button>
        <button
          onClick={() => goTo("welcome")}
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
        <button className="navlink btn-bounce" style={{ ...navBtn("works"), justifySelf: "end" }} onClick={() => goTo("works")}>
          Works →
        </button>
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
        <section id="panel-about" style={panelStyle}>
          <AboutPage goTo={goTo} />
        </section>
        <section id="panel-welcome" ref={welcomeRef} style={panelStyle}>
          <Welcome
            goTo={goTo}
            p={growth}
            duckAwake={duckChatOpen}
            onDuckClick={() => setDuckChatOpen(true)}
            active={active}
          />
        </section>
        <section id="panel-works" style={panelStyle}>
          <WorkPage goTo={goTo} />
        </section>
      </div>

      {/* ── keyboard hint ── */}
      <div
        style={{
          position: "fixed",
          bottom: "14px",
          left: "14px",
          zIndex: 70,
          fontFamily: FONT,
          fontSize: "10px",
          fontWeight: 600,
          color: "rgba(255,249,232,0.45)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        [A] About · [H] Home · [W] Works
      </div>
    </div>
  );
}
