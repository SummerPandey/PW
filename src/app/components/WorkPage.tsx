"use client";

import { useId, useState } from "react";
import {
  Github,
  ArrowUpRight,
  Activity,
  Stethoscope,
  Coins,
  Navigation,
  Trophy,
  ShieldCheck,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import { C, FONT, SERIF, DARK_GRAD, DOT_GRID, type Panel } from "./theme";
import { Reveal } from "./fx";

/* ────────────────────────────────────────────────────────────────────
   WorkPage — the project garden: flippable project cards (front =
   quick summary, back = case-study detail), a compact résumé strip
   (experience / education / toolbox), and a footer CTA.
   ──────────────────────────────────────────────────────────────────── */

/* ── project data ──────────────────────────────────────────────────── */

// Hashtag/tag colors, cycled by index.
const TAG_COLORS = [C.leaf, C.wood, "#c9702e", C.teal] as const;

type Category = "AI/ML" | "Backend" | "Frontend" | "NLP" | "Robotics";
type Filter = "All Projects" | Category;
type Status = "Prototype" | "Live" | "Award Winner" | "In Development";

type BackSection = { label: string; text: string };

type Project = {
  title: string;
  icon: LucideIcon;
  status: Status;
  desc: string; // front-facing description
  grad: string; // banner gradient
  photo?: string; // optional banner photo, shown under the gradient wash
  tags: string[]; // 3-5 tech tags, shown on the front
  ghUrl?: string; // omitted when no confirmed/public repo exists
  demoUrl?: string; // omitted when nothing is actually deployed
  devpostUrl?: string; // omitted when no writeup exists
  back: {
    sections: BackSection[];
    tech: string;
  };
  cats: Category[];
};

const PROJECTS: Project[] = [
  {
    title: "Argus",
    icon: ShieldCheck,
    status: "In Development",
    desc: "Privacy-first edge AI for monitoring operating-room safety without sending sensitive video to the cloud.",
    grad: "linear-gradient(150deg, rgba(20,54,31,0.55), rgba(10,20,14,0.85))",
    photo: "/images/jetson-device.jpg",
    tags: ["python", "computer-vision", "jetson", "gemini-ai"],
    ghUrl: "https://github.com/SummerPandey/Argus_0.1",
    back: {
      sections: [
        {
          label: "Problem",
          text: "Operating-room safety procedures must be monitored consistently, but uploading medical footage to external servers introduces serious privacy concerns.",
        },
        {
          label: "What I built",
          text: "I prototyped a computer-vision system that processes video locally on an NVIDIA Jetson. It monitors four safety workflows: hand hygiene, instrument counts, zone tracking, and sterile-field alerts.",
        },
        {
          label: "Engineering approach",
          text: "I combined AI detection with deterministic safety rules and a human-in-the-loop review step so uncertain events are reviewed before being reported.",
        },
        {
          label: "Outcome",
          text: "The prototype demonstrates how hospitals could automate safety monitoring while keeping sensitive footage on the local device.",
        },
      ],
      tech: "Python · NVIDIA Jetson · Computer Vision · Gemini AI",
    },
    cats: ["AI/ML", "Backend"],
  },
  {
    title: "VentureGain",
    icon: Activity,
    status: "Live",
    desc: "An AI-assisted health and workout tracker that turns photo, voice, and text logs into structured daily records.",
    grad: "linear-gradient(150deg, #c0453a, #5c1414)",
    tags: ["typescript", "react", "supabase", "postgresql", "ai"],
    ghUrl: "https://github.com/SummerPandey/Venture_Gain",
    demoUrl: "https://venture-gain.vercel.app",
    back: {
      sections: [
        {
          label: "Problem",
          text: "Health tracking becomes difficult to maintain when users must manually format every workout, meal, or wellness entry.",
        },
        {
          label: "What I built",
          text: "I built a progressive web app that accepts photo, voice, and text input. AI extraction and TypeScript validation transform all three input formats into consistent health records.",
        },
        {
          label: "Engineering approach",
          text: "I created a React dashboard that combines health and workout metrics into one daily view. I also designed a PostgreSQL schema supporting five record types and used Supabase row-level security to isolate each user's data.",
        },
        {
          label: "Outcome",
          text: "VentureGain supported more than 20 active users while making daily logging faster and more flexible.",
        },
      ],
      tech: "TypeScript · React · Supabase · PostgreSQL · Vercel",
    },
    cats: ["Frontend", "AI/ML"],
  },
  {
    title: "Preventia",
    icon: Stethoscope,
    status: "Award Winner",
    desc: "A Gemini-powered preventive-health app that creates personalized health checklists from demographic and regional risk factors.",
    grad: "linear-gradient(150deg, rgba(107,31,31,0.6), rgba(30,8,8,0.88))",
    photo: "/images/team-photo-2.jpg",
    tags: ["flutter", "firebase", "gemini-ai", "health-tech"],
    devpostUrl: "https://devpost.com/software/preventia-sblncy",
    back: {
      sections: [
        {
          label: "Problem",
          text: "Generic health recommendations often fail to account for a person's demographic background, location, and individual risk factors.",
        },
        {
          label: "What I built",
          text: "I developed a Flutter application that uses Gemini AI to generate personalized preventive-health checklists based on demographic and regional information.",
        },
        {
          label: "Product design",
          text: "I added Firebase-powered progress tracking, gamification, and leaderboards to encourage users to complete preventive-health actions consistently.",
        },
        {
          label: "Outcome",
          text: "Preventia won Best Use of Gemini AI at HackAugie.",
        },
      ],
      tech: "Flutter · Firebase · Gemini AI",
    },
    cats: ["AI/ML"],
  },
  {
    title: "Crypto Sentiment Analyzer",
    icon: Coins,
    status: "Prototype",
    desc: "A machine-learning pipeline that scores sentiment in cryptocurrency news and social-media discussions.",
    grad: "linear-gradient(150deg, #d9895a, #a34a1e)",
    tags: ["python", "roberta", "vader", "nlp"],
    back: {
      sections: [
        {
          label: "Problem",
          text: "Cryptocurrency discussions move quickly across news and social platforms, making overall market sentiment difficult to evaluate manually.",
        },
        {
          label: "What I built",
          text: "I developed a Python pipeline that processes cryptocurrency text and combines RoBERTa-based language understanding with VADER sentiment scoring.",
        },
        {
          label: "Evaluation",
          text: "The model achieved 72% accuracy when evaluated against labeled sentiment data.",
        },
        {
          label: "Outcome",
          text: "The project converts large amounts of unstructured crypto discussion into sentiment signals that can be analyzed more efficiently.",
        },
      ],
      tech: "Python · RoBERTa · VADER · Natural Language Processing",
    },
    cats: ["AI/ML", "NLP"],
  },
  {
    title: "Pi Car",
    icon: Navigation,
    status: "Prototype",
    desc: "A Raspberry Pi robotics car that uses real-time lane detection for autonomous navigation.",
    grad: "linear-gradient(150deg, #9a5a52, #4a2018)",
    tags: ["python", "opencv", "raspberry-pi", "robotics"],
    back: {
      sections: [
        {
          label: "Problem",
          text: "An autonomous vehicle must interpret visual road information and make navigation decisions with limited on-device computing power.",
        },
        {
          label: "What I built",
          text: "I created a Raspberry Pi-powered robotic car that analyzes camera input and performs real-time lane detection for autonomous navigation.",
        },
        {
          label: "Engineering focus",
          text: "The project focused on connecting computer-vision output to physical steering behavior while operating within the Raspberry Pi's hardware constraints.",
        },
        {
          label: "Outcome",
          text: "The completed prototype demonstrated on-device visual perception and autonomous lane-following behavior.",
        },
      ],
      tech: "Python · OpenCV · Raspberry Pi · Computer Vision",
    },
    cats: ["AI/ML", "Robotics"],
  },
];

const TABS: Filter[] = ["All Projects", "AI/ML", "Backend", "Frontend", "NLP", "Robotics"];

const STATUS_STYLE: Record<Status, { bg: string; color: string }> = {
  Prototype: { bg: "rgba(255,255,255,0.14)", color: C.cream },
  Live: { bg: "rgba(90,200,120,0.22)", color: "#8fe3a8" },
  "Award Winner": { bg: "rgba(255,180,63,0.22)", color: "#ffd23f" },
  "In Development": { bg: "rgba(255,138,101,0.2)", color: C.sun },
};

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

/** External-link buttons on the card back — GitHub, live demo, Devpost
    writeup — only rendered when a real URL exists for that project. */
function LinkButtons({
  p,
  onLinkClick,
  tabIndex,
}: {
  p: Project;
  onLinkClick: (e: React.MouseEvent) => void;
  tabIndex: number;
}) {
  const btnStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    borderRadius: "999px",
    padding: "8px 14px",
    fontFamily: FONT,
    fontWeight: 700,
    fontSize: "12px",
    textDecoration: "none",
    cursor: "pointer",
  };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
      {p.ghUrl && (
        <a
          href={p.ghUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onLinkClick}
          tabIndex={tabIndex}
          className="btn-bounce"
          style={{ ...btnStyle, background: "rgba(255,255,255,0.1)", color: C.cream, border: `1px solid ${C.border}` }}
        >
          <Github size={13} /> Code
        </a>
      )}
      {p.demoUrl && (
        <a
          href={p.demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onLinkClick}
          tabIndex={tabIndex}
          className="btn-bounce"
          style={{ ...btnStyle, background: `linear-gradient(90deg, ${C.leaf}, ${C.sun})`, color: "#1a0605" }}
        >
          <ArrowUpRight size={13} strokeWidth={2.4} /> Live demo
        </a>
      )}
      {p.devpostUrl && (
        <a
          href={p.devpostUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onLinkClick}
          tabIndex={tabIndex}
          className="btn-bounce"
          style={{ ...btnStyle, background: "rgba(255,255,255,0.1)", color: C.cream, border: `1px solid ${C.border}` }}
        >
          <ArrowUpRight size={13} strokeWidth={2.4} /> Devpost writeup
        </a>
      )}
    </div>
  );
}

