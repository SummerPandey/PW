import { Linkedin, Github, FileText, ArrowUpRight } from "lucide-react";

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

/* pixel logo mark (three stepped bars) */
function Logo() {
  return (
    <div style={{ display: "flex", gap: "3px", alignItems: "flex-end" }}>
      <div style={{ width: "7px", height: "18px", background: C.dark, borderRadius: "2px" }} />
      <div style={{ width: "7px", height: "12px", background: C.copper, borderRadius: "2px" }} />
      <div style={{ width: "7px", height: "8px", background: C.mid, borderRadius: "2px" }} />
    </div>
  );
}

/* a section label like "MY MOTTO" / "TECH WORKS" */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: "7px", color: C.muted, letterSpacing: "0.25em" }}>{children}</div>
  );
}

/* big showcase block: label + title + clickable cover + arrow */
function Showcase({
  label,
  title,
  gradient,
  onClick,
}: {
  label: string;
  title: string;
  gradient: string;
  onClick: () => void;
}) {
  return (
    <section style={{ marginBottom: "90px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "16px" }}>
        <div>
          <Label>{label}</Label>
          <div style={{ marginTop: "12px", fontSize: "clamp(14px, 3vw, 22px)", color: C.dark, letterSpacing: "0.04em", lineHeight: 1.5 }}>
            {title}
          </div>
        </div>
        <ArrowUpRight size={22} color={C.copper} strokeWidth={1.5} />
      </div>
      <button
        onClick={onClick}
        aria-label={title}
        style={{
          display: "block",
          width: "100%",
          height: "260px",
          border: `1px solid ${C.border}`,
          borderRadius: "10px",
          background: gradient,
          cursor: "pointer",
          padding: 0,
          overflow: "hidden",
        }}
      />
    </section>
  );
}

export function AboutPage({ onNav }: { onNav: (p: "about" | "work") => void }) {
  // scattered "gallery" tiles (no photos — pixel-themed placeholders)
  const tiles: { label: string; top: string; left: string; w: number; h: number; rot: number; grad: string }[] = [
    { label: "PYTHON", top: "0px", left: "2%", w: 150, h: 110, rot: -4, grad: "linear-gradient(160deg,#D4C4A8,#B8A080)" },
    { label: "SQL", top: "150px", left: "26%", w: 120, h: 150, rot: 3, grad: "linear-gradient(160deg,#C8B898,#A89070)" },
    { label: "ML", top: "30px", left: "52%", w: 140, h: 120, rot: 5, grad: "linear-gradient(160deg,#D4C4A8,#C0AA88)" },
    { label: "REACT", top: "190px", left: "70%", w: 130, h: 130, rot: -6, grad: "linear-gradient(160deg,#C8C0B0,#A8A098)" },
    { label: "OPENCV", top: "300px", left: "8%", w: 130, h: 120, rot: 4, grad: "linear-gradient(135deg,#D4C4A8,#B89870)" },
    { label: "FLUTTER", top: "330px", left: "44%", w: 145, h: 140, rot: -3, grad: "linear-gradient(160deg,#C8B898,#A89070)" },
    { label: "NODE.JS", top: "10px", left: "80%", w: 110, h: 110, rot: 7, grad: "linear-gradient(135deg,#D4C4A8,#B8A080)" },
    { label: "TWILIO", top: "360px", left: "76%", w: 120, h: 115, rot: -5, grad: "linear-gradient(160deg,#C8C0B0,#A8A098)" },
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
      {/* ── NAV (centered logo, flanked by links) ── */}
      <nav
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          background: `${C.bg}e0`,
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${C.border}`,
          display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center",
          padding: "0 28px", height: "52px",
        }}
      >
        <button
          style={{ justifySelf: "start", background: "none", border: "none", cursor: "pointer", fontFamily: FONT, fontSize: "7px", color: C.copper, letterSpacing: "0.18em" }}
        >
          ABOUT
        </button>
        <div style={{ justifySelf: "center" }}><Logo /></div>
        <button
          onClick={() => onNav("work")}
          style={{ justifySelf: "end", background: "none", border: "none", cursor: "pointer", fontFamily: FONT, fontSize: "7px", color: C.muted, letterSpacing: "0.18em" }}
        >
          WORK
        </button>
      </nav>

      {/* ── SINGLE-COLUMN NARRATIVE ── */}
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "0 24px" }}>

        {/* HERO */}
        <section style={{ minHeight: "78vh", display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: "90px" }}>
          <div style={{ fontSize: "clamp(22px, 5.5vw, 44px)", color: C.dark, lineHeight: 1.6, letterSpacing: "0.02em" }}>
            BUILDING<br />THINGS WORTH<br />SHIPPING
          </div>
          <div style={{ marginTop: "28px", fontSize: "9px", color: C.mid, letterSpacing: "0.08em", lineHeight: 2 }}>
            one project at a time
          </div>
          <button
            onClick={() => onNav("work")}
            style={{ marginTop: "26px", display: "inline-flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", fontFamily: FONT, fontSize: "8px", color: C.copper, letterSpacing: "0.12em" }}
          >
            SEE MY WORK <ArrowUpRight size={14} color={C.copper} strokeWidth={2} />
          </button>
        </section>

        {/* ROLES */}
        <section style={{ marginBottom: "100px" }}>
          {["SOFTWARE ENGINEER", "DATA SCIENTIST", "ML · AI DEVELOPER"].map((r, i) => (
            <div
              key={r}
              style={{
                fontSize: "clamp(13px, 3vw, 22px)",
                color: i === 1 ? C.copper : C.dark,
                letterSpacing: "0.04em",
                lineHeight: 2.1,
                borderBottom: `1px solid ${C.border}`,
                paddingBottom: "14px",
                marginBottom: "14px",
              }}
            >
              {r}
            </div>
          ))}
        </section>

        {/* MOTTO */}
        <section style={{ marginBottom: "100px" }}>
          <Label>MY MOTTO</Label>
          <div style={{ marginTop: "22px" }}>
            {[
              "Try things, see what happens",
              "Push ideas forward, find direction",
              "Just give it a shot",
            ].map((l) => (
              <div key={l} style={{ fontSize: "10px", color: C.mid, lineHeight: 2.6, letterSpacing: "0.03em" }}>
                <span style={{ color: C.copper }}>✦ </span>{l}
              </div>
            ))}
          </div>
        </section>

        {/* TECH WORKS showcase */}
        <Showcase
          label="TECH WORKS"
          title={"What I've built\nwith data & code"}
          gradient="linear-gradient(160deg,#241A0F 0%,#5C3D20 100%)"
          onClick={() => onNav("work")}
        />

        {/* GALLERY — scattered pixel tiles */}
        <section style={{ marginBottom: "100px" }}>
          <Label>IN THE STACK</Label>
          <div style={{ position: "relative", height: "520px", marginTop: "24px" }}>
            {tiles.map((t) => (
              <div
                key={t.label}
                style={{
                  position: "absolute",
                  top: t.top,
                  left: t.left,
                  width: `${t.w}px`,
                  height: `${t.h}px`,
                  transform: `rotate(${t.rot}deg)`,
                  background: t.grad,
                  border: `1px solid ${C.border}`,
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 6px 18px rgba(92,61,32,0.12)",
                }}
              >
                <span style={{ fontSize: "6px", color: "rgba(92,61,32,0.5)", letterSpacing: "0.12em" }}>{t.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* BELIEFS */}
        <section style={{ marginBottom: "100px", textAlign: "center" }}>
          <div style={{ fontSize: "clamp(12px, 2.6vw, 18px)", color: C.dark, lineHeight: 2.2, letterSpacing: "0.05em" }}>
            small steps,<br />big outcomes
          </div>
          <div style={{ margin: "30px auto 0", maxWidth: "420px", height: "180px", borderRadius: "10px", border: `1px solid ${C.border}`, background: "linear-gradient(160deg,#D4C4A8 0%,#B8A080 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "6px", color: "rgba(92,61,32,0.4)", letterSpacing: "0.12em" }}>✦ ✦ ✦</span>
          </div>
        </section>

        {/* EXPERIENCE showcase */}
        <Showcase
          label="EXPERIENCE"
          title={"Where I've worked\n& what I shipped"}
          gradient="linear-gradient(160deg,#C8C0B0 0%,#A8A098 100%)"
          onClick={() => onNav("work")}
        />

        {/* PROFILE */}
        <section style={{ marginBottom: "100px" }}>
          <Label>PROFILE</Label>
          <div style={{ marginTop: "24px", height: "420px", borderRadius: "12px", border: `1px solid ${C.border}`, background: "linear-gradient(160deg,#D4C4A8 0%,#B8A080 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "8px", color: "rgba(92,61,32,0.4)", letterSpacing: "0.2em" }}>SUMMER PANDEY</span>
          </div>
        </section>

        {/* PROJECTS showcase */}
        <Showcase
          label="PROJECTS"
          title={"Side builds &\nexperiments"}
          gradient="linear-gradient(135deg,#241A0F 0%,#5C3D20 100%)"
          onClick={() => onNav("work")}
        />

      </div>

      {/* ── CONTACT FOOTER (full-bleed dark) ── */}
      <footer style={{ background: C.dark, padding: "80px 24px" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div style={{ fontSize: "clamp(16px, 4vw, 30px)", color: C.cream, lineHeight: 1.7, letterSpacing: "0.03em" }}>
            DON&apos;T BE SHY,<br />HERE&apos;S MY CONTACT
          </div>
          <div style={{ marginTop: "26px", fontSize: "9px", color: C.copper, lineHeight: 2, letterSpacing: "0.06em" }}>
            LET&apos;S BUILD COOL <span style={{ color: C.cream }}>PROUD</span>-UCTS TOGETHER
          </div>
          <a href="mailto:summerpandey23@augustana.edu" style={{ display: "inline-block", marginTop: "30px", fontSize: "9px", color: "rgba(251,246,236,0.8)", letterSpacing: "0.04em", textDecoration: "none" }}>
            ✉ summerpandey23@augustana.edu
          </a>
          <div style={{ marginTop: "34px", display: "flex", gap: "14px" }}>
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
                style={{ width: "34px", height: "34px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.14)", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <Icon size={14} color={C.copper} />
              </a>
            ))}
          </div>
          <div style={{ marginTop: "48px", fontSize: "6px", color: "rgba(251,246,236,0.3)", letterSpacing: "0.1em" }}>
            © 2026 SUMMER PANDEY · BUILT WITH NEXT.JS
          </div>
        </div>
      </footer>
    </div>
  );
}
