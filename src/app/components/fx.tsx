"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const COPPER = "#B87840";
const DARK = "#241A0F";
const CREAM = "#FBF6EC";
const FONT = "'Press Start 2P', monospace";

/* ── live clock (HH:MM:SS) — mounts client-side to avoid hydration drift ── */
export function useClock() {
  const [t, setT] = useState<string | null>(null);
  useEffect(() => {
    const tick = () =>
      setT(
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
  return t;
}

export function Clock({ color = COPPER }: { color?: string }) {
  const t = useClock();
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "6px", color, letterSpacing: "0.1em" }}>
      <span
        style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#3FB950", boxShadow: "0 0 6px #3FB950", animation: "float-y 1.6s ease-in-out infinite" }}
      />
      {t ?? "--:--:--"}
    </span>
  );
}

/* ── typewriter that types out multi-line text with a blinking cursor ── */
export function Typewriter({
  text,
  speed = 55,
  style,
}: {
  text: string;
  speed?: number;
  style?: React.CSSProperties;
}) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (n >= text.length) return;
    const delay = text[n] === "\n" ? speed * 3 : speed;
    const id = setTimeout(() => setN((v) => v + 1), delay);
    return () => clearTimeout(id);
  }, [n, text, speed]);
  return (
    <span style={{ whiteSpace: "pre-line", ...style }}>
      {text.slice(0, n)}
      <span className="cursor" style={{ color: COPPER }}>
        ▮
      </span>
    </span>
  );
}

/* ── scroll-reveal wrapper (IntersectionObserver) ── */
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
      ([e]) => {
        if (e.isIntersecting) {
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

/* ── 8-bit boot screen, shown once per browser session ── */
export function BootScreen({ onDone }: { onDone: () => void }) {
  const [show, setShow] = useState(true);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("booted") === "1") {
      setShow(false);
      onDone();
      return;
    }
    const id = setInterval(() => setPct((p) => Math.min(100, p + Math.random() * 18 + 6)), 130);
    const done = setTimeout(finish, 2200);
    return () => {
      clearInterval(id);
      clearTimeout(done);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function finish() {
    if (typeof window !== "undefined") sessionStorage.setItem("booted", "1");
    setShow(false);
    onDone();
  }

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
        background: DARK,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "22px",
        fontFamily: FONT,
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", gap: "4px", alignItems: "flex-end" }}>
        <div style={{ width: "10px", height: "30px", background: CREAM, borderRadius: "2px", animation: "float-y 1s ease-in-out infinite" }} />
        <div style={{ width: "10px", height: "20px", background: COPPER, borderRadius: "2px", animation: "float-y 1s ease-in-out infinite 0.15s" }} />
        <div style={{ width: "10px", height: "13px", background: "#5C3D20", borderRadius: "2px", animation: "float-y 1s ease-in-out infinite 0.3s" }} />
      </div>
      <div style={{ fontSize: "12px", color: CREAM, letterSpacing: "0.18em" }}>PORTFOLIO.EXE</div>
      <div style={{ fontSize: "6px", color: COPPER, letterSpacing: "0.12em" }}>SUMMER PANDEY — LOADING…</div>
      <div style={{ width: "220px", height: "10px", border: `1px solid ${COPPER}`, borderRadius: "3px", padding: "2px", marginTop: "4px" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: COPPER, borderRadius: "1px", transition: "width 0.13s linear" }} />
      </div>
      <div style={{ fontSize: "5px", color: "rgba(251,246,236,0.4)", letterSpacing: "0.14em", marginTop: "6px" }}>
        CLICK OR PRESS ANY KEY TO ENTER
      </div>
    </div>
  );
}

/* ── Konami code detector ── */
const KONAMI = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
];
export function useKonami(onUnlock: () => void) {
  useEffect(() => {
    let i = 0;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (k === KONAMI[i]) {
        i++;
        if (i === KONAMI.length) {
          i = 0;
          onUnlock();
        }
      } else {
        i = k === KONAMI[0] ? 1 : 0;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onUnlock]);
}

/* ── pixel confetti rain ── */
export function Confetti({ active }: { active: boolean }) {
  const bits = useMemo(
    () =>
      Array.from({ length: 50 }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        dur: 1.8 + Math.random() * 1.6,
        size: 6 + Math.random() * 8,
        ch: Math.random() > 0.5 ? "✦" : "■",
        color: [COPPER, DARK, "#5C3D20", "#D4C4A8"][Math.floor(Math.random() * 4)],
      })),
    // re-randomize each time it turns on
    [active]
  );
  if (!active) return null;
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 95, overflow: "hidden" }}>
      {bits.map((b, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            top: 0,
            left: `${b.left}%`,
            fontSize: `${b.size}px`,
            color: b.color,
            animation: `confetti-fall ${b.dur}s linear ${b.delay}s forwards`,
          }}
        >
          {b.ch}
        </span>
      ))}
    </div>
  );
}

/* ── "achievement unlocked" toast ── */
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
        background: DARK,
        border: `1px solid ${COPPER}`,
        borderRadius: "6px",
        padding: "12px 18px",
        fontFamily: FONT,
        fontSize: "7px",
        color: CREAM,
        letterSpacing: "0.1em",
        boxShadow: "0 10px 30px rgba(36,26,15,0.4)",
        animation: "toast-in 0.3s ease",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ color: COPPER }}>★</span>
      {text}
    </div>
  );
}

/* ── keyboard navigation: A → about, W → work ── */
export function useKeyboardNav(onNav: (p: "about" | "work") => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "a" || e.key === "A") onNav("about");
      if (e.key === "w" || e.key === "W") onNav("work");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onNav]);
}
