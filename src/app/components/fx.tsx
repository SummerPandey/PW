"use client";

import { useEffect, useRef, useState } from "react";
import { C, FONT } from "./theme";

/* ────────────────────────────────────────────────────────────────────
   fx.tsx — the site's little moments of delight.

   Small, self-contained effects: the sprout logo, the scroll-grown
   treeline, a live clock, a typewriter, scroll reveals, the boot
   screen, and a couple of playful easter eggs.
   ──────────────────────────────────────────────────────────────────── */

/** Clamp a value into the 0–1 range. */
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/* ── Sprout — the site mark: a stem with two leaves ─────────────────── */

export function Sprout({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      {/* stem */}
      <path d="M12 22V11" stroke={C.bark} strokeWidth="2" strokeLinecap="round" />
      {/* left leaf (green) */}
      <path
        d="M12 13C12 13 8.5 12.6 6.4 10.2C4.9 8.5 5 5.6 5 5.6C5 5.6 8 5.4 10 7.4C11.7 9.1 12 13 12 13Z"
        fill={C.leaf}
      />
      {/* right leaf (gold) */}
      <path
        d="M12 11C12 11 14.6 10 16 7.8C17 6.2 16.8 3.8 16.8 3.8C16.8 3.8 14.4 4 13 6C11.9 7.6 12 11 12 11Z"
        fill={C.sun}
      />
    </svg>
  );
}

/* ── GrowingTrees — a bare, wind-swept treeline rises as p goes 0 → 1 ──
   Each tree starts at its own delay so the grove climbs in a wave.
   A résumé tag sits at the root of the tallest tree. ───────────────── */

type TreeCfg = {
  x: number; // trunk base, in the 0–1000 viewBox
  h: number; // full-grown height
  lean: number; // tip drift, px — the wind direction
  delay: number; // 0–1 slice of growth before this tree starts climbing
  branches: number;
};

const BASE_Y = 300;

// Deterministic, hand-placed — not random, so server and client agree.
const TREES: TreeCfg[] = [
  { x: 40, h: 108, lean: -14, delay: 0.16, branches: 3 },
  { x: 150, h: 168, lean: 10, delay: 0.04, branches: 4 },
  { x: 260, h: 128, lean: -8, delay: 0.22, branches: 3 },
  { x: 380, h: 196, lean: 14, delay: 0.0, branches: 5 },
  { x: 500, h: 236, lean: 8, delay: 0.1, branches: 5 }, // tallest — carries the résumé tag
  { x: 630, h: 172, lean: -12, delay: 0.18, branches: 4 },
  { x: 750, h: 118, lean: 9, delay: 0.06, branches: 3 },
  { x: 860, h: 152, lean: -10, delay: 0.26, branches: 4 },
  { x: 960, h: 100, lean: 12, delay: 0.12, branches: 3 },
];

const TAG_TREE = TREES[4];

/** One bare tree: a curved trunk with branches that sprout in as the
    trunk climbs past them, angled outward like wind-bent limbs. */
function Tree({ cfg, g }: { cfg: TreeCfg; g: number }) {
  const growth = clamp01((g - cfg.delay) / (0.92 - cfg.delay));
  if (growth <= 0) return null;

  const h = cfg.h * growth;
  const tipX = cfg.x + cfg.lean * growth;
  const tipY = BASE_Y - h;
  const trunkPath = `M${cfg.x} ${BASE_Y} Q${cfg.x + cfg.lean * 0.4 * growth} ${BASE_Y - h * 0.55} ${tipX} ${tipY}`;

  const branches = Array.from({ length: cfg.branches }, (_, i) => {
    const frac = 0.32 + (i / cfg.branches) * 0.6; // spread up the trunk
    const bGrowth = clamp01((growth - frac * 0.6) / (1 - frac * 0.6));
    if (bGrowth <= 0) return null;

    const alongX = cfg.x + cfg.lean * growth * frac;
    const alongY = BASE_Y - h * frac;
    const side = i % 2 === 0 ? 1 : -1;
    const len = (16 + i * 3.5) * bGrowth;
    const rad = (side * (34 + i * 7) * Math.PI) / 180;
    const endX = alongX + Math.sin(rad) * len;
    const endY = alongY - Math.cos(rad) * len * 0.75;

    return (
      <path
        key={i}
        d={`M${alongX} ${alongY} Q${alongX + Math.sin(rad) * len * 0.5} ${alongY - len * 0.4} ${endX} ${endY}`}
        stroke="#3a1c16"
        strokeWidth={Math.max(1.3, 3.4 - i * 0.35)}
        strokeLinecap="round"
        fill="none"
        opacity={bGrowth}
      />
    );
  });

  return (
    <g opacity={clamp01(growth * 3)} style={{ filter: "drop-shadow(0 0 5px rgba(226,72,58,0.3))" }}>
      <path d={trunkPath} stroke="#3a1c16" strokeWidth={Math.max(2.8, 5.5 * growth)} strokeLinecap="round" fill="none" />
      {branches}
    </g>
  );
}

