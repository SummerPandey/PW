import { Clock } from "./fx";

const C = { bg: "#EDE3CF", dark: "#241A0F", mid: "#5C3D20", copper: "#B87840", cream: "#FBF6EC", border: "rgba(92,61,32,0.18)", muted: "rgba(92,61,32,0.45)" };

// ── small text helpers (Press Start 2P is tiny — keep sizes small) ──
function Line({ children, dark, dim }: { children: React.ReactNode; dark?: boolean; dim?: boolean }) {
  return (
    <div style={{ fontSize: "6px", lineHeight: 2, letterSpacing: "0.04em", color: dim ? C.muted : dark ? "rgba(251,246,236,0.85)" : C.mid }}>
      {children}
    </div>
  );
}

function Bullet({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
      <span style={{ fontSize: "6px", color: C.copper, flexShrink: 0 }}>▸</span>
      <span style={{ fontSize: "6px", lineHeight: 1.9, letterSpacing: "0.03em", color: dark ? "rgba(251,246,236,0.8)" : C.mid }}>{children}</span>
    </div>
  );
}

function Entry({ title, meta, dark, children }: { title: string; meta: string; dark?: boolean; children?: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <div style={{ fontSize: "7px", color: dark ? C.cream : C.dark, letterSpacing: "0.06em", lineHeight: 1.7 }}>{title}</div>
      <div style={{ fontSize: "5px", color: dark ? C.copper : C.muted, letterSpacing: "0.08em", marginTop: "5px" }}>{meta}</div>
      {children}
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ display: "inline-block", border: `1px solid ${C.border}`, borderRadius: "4px", padding: "3px 6px", margin: "0 4px 4px 0", fontSize: "5px", color: C.mid, letterSpacing: "0.05em" }}>
      {children}
    </span>
  );
}

interface BoxProps {
  id: string;
  title: string;
  dark?: boolean;
  gridStyle: React.CSSProperties;
  children: React.ReactNode;
}

