import { Linkedin, Github, FileText, ArrowUpRight, Trophy } from "lucide-react";
import { C, FONT, SERIF, DARK_GRAD, DOT_GRID, type Panel } from "./theme";
import { Typewriter, Reveal, Sprout } from "./fx";

/* ────────────────────────────────────────────────────────────────────
   AboutPage — a dense bento grid that fits on one screen:
   hero, roles & motto, three showcases, achievements, skills,
   contact, and a footer bar.
   ──────────────────────────────────────────────────────────────────── */

const GAP = "6px"; // tight gutter between bento boxes
const RADIUS = "18px";

/* ── tiny building blocks ──────────────────────────────────────────── */

/** Small uppercase section label, e.g. "ROLES". */
function Label({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div
      style={{
        fontSize: "11px",
        fontWeight: 700,
        textTransform: "uppercase",
        color: dark ? "rgba(243,222,210,0.55)" : C.muted,
        letterSpacing: "0.18em",
      }}
    >
      {children}
    </div>
  );
}

/** One bento box. `dark` flips to the forest-walnut gradient,
    `arrow` adds a corner arrow, `flat` turns off the hover lift. */
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
        background: dark ? DARK_GRAD : C.panel,
        border: `1px solid ${dark ? "rgba(226,72,58,0.18)" : C.border}`,
        borderRadius: RADIUS,
        padding: "16px 18px",
        cursor: onClick ? "pointer" : "default",
        overflow: "hidden",
        boxShadow: dark ? "none" : "0 2px 10px rgba(0,0,0,0.35)",
        ...style,
      }}
    >
      {children}
      {arrow && (
        <div style={{ position: "absolute", top: "14px", right: "14px" }}>
          <ArrowUpRight size={15} color={C.sun} strokeWidth={2} opacity={0.85} />
        </div>
      )}
    </div>
  );
}

/* ── content ───────────────────────────────────────────────────────── */

const ROLES = ["Software Engineer", "AI/ML Engineer", "Data Scientist"];

const MOTTOS = ["Build for real people", "Test on real systems", "Improve with evidence"];

// Compact skill set — shown as chips so the whole page fits one screen.
const SKILLS = [
  "Python", "TypeScript", "JavaScript", "SQL", "Dart",
  "React", "Flutter", "Node.js",
  "PostgreSQL", "Supabase", "Firebase", "Vercel",
  "Git/GitHub", "REST APIs", "Twilio Voice", "Gemini API",
  "Computer Vision", "NVIDIA Jetson", "PyTorch", "scikit-learn", "Hugging Face", "pandas",
];

// Gamified résumé metrics (the trophy badge is rendered separately).
const WINS = [
  "1,000+ calls automated/week",
  "+25% call completion",
  "15% fewer service failures",
  "200+ students mentored",
  "50+ students taught",
];

const SOCIALS = [
  { Icon: Linkedin, href: "https://www.linkedin.com/", label: "LinkedIn" },
  { Icon: Github, href: "https://github.com/SummerPandey", label: "GitHub" },
  { Icon: FileText, href: "/Summer_Pandey_Resume.pdf", label: "Resume" },
];

/* ── the page ──────────────────────────────────────────────────────── */

