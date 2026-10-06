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
  Dumbbell,
  Aperture,
  BarChart3,
  Cast,
  CircleDot,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { C, FONT, SERIF, DARK_GRAD, DOT_GRID, EYEBROW, type Panel } from "./theme";
import { Reveal } from "./fx";
import {
  ART_FIELD,
  PHOTO_SCRIM,
  VentureGainArt,
  CryptoArt,
  PiCarArt,
  WlogArt,
  PortfolioArt,
  DataArt,
  AuraTVArt,
  VolleyballArt,
  MMMArt,
} from "./ProjectArt";

/* ────────────────────────────────────────────────────────────────────
   WorkPage — the project garden: flippable project cards (front =
   quick summary, back = case-study detail), a compact résumé strip
   (experience / education / toolbox), and a footer CTA.
   ──────────────────────────────────────────────────────────────────── */

/* ── project data ──────────────────────────────────────────────────── */

// Technology tags — restrained golden-yellow, per the brand's "use yellow
// sparingly for tags" rule. A single muted tone keeps a row of 4-5 tags
// from reading as a rainbow.
const TAG_COLORS = [C.sun] as const;

type Category = "AI/ML" | "Backend" | "Frontend" | "NLP" | "Robotics";
type Filter = "All Projects" | Category;
type Status = "Prototype" | "Live" | "Award Winner" | "In Development";

type BackSection = { label: string; text: string };

type Project = {
  title: string;
  icon: LucideIcon; // fallback banner mark for a project with neither photo nor art
  status: Status;
  desc: string; // front-facing description
  photo?: string; // banner photo, when there's a real one
  art?: () => React.ReactElement; // hand-drawn banner art for projects without a photo
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
    art: VentureGainArt,
    icon: Activity,
    status: "Live",
    desc: "An AI-assisted health and workout tracker that turns photo, voice, and text logs into structured daily records.",
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
    art: CryptoArt,
    icon: Coins,
    status: "Prototype",
    desc: "A machine-learning pipeline that scores sentiment in cryptocurrency news and social-media discussions.",
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
    art: PiCarArt,
    icon: Navigation,
    status: "Prototype",
    desc: "A Raspberry Pi robotics car that uses real-time lane detection for autonomous navigation.",
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
  {
    title: "Wlog",
    art: WlogArt,
    icon: Dumbbell,
    status: "Prototype",
    desc: "A Chrome extension that logs workouts from plain language, cutting manual entry time.",
    tags: ["chrome-extension", "openai", "nodejs"],
    back: {
      sections: [
        {
          label: "Overview",
          text: "A Google Chrome extension to log workouts from plain language — cut manual entry 40%, 200+ entries stored.",
        },
      ],
      tech: "Chrome Extension · OpenAI · Node.js",
    },
    cats: ["AI/ML"],
  },
  {
    title: "Portfolio Website",
    art: PortfolioArt,
    icon: Aperture,
    status: "Live",
    desc: "This site — a moody, film-grain, scroll-to-grow portfolio built with Next.js & React.",
    ghUrl: "https://github.com/SummerPandey/PW",
    demoUrl: "https://summerpandey.com",
    tags: ["nextjs", "react", "typescript"],
    back: {
      sections: [
        {
          label: "Overview",
          text: "The site you're looking at right now — a moody, film-grain, scroll-to-grow portfolio built with Next.js & React.",
        },
      ],
      tech: "Next.js · React · TypeScript",
    },
    cats: ["Frontend"],
  },
  {
    title: "Data Project",
    art: DataArt,
    icon: BarChart3,
    status: "Prototype",
    desc: "Twitter sentiment analysis — cleaning, modeling, and visualizing public sentiment from tweet data.",
    tags: ["python", "nlp", "data-science"],
    back: {
      sections: [
        {
          label: "Overview",
          text: "Twitter sentiment analysis — cleaning, modeling and visualizing public sentiment from tweet data.",
        },
      ],
      tech: "Python · NLP · Data Science",
    },
    cats: ["AI/ML", "NLP"],
  },
  {
    title: "CS SI · AuraTV",
    art: AuraTVArt,
    icon: Cast,
    status: "Prototype",
    desc: "A streaming app with autoplay channels and personalized recommendations, built for the CS SI course.",
    tags: ["flutter", "firebase", "youtube-api"],
    back: {
      sections: [
        {
          label: "Overview",
          text: "AuraTV — a streaming app with autoplay channels and personalized recommendations, built for the CS SI course.",
        },
      ],
      tech: "Flutter · Firebase · YouTube API",
    },
    cats: ["Frontend"],
  },
  {
    title: "Volleyball Organizer",
    art: VolleyballArt,
    icon: CircleDot,
    status: "Prototype",
    desc: "A volleyball tournament organizer — building brackets, scheduling matches, and tracking results.",
    tags: ["app", "scheduling"],
    back: {
      sections: [
        {
          label: "Overview",
          text: "A volleyball tournament organizer — building brackets, scheduling matches and tracking results.",
        },
      ],
      tech: "App · Scheduling",
    },
    cats: ["Frontend"],
  },
  {
    title: "MMM",
    art: MMMArt,
    icon: TrendingUp,
    status: "Prototype",
    desc: "Multi-marketing modeling — quantifying how marketing channels drive outcomes with SQL and Python.",
    tags: ["python", "sql", "marketing"],
    back: {
      sections: [
        {
          label: "Overview",
          text: "Multi-marketing modeling — quantifying how marketing channels drive outcomes, with SQL & Python and channel-ROI reporting.",
        },
      ],
      tech: "Python · SQL · Marketing Analytics",
    },
    cats: ["Backend"],
  },
];

