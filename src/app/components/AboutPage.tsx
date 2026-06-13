import { Linkedin, Github, FileText, ArrowUpRight } from "lucide-react";
import { Typewriter, Clock, Reveal } from "./fx";

// ── palette (8-bit theme — kept strictly) ───────────────
const C = {
  bg: "#EDE3CF",
  dark: "#241A0F",
  mid: "#5C3D20",
  copper: "#B87840",
  cream: "#FBF6EC",
  border: "rgba(92,61,32,0.18)",
  muted: "rgba(92,61,32,0.45)",
};

const FONT = "'Press Start 2P', monospace";
const GAP = "12px";

function Logo() {
  return (
    <div className="bob" style={{ display: "flex", gap: "3px", alignItems: "flex-end" }}>
      <div style={{ width: "6px", height: "16px", background: C.dark, borderRadius: "2px" }} />
      <div style={{ width: "6px", height: "11px", background: C.copper, borderRadius: "2px" }} />
      <div style={{ width: "6px", height: "7px", background: C.mid, borderRadius: "2px" }} />
    </div>
  );
}

function Label({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div style={{ fontSize: "6px", color: dark ? "rgba(251,246,236,0.5)" : C.muted, letterSpacing: "0.22em" }}>
      {children}
    </div>
  );
}