export function AboutPage({ goTo }: { goTo: (p: Panel) => void }) {
  return (
    <div style={{ minHeight: "100vh", fontFamily: FONT, color: C.dark, ...DOT_GRID }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "58px clamp(16px, 3vw, 36px) 10px" }}>
        {/* ── row 1: hero (left) + roles & motto (right) ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: GAP, marginBottom: GAP }}>
          <Box
            dark
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "216px",
              padding: "20px 26px",
            }}
          >
            {/* sun-glow + swaying sprout, plus a headshot avatar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, #ff8a65, #e2483a)",
                    boxShadow: "0 0 22px rgba(226,72,58,0.55)",
                    animation: "sun-pulse 3s ease-in-out infinite",
                  }}
                />
                <span className="sway" style={{ display: "inline-flex" }}>
                  <Sprout size={26} />
                </span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/headshot.jpg"
                alt="Summer Pandey"
                width={52}
                height={52}
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "1.5px solid rgba(255,220,210,0.4)",
                  flexShrink: 0,
                }}
              />
            </div>

            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(243,222,210,0.55)" }}>
                Summer Pandey · Software Engineer
              </div>
              <div
                className="serif"
                style={{
                  fontFamily: SERIF,
                  fontWeight: 600,
                  fontSize: "clamp(22px, 2.4vw, 32px)",
                  color: C.cream,
                  lineHeight: 1.1,
                  letterSpacing: "0.005em",
                  minHeight: "72px",
                  marginTop: "6px",
                }}
              >
                <Typewriter text={"Building reliable\nAI for the\nreal world"} style={{ color: C.cream }} />
              </div>
              <div style={{ marginTop: "10px", fontSize: "14px", fontWeight: 600, color: C.sun, letterSpacing: "0.02em" }}>
                From edge computer vision to production voice systems.
              </div>
              <button
                className="btn-bounce"
                onClick={() => goTo("works")}
                style={{
                  marginTop: "14px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: `linear-gradient(90deg, ${C.leaf}, ${C.sun})`,
                  border: "none",
                  borderRadius: "999px",
                  padding: "10px 16px",
                  cursor: "pointer",
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: "13px",
                  color: "#1a0605",
                  letterSpacing: "0.04em",
                }}
              >
                Explore my work <ArrowUpRight size={15} color="#1a0605" strokeWidth={2.5} />
              </button>
            </div>
          </Box>

          <div style={{ display: "grid", gridTemplateRows: "auto 1fr", gap: GAP }}>
            <Box>
              <Label>Roles</Label>
              <div style={{ marginTop: "12px" }}>
                {ROLES.map((role, i) => (
                  <div
                    key={role}
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: i === 1 ? C.leaf : C.moss,
                      letterSpacing: "0.01em",
                      lineHeight: 1.65,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ color: C.sun }}>✦</span> {role}
                  </div>
                ))}
              </div>
            </Box>

            <Box style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Label>My motto</Label>
              <div style={{ marginTop: "12px" }}>
                {MOTTOS.map((line) => (
                  <div key={line} style={{ fontSize: "13px", fontWeight: 500, color: C.moss, lineHeight: 1.65 }}>
                    <span style={{ color: C.leaf }}>✦ </span>
                    {line}
                  </div>
                ))}
              </div>
            </Box>
          </div>
        </div>

        {/* ── about text ── */}
        <Reveal style={{ marginBottom: GAP }}>
          <Box style={{ padding: "14px 18px" }}>
            <p style={{ fontSize: "13px", fontWeight: 500, lineHeight: 1.65, color: C.moss, margin: 0 }}>
              I&apos;m Summer Pandey, a Computer Science and Data Science student at Augustana College. I build
              human-centered AI products across edge computer vision, voice automation, and personal health. I care
              about privacy, reliability, and turning complex technology into tools people can actually use.
            </p>
          </Box>
        </Reveal>

        {/* ── row 2: three showcases, all leading to Works ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", gap: GAP, marginBottom: GAP }}>
          <Box
            dark
            onClick={() => goTo("works")}
            arrow
            style={{ minHeight: "98px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
          >
            <Label dark>Tech works</Label>
            <div>
              <div style={{ display: "flex", gap: "8px", marginBottom: "9px" }}>
                {["ARGUS", "VENTUREGAIN"].map((name) => (
                  <button
                    key={name}
                    onClick={(e) => {
                      e.stopPropagation();
                      goTo("works");
                    }}
                    style={{
                      flex: 1,
                      height: "38px",
                      borderRadius: "12px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(255,255,255,0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontFamily: FONT,
                    }}
                  >
                    <span style={{ fontSize: "11px", fontWeight: 700, color: C.sun, opacity: 0.85, letterSpacing: "0.08em" }}>
                      {name}
                    </span>
                  </button>
                ))}
              </div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: C.cream, letterSpacing: "0.01em", lineHeight: 1.45 }}>
                Privacy-first AI, edge vision, and full-stack products.
              </div>
            </div>
          </Box>

          <Box
            onClick={() => goTo("works")}
            arrow
            style={{ minHeight: "98px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
          >
            <Label>Experience</Label>
            <div
              style={{
                flex: 1,
                margin: "10px 0",
                borderRadius: "12px",
                background: "linear-gradient(160deg, #9a5a52, #4a2018)",
                minHeight: "40px",
                padding: "8px 10px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: "4px",
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: 700, color: C.cream, lineHeight: 1.35 }}>
                Sports Media Inc. <span style={{ fontWeight: 500, opacity: 0.85 }}>· Software Engineering Intern</span>
              </div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: C.cream, lineHeight: 1.35 }}>
                iD Tech <span style={{ fontWeight: 500, opacity: 0.85 }}>· NVIDIA AI &amp; Machine Learning Instructor</span>
              </div>
            </div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: C.dark, letterSpacing: "0.01em" }}>2 roles</div>
          </Box>

          <Box
            onClick={() => goTo("works")}
            arrow
            style={{ minHeight: "98px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
          >
            <Label>Projects</Label>
            <div
              style={{
                flex: 1,
                margin: "10px 0",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #d9895a, #a34a1e)",
                minHeight: "40px",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                padding: "8px",
              }}
            >
              {["Argus", "VentureGain", "Preventia"].map((name) => (
                <span
                  key={name}
                  style={{
                    fontSize: "9.5px",
                    fontWeight: 700,
                    color: "#2a0e0e",
                    background: "rgba(255,255,255,0.28)",
                    borderRadius: "999px",
                    padding: "3px 7px",
                    letterSpacing: "0.01em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {name}
                </span>
              ))}
            </div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: C.dark, letterSpacing: "0.01em" }}>3 products across edge AI, health, and data</div>
          </Box>
        </div>

        {/* ── achievements: trophy badge + metric pills ── */}
        <Reveal style={{ marginBottom: GAP }}>
          <Box style={{ padding: "12px 16px" }}>
            <Label>Achievements · unlocked</Label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", marginTop: "9px" }}>
              <a
                href="https://devpost.com/software/preventia-sblncy"
                target="_blank"
                rel="noopener noreferrer"
                className="badge"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: `linear-gradient(90deg, ${C.leaf}, ${C.sun})`,
                  borderRadius: "999px",
                  padding: "8px 14px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#1a0605",
                  letterSpacing: "0.02em",
                  textDecoration: "none",
                }}
              >
                <Trophy size={13} color="#1a0605" strokeWidth={2.2} />
                Best Use of Gemini AI · HackAugie
              </a>
              {WINS.map((win) => (
                <span
                  key={win}
                  className="badge"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    border: `1px solid ${C.border}`,
                    background: C.panel,
                    borderRadius: "999px",
                    padding: "8px 13px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: C.moss,
                    letterSpacing: "0.02em",
                  }}
                >
                  <span style={{ color: C.leaf }}>✦</span>
                  {win}
                </span>
              ))}
            </div>
          </Box>
        </Reveal>

        {/* ── row 3: skill chips (left) + contact (right) ── */}
        <Reveal style={{ marginBottom: GAP }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: GAP }}>
            <Box style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Label>In the stack</Label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
                {SKILLS.map((skill) => (
                  <span
                    key={skill}
                    className="badge chip"
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: C.bark,
                      border: `1px solid ${C.border}`,
                      background: "rgba(226,72,58,0.1)",
                      borderRadius: "999px",
                      padding: "6px 13px",
                      letterSpacing: "0.01em",
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </Box>

            <Box dark style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: "15px", fontWeight: 700, color: C.cream, lineHeight: 1.6, letterSpacing: "0.01em" }}>
                Have a problem worth building for?
              </div>
              <div style={{ marginTop: "6px", fontSize: "12px", fontWeight: 500, color: C.moss, lineHeight: 1.55 }}>
                I&apos;m open to software engineering, AI/ML, and product-focused opportunities.
              </div>
              <a
                href="mailto:summerpandey23@augustana.edu"
                className="link-glow"
                style={{ marginTop: "10px", fontSize: "12px", fontWeight: 600, color: C.sun, opacity: 0.95, textDecoration: "none" }}
              >
                summerpandey23@augustana.edu
              </a>
            </Box>
          </div>
        </Reveal>

        {/* ── footer: sign-off + social links ── */}
        <Reveal>
          <Box dark flat style={{ padding: "16px 26px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
              <div
                className="serif"
                style={{
                  fontFamily: SERIF,
                  fontWeight: 600,
                  fontSize: "clamp(18px, 2vw, 26px)",
                  color: C.cream,
                  lineHeight: 1.35,
                  letterSpacing: "0.01em",
                }}
              >
                Let&apos;s build something
                <br />
                <span style={{ color: C.sun }}>useful</span>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                {SOCIALS.map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="icon-btn"
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      border: "1px solid rgba(255,255,255,0.16)",
                      background: "rgba(255,255,255,0.04)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={15} color={C.sun} />
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