function ProjectCard({ p, flipped, onToggle }: { p: Project; flipped: boolean; onToggle: () => void }) {
  const backId = useId();
  const status = STATUS_STYLE[p.status];
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="flip-scene">
      <div className={"flip-card" + (flipped ? " is-flipped" : "")}>
        {/* ── front face ── */}
        <div
          className="flip-face flip-face-front"
          aria-hidden={flipped}
          style={{
            background: C.panel,
            borderRadius: "22px",
            border: `1px solid ${C.border}`,
            padding: "14px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
          }}
        >
          {/* banner: photo (if any) + gradient wash, sigil mark, status badge, GitHub shortcut */}
          <div
            style={{
              position: "relative",
              height: "150px",
              borderRadius: "16px",
              flexShrink: 0,
              background: p.photo ? `${p.grad}, url(${p.photo}) center/cover no-repeat` : p.grad,
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
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.22)",
                filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.25))",
              }}
            >
              <p.icon size={34} color={C.cream} strokeWidth={1.4} />
            </span>
            <span
              style={{
                position: "absolute",
                top: "10px",
                left: "10px",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                background: "rgba(20,8,7,0.82)",
                color: status.color,
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.02em",
                padding: "5px 10px",
                borderRadius: "999px",
              }}
            >
              {p.status === "Award Winner" && <Trophy size={11} color={status.color} strokeWidth={2} />}
              {p.status}
            </span>
            {p.ghUrl && (
              <a
                href={p.ghUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={stop}
                tabIndex={flipped ? -1 : 0}
                aria-label={`Open ${p.title} on GitHub`}
                className="btn-bounce"
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: "rgba(20,8,7,0.82)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                }}
              >
                <Github size={15} color={C.cream} />
              </a>
            )}
          </div>

          {/* title + description */}
          <div
            className="serif"
            style={{ fontFamily: SERIF, fontWeight: 600, fontSize: "19px", color: C.dark, marginTop: "12px", letterSpacing: "0.005em" }}
          >
            {p.title}
          </div>
          <p style={{ fontSize: "13px", fontWeight: 500, lineHeight: 1.55, color: C.moss, marginTop: "6px", flex: 1 }}>{p.desc}</p>

          {/* colored hashtags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 10px", marginTop: "10px" }}>
            {p.tags.map((tag, i) => (
              <span key={tag} style={{ fontSize: "12px", fontWeight: 700, color: TAG_COLORS[i % TAG_COLORS.length] }}>
                #{tag}
              </span>
            ))}
          </div>

          {/* flip control */}
          <button
            type="button"
            onClick={onToggle}
            tabIndex={flipped ? -1 : 0}
            aria-expanded={flipped}
            aria-controls={backId}
            aria-label={`View details for ${p.title}`}
            className="tab"
            style={{
              marginTop: "12px",
              width: "100%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              cursor: "pointer",
              borderRadius: "999px",
              padding: "10px 14px",
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: "13px",
              border: `1px solid ${C.border}`,
              background: "rgba(255,255,255,0.04)",
              color: C.cream,
            }}
          >
            View details <ArrowUpRight size={14} strokeWidth={2.4} />
          </button>
        </div>

        {/* ── back face: case-study detail ── */}
        <div
          id={backId}
          className="flip-face flip-face-back"
          aria-hidden={!flipped}
          style={{
            background: DARK_GRAD,
            borderRadius: "22px",
            border: "1px solid rgba(226,72,58,0.22)",
            padding: "16px",
          }}
        >
          <div
            className="serif"
            style={{ fontFamily: SERIF, fontWeight: 600, fontSize: "18px", color: C.cream, letterSpacing: "0.005em" }}
          >
            {p.title}
          </div>

          <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
            {p.back.sections.map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.sun }}>
                  {s.label}
                </div>
                <p style={{ fontSize: "12.5px", fontWeight: 500, lineHeight: 1.55, color: "rgba(243,222,210,0.82)", marginTop: "3px" }}>
                  {s.text}
                </p>
              </div>
            ))}
            <div>
              <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.sun }}>
                Technology
              </div>
              <p style={{ fontSize: "12.5px", fontWeight: 600, lineHeight: 1.5, color: C.cream, marginTop: "3px" }}>{p.back.tech}</p>
            </div>
          </div>

          <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <LinkButtons p={p} onLinkClick={stop} tabIndex={flipped ? 0 : -1} />
            <button
              type="button"
              onClick={onToggle}
              tabIndex={flipped ? 0 : -1}
              aria-expanded={flipped}
              aria-controls={backId}
              aria-label={`Flip back to ${p.title} summary`}
              className="btn-bounce"
              style={{
                alignSelf: "flex-start",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                borderRadius: "999px",
                padding: "8px 14px",
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: "12px",
                border: "1px solid rgba(255,255,255,0.16)",
                background: "rgba(255,255,255,0.06)",
                color: C.cream,
              }}
            >
              <RotateCcw size={13} /> Flip back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── the page ──────────────────────────────────────────────────────── */