function Box({
  dark,
  children,
  style,
  onClick,
  arrow,
  flat,
}: {
  dark?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
  arrow?: boolean;
  flat?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={flat ? undefined : "pbox"}
      style={{
        position: "relative",
        background: dark ? C.dark : C.cream,
        border: `1px solid ${dark ? "rgba(255,255,255,0.07)" : C.border}`,
        borderRadius: "8px",
        padding: "14px 16px",
        cursor: onClick ? "pointer" : "default",
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
      {arrow && (
        <div style={{ position: "absolute", top: "12px", right: "12px" }}>
          <ArrowUpRight size={13} color={C.copper} strokeWidth={1.5} opacity={0.8} />
        </div>
      )}
    </div>
  );
}

export function AboutPage({ onNav }: { onNav: (p: "about" | "work") => void }) {
  // packed overlapping collage tiles
  const tiles: { label: string; top: number; left: string; w: number; h: number; rot: number; grad: string; z: number }[] = [
    { label: "PYTHON", top: 0, left: "1%", w: 180, h: 140, rot: -3, grad: "linear-gradient(160deg,#D4C4A8,#B8A080)", z: 2 },
    { label: "SQL", top: 95, left: "19%", w: 150, h: 175, rot: 4, grad: "linear-gradient(160deg,#C8B898,#A89070)", z: 4 },
    { label: "ML", top: 10, left: "39%", w: 168, h: 135, rot: -5, grad: "linear-gradient(160deg,#D4C4A8,#C0AA88)", z: 3 },
    { label: "REACT", top: 120, left: "60%", w: 158, h: 150, rot: 5, grad: "linear-gradient(160deg,#C8C0B0,#A8A098)", z: 5 },
    { label: "NODE.JS", top: 0, left: "80%", w: 140, h: 125, rot: 6, grad: "linear-gradient(135deg,#D4C4A8,#B8A080)", z: 2 },
    { label: "OPENCV", top: 250, left: "5%", w: 165, h: 145, rot: 4, grad: "linear-gradient(135deg,#D4C4A8,#B89870)", z: 3 },
    { label: "FLUTTER", top: 285, left: "33%", w: 170, h: 150, rot: -4, grad: "linear-gradient(160deg,#C8B898,#A89070)", z: 6 },
    { label: "TWILIO", top: 305, left: "59%", w: 152, h: 130, rot: 5, grad: "linear-gradient(160deg,#C8C0B0,#A8A098)", z: 4 },
    { label: "FIREBASE", top: 250, left: "81%", w: 135, h: 155, rot: -6, grad: "linear-gradient(160deg,#D4C4A8,#B8A080)", z: 3 },
    { label: "PYTORCH", top: 175, left: "45%", w: 128, h: 110, rot: 8, grad: "linear-gradient(135deg,#D4C4A8,#C0AA88)", z: 7 },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: FONT,
        color: C.dark,
        backgroundColor: C.bg,
        backgroundImage: `
          linear-gradient(rgba(92,61,32,0.07) 1px, transparent 1px),
          linear-gradient(90deg, rgba(92,61,32,0.07) 1px, transparent 1px)
        `,
        backgroundSize: "28px 28px",
      }}
    >
      {/* ── NAV ── */}
      <nav
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          background: `${C.bg}e0`, backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${C.border}`,
          display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center",
          padding: "0 24px", height: "48px",
        }}
      >
        <button className="navlink btn-bounce" style={{ justifySelf: "start", background: "none", border: "none", cursor: "pointer", fontFamily: FONT, fontSize: "7px", color: C.copper, letterSpacing: "0.16em" }}>ABOUT</button>
        <div style={{ justifySelf: "center", display: "flex", alignItems: "center", gap: "12px" }}>
          <Logo />
          <Clock />
        </div>
        <button className="navlink btn-bounce" onClick={() => onNav("work")} style={{ justifySelf: "end", background: "none", border: "none", cursor: "pointer", fontFamily: FONT, fontSize: "7px", color: C.muted, letterSpacing: "0.16em" }}>WORK</button>
      </nav>

      {/* ── DENSE PACKED GRID ── */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "70px clamp(16px, 3vw, 36px) 28px" }}>

        {/* ROW 1 — hero (left) + roles & motto (right) */}
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: GAP, marginBottom: GAP }}>
          <Box dark style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "400px", padding: "30px 32px" }}>
            <div style={{ display: "flex", gap: "4px", alignItems: "flex-end", opacity: 0.4 }}>
              {[20, 14, 10, 17, 12, 8].map((h, i) => (
                <div key={i} style={{ width: "7px", height: `${h}px`, background: C.copper, borderRadius: "2px" }} />
              ))}
            </div>
            <div>
              <div style={{ fontSize: "clamp(24px, 3.4vw, 46px)", color: C.cream, lineHeight: 1.45, letterSpacing: "0.02em", minHeight: "190px" }}>
                <Typewriter text={"BUILDING\nTHINGS WORTH\nSHIPPING"} style={{ color: C.cream }} />
              </div>
              <div style={{ marginTop: "16px", fontSize: "7px", color: C.copper, letterSpacing: "0.08em" }}>one project at a time</div>
              <button className="btn-bounce" onClick={() => onNav("work")} style={{ marginTop: "16px", display: "inline-flex", alignItems: "center", gap: "7px", background: C.copper, border: "none", borderRadius: "4px", padding: "7px 11px", cursor: "pointer", fontFamily: FONT, fontSize: "7px", color: C.dark, letterSpacing: "0.08em" }}>
                SEE MY WORK <ArrowUpRight size={12} color={C.dark} strokeWidth={2.5} />
              </button>
            </div>
          </Box>

          <div style={{ display: "grid", gridTemplateRows: "auto 1fr", gap: GAP }}>
            <Box>
              <Label>ROLES</Label>
              <div style={{ marginTop: "12px" }}>
                {["SOFTWARE ENGINEER", "DATA SCIENTIST", "ML · AI DEVELOPER"].map((r, i) => (
                  <div key={r} style={{ fontSize: "8px", color: i === 1 ? C.copper : C.mid, letterSpacing: "0.04em", lineHeight: 2.2 }}>· {r}</div>
                ))}
              </div>
            </Box>
            <Box style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Label>MY MOTTO</Label>
              <div style={{ marginTop: "10px" }}>
                {["Try things, see what happens", "Push ideas forward", "Just give it a shot"].map((l) => (
                  <div key={l} style={{ fontSize: "6px", color: C.mid, lineHeight: 2.3 }}>
                    <span style={{ color: C.copper }}>✦ </span>{l}
                  </div>
                ))}
              </div>
            </Box>
          </div>
        </div>

        {/* ROW 2 — three showcases packed */}
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", gap: GAP, marginBottom: GAP }}>
          <Box dark onClick={() => onNav("work")} arrow style={{ minHeight: "200px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <Label dark>TECH WORKS</Label>
            <div>
              <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
                {["PREVENTIA", "MMM"].map((n) => (
                  <div key={n} style={{ flex: 1, height: "54px", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "5px", color: C.copper, opacity: 0.7 }}>{n}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: "8px", color: C.cream, letterSpacing: "0.04em", lineHeight: 1.6 }}>What I&apos;ve built<br />with data &amp; code</div>
            </div>
          </Box>
          <Box onClick={() => onNav("work")} arrow style={{ minHeight: "200px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <Label>EXPERIENCE</Label>
            <div style={{ flex: 1, margin: "10px 0", borderRadius: "5px", background: "linear-gradient(160deg,#C8C0B0,#A8A098)", minHeight: "60px" }} />
            <div style={{ fontSize: "8px", color: C.dark, letterSpacing: "0.04em", lineHeight: 1.6 }}>2 internships</div>
          </Box>
          <Box onClick={() => onNav("work")} arrow style={{ minHeight: "200px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <Label>PROJECTS</Label>
            <div style={{ flex: 1, margin: "10px 0", borderRadius: "5px", background: "linear-gradient(135deg,#D4C4A8,#B89870)", minHeight: "60px" }} />
            <div style={{ fontSize: "8px", color: C.dark, letterSpacing: "0.04em", lineHeight: 1.6 }}>3 side builds</div>
          </Box>
        </div>

        {/* ACHIEVEMENTS — gamified résumé metrics */}
        <Reveal style={{ marginBottom: GAP }}>
          <Box style={{ padding: "14px 16px" }}>
            <Label>ACHIEVEMENTS · UNLOCKED</Label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
              <a
                href="https://devpost.com/software/preventia-sblncy"
                target="_blank"
                rel="noopener noreferrer"
                className="badge"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: C.copper, borderRadius: "999px", padding: "6px 11px", fontSize: "6px", color: C.dark, letterSpacing: "0.05em", textDecoration: "none" }}
              >
                🏆 BEST USE OF GEMINI AI · HACKAUGIE
              </a>
              {[
                "1K+ CALLS / WEEK",
                "+25% ENGAGEMENT",
                "200+ MENTORED",
                "−15% FAILURE RATE",
                "40% FASTER LOGGING",
              ].map((b) => (
                <span key={b} className="badge" style={{ display: "inline-flex", alignItems: "center", gap: "6px", border: `1px solid ${C.border}`, borderRadius: "999px", padding: "6px 10px", fontSize: "6px", color: C.mid, letterSpacing: "0.05em" }}>
                  <span style={{ color: C.copper }}>✦</span>{b}
                </span>
              ))}
            </div>
          </Box>
        </Reveal>

        {/* ROW 3 — packed collage (left) + beliefs/contact (right) */}
        <Reveal style={{ marginBottom: GAP }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: GAP }}>
          <Box style={{ padding: "14px 16px 16px" }}>
            <Label>IN THE STACK</Label>
            <div style={{ position: "relative", height: "460px", marginTop: "8px" }}>
              {tiles.map((t) => (
                <div
                  key={t.label}
                  className="tile"
                  title={t.label}
                  style={{
                    position: "absolute", top: `${t.top}px`, left: t.left,
                    width: `${t.w}px`, height: `${t.h}px`, zIndex: t.z,
                    transform: `rotate(${t.rot}deg)`, background: t.grad,
                    border: `1px solid ${C.border}`, borderRadius: "6px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 5px 14px rgba(92,61,32,0.16)",
                  }}
                >
                  <span style={{ fontSize: "5px", color: "rgba(92,61,32,0.55)", letterSpacing: "0.1em" }}>{t.label}</span>
                </div>
              ))}
            </div>
          </Box>

          <div style={{ display: "grid", gridTemplateRows: "1fr auto", gap: GAP }}>
            <Box style={{ display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center", minHeight: "150px" }}>
              <div style={{ fontSize: "9px", color: C.dark, lineHeight: 2, letterSpacing: "0.04em" }}>small steps,<br />big outcomes</div>
              <div style={{ marginTop: "12px", fontSize: "7px", color: C.copper, opacity: 0.6 }}>✦ ✦ ✦</div>
            </Box>
            <Box dark style={{ minHeight: "150px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: "8px", color: C.cream, lineHeight: 1.9, letterSpacing: "0.03em" }}>DON&apos;T BE SHY,<br />HIT ME UP</div>
              <a href="mailto:summerpandey23@augustana.edu" style={{ marginTop: "10px", fontSize: "5px", color: C.copper, opacity: 0.9, textDecoration: "none" }}>summerpandey23@augustana.edu</a>
            </Box>
          </div>
        </div>
        </Reveal>

        {/* ROW 4 — profile (wide) + quote */}
        <Reveal style={{ marginBottom: GAP }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: GAP }}>
          <Box style={{ padding: 0, minHeight: "230px", display: "flex" }}>
            <div style={{ flex: 1, background: "linear-gradient(160deg,#D4C4A8,#B8A080)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "7px", color: "rgba(92,61,32,0.4)", letterSpacing: "0.16em" }}>SUMMER PANDEY</span>
            </div>
          </Box>
          <Box dark style={{ minHeight: "230px", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <div>
              <div style={{ fontSize: "9px", color: C.cream, lineHeight: 2.1, letterSpacing: "0.05em", opacity: 0.92 }}>
                &quot;BUILD THINGS,<br />SHIP THINGS,<br />LEARN FAST.&quot;
              </div>
              <div style={{ marginTop: "12px", fontSize: "7px", color: C.copper, opacity: 0.6 }}>CS + DATA SCIENCE @ AUGUSTANA</div>
            </div>
          </Box>
        </div>
        </Reveal>

        {/* FOOTER — packed dark bar */}
        <Reveal>
        <Box dark flat style={{ padding: "18px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ fontSize: "clamp(9px,1.6vw,13px)", color: C.cream, lineHeight: 1.8, letterSpacing: "0.03em" }}>
              LET&apos;S BUILD COOL<br /><span style={{ color: C.copper }}>PROUD</span>-UCTS TOGETHER
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              {[
                { Icon: Linkedin, href: "https://www.linkedin.com/", label: "LinkedIn" },
                { Icon: Github, href: "https://github.com/SummerPandey", label: "GitHub" },
                { Icon: FileText, href: "/Summer_Pandey_Resume.pdf", label: "Resume" },
              ].map(({ Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  style={{ width: "28px", height: "28px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.13)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={12} color={C.copper} />
                </a>
              ))}
            </div>
          </div>
        </Box>
        </Reveal>

      </div>
    </div>
  );
}
