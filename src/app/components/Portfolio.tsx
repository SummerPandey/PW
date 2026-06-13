"use client";

import { useCallback, useEffect, useState } from "react";
import { AboutPage } from "./AboutPage";
import { WorkPage } from "./WorkPage";
import { BootScreen, Confetti, Toast, useKeyboardNav, useKonami } from "./fx";

export function Portfolio() {
  const [page, setPage] = useState<"about" | "work">("about");
  const [confetti, setConfetti] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useKeyboardNav(setPage);

  const unlock = useCallback(() => {
    setConfetti(true);
    setToast("ACHIEVEMENT UNLOCKED · KONAMI MASTER");
  }, []);
  useKonami(unlock);

  // auto-clear the celebration
  useEffect(() => {
    if (!confetti) return;
    const a = setTimeout(() => setConfetti(false), 3800);
    const b = setTimeout(() => setToast(null), 4200);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [confetti]);

  return (
    <div className="crt size-full overflow-y-auto" style={{ fontFamily: "'Press Start 2P', monospace", background: "#F5EDD3" }}>
      <BootScreen onDone={() => {}} />
      <Confetti active={confetti} />
      <Toast text={toast} />

      {page === "about" ? <AboutPage onNav={setPage} /> : <WorkPage onNav={setPage} />}

      {/* keyboard hint */}
      <div
        style={{
          position: "fixed",
          bottom: "14px",
          left: "14px",
          zIndex: 70,
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "5px",
          color: "rgba(92,61,32,0.45)",
          letterSpacing: "0.1em",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        [A] ABOUT · [W] WORK
      </div>
    </div>
  );
}