export function GrowingTrees({
  p,
  className,
  resumeHref,
}: {
  p: number;
  className?: string;
  resumeHref?: string;
}) {
  const g = clamp01(p);
  const groveGrowth = clamp01(g / 0.5); // how settled-in the ground looks
  const tagFade = clamp01((g - 0.12) / 0.15);

  return (
    <svg viewBox="0 0 1000 320" className={className} width="100%" style={{ display: "block" }}>
      {/* ground — a dark horizon line the trees root into */}
      <g opacity={0.3 + 0.7 * groveGrowth}>
        <path d="M0 300 Q500 288 1000 300 L1000 320 L0 320 Z" fill="rgba(10,5,4,0.55)" />
      </g>

      {TREES.map((cfg, i) => (
        <Tree key={i} cfg={cfg} g={g} />
      ))}

      {/* résumé tag planted at the tallest tree's root */}
      <a
        href={resumeHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Résumé"
        style={{ pointerEvents: tagFade > 0.6 ? "auto" : "none" }}
      >
        <g opacity={tagFade} style={{ cursor: "pointer" }}>
          <rect x={TAG_TREE.x - 50} y={280} width={100} height={25} rx={12.5} fill="#2a1210" />
          <rect x={TAG_TREE.x - 50} y={280} width={100} height={25} rx={12.5} fill="none" stroke="#5c2620" strokeWidth={1.5} />
          <text
            x={TAG_TREE.x}
            y={293}
            dominantBaseline="central"
            textAnchor="middle"
            fontFamily={FONT}
            fontSize={13}
            fontWeight={700}
            fill="#f3e3dc"
          >
            Résumé ↓
          </text>
        </g>
      </a>
    </svg>
  );
}

/* ── Clock — live HH:MM:SS with a gently floating green dot ──────────
   Mounts client-side only, so the server and browser never disagree. */

export function useClock() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export function Clock({ color = C.leaf }: { color?: string }) {
  const time = useClock();
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        fontFamily: FONT,
        fontWeight: 600,
        fontSize: "12px",
        color,
        letterSpacing: "0.08em",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      <span
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: C.leaf,
          boxShadow: `0 0 8px ${C.leaf}`,
          animation: "float-y 1.6s ease-in-out infinite",
        }}
      />
      {time ?? "--:--:--"}
    </span>
  );
}

/* ── Typewriter — types multi-line text with a blinking cursor ───────
   Waits until it scrolls into view, so the typing isn't wasted
   offscreen. Under reduced motion it just shows the full text. ───── */

export function Typewriter({
  text,
  speed = 55,
  style,
}: {
  text: string;
  speed?: number;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);
  const [typed, setTyped] = useState(0); // how many characters are showing

  // Start typing the first time we're at least 40% visible.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStarted(true);
      setTyped(text.length);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [text]);

  // One character per tick; pause a little longer at line breaks.
  useEffect(() => {
    if (!started || typed >= text.length) return;
    const delay = text[typed] === "\n" ? speed * 3 : speed;
    const id = setTimeout(() => setTyped((n) => n + 1), delay);
    return () => clearTimeout(id);
  }, [started, typed, text, speed]);

  return (
    <span ref={ref} style={{ whiteSpace: "pre-line", ...style }}>
      {text.slice(0, typed)}
      <span className="cursor" style={{ color: C.sun }}>
        ▮
      </span>
    </span>
  );
}

/* ── Reveal — bounces children in the first time they scroll into view ── */

