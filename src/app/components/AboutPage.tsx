import { Linkedin, Github, FileText, ArrowUpRight } from "lucide-react";

// ── palette ──────────────────────────────────────────────
const C = {
  bg: "#EDE3CF",
  dark: "#241A0F",
  mid: "#5C3D20",
  copper: "#B87840",
  cream: "#FBF6EC",
  border: "rgba(92,61,32,0.18)",
  muted: "rgba(92,61,32,0.45)",
};

function Panel({
  dark,
  children,
  style,
  arrow,
}: {
  dark?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
  arrow?: boolean;
}) {
  return (
    <div
      style={{
        position: "relative",
        background: dark ? C.dark : C.cream,
        borderRadius: "8px",
        border: `1px solid ${dark ? "rgba(255,255,255,0.07)" : C.border}`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      {children}
      {arrow && (
        <div style={{ position: "absolute", bottom: "12px", right: "12px" }}>
          <ArrowUpRight size={14} color={dark ? C.copper : C.mid} strokeWidth={1.5} opacity={0.7} />
        </div>
      )}
    </div>
  );
}

export function AboutPage({ onNav }: { onNav: (p: "about" | "work") => void }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "'Press Start 2P', monospace",
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
          background: `${C.bg}e0`,
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 28px", height: "46px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ display: "flex", gap: "2px", alignItems: "flex-end" }}>
            <div style={{ width: "6px", height: "16px", background: C.dark, borderRadius: "2px" }} />
            <div style={{ width: "6px", height: "11px", background: C.copper, borderRadius: "2px" }} />
            <div style={{ width: "6px", height: "7px", background: C.mid, borderRadius: "2px" }} />
          </div>
          <span style={{ fontSize: "7px", color: C.dark, letterSpacing: "0.1em" }}>SUMMER PANDEY</span>
        </div>
        <div style={{ display: "flex", gap: "24px" }}>
          <button style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Press Start 2P', monospace", fontSize: "6px", color: C.copper, letterSpacing: "0.1em" }}>
            ABOUT
          </button>
          <button
            onClick={() => onNav("work")}
            style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Press Start 2P', monospace", fontSize: "6px", color: C.muted, letterSpacing: "0.1em" }}
          >
            WORK
          </button>
        </div>
      </nav>

      {/* ── BENTO GRID ── */}
      <div style={{ padding: "60px 20px 40px", maxWidth: "960px", margin: "0 auto" }}>

        {/* ROW 1 */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.1fr", gap: "8px", marginBottom: "8px" }}>

          {/* Hero */}
          <Panel dark style={{ minHeight: "200px", padding: "20px 22px" }}>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
              <div style={{ display: "flex", gap: "5px", alignItems: "flex-end", opacity: 0.35 }}>
                {[18, 13, 9, 15, 11, 8].map((h, i) => (
                  <div key={i} style={{ width: "7px", height: `${h}px`, background: C.copper, borderRadius: "2px" }} />
                ))}
              </div>
              <div>
                <div style={{ fontSize: "clamp(22px, 3.5vw, 34px)", color: C.cream, lineHeight: 1.15, letterSpacing: "0.03em" }}>
                  SUMMER<br />PANDEY
                </div>
                <div style={{ marginTop: "12px", display: "inline-block", background: C.copper, borderRadius: "4px", padding: "3px 9px" }}>
                  <span style={{ fontSize: "5px", color: C.dark, letterSpacing: "0.1em" }}>PORTFOLIO</span>
                </div>
              </div>
            </div>
          </Panel>

          {/* Roles + motto */}
          <Panel style={{ minHeight: "200px", padding: "18px 16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {["SOFTWARE ENGINEER", "DATA SCIENTIST", "ML / AI DEVELOPER"].map((r) => (
                <div key={r} style={{ fontSize: "5px", color: C.mid, letterSpacing: "0.06em", lineHeight: 1.8 }}>· {r}</div>
              ))}
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "10px", marginTop: "2px" }}>
                <div style={{ fontSize: "5px", color: C.muted, marginBottom: "6px", letterSpacing: "0.1em" }}>MOTTO</div>
                {["Try things, see what happens", "Push ideas forward", "Just give it a shot"].map((l) => (
                  <div key={l} style={{ fontSize: "4.5px", color: C.mid, lineHeight: 2.2, opacity: 0.8 }}>{l}</div>
                ))}
              </div>
            </div>
          </Panel>

          {/* Portrait — spans rows 1–2 */}
          <Panel style={{ gridRow: "1 / 3", minHeight: "380px", padding: "0" }}>
            <div
              style={{
                flex: 1,
                background: `linear-gradient(160deg, #D4C4A8 0%, #B8A080 100%)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                minHeight: "380px",
              }}
            >
              <span style={{ fontSize: "5px", color: "rgba(92,61,32,0.35)", letterSpacing: "0.12em" }}>SUMMER</span>
            </div>
          </Panel>
        </div>

        {/* ROW 2 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "8px", marginBottom: "8px" }}>

          {/* Tagline */}
          <Panel style={{ minHeight: "160px", padding: "18px 16px" }} arrow>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
              <div style={{ fontSize: "7px", color: C.dark, lineHeight: 1.9, letterSpacing: "0.03em" }}>
                CS + Data<br />Science @<br />Augustana
              </div>
              <div>
                <div style={{ fontSize: "5px", color: C.muted, marginBottom: "8px" }}>Currently</div>
                <div style={{ display: "inline-block", border: `1px solid ${C.border}`, borderRadius: "4px", padding: "2px 7px" }}>
                  <span style={{ fontSize: "5px", color: C.mid, letterSpacing: "0.06em" }}>marketing data intern</span>
                </div>
              </div>
            </div>
          </Panel>

          {/* Quote */}
          <Panel dark style={{ minHeight: "160px", padding: "22px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center" }}>
              <div>
                <div style={{ fontSize: "7px", color: C.cream, lineHeight: 2.2, letterSpacing: "0.05em", opacity: 0.9 }}>
                  &quot;BUILD THINGS,<br />SHIP THINGS,<br />LEARN FAST.&quot;
                </div>
                <div style={{ marginTop: "12px", display: "flex", justifyContent: "center", gap: "8px" }}>
                  {[6, 9, 6].map((sz, i) => (
                    <span key={i} style={{ fontSize: `${sz}px`, color: C.copper, opacity: 0.6 }}>✦</span>
                  ))}
                </div>
              </div>
            </div>
          </Panel>
        </div>

        {/* ROW 3 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1fr", gap: "8px", marginBottom: "8px" }}>

          {/* Tech Works */}
          <Panel dark style={{ minHeight: "170px", padding: "16px" }} arrow>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
              <div style={{ display: "flex", gap: "5px" }}>
                {["PI CAR", "AURATV"].map((n) => (
                  <div key={n} style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: "5px", border: "1px solid rgba(255,255,255,0.08)", padding: "10px 8px", minHeight: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "4.5px", color: C.copper, opacity: 0.7, letterSpacing: "0.08em" }}>{n}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: "5.5px", color: C.cream, letterSpacing: "0.1em", opacity: 0.7, marginTop: "10px" }}>TECH WORKS</div>
            </div>
          </Panel>

          {/* Gallery */}
          <Panel style={{ minHeight: "170px", padding: "0", overflow: "hidden" }}>
            <div style={{ flex: 1, background: `linear-gradient(160deg, #C8B898 0%, #A89070 100%)`, minHeight: "140px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "10px" }}>
              <span style={{ fontSize: "5px", color: "rgba(92,61,32,0.4)", letterSpacing: "0.1em" }}>1000+ CALLS / WEEK</span>
              <div style={{ display: "flex", gap: "5px" }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{ width: "5px", height: "5px", borderRadius: "50%", background: i === 1 ? C.mid : `${C.mid}44` }} />
                ))}
              </div>
            </div>
          </Panel>

          {/* Creative Works */}
          <Panel style={{ minHeight: "170px", padding: "16px" }} arrow>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
              <div style={{ fontSize: "5.5px", color: C.dark, letterSpacing: "0.1em" }}>AI VOICE<br />AGENT</div>
              <div style={{ flex: 1, margin: "10px 0", background: `linear-gradient(135deg, #D4C4A8 0%, #B89870 100%)`, borderRadius: "5px", minHeight: "80px", opacity: 0.6 }} />
            </div>
          </Panel>
        </div>

        {/* ROW 4 */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "8px", marginBottom: "8px" }}>

          {/* Beliefs */}
          <Panel style={{ minHeight: "190px", padding: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", minHeight: "160px" }}>
              <div style={{ fontSize: "5.5px", color: C.dark, letterSpacing: "0.1em" }}>FOCUS</div>
              <div style={{ flex: 1, margin: "10px 0", background: `linear-gradient(160deg, #D4C4A8 0%, #C0AA88 100%)`, borderRadius: "5px", minHeight: "90px" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "4.5px", color: C.muted }}>machine learning</span>
                <span style={{ fontSize: "4.5px", color: C.muted }}>data + product</span>
              </div>
            </div>
          </Panel>

          {/* Blogs */}
          <Panel style={{ minHeight: "190px", padding: "16px" }} arrow>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", minHeight: "160px" }}>
              <div style={{ flex: 1, background: `linear-gradient(160deg, #C8C0B0 0%, #A8A098 100%)`, borderRadius: "5px", marginBottom: "10px", minHeight: "110px" }} />
              <div style={{ fontSize: "5.5px", color: C.dark, letterSpacing: "0.1em" }}>LEADERSHIP</div>
            </div>
          </Panel>

          {/* Contact */}
          <Panel dark style={{ minHeight: "190px", padding: "20px 18px" }} arrow>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", gap: "10px" }}>
              <div style={{ fontSize: "7px", color: C.cream, lineHeight: 2, letterSpacing: "0.04em" }}>
                DON&apos;T<br />BE SHY,<br />HIT ME UP
              </div>
              <a href="mailto:summerpandey23@augustana.edu" style={{ fontSize: "4.5px", color: C.copper, opacity: 0.85, textDecoration: "none" }}>
                summerpandey23@augustana.edu
              </a>
            </div>
          </Panel>
        </div>

        {/* ── FOOTER ── */}
        <Panel dark style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ fontSize: "clamp(7px, 1.4vw, 11px)", color: C.cream, lineHeight: 1.9, letterSpacing: "0.04em" }}>
              LET&apos;S BUILD COOL<br />
              <span style={{ color: C.copper }}>PROUD</span>-UCTS TOGETHER
            </div>
            <div style={{ fontSize: "5px", color: C.muted, letterSpacing: "0.06em" }}>summerpandey23@augustana.edu</div>
            <div style={{ display: "flex", gap: "10px" }}>
              {[
                { Icon: Linkedin, href: "https://www.linkedin.com/", label: "LinkedIn" },
                { Icon: Github, href: "https://github.com/", label: "GitHub" },
                { Icon: FileText, href: "/Summer_Pandey_Resume.pdf", label: "Resume" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  style={{ width: "26px", height: "26px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                >
                  <Icon size={11} color={C.copper} />
                </a>
              ))}
            </div>
          </div>
        </Panel>

      </div>
    </div>
  );
}
