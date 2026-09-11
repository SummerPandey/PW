"use client";

import { useEffect, useRef, useState } from "react";
import { C, FONT } from "./theme";
import { DuckPeek } from "./fx";

/* ────────────────────────────────────────────────────────────────────
   DuckChat — the panel that opens when you click the duck. Talks to
   /api/duck-chat, which answers as Summer's coding duck.
   ──────────────────────────────────────────────────────────────────── */

type Message = { role: "user" | "duck"; text: string };

const GREETING: Message = {
  role: "duck",
  text: "quack — I'm Summer's coding duck. Ask me about her projects, skills, or experience.",
};

export function DuckChat({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus the input the moment the panel opens.
  useEffect(() => {
    if (open) inputRef.current?.focus();
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
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
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

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
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
        <DuckPeek size={72} />
      </div>

      {/* the panel itself — clipped to its rounded corners, so it needs
          its own box separate from the duck poking out above it */}
      <div
        role="dialog"
        aria-label="Chat with the coding duck"
        style={{
          maxHeight: "min(480px, calc(100vh - 100px))",
          display: "flex",
          flexDirection: "column",
          background: "#130c0b",
          border: "1px solid rgba(255,210,63,0.28)",
          borderRadius: "18px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,210,63,0.06)",
          overflow: "hidden",
          fontFamily: FONT,
          animation: "toast-in 0.25s ease",
        }}
      >
        {/* header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 14px",
            borderBottom: "1px solid rgba(255,210,63,0.16)",
            background: "linear-gradient(180deg, rgba(255,210,63,0.08), transparent)",
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
            className="icon-btn"
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
              style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "84%",
                padding: "9px 12px",
                borderRadius: "14px",
                borderBottomRightRadius: m.role === "user" ? "4px" : "14px",
                borderBottomLeftRadius: m.role === "duck" ? "4px" : "14px",
                background: m.role === "user" ? `linear-gradient(90deg, ${C.leaf}, ${C.sun})` : "#1c1110",
                border: m.role === "duck" ? "1px solid rgba(255,210,63,0.18)" : "none",
                color: m.role === "user" ? "#1a0605" : C.moss,
                fontSize: "13px",
                fontWeight: 500,
                lineHeight: 1.5,
              }}
            >
              {m.text}
            </div>
          ))}
          {loading && (
            <div
              style={{
                alignSelf: "flex-start",
                padding: "9px 12px",
                borderRadius: "14px",
                borderBottomLeftRadius: "4px",
                background: "#1c1110",
                border: "1px solid rgba(255,210,63,0.18)",
                color: C.muted,
                fontSize: "13px",
              }}
            >
              <span className="cursor">▮</span> thinking
            </div>
          )}
          {error && (
            <div style={{ fontSize: "12px", color: C.sun, fontWeight: 600, alignSelf: "flex-start" }}>{error}</div>
          )}
        </div>

        {/* input */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            padding: "10px",
            borderTop: "1px solid rgba(255,210,63,0.12)",
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            placeholder="Ask about a project, skill..."
            maxLength={400}
            style={{
              flex: 1,
              background: "#0d0807",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "999px",
              padding: "9px 14px",
              fontSize: "13px",
              color: C.dark,
              fontFamily: FONT,
              outline: "none",
            }}
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="btn-bounce"
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              border: "none",
              background: "#ffd23f",
              color: "#1a0605",
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
