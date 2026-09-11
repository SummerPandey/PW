"use client";

import { useEffect, useRef, useState } from "react";
import { C, FONT } from "./theme";

/* ────────────────────────────────────────────────────────────────────
   fx.tsx — the site's little moments of delight.

   Small, self-contained effects: the sprout logo, the coding duck
   that pops in on scroll, a live clock, a typewriter, scroll reveals,
   the boot screen, and a couple of playful easter eggs.
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

/* ── CodingDuck — a duck at a laptop pops in as p goes 0 → 1. In the
   dark it's a strong black silhouette with glowing red eyes; click it
   and it flips cute and yellow, ready to chat. A résumé tag sits by
   its feet. ── */

const DUCK_PALETTE = {
  dark: { body: "#0a0403", accent: "#3a1c16", eyeRing: "none" },
  awake: { body: "#ffd23f", accent: "#f5a623", eyeRing: "#fff" },
};

export function CodingDuck({
  p,
  awake = false,
  onActivate,
  className,
  resumeHref,
}: {
  p: number;
  awake?: boolean;
  onActivate?: () => void;
  className?: string;
  resumeHref?: string;
}) {
  const g = clamp01(p);
  const pop = clamp01((g - 0.05) / 0.4); // pop-in with a little overshoot
  const scale = 0.5 + 0.5 * pop;
  const rise = (1 - pop) * 36;
  const tagFade = clamp01((g - 0.32) / 0.15);
  const hintFade = awake ? 0 : clamp01((g - 0.55) / 0.2);

  const mood = awake ? DUCK_PALETTE.awake : DUCK_PALETTE.dark;
  const fillT = "fill 0.35s ease";

  return (
    <svg viewBox="0 0 300 340" className={className} width="100%" style={{ display: "block", overflow: "visible" }}>
      {/* ground shadow, settles in as the duck lands */}
      <ellipse cx={150} cy={300} rx={100 * pop} ry={13} fill="rgba(10,5,4,0.5)" />

      <g
        transform={`translate(150, ${300 + rise}) scale(${scale}) translate(-150, -300)`}
        opacity={clamp01(pop * 2.2)}
        style={{
          filter: awake
            ? "drop-shadow(0 0 12px rgba(255,210,63,0.45))"
            : "drop-shadow(0 0 6px rgba(226,72,58,0.28))",
          transition: "filter 0.35s ease",
        }}
      >
        <g
          onClick={onActivate}
          style={{ cursor: onActivate ? "pointer" : "default", pointerEvents: pop > 0.5 ? "auto" : "none" }}
        >
          {/* the classic rubber-duck silhouette: a rounded body with an
              integrated tail bump, a raised head, and a forward bill —
              built from one continuous outline so it reads as a single
              clean shape, the way a vector duck icon does. */}
          <path
            d="M45 206
               Q50 178 78 172
               Q76 150 96 138
               Q120 126 146 138
               Q168 150 172 174
               Q198 162 220 176
               Q238 188 234 208
               Q230 224 210 222
               Q222 240 218 260
               Q214 288 182 298
               Q150 306 118 300
               Q84 294 64 270
               Q48 250 45 206 Z"
            fill={mood.body}
            stroke={mood.accent}
            strokeWidth={3}
            strokeLinejoin="round"
            style={{ transition: fillT }}
          />

          {/* open bill, a hair darker than the body */}
          <path
            d="M45 206 Q50 178 78 172 Q86 186 82 200 Q76 214 58 216 Q48 214 45 206 Z"
            fill={mood.accent}
            style={{ transition: fillT }}
          />
          <path d="M53 197 Q66 203 79 198" stroke={mood.body} strokeWidth={2} fill="none" strokeLinecap="round" style={{ transition: fillT }} />

          {/* the one eye a side-profile duck gets */}
          {awake ? (
            <g>
              <circle cx={100} cy={162} r={10} fill="#1a1002" />
              <circle cx={103} cy={158} r={3} fill="#fff" />
              <ellipse cx={82} cy={176} rx={9} ry={5.5} fill="#ff8a65" opacity={0.5} />
            </g>
          ) : (
            <g style={{ animation: "sun-pulse 2.4s ease-in-out infinite" }}>
              <circle cx={100} cy={162} r={8} fill="#ff3b2b" />
            </g>
          )}

          {/* feet, peeking out from underneath */}
          <ellipse cx={110} cy={298} rx={10} ry={5.5} fill={mood.accent} style={{ transition: fillT }} />
          <ellipse cx={190} cy={298} rx={10} ry={5.5} fill={mood.accent} style={{ transition: fillT }} />

          {/* laptop, tucked under the chin — drawn last so its glow reads over the belly */}
          <path d="M68 300 L184 300 L194 308 L58 308 Z" fill={mood.accent} style={{ transition: fillT }} />
          <rect x={80} y={250} width={92} height={58} rx={4} fill="#0d0605" stroke={mood.accent} strokeWidth={2} style={{ transition: fillT }} />
          <rect x={86} y={256} width={80} height={46} rx={2} fill="#3a1010" />
          <rect x={93} y={265} width={44} height={3} rx={1.5} fill="#e2483a" opacity={0.85} />
          <rect x={93} y={274} width={58} height={3} rx={1.5} fill="#8a4a4a" opacity={0.75} />
          <rect x={93} y={283} width={32} height={3} rx={1.5} fill="#e2483a" opacity={0.65} />
        </g>
      </g>

      {/* "ask me" hint — fades in once the duck has settled, gone once awake */}
      <g opacity={hintFade} style={{ pointerEvents: "none" }}>
        <rect x={58} y={86} width={114} height={26} rx={13} fill="#2a1210" stroke="#5c2620" strokeWidth={1.5} />
        <text
          x={115}
          y={100}
          dominantBaseline="central"
          textAnchor="middle"
          fontFamily={FONT}
          fontSize={11.5}
          fontWeight={700}
          fill="#f3e3dc"
        >
          ask me something
        </text>
      </g>

      {/* résumé tag, set down by the duck's feet */}
      <a
        href={resumeHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Résumé"
        style={{ pointerEvents: tagFade > 0.6 ? "auto" : "none" }}
      >
        <g opacity={tagFade} style={{ cursor: "pointer" }}>
          <rect x={100} y={306} width={100} height={25} rx={12.5} fill="#2a1210" />
          <rect x={100} y={306} width={100} height={25} rx={12.5} fill="none" stroke="#5c2620" strokeWidth={1.5} />
          <text
            x={150}
            y={319}
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

/* ── DuckPeek — just the cute yellow head, poking up beside the chat
   panel so the duck never gets buried under its own popup. ─────────── */

export function DuckPeek({ size = 68, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      style={{ display: "block", overflow: "visible" }}
    >
      <g className="bob">
        {/* head, same profile silhouette as the big duck, just cropped to the head */}
        <circle cx={64} cy={62} r={42} fill="#ffd23f" stroke="#f5a623" strokeWidth={2.5} />
        {/* bill, pointing out to the side */}
        <path d="M14 68 Q20 44 46 40 Q54 54 50 68 Q44 82 26 84 Q16 82 14 68 Z" fill="#f5a623" />
        <path d="M22 60 Q34 66 46 61" stroke="#ffd23f" strokeWidth={2} fill="none" strokeLinecap="round" />
        {/* the one eye */}
        <circle cx={68} cy={48} r={9} fill="#1a1002" />
        <circle cx={71.5} cy={44} r={2.8} fill="#fff" />
        <ellipse cx={50} cy={62} rx={8} ry={5} fill="#ff8a65" opacity={0.5} />
      </g>
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
