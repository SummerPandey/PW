"use client";

import { useEffect, useRef, useState } from "react";
import { C, FONT, MAILTO, RESUME_PDF } from "./theme";
import { DuckPeek, usePrefersReducedMotion } from "./fx";

/* ────────────────────────────────────────────────────────────────────
   DuckChat — the panel that opens when you click the duck. Talks to
   /api/duck-chat, which answers as Summer's coding duck.

   It has a real lifecycle: it grows out of its bottom-right corner (where
   the duck lives) on open, sinks away on close instead of popping out,
   and hands focus back to whatever opened it.
   ──────────────────────────────────────────────────────────────────── */

type Message = { role: "user" | "duck"; text: string };

const GREETING: Message = {
  role: "duck",
  text: "quack — me Summer's duck. Ask about Summer's projects, skills, work.",
};

/** Starter questions shown under the greeting until the first message. */
const STARTERS = ["What has Summer built?", "What's his tech stack?", "Is Summer open to roles?", "How do I reach Summer?"];

/** Matches the .duck-chat close animation (--dur-base) in globals.css. */
const EXIT_MS = 200;

export function DuckChat({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const reduced = usePrefersReducedMotion();

  // Stay mounted through the exit animation.
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  if (open && (!mounted || closing)) {
    // opening (or re-opening mid-exit) takes effect in this same render
    setMounted(true);
    setClosing(false);
  }
  useEffect(() => {
    if (open || !mounted) return;
    if (reduced) {
      setMounted(false);
      return;
    }
    setClosing(true);
    const t = window.setTimeout(() => {
      setMounted(false);
      setClosing(false);
    }, EXIT_MS);
    return () => window.clearTimeout(t);
  }, [open, mounted, reduced]);

  // On open: remember who opened us and focus the input. On close: hand
  // focus back (unless the visitor already moved it somewhere else).
  useEffect(() => {
    if (open) {
      const active = document.activeElement;
      openerRef.current = active instanceof HTMLElement && active !== document.body ? active : null;
      inputRef.current?.focus({ preventScroll: true });
      return;
    }
    const opener = openerRef.current;
    openerRef.current = null;
    const active = document.activeElement;
    const focusIsOurs = !active || active === document.body || rootRef.current?.contains(active);
    if (opener?.isConnected && focusIsOurs) opener.focus({ preventScroll: true });
  }, [open]);

  // Escape closes the panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Auto-scroll to the newest message.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: reduced ? "auto" : "smooth" });
  }, [messages, loading, reduced]);

  async function send(preset?: string) {
    const text = (preset ?? input).trim();
    if (!text || loading) return;
    if (preset === undefined) setInput("");
    setError(null);
    const next = [...messages, { role: "user" as const, text }];
    setMessages(next);
    setLoading(true);

    try {
      const res = await fetch("/api/duck-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: next.slice(-8).map((m) => ({ role: m.role === "duck" ? "assistant" : "user", content: m.text })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "The duck didn't answer.");
      setMessages((m) => [...m, { role: "duck", text: data.reply as string }]);
    } catch {
      setError("Couldn't reach the duck's brain — try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  return (
    <div
      ref={rootRef}
      className="duck-chat"
      data-state={closing ? "closed" : "open"}
      style={{
        position: "fixed",
        bottom: "calc(20px + env(safe-area-inset-bottom, 0px))",
        right: "20px",
        zIndex: 90,
        width: "min(340px, calc(100vw - 32px))",
      }}
    >
      {/* the duck itself, poking its head up beside its own popup */}
      <div
        style={{
          position: "absolute",
          top: "-40px",
          left: "8px",
          zIndex: 1,
          pointerEvents: "none",
          filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.4))",
        }}
      >
        <DuckPeek size={72} className="duck-chat-peek" />
      </div>

      {/* the panel itself — clipped to its rounded corners, so it needs
          its own box separate from the duck poking out above it */}
      <div
        role="dialog"
        aria-label="Chat with the coding duck"
        className="duck-chat-panel"
        style={{
          display: "flex",
          flexDirection: "column",
          background: "#121313",
          border: "1px solid rgba(255,212,71,0.28)",
          borderRadius: "18px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,212,71,0.06)",
          overflow: "hidden",
          fontFamily: FONT,
        }}
      >
        {/* header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 14px",
            borderBottom: "1px solid rgba(255,212,71,0.16)",
            background: "linear-gradient(180deg, rgba(255,212,71,0.08), transparent)",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/duck-pixel.png" alt="" width={20} height={20} style={{ imageRendering: "pixelated" }} />
            <span style={{ fontSize: "13px", fontWeight: 700, color: C.dark, letterSpacing: "0.01em" }}>
              Summer&apos;s coding duck
            </span>
          </span>
          <button
            onClick={onClose}
            aria-label="Close chat"
            className="icon-btn hit"
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.05)",
              color: C.muted,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "13px",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* messages */}
        <div
          ref={listRef}
          role="log"
          aria-live="polite"
          aria-label="Conversation"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "14px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            minHeight: "160px",
          }}
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className="chat-msg"
              style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "84%",
                padding: "9px 12px",
                borderRadius: "14px",
                borderBottomRightRadius: m.role === "user" ? "4px" : "14px",
                borderBottomLeftRadius: m.role === "duck" ? "4px" : "14px",
                background: m.role === "user" ? `linear-gradient(90deg, ${C.leaf}, ${C.sun})` : "#1A1B1B",
                border: m.role === "duck" ? "1px solid rgba(255,212,71,0.18)" : "none",
                color: m.role === "user" ? "#080909" : C.moss,
                fontSize: "13px",
                fontWeight: 500,
                lineHeight: 1.5,
              }}
            >
              {m.text}
            </div>
          ))}
          {messages.length === 1 && !loading && (
            <div className="duck-starters" role="group" aria-label="Suggested questions">
              {STARTERS.map((q) => (
                <button key={q} type="button" className="duck-chip" onClick={() => send(q)}>
                  {q}
                </button>
              ))}
            </div>
          )}
          {loading && (
            <div
              className="chat-msg"
              style={{
                alignSelf: "flex-start",
                padding: "9px 12px",
                borderRadius: "14px",
                borderBottomLeftRadius: "4px",
                background: "#1A1B1B",
                border: "1px solid rgba(255,212,71,0.18)",
                color: C.muted,
                fontSize: "13px",
              }}
            >
              <span className="cursor">▮</span> thinking
            </div>
          )}
          {error && (
            <div className="chat-msg" style={{ fontSize: "12px", color: C.sun, fontWeight: 600, alignSelf: "flex-start" }}>
              {error}
            </div>
          )}
        </div>

        {/* always-visible hiring shortcuts — plain links, nothing sent */}
        <div className="duck-links">
          <a href={RESUME_PDF} target="_blank" rel="noopener noreferrer">
            Résumé (PDF) ↗
          </a>
          <a href={MAILTO}>Email Summer</a>
        </div>

        {/* input */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            padding: "10px",
            borderTop: "1px solid rgba(255,212,71,0.12)",
          }}
        >
          <input
            ref={inputRef}
            className="duck-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              // an IME confirming a word also sends Enter; don't send then
              if (e.key === "Enter" && !e.nativeEvent.isComposing) send();
            }}
            placeholder="Ask about a project, skill..."
            aria-label="Message the duck"
            enterKeyHint="send"
            autoComplete="off"
            maxLength={400}
            style={{
              flex: 1,
              minWidth: 0,
              background: "#080909",
              borderRadius: "999px",
              padding: "9px 14px",
              color: C.dark,
              fontFamily: FONT,
            }}
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="btn-bounce chat-send"
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              border: "none",
              background: "#FFD447",
              color: "#080909",
              fontWeight: 700,
              fontSize: "15px",
              cursor: loading || !input.trim() ? "default" : "pointer",
              opacity: loading || !input.trim() ? 0.5 : 1,
              flexShrink: 0,
            }}
            aria-label="Send"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}