export function Reveal({
  children,
  style,
  delay = 0,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={"reveal" + (shown ? " in" : "")} style={{ animationDelay: `${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

/* ── BootScreen — a sprout grows in while the site "loads" ───────────
   Shown once per browser session; any click or key skips it. ─────── */

export function BootScreen({ onDone }: { onDone: () => void }) {
  const [show, setShow] = useState(true);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    // Already booted this session? Skip straight in.
    if (typeof window !== "undefined" && sessionStorage.getItem("booted") === "1") {
      setShow(false);
      onDone();
      return;
    }
    const bar = setInterval(() => setPct((p) => Math.min(100, p + Math.random() * 18 + 6)), 130);
    const done = setTimeout(finish, 2200);
    return () => {
      clearInterval(bar);
      clearTimeout(done);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function finish() {
    if (typeof window !== "undefined") sessionStorage.setItem("booted", "1");
    setShow(false);
    onDone();
  }

  // Any key or click skips the boot.
  useEffect(() => {
    if (!show) return;
    const skip = () => finish();
    window.addEventListener("keydown", skip);
    window.addEventListener("click", skip);
    return () => {
      window.removeEventListener("keydown", skip);
      window.removeEventListener("click", skip);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background:
          "radial-gradient(900px 600px at 50% -10%, rgba(226,72,58,0.35), transparent 60%), " +
          "linear-gradient(180deg, #1e0a0a 0%, #050302 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        fontFamily: FONT,
        cursor: "pointer",
      }}
    >
      {/* glowing sun + growing sprout */}
      <div
        style={{
          position: "relative",
          width: "120px",
          height: "96px",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "radial-gradient(circle, #ff8a65, #e2483a)",
            boxShadow: "0 0 38px rgba(226,72,58,0.7)",
            animation: "sun-pulse 2.4s ease-in-out infinite",
          }}
        />
        <div style={{ transformOrigin: "bottom center", animation: "grow 1.1s cubic-bezier(0.34,1.56,0.64,1) forwards" }}>
          <Sprout size={64} />
        </div>
      </div>

      <div className="serif" style={{ fontSize: "26px", fontWeight: 600, color: C.cream, letterSpacing: "0.04em" }}>
        Portfolio
      </div>
      <div
        style={{
          fontSize: "11px",
          fontWeight: 600,
          color: C.sun,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
        }}
      >
        Summer Pandey — growing…
      </div>

      {/* progress bar */}
      <div
        style={{
          width: "240px",
          height: "8px",
          borderRadius: "999px",
          background: "rgba(255,255,255,0.12)",
          overflow: "hidden",
          marginTop: "4px",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${C.leaf}, ${C.sun})`,
            borderRadius: "999px",
            transition: "width 0.13s linear",
          }}
        />
      </div>

      <div
        style={{
          fontSize: "10px",
          color: "rgba(243,222,210,0.5)",
          letterSpacing: "0.14em",
          marginTop: "6px",
          textTransform: "uppercase",
        }}
      >
        click or press any key to enter
      </div>
    </div>
  );
}

/* ── useKonami — fires when someone types the classic code ─────────── */

const KONAMI = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
];

export function useKonami(onUnlock: () => void) {
  useEffect(() => {
    let progress = 0;
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === KONAMI[progress]) {
        progress++;
        if (progress === KONAMI.length) {
          progress = 0;
          onUnlock();
        }
      } else {
        // A wrong key restarts — unless it's Up, which starts a new attempt.
        progress = key === KONAMI[0] ? 1 : 0;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onUnlock]);
}

/* ── Confetti — a flurry of falling embers to celebrate ─────────────── */

type Ember = {
  left: number;
  delay: number;
  duration: number;
  size: number;
  glyph: string;
  color: string;
};

const EMBER_COLORS = ["#e2483a", "#ff8a65", "#c9382a", "#f0dcd2"];

function makeEmbers(): Ember[] {
  return Array.from({ length: 46 }, () => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.8,
    duration: 2.4 + Math.random() * 1.8,
    size: 10 + Math.random() * 10,
    glyph: ["✦", "✧", "⋆", "·"][Math.floor(Math.random() * 4)],
    color: EMBER_COLORS[Math.floor(Math.random() * EMBER_COLORS.length)],
  }));
}

export function Confetti({ active }: { active: boolean }) {
  const [embers, setEmbers] = useState<Ember[]>([]);

  // A fresh random flurry every time the confetti turns on.
  useEffect(() => {
    if (active) setEmbers(makeEmbers());
  }, [active]);

  if (!active) return null;

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 95, overflow: "hidden" }}>
      {embers.map((ember, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            top: 0,
            left: `${ember.left}%`,
            fontSize: `${ember.size}px`,
            color: ember.color,
            textShadow: `0 0 8px ${ember.color}`,
            animation: `leaf-fall ${ember.duration}s linear ${ember.delay}s forwards`,
          }}
        >
          {ember.glyph}
        </span>
      ))}
    </div>
  );
}

/* ── Toast — an "achievement unlocked" pill at the bottom ──────────── */

export function Toast({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: "28px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 96,
        background: C.panel,
        border: `1px solid ${C.leaf}`,
        borderRadius: "999px",
        padding: "12px 20px",
        fontFamily: FONT,
        fontWeight: 600,
        fontSize: "12px",
        color: C.cream,
        letterSpacing: "0.08em",
        boxShadow: "0 12px 34px rgba(0,0,0,0.5)",
        animation: "toast-in 0.3s ease",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ color: C.sun }}>✦</span>
      {text}
    </div>
  );
}
