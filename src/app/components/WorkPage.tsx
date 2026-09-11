"use client";

import { useState } from "react";
import {
  Github,
  ArrowUpRight,
  FileText,
  Activity,
  Dumbbell,
  Stethoscope,
  Aperture,
  Coins,
  Navigation,
  BarChart3,
  Cast,
  CircleDot,
  TrendingUp,
  Trophy,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { C, FONT, SERIF, DARK_GRAD, DOT_GRID, type Panel } from "./theme";
import { Reveal } from "./fx";

/* ────────────────────────────────────────────────────────────────────
   WorkPage — the project garden: filterable project cards, a compact
   résumé strip (experience / education / toolbox), and a footer CTA.
   ──────────────────────────────────────────────────────────────────── */

/* ── project data ──────────────────────────────────────────────────── */

// Hashtag tag colors, keyed by tone.
const TAG_COLOR = {
  leaf: C.leaf,
  teal: C.teal,
  sun: "#c9702e",
  wood: C.wood,
} as const;

type Category =
  | "AI/ML"
  | "Backend"
  | "Frontend"
  | "UI/UX"
  | "Design"
  | "Branding"
  | "Illustration"
  | "Blogs";

type Filter = "All Projects" | Category;

type Project = {
  title: string;
  icon: LucideIcon;
  award?: string;
  desc: string;
  grad: string; // banner gradient
  photo?: string; // optional banner photo, shown under the gradient wash
  tags: { label: string; tone: keyof typeof TAG_COLOR }[];
  link: string;
  linkIcon: "github" | "devpost" | "resume";
  cats: Category[];
};

const PROJECTS: Project[] = [
  {
    title: "Argus",
    icon: ShieldCheck,
    desc: "A privacy-by-design operating-room CV system: all video processed on an NVIDIA Jetson, connected to a serverless AWS backend, so medical footage never leaves the device. Detects 4 safety events with human-in-the-loop review.",
    grad: "linear-gradient(150deg, rgba(20,54,31,0.55), rgba(10,20,14,0.85))",
    photo: "/images/jetson-device.jpg",
    tags: [
      { label: "python", tone: "leaf" },
      { label: "aws", tone: "sun" },
      { label: "jetson", tone: "teal" },
    ],
    link: "https://github.com/SummerPandey",
    linkIcon: "github",
    cats: ["AI/ML", "Backend"],
  },
  {
    title: "VentureGain",
    icon: Activity,
    desc: "A full-stack health-tracking dashboard used by 20+ users — workouts, nutrition, sleep, energy & hydration in one place, with photo/voice/text logging normalized into a PostgreSQL/JSONB schema with per-user row-level security.",
    grad: "linear-gradient(150deg, #c0453a, #5c1414)",
    tags: [
      { label: "react", tone: "leaf" },
      { label: "typescript", tone: "wood" },
      { label: "supabase", tone: "teal" },
    ],
    link: "https://github.com/SummerPandey",
    linkIcon: "github",
    cats: ["Frontend", "UI/UX"],
  },
  {
    title: "Wlog",
    icon: Dumbbell,
    desc: "A Google Chrome extension to log workouts from plain language — cut manual entry 40%, 200+ entries stored.",
    grad: "linear-gradient(150deg, #d97a4d, #8a3a1e)",
    tags: [
      { label: "chrome", tone: "teal" },
      { label: "openai", tone: "leaf" },
      { label: "nodejs", tone: "sun" },
    ],
    link: "https://github.com/SummerPandey",
    linkIcon: "github",
    cats: ["AI/ML"],
  },
  {
    title: "Preventia",
    icon: Stethoscope,
    award: "Best Use of Gemini AI",
    desc: "Won Best Use of Gemini AI at HackAugie — a Flutter app that generates personalized preventive-health checklists from demographic and regional risk factors, with Firebase-powered gamified tracking and leaderboards.",
    grad: "linear-gradient(150deg, rgba(107,31,31,0.6), rgba(30,8,8,0.88))",
    photo: "/images/team-photo-2.jpg",
    tags: [
      { label: "flutter", tone: "teal" },
      { label: "firebase", tone: "sun" },
      { label: "geminiai", tone: "leaf" },
    ],
    link: "https://devpost.com/software/preventia-sblncy",
    linkIcon: "devpost",
    cats: ["AI/ML"],
  },
  {
    title: "Portfolio Website",
    icon: Aperture,
    desc: "The site you're looking at right now — a moody, film-grain, scroll-to-grow portfolio built with Next.js & React.",
    grad: "linear-gradient(150deg, #8a4a4a, #3a1616)",
    tags: [
      { label: "nextjs", tone: "leaf" },
      { label: "react", tone: "teal" },
      { label: "typescript", tone: "wood" },
    ],
    link: "https://github.com/SummerPandey",
    linkIcon: "github",
    cats: ["Design", "Branding"],
  },
  {
    title: "Crypto Sentiment Analyzer",
    icon: Coins,
    desc: "A Python pipeline that scores crypto news & social sentiment with RoBERTa and VADER — 72% accuracy against labeled data.",
    grad: "linear-gradient(150deg, #d9895a, #a34a1e)",
    tags: [
      { label: "python", tone: "leaf" },
      { label: "roberta", tone: "sun" },
      { label: "vader", tone: "teal" },
    ],
    link: "https://github.com/SummerPandey",
    linkIcon: "github",
    cats: ["AI/ML", "Backend"],
  },
  {
    title: "Pi Car",
    icon: Navigation,
    desc: "A robotics car that drives on its own — real-time lane detection for autonomous navigation on a Raspberry Pi.",
    grad: "linear-gradient(150deg, #9a5a52, #4a2018)",
    tags: [
      { label: "python", tone: "leaf" },
      { label: "opencv", tone: "teal" },
      { label: "raspberrypi", tone: "wood" },
    ],
    link: "https://github.com/SummerPandey",
    linkIcon: "github",
    cats: ["AI/ML"],
  },
  {
    title: "Data Project",
    icon: BarChart3,
    desc: "Twitter sentiment analysis — cleaning, modeling and visualizing public sentiment from tweet data.",
    grad: "linear-gradient(150deg, #c96a4a, #7a2e1e)",
    tags: [
      { label: "python", tone: "leaf" },
      { label: "nlp", tone: "teal" },
      { label: "datascience", tone: "wood" },
    ],
    link: "https://github.com/SummerPandey",
    linkIcon: "github",
    cats: ["Illustration", "Blogs"],
  },
  {
    title: "CS SI · AuraTV",
    icon: Cast,
    desc: "AuraTV — a streaming app with autoplay channels and personalized recommendations, built for the CS SI course.",
    grad: "linear-gradient(150deg, #8a3230, #2a0e0e)",
    tags: [
      { label: "flutter", tone: "sun" },
      { label: "firebase", tone: "wood" },
      { label: "youtubeapi", tone: "teal" },
    ],
    link: "https://github.com/SummerPandey",
    linkIcon: "github",
    cats: ["Frontend"],
  },
  {
    title: "Volleyball Organizer",
    icon: CircleDot,
    desc: "A volleyball tournament organizer — building brackets, scheduling matches and tracking results.",
    grad: "linear-gradient(150deg, #d16a4a, #8a3018)",
    tags: [
      { label: "app", tone: "leaf" },
      { label: "scheduling", tone: "teal" },
    ],
    link: "https://github.com/SummerPandey",
    linkIcon: "github",
    cats: ["Branding"],
  },
  {
    title: "MMM",
    icon: TrendingUp,
    desc: "Multi-marketing modeling — quantifying how marketing channels drive outcomes, with SQL & Python and channel-ROI reporting.",
    grad: "linear-gradient(150deg, #b04a3a, #5a1e14)",
    tags: [
      { label: "python", tone: "leaf" },
      { label: "sql", tone: "teal" },
      { label: "marketing", tone: "wood" },
    ],
    link: "/Summer_Pandey_Resume.pdf",
    linkIcon: "resume",
    cats: ["Illustration", "Blogs"],
  },
];

const TABS: Filter[] = [
  "All Projects", "AI/ML", "Backend", "Frontend", "UI/UX",
  "Design", "Branding", "Illustration", "Blogs",
];

const SKILLS = [
  "Python", "TypeScript", "JavaScript", "Java", "C++", "C", "SQL", "Rust", "Dart",
  "React", "Node.js", "Express.js", "Flutter",
  "AWS", "PostgreSQL", "Supabase", "Firebase", "MongoDB",
  "Docker", "Kubernetes", "Git",
  "PyTorch", "TensorFlow", "scikit-learn", "NVIDIA Jetson", "Gemini API",
];

function countFor(filter: Filter) {
  if (filter === "All Projects") return PROJECTS.length;
  return PROJECTS.filter((p) => p.cats.includes(filter)).length;
}

/* ── card pieces ───────────────────────────────────────────────────── */

function LinkIcon({ kind }: { kind: Project["linkIcon"] }) {
  if (kind === "github") return <Github size={16} color={C.cream} />;
  if (kind === "resume") return <FileText size={16} color={C.cream} />;
  return <ArrowUpRight size={16} color={C.cream} strokeWidth={2.4} />;
}

function ProjectCard({ p }: { p: Project }) {
  return (
    <div
      className="pbox"
      style={{
        width: "100%",
        background: C.panel,
        borderRadius: "22px",
        border: `1px solid ${C.border}`,
        padding: "14px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
      }}
    >
      {/* banner: photo (if any) + gradient wash, sigil mark, award ribbon, link button */}
      <div
        style={{
          position: "relative",
          height: "172px",
          borderRadius: "16px",
          background: p.photo
            ? `${p.grad}, url(${p.photo}) center/cover no-repeat`
            : p.grad,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          className="card-icon"
          style={{
            display: "flex",
            width: "84px",
            height: "84px",
            borderRadius: "50%",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.22)",
            filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.25))",
          }}
        >
          <p.icon size={40} color={C.cream} strokeWidth={1.4} />
        </span>
        {p.award && (
          <span
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              background: "rgba(20,8,7,0.8)",
              color: C.cream,
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.02em",
              padding: "5px 10px",
              borderRadius: "999px",
            }}
          >
            <Trophy size={11} color={C.cream} strokeWidth={2} />
            {p.award}
          </span>
        )}
        <a
          href={p.link}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${p.title}`}
          className="btn-bounce"
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            background: "rgba(20,8,7,0.82)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
          }}
        >
          <LinkIcon kind={p.linkIcon} />
        </a>
      </div>

      {/* title + description */}
      <div
        className="serif"
        style={{ fontFamily: SERIF, fontWeight: 600, fontSize: "20px", color: C.dark, marginTop: "14px", letterSpacing: "0.005em" }}
      >
        {p.title}
      </div>
      <p style={{ fontSize: "13px", fontWeight: 500, lineHeight: 1.6, color: C.moss, marginTop: "8px", minHeight: "82px" }}>
        {p.desc}
      </p>

      {/* colored hashtags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
        {p.tags.map((tag) => (
          <span key={tag.label} style={{ fontSize: "13px", fontWeight: 700, color: TAG_COLOR[tag.tone] }}>
            #{tag.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── the page ──────────────────────────────────────────────────────── */

export function WorkPage({ goTo }: { goTo: (p: Panel) => void }) {
  const [filter, setFilter] = useState<Filter>("All Projects");
  const shown = PROJECTS.filter((p) => filter === "All Projects" || p.cats.includes(filter));

  const resumeCard: React.CSSProperties = {
    background: C.panel,
    borderRadius: "20px",
    border: `1px solid ${C.border}`,
    padding: "20px 22px",
  };
  const resumeCardDark: React.CSSProperties = {
    background: DARK_GRAD,
    borderRadius: "20px",
    border: "1px solid rgba(226,72,58,0.18)",
    padding: "20px 22px",
  };
  const cardLabel = (dark?: boolean): React.CSSProperties => ({
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: dark ? C.sun : C.muted,
  });

  return (
    <div style={{ minHeight: "100vh", fontFamily: FONT, ...DOT_GRID }}>
      <div style={{ padding: "92px clamp(16px, 3vw, 36px) 56px", maxWidth: "1240px", margin: "0 auto" }}>
        {/* ── intro ── */}
        <div style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: C.wood }}>
          What I&apos;ve built
        </div>
        <h1
          className="serif"
          style={{ fontFamily: SERIF, fontWeight: 600, fontSize: "clamp(34px, 4vw, 56px)", color: C.dark, margin: "8px 0 0", letterSpacing: "0.01em" }}
        >
          My Work.
        </h1>
        <p style={{ maxWidth: "620px", marginTop: "14px", fontSize: "15px", fontWeight: 500, lineHeight: 1.7, color: C.moss }}>
          A collection of things I&apos;ve built. Filter by what you&apos;re curious about —
          each card links out to its code, write-up, or résumé entry.
        </p>

        {/* ── filter tabs ── */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "26px" }}>
          {TABS.map((tab) => {
            const on = filter === tab;
            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className="tab"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  cursor: "pointer",
                  borderRadius: "999px",
                  padding: "9px 16px",
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: "13px",
                  letterSpacing: "0.01em",
                  border: on ? "1px solid transparent" : `1px solid ${C.border}`,
                  background: on ? `linear-gradient(90deg, ${C.leaf}, ${C.sun})` : C.panel,
                  color: on ? "#1a0605" : C.moss,
                  boxShadow: on ? "0 6px 16px rgba(226,72,58,0.22)" : "none",
                }}
              >
                {tab}
                <span style={{ fontWeight: 700, opacity: 0.7, fontSize: "12px" }}>({countFor(tab)})</span>
              </button>
            );
          })}
        </div>
        <div
          style={{
            height: "2px",
            background: `linear-gradient(90deg, ${C.leaf}, ${C.wood}, transparent)`,
            borderRadius: "2px",
            margin: "18px 0 24px",
          }}
        />

        {/* ── filtered project grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: "20px" }}>
          {shown.map((p, i) => (
            <Reveal key={`${filter}-${p.title}`} delay={i * 55} style={{ display: "flex" }}>
              <ProjectCard p={p} />
            </Reveal>
          ))}
        </div>

        {/* ── compact résumé strip: experience / education / toolbox ── */}
        <Reveal style={{ marginTop: "48px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            <div className="pbox" style={resumeCardDark}>
              <div style={cardLabel(true)}>Experience</div>
              <div style={{ marginTop: "12px" }}>
                <div className="serif" style={{ fontFamily: SERIF, fontWeight: 600, fontSize: "15px", color: C.cream }}>
                  NVIDIA AI &amp; Machine Learning Instructor
                </div>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "rgba(243,222,210,0.6)", marginTop: "3px" }}>
                  iD Tech at Stanford University · Jun 2026 – Present
                </div>
                <div className="serif" style={{ fontFamily: SERIF, fontWeight: 600, fontSize: "15px", color: C.cream, marginTop: "14px" }}>
                  Software Engineering Intern
                </div>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "rgba(243,222,210,0.6)", marginTop: "3px" }}>
                  Sports Media Inc. · Jun 2025 – Aug 2025
                </div>
              </div>
            </div>

            <div className="pbox" style={resumeCard}>
              <div style={cardLabel()}>Education &amp; Leadership</div>
              <div className="serif" style={{ fontFamily: SERIF, fontWeight: 600, fontSize: "15px", color: C.dark, marginTop: "12px" }}>
                Augustana College
              </div>
              <div style={{ fontSize: "12px", fontWeight: 500, color: C.moss, marginTop: "4px", lineHeight: 1.6 }}>
                B.A. Computer Science &amp; Data Science · Minor in Math · Expected 05/2027
              </div>
              <div style={{ fontSize: "12px", fontWeight: 500, color: C.moss, marginTop: "10px", lineHeight: 1.6 }}>
                Community Advisor · Google Dev Group Co-Lead — mentored 200+ students, ran workshops &amp; hackathons.
              </div>
            </div>

            <div className="pbox" style={resumeCard}>
              <div style={cardLabel()}>Toolbox</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
                {SKILLS.map((skill) => (
                  <span
                    key={skill}
                    className="chip"
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: C.bark,
                      border: `1px solid ${C.border}`,
                      background: "rgba(226,72,58,0.1)",
                      borderRadius: "999px",
                      padding: "4px 11px",
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── footer CTA ── */}
        <Reveal style={{ marginTop: "20px" }}>
          <div
            style={{
              background: DARK_GRAD,
              borderRadius: "20px",
              border: "1px solid rgba(226,72,58,0.18)",
              padding: "24px 28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div
              className="serif"
              style={{ fontFamily: SERIF, fontWeight: 600, fontSize: "clamp(18px, 2vw, 26px)", color: C.cream, lineHeight: 1.35 }}
            >
              Let&apos;s build something <span style={{ color: C.sun }}>useful</span> ✦
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => goTo("welcome")}
                className="btn-bounce"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  borderRadius: "999px",
                  padding: "11px 18px",
                  cursor: "pointer",
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: "13px",
                  color: C.cream,
                }}
              >
                ← Back to start
              </button>
              <a
                href="mailto:summerpandey23@augustana.edu"
                className="btn-bounce"
                style={{
                  background: `linear-gradient(90deg, ${C.leaf}, ${C.sun})`,
                  borderRadius: "999px",
                  padding: "11px 18px",
                  textDecoration: "none",
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: "13px",
                  color: "#1a0605",
                }}
              >
                Say hello ✉
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