export function WorkPage({ goTo }: { goTo: (p: Panel) => void }) {
  const [filter, setFilter] = useState<Filter>("All Projects");
  const [flippedTitle, setFlippedTitle] = useState<string | null>(null);
  const shown = PROJECTS.filter((p) => filter === "All Projects" || p.cats.includes(filter));

  const selectFilter = (f: Filter) => {
    setFilter(f);
    setFlippedTitle(null); // don't leave an orphaned flipped card behind a changed filter
  };

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
                onClick={() => selectFilter(tab)}
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

        {/* ── selected-work header ── */}
        <h2
          className="serif"
          style={{ fontFamily: SERIF, fontWeight: 600, fontSize: "clamp(22px, 2.6vw, 30px)", color: C.dark, margin: 0, letterSpacing: "0.01em" }}
        >
          Selected Work
        </h2>
        <p style={{ maxWidth: "620px", marginTop: "8px", marginBottom: "20px", fontSize: "14px", fontWeight: 500, lineHeight: 1.6, color: C.moss }}>
          Products and experiments across edge AI, health technology, automation, and applied machine learning.
        </p>

        {/* ── filtered project grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: "20px" }}>
          {shown.map((p, i) => (
            <Reveal key={`${filter}-${p.title}`} delay={i * 55} style={{ display: "flex" }}>
              <ProjectCard
                p={p}
                flipped={flippedTitle === p.title}
                onToggle={() => setFlippedTitle(flippedTitle === p.title ? null : p.title)}
              />
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
                  iD Tech · Stanford, CA · Jun 2026 – Present
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