const TABS: Filter[] = ["All Projects", "AI/ML", "Backend", "Frontend", "NLP", "Robotics"];

const STATUS_STYLE: Record<Status, { bg: string; color: string }> = {
  Prototype: { bg: "rgba(255,255,255,0.14)", color: C.cream },
  Live: { bg: "rgba(90,200,120,0.22)", color: "#8fe3a8" },
  "Award Winner": { bg: "rgba(255,212,71,0.22)", color: "#FFD447" },
  "In Development": { bg: "rgba(234,170,34,0.2)", color: C.sun },
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
          className="btn-quiet"
          style={{ ...btnStyle, background: "rgba(255,255,255,0.08)", color: C.cream, border: `1px solid ${C.border}` }}
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
          className="btn-quiet btn-gold"
          style={btnStyle}
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
          className="btn-quiet"
          style={{ ...btnStyle, background: "rgba(255,255,255,0.08)", color: C.cream, border: `1px solid ${C.border}` }}
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
          {/* banner: real photo, or hand-drawn art — plus status badge and GitHub shortcut */}
          <div
            className="card-banner"
            style={{
              position: "relative",
              borderRadius: "16px",
              background: p.photo ? `${PHOTO_SCRIM}, url(${p.photo}) center/cover no-repeat` : ART_FIELD,
              boxShadow: "inset 0 0 0 1px rgba(255,249,232,0.06)",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {p.photo ? null : p.art ? (
              <p.art />
            ) : (
              <p.icon size={34} color={C.cream} strokeWidth={1.4} aria-hidden />
            )}
            <span
              style={{
                position: "absolute",
                top: "10px",
                left: "10px",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                background: "rgba(8,9,9,0.85)",
                color: status.color,
                fontSize: "11px",
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
                className="btn-quiet"
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: "rgba(8,9,9,0.85)",
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
            style={{ fontFamily: SERIF, fontWeight: 600, fontSize: "19px", color: C.dark, marginTop: "14px", lineHeight: 1.25 }}
          >
            {p.title}
          </div>
          <p className="card-desc" style={{ fontSize: "14px", fontWeight: 500, lineHeight: 1.6, color: C.moss, marginTop: "6px" }}>
            {p.desc}
          </p>

          {/* hashtags */}
          <div className="card-tags" style={{ display: "flex", flexWrap: "wrap", gap: "6px 10px", marginTop: "10px" }}>
            {p.tags.map((tag, i) => (
              <span key={tag} style={{ fontSize: "12px", fontWeight: 700, color: TAG_COLORS[i % TAG_COLORS.length] }}>
                #{tag}
              </span>
            ))}
          </div>

          <div aria-hidden style={{ height: "14px", flexShrink: 0 }} />

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
              marginTop: "auto",
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
              flexShrink: 0,
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
            border: "1px solid rgba(234,170,34,0.18)",
            padding: "16px",
          }}
        >
          <div
            className="serif"
            style={{ fontFamily: SERIF, fontWeight: 600, fontSize: "19px", color: C.cream, lineHeight: 1.25 }}
          >
            {p.title}
          </div>

          <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
            {p.back.sections.map((s) => (
              <div key={s.label}>
                <div style={{ ...EYEBROW, color: C.sun }}>{s.label}</div>
                <p style={{ fontSize: "13px", fontWeight: 500, lineHeight: 1.5, color: "rgba(255,249,232,0.82)", marginTop: "5px" }}>
                  {s.text}
                </p>
              </div>
            ))}
            <div>
              <div style={{ ...EYEBROW, color: C.sun }}>Technology</div>
              <p style={{ fontSize: "13px", fontWeight: 600, lineHeight: 1.5, color: C.cream, marginTop: "5px" }}>{p.back.tech}</p>
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
              className="btn-quiet"
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
    border: "1px solid rgba(234,170,34,0.16)",
    padding: "20px 22px",
  };
  const cardLabel = (dark?: boolean): React.CSSProperties => ({ ...EYEBROW, color: dark ? C.sun : C.muted });

  return (
    <div style={{ minHeight: "100vh", fontFamily: FONT, ...DOT_GRID }}>
      <div style={{ padding: "92px clamp(16px, 3vw, 36px) 56px", maxWidth: "1240px", margin: "0 auto" }}>
        {/* ── intro ── */}
        <div style={EYEBROW}>What I&apos;ve built</div>
        <h1
          className="serif"
          style={{
            fontFamily: SERIF,
            fontWeight: 600,
            fontSize: "clamp(36px, 4vw, 56px)",
            lineHeight: 1.05,
            color: C.dark,
            margin: "14px 0 0",
            letterSpacing: "-0.018em",
          }}
        >
          My Work.
        </h1>
        <p style={{ maxWidth: "62ch", marginTop: "16px", fontSize: "15px", fontWeight: 500, lineHeight: 1.65, color: C.moss }}>
          A collection of things I&apos;ve built — products and experiments across edge AI, health technology,
          automation, and applied machine learning. Filter by what you&apos;re curious about; each card links out
          to its code, write-up, or résumé entry.
        </p>

        {/* ── filter tabs ── */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "26px" }}>
          {TABS.map((tab) => {
            const on = filter === tab;
            return (
              <button
                key={tab}
                onClick={() => selectFilter(tab)}
                aria-pressed={on}
                className={on ? "tab btn-gold" : "tab"}
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
                  background: C.panel,
                  color: C.moss,
                }}
              >
                {tab}
                <span style={{ fontWeight: 600, opacity: 0.6, fontSize: "12px", fontVariantNumeric: "tabular-nums" }}>
                  {countFor(tab)}
                </span>
              </button>
            );
          })}
        </div>
        <div style={{ height: "1px", background: C.border, margin: "24px 0 28px" }} />

        {/* the grid's heading, for screen readers — the H1 above already says it visually */}
        <h2 className="sr-only">Selected work</h2>

        {/* ── filtered project grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: "20px" }}>
          {shown.map((p, i) => (
            <Reveal key={`${filter}-${p.title}`} delay={Math.min(i, 5) * 40} style={{ display: "flex" }}>
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
                <div style={{ fontSize: "12px", fontWeight: 500, color: "rgba(255,249,232,0.6)", marginTop: "4px" }}>
                  iD Tech · Stanford, CA · Jun 2026 – Present
                </div>
                <div className="serif" style={{ fontFamily: SERIF, fontWeight: 600, fontSize: "15px", color: C.cream, marginTop: "14px" }}>
                  Software Engineering Intern
                </div>
                <div style={{ fontSize: "12px", fontWeight: 500, color: "rgba(255,249,232,0.6)", marginTop: "4px" }}>
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
                      background: "rgba(234,170,34,0.12)",
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
              border: "1px solid rgba(234,170,34,0.16)",
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
              style={{ fontFamily: SERIF, fontWeight: 600, fontSize: "clamp(20px, 2vw, 26px)", color: C.cream, lineHeight: 1.3, letterSpacing: "-0.01em" }}
            >
              Let&apos;s build something <span style={{ color: C.sun }}>useful</span> ✦
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => goTo("welcome")}
                className="btn-quiet"
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
                className="btn-quiet btn-gold"
                style={{
                  borderRadius: "999px",
                  padding: "11px 18px",
                  textDecoration: "none",
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: "13px",
                  color: "#080909",
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