function CategoryBox({ id, title, dark, gridStyle, children }: BoxProps) {
  return (
    <div
      className="pbox"
      style={{
        position: "relative",
        background: dark ? C.dark : C.cream,
        borderRadius: "8px",
        border: `1px solid ${dark ? "rgba(255,255,255,0.07)" : C.border}`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minHeight: "200px",
        ...gridStyle,
      }}
    >
      <div
        style={{
          borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.07)" : C.border}`,
          padding: "8px 14px",
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "6px",
          color: dark ? C.cream : C.dark,
          letterSpacing: "0.1em",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <span>{id} · {title}</span>
        <span style={{ fontSize: "5px", color: C.copper, opacity: 0.7 }}>· · ·</span>
      </div>
      <div
        style={{
          flex: 1,
          padding: "16px",
          backgroundImage: `linear-gradient(rgba(92,61,32,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(92,61,32,0.04) 1px, transparent 1px)`,
          backgroundSize: "18px 18px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function WorkPage({ onNav }: { onNav: (p: "about" | "work") => void }) {
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
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Clock />
          <button className="navlink btn-bounce" onClick={() => onNav("about")} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Press Start 2P', monospace", fontSize: "6px", color: C.muted, letterSpacing: "0.1em" }}>ABOUT</button>
          <button className="navlink btn-bounce" style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Press Start 2P', monospace", fontSize: "6px", color: C.copper, letterSpacing: "0.1em" }}>WORK</button>
        </div>
      </nav>

      {/* ── CONTENT ── */}
      <div style={{ padding: "70px clamp(16px, 3vw, 36px) 40px", maxWidth: "1400px", margin: "0 auto" }}>

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "16px" }}>
          <div style={{ fontSize: "clamp(12px, 2.2vw, 20px)", color: C.dark, letterSpacing: "0.08em" }}>MY WORK</div>
          <a href="/Summer_Pandey_Resume.pdf" target="_blank" rel="noopener noreferrer" style={{ fontSize: "6px", color: C.copper, letterSpacing: "0.1em", textDecoration: "none" }}>↓ RESUME.PDF</a>
        </div>
        <div style={{ height: "1px", background: C.border, marginBottom: "14px" }} />

        {/* Category grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>

          {/* 01 — EXPERIENCE (wide, dark) */}
          <CategoryBox id="01" title="EXPERIENCE" dark gridStyle={{ gridColumn: "1 / 3", gridRow: "1" }}>
            <Entry dark title="Marketing Data Science Intern" meta="AUGUSTANA COLLEGE · AUG 2025 – PRESENT">
              <Bullet dark>Built a Marketing Mix Model (MMM) to quantify how channels drove college applications</Bullet>
              <Bullet dark>Unified multi-source campaign data with SQL & Python; built outcome-by-channel charts</Bullet>
              <Bullet dark>Delivered a stakeholder report with channel ROI insights to guide budget decisions</Bullet>
            </Entry>
            <Entry dark title="Sports Media Intern" meta="SPORTS MEDIA INC. · JUN 2025 – AUG 2025">
              <Bullet dark>Built & deployed an automated AI voice agent (Twilio Voice API) handling 1,000+ calls/week</Bullet>
              <Bullet dark>Raised call completion 25% via optimized flows and RESTful API integration</Bullet>
              <Bullet dark>Cut system failure rates 15% with error detection and routine code reviews</Bullet>
            </Entry>
          </CategoryBox>

          {/* 02 — EDUCATION */}
          <CategoryBox id="02" title="EDUCATION" gridStyle={{ gridColumn: "3", gridRow: "1" }}>
            <Entry title="Augustana College" meta="ROCK ISLAND, IL · AUG 2023 – MAY 2027">
              <Line>B.A. Computer Science & Data Science</Line>
              <Line>Minor in Mathematics</Line>
            </Entry>
            <Line dim>COURSEWORK</Line>
            <div style={{ marginTop: "6px" }}>
              <Chip>Machine Learning</Chip>
              <Chip>Data Structures</Chip>
              <Chip>Algorithms</Chip>
              <Chip>Operating Systems</Chip>
              <Chip>Statistics</Chip>
            </div>
          </CategoryBox>

          {/* 03 — LEADERSHIP */}
          <CategoryBox id="03" title="LEADERSHIP" gridStyle={{ gridColumn: "1", gridRow: "2" }}>
            <Entry title="Resident Advisor" meta="AUGUSTANA · AUG 2024 – PRESENT">
              <Bullet>Mentored 200+ students; ran programs boosting engagement 25%</Bullet>
            </Entry>
            <Entry title="Google Dev Group Co-Lead" meta="AUGUSTANA · MAY 2024 – PRESENT">
              <Bullet>Led workshops & hackathons; managed tech-community partnerships</Bullet>
            </Entry>
          </CategoryBox>

          {/* 04 — SKILLS (wide, dark) */}
          <CategoryBox id="04" title="TECHNICAL SKILLS" dark gridStyle={{ gridColumn: "2 / 4", gridRow: "2" }}>
            <Line dark dim>LANGUAGES</Line>
            <Line dark>Python · SQL · Java · C · JavaScript · TypeScript · R · Dart · HTML/CSS</Line>
            <div style={{ height: "8px" }} />
            <Line dark dim>LIBRARIES</Line>
            <Line dark>pandas · NumPy · scikit-learn · TensorFlow · PyTorch · OpenCV · Matplotlib</Line>
            <div style={{ height: "8px" }} />
            <Line dark dim>FRAMEWORKS / TOOLS</Line>
            <Line dark>React · Node.js · Express · MongoDB · Flutter · Firebase · Git</Line>
          </CategoryBox>

          {/* 05 — CONTACT (dark) */}
          <CategoryBox id="05" title="CONTACT" dark gridStyle={{ gridColumn: "1", gridRow: "3" }}>
            <a href="mailto:summerpandey23@augustana.edu" style={{ textDecoration: "none" }}>
              <Line dark>✉ summerpandey23@augustana.edu</Line>
            </a>
            <div style={{ height: "6px" }} />
            <a href="tel:+13096314748" style={{ textDecoration: "none" }}>
              <Line dark>☎ +1 309-631-4748</Line>
            </a>
            <div style={{ height: "6px" }} />
            <a href="/Summer_Pandey_Resume.pdf" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <Line dark>↓ download résumé</Line>
            </a>
          </CategoryBox>

          {/* 06 — PROJECTS */}
          <CategoryBox id="06" title="PROJECTS" gridStyle={{ gridColumn: "2", gridRow: "3" }}>
            <Entry title="Lane-Detection Pi Car" meta="PYTHON · OPENCV · RASPBERRY PI">
              <Bullet>Real-time lane detection for autonomous navigation</Bullet>
            </Entry>
            <Entry title="Automated Workout Log" meta="OPENAI API · NODE.JS">
              <Bullet>Chrome extension cutting manual entry 40%; 200+ entries stored</Bullet>
            </Entry>
            <Entry title="AuraTV" meta="FLUTTER · FIREBASE · YOUTUBE API">
              <Bullet>Streaming app with autoplay channels & personalized recs</Bullet>
            </Entry>
          </CategoryBox>

          {/* 07 — FEATURED · award-winning project */}
          <CategoryBox id="★" title="WINNER · PREVENTIA" dark gridStyle={{ gridColumn: "3", gridRow: "3" }}>
            <div className="badge" style={{ display: "inline-block", background: C.copper, borderRadius: "4px", padding: "5px 8px", marginBottom: "12px" }}>
              <span style={{ fontSize: "5.5px", color: C.dark, letterSpacing: "0.06em" }}>🏆 BEST USE OF GEMINI AI</span>
            </div>
            <Line dark dim>HACKAUGIE · FLUTTER · FIREBASE · GEMINI AI</Line>
            <Bullet dark>Gamified preventive-health app: personalized checklists by age, gender & local disease data</Bullet>
            <Bullet dark>Built credible, medically-sourced content + a live leaderboard to keep users engaged</Bullet>
            <div style={{ height: "8px" }} />
            <Line dark dim>TEAM · OSHAN HAMAL · BINAYAK GURUBACHARYA</Line>
            <div style={{ height: "8px" }} />
            <a href="https://devpost.com/software/preventia-sblncy" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <Line dark>↗ view on devpost</Line>
            </a>
          </CategoryBox>

        </div>
      </div>
    </div>
  );
}
