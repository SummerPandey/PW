"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Github,
  ArrowLeft,
  ArrowUpRight,
  Mail,
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
  FileText,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { C, FONT, SERIF, DARK_GRAD, DOT_GRID, EYEBROW, RESUME_PDF, MAILTO, type Panel } from "./theme";
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
import "../styles/works.css";

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
  metric?: { value: string; label: string }; // only real, sourced numbers
  when?: string; // timeline/context line on the case sheet
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
    metric: { value: "4", label: "safety workflows, on-device" },
    when: "Jun 2026 – present",
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
    metric: { value: "20+", label: "active users" },
    when: "Jan – Jun 2026",
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
    when: "Mar 2026 · HackAugie",
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
    metric: { value: "72%", label: "accuracy on labeled data" },
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
    metric: { value: "40%", label: "less manual entry" },
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
    when: "CS SI course project",
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
  Live: { bg: "rgba(255,249,232,0.14)", color: C.cream },
  "Award Winner": { bg: "rgba(255,212,71,0.22)", color: "#FFD447" },
  "In Development": { bg: "rgba(234,170,34,0.2)", color: C.sun },
};

// The toolbox, grouped so 26 names read as four short rows instead of one wall.
const TOOLBOX: { label: string; items: string[] }[] = [
  { label: "Languages", items: ["Python", "TypeScript", "JavaScript", "Java", "C++", "C", "SQL", "Rust", "Dart"] },
  { label: "Frameworks", items: ["React", "Node.js", "Express.js", "Flutter"] },
  {
    label: "Cloud, data & DevOps",
    items: ["AWS", "PostgreSQL", "Supabase", "Firebase", "MongoDB", "Docker", "Kubernetes", "Git"],
  },
  { label: "ML & hardware", items: ["PyTorch", "TensorFlow", "scikit-learn", "NVIDIA Jetson", "Gemini API"] },
];

function countFor(filter: Filter) {
  if (filter === "All Projects") return PROJECTS.length;
  return PROJECTS.filter((p) => p.cats.includes(filter)).length;
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** A CSS custom property for the case-sheet stagger index. */
const stagger = (i: number) => ({ "--i": i }) as React.CSSProperties;

/* ── card pieces ───────────────────────────────────────────────────── */

/** External-link buttons on the card back — live demo (the primary
    action, so it leads), GitHub, Devpost writeup — only rendered when a
    real URL exists for that project. */
function LinkButtons({
  p,
  onLinkClick,
  tabIndex,
}: {
  p: Project;
  onLinkClick: (e: React.MouseEvent) => void;
  tabIndex: number;
}) {
  return (
    <>
      {p.demoUrl && (
        <a
          href={p.demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onLinkClick}
          tabIndex={tabIndex}
          className="btn-quiet btn-gold case-link"
        >
          <ArrowUpRight size={13} strokeWidth={2.4} aria-hidden /> Live demo
        </a>
      )}
      {p.ghUrl && (
        <a
          href={p.ghUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onLinkClick}
          tabIndex={tabIndex}
          className="btn-quiet case-link"
        >
          <Github size={13} aria-hidden /> Code
        </a>
      )}
      {p.devpostUrl && (
        <a
          href={p.devpostUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onLinkClick}
          tabIndex={tabIndex}
          className="btn-quiet case-link"
        >
          <ArrowUpRight size={13} strokeWidth={2.4} aria-hidden /> Devpost writeup
        </a>
      )}
    </>
  );
}

function ProjectCard({ p, flipped, onToggle }: { p: Project; flipped: boolean; onToggle: () => void }) {
  const backId = useId();
  const status = STATUS_STYLE[p.status];
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  const hasLinks = Boolean(p.demoUrl || p.ghUrl || p.devpostUrl);
  const isLede = p.back.sections.length === 1;

  const sceneRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLSpanElement>(null);
  const frontBtnRef = useRef<HTMLButtonElement>(null);
  const backBtnRef = useRef<HTMLButtonElement>(null);
  const box = useRef<DOMRect | null>(null);
  const frame = useRef(0);
  const aim = useRef({ x: 0.5, y: 0.3 });

  // Every change of side (this card's button, another card taking over,
  // or a filter change) bumps the turn count. Its parity picks one of two
  // identical keyframes, so each turn restarts the light-catch animation;
  // zero means "never turned", so nothing animates on first paint.
  const [turns, setTurns] = useState(0);
  const [lastFlipped, setLastFlipped] = useState(flipped);
  if (lastFlipped !== flipped) {
    setLastFlipped(flipped);
    setTurns((n) => n + 1);
  }

  // Keep keyboard focus on the visible side: the button you pressed is
  // about to face away (and go aria-hidden), so hand focus to its twin.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const scene = sceneRef.current;
    if (!scene || !scene.contains(document.activeElement)) return;
    (flipped ? backBtnRef : frontBtnRef).current?.focus({ preventScroll: true });
  }, [flipped]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  // Sunlight sheen: the box is measured once on enter, so pointermove does
  // no layout reads; writes are batched to one per frame, on the sheen only.
  const aimAt = (x: number, y: number) => {
    aim.current = { x, y };
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const el = sheenRef.current;
      if (!el) return;
      el.style.setProperty("--px", aim.current.x.toFixed(3));
      el.style.setProperty("--py", aim.current.y.toFixed(3));
    });
  };

  return (
    <div
      ref={sceneRef}
      className="flip-scene"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") box.current = e.currentTarget.getBoundingClientRect();
      }}
      onPointerMove={(e) => {
        const r = box.current;
        if (r) aimAt((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => {
        box.current = null;
      }}
    >
      <div
        className={
          "flip-card" + (flipped ? " is-flipped" : "") + (turns === 0 ? "" : turns % 2 ? " turn-a" : " turn-b")
        }
      >
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
              isolation: "isolate",
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
            <span ref={sheenRef} className="card-sheen" aria-hidden />
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
              {p.status === "Award Winner" && <Trophy size={11} color={status.color} strokeWidth={2} aria-hidden />}
              {p.status === "Live" && (
                <span
                  className="live-dot"
                  aria-hidden
                  style={{ width: 6, height: 6, borderRadius: "50%", background: "#FFD447" }}
                />
              )}
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
                <Github size={15} color={C.cream} aria-hidden />
              </a>
            )}
          </div>

          {/* title + description */}
          <h3
            className="serif"
            style={{
              fontFamily: SERIF,
              fontWeight: 600,
              fontSize: "19px",
              color: C.dark,
              margin: "14px 0 0",
              lineHeight: 1.25,
              letterSpacing: "-0.01em",
            }}
          >
            {p.title}
          </h3>
          <p
            className="card-desc"
            style={{ fontSize: "14px", fontWeight: 500, lineHeight: 1.6, color: C.moss, marginTop: "6px", textWrap: "pretty" }}
          >
            {p.desc}
          </p>

          {/* one real, sourced number — only when the project has one */}
          {p.metric && (
            <div className="card-metric">
              <span className="card-metric__value">{p.metric.value}</span>
              <span className="card-metric__label">{p.metric.label}</span>
            </div>
          )}

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
            ref={frontBtnRef}
            type="button"
            onClick={onToggle}
            tabIndex={flipped ? -1 : 0}
            aria-expanded={flipped}
            aria-controls={backId}
            aria-label={`View details for ${p.title}`}
            className="tab card-flip-btn"
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
            View details <ArrowUpRight size={14} strokeWidth={2.4} aria-hidden />
          </button>
        </div>

        {/* ── back face: a small case-study sheet ── */}
        <div
          id={backId}
          className="flip-face flip-face-back case-back"
          aria-hidden={!flipped}
          style={{
            background: DARK_GRAD,
            borderRadius: "22px",
            border: "1px solid rgba(234,170,34,0.18)",
          }}
        >
          <div className="case-head">
            <div className="case-titles">
              <div className="case-title">{p.title}</div>
              {p.when && <div className="case-when">{p.when}</div>}
            </div>
            <button
              ref={backBtnRef}
              type="button"
              onClick={onToggle}
              tabIndex={flipped ? 0 : -1}
              aria-expanded={flipped}
              aria-controls={backId}
              aria-label={`Flip back to ${p.title} summary`}
              className="btn-quiet case-flip"
            >
              <RotateCcw size={13} aria-hidden /> Flip back
            </button>
          </div>

          <div className="case-body">
            {p.back.sections.map((s, i) => (
              <section
                key={s.label}
                className={
                  "case-section" + (s.label === "Outcome" ? " is-outcome" : "") + (isLede ? " is-lede" : "")
                }
                style={stagger(i)}
              >
                <div className="case-label">{s.label}</div>
                <p className="case-text">{s.text}</p>
              </section>
            ))}
            <section className="case-section" style={stagger(p.back.sections.length)}>
              <div className="case-label">Technology</div>
              <p className="case-tech">{p.back.tech}</p>
            </section>
          </div>

          {hasLinks && (
            <div className="case-foot" style={stagger(p.back.sections.length + 1)}>
              <LinkButtons p={p} onLinkClick={stop} tabIndex={flipped ? 0 : -1} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── the page ──────────────────────────────────────────────────────── */

export function WorkPage({ goTo }: { goTo: (p: Panel) => void }) {
  const [filter, setFilter] = useState<Filter>("All Projects");
  const [flippedTitle, setFlippedTitle] = useState<string | null>(null);
  const shown = useMemo(
    () => PROJECTS.filter((p) => filter === "All Projects" || p.cats.includes(filter)),
    [filter]
  );

  /* filter rail: one gold pill that glides to the active tab */
  const railRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const tabRefs = useRef<Partial<Record<Filter, HTMLButtonElement | null>>>({});
  const [railReady, setRailReady] = useState(false);

  // Writes CSS variables only, so moving the pill never re-renders React.
  const placePill = useCallback(() => {
    const pill = pillRef.current;
    const btn = tabRefs.current[filter];
    if (!pill || !btn) return;
    pill.style.setProperty("--pill-x", `${btn.offsetLeft}px`);
    pill.style.setProperty("--pill-y", `${btn.offsetTop}px`);
    pill.style.setProperty("--pill-w", `${btn.offsetWidth}px`);
    pill.style.setProperty("--pill-h", `${btn.offsetHeight}px`);
  }, [filter]);

  useLayoutEffect(() => {
    placePill();
  }, [placePill]);

  // Place first, then switch transitions on a frame later: no slide-in from 0,0.
  useEffect(() => {
    const id = requestAnimationFrame(() => setRailReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Re-measure when the rail wraps or the web font swaps in and changes tab widths.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => placePill());
    ro.observe(rail);
    Object.values(tabRefs.current).forEach((b) => b && ro.observe(b));
    return () => ro.disconnect();
  }, [placePill]);

  // Arrow keys / Home / End move focus along the rail (Enter or Space picks).
  // Handling them here also stops the panel scroller from sliding sideways.
  const onTabKey = (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = TABS.length;
    let j: number;
    if (e.key === "ArrowRight") j = (i + 1) % n;
    else if (e.key === "ArrowLeft") j = (i - 1 + n) % n;
    else if (e.key === "Home") j = 0;
    else if (e.key === "End") j = n - 1;
    else return;
    e.preventDefault();
    tabRefs.current[TABS[j]]?.focus();
  };

  /* grid: cards that survive a filter change glide to their new cell (FLIP) */
  const gridRef = useRef<HTMLDivElement>(null);
  const flipFrom = useRef<Map<string, DOMRect> | null>(null);

  const selectFilter = (f: Filter) => {
    if (f === filter) return;
    const grid = gridRef.current;
    if (grid && !prefersReducedMotion()) {
      const from = new Map<string, DOMRect>();
      Array.from(grid.children).forEach((el, i) => {
        if (shown[i]) from.set(shown[i].title, el.getBoundingClientRect());
      });
      flipFrom.current = from;
    }
    setFilter(f);
    setFlippedTitle(null); // don't leave an orphaned flipped card behind a changed filter
  };

  useLayoutEffect(() => {
    const from = flipFrom.current;
    flipFrom.current = null;
    const grid = gridRef.current;
    if (!from || !grid) return;
    Array.from(grid.children).forEach((el, i) => {
      const prev = shown[i] && from.get(shown[i].title);
      if (!prev) return;
      const now = el.getBoundingClientRect();
      const dx = prev.left - now.left;
      const dy = prev.top - now.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      (el as HTMLElement).animate(
        [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0, 0)" }],
        { duration: 480, easing: "cubic-bezier(0.23, 1, 0.32, 1)" } // --dur-slow, --ease-out
      );
    });
  }, [shown]);

  const resumeCard: React.CSSProperties = {
    background: C.panel,
    borderRadius: "20px",
    border: `1px solid ${C.border}`,
  };
  const resumeCardDark: React.CSSProperties = {
    background: DARK_GRAD,
    borderRadius: "20px",
    border: "1px solid rgba(234,170,34,0.16)",
  };
  const cardLabel = (dark?: boolean): React.CSSProperties => ({ ...EYEBROW, color: dark ? C.sun : C.muted });

  return (
    <div style={{ minHeight: "100vh", fontFamily: FONT, ...DOT_GRID }}>
      <div style={{ padding: "92px clamp(16px, 3vw, 36px) 56px", maxWidth: "1240px", margin: "0 auto" }}>
        {/* ── intro: editorial masthead ── */}
        <header className="works-masthead">
          <Reveal>
            <div style={EYEBROW}>What I&apos;ve built</div>
          </Reveal>
          <Reveal delay={60}>
            <h1 className="works-title">
              My <em>Work.</em>
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="works-lead">
              A collection of things I&apos;ve built — products and experiments across edge AI, health technology,
              automation, and applied machine learning. Filter by what you&apos;re curious about; each card links out
              to its code, write-up, or résumé entry.
            </p>
          </Reveal>
        </header>

        {/* ── filter rail ── */}
        <div
          ref={railRef}
          role="group"
          aria-label="Filter projects by category"
          className={"filter-rail" + (railReady ? " is-ready" : "")}
          style={{ marginTop: "30px" }}
        >
          <span ref={pillRef} aria-hidden className="filter-rail__pill" />
          {TABS.map((tab, i) => {
            const on = filter === tab;
            return (
              <button
                key={tab}
                ref={(el) => {
                  tabRefs.current[tab] = el;
                }}
                type="button"
                onClick={() => selectFilter(tab)}
                onKeyDown={(e) => onTabKey(e, i)}
                aria-pressed={on}
                className="tab filter-rail__tab"
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
                }}
              >
                {tab}
                <span className="filter-rail__count">{countFor(tab)}</span>
              </button>
            );
          })}
        </div>
        <p className="sr-only" aria-live="polite">
          Showing {shown.length} of {PROJECTS.length} projects
        </p>
        <Reveal style={{ margin: "24px 0 28px" }}>
          <div className="works-rule" />
        </Reveal>

        {/* the grid's heading, for screen readers — the H1 above already says it visually */}
        <h2 className="sr-only">Selected work</h2>

        {/* ── filtered project grid ── */}
        <div
          ref={gridRef}
          className="works-grid"
          onKeyDown={(e) => {
            // Escape closes the open case sheet; the card hands focus back to its front button
            if (e.key === "Escape" && flippedTitle) {
              e.stopPropagation();
              setFlippedTitle(null);
            }
          }}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: "20px" }}
        >
          {shown.map((p, i) => (
            <Reveal key={p.title} delay={Math.min(i, 5) * 40} style={{ display: "flex" }}>
              <ProjectCard
                p={p}
                flipped={flippedTitle === p.title}
                onToggle={() => setFlippedTitle(flippedTitle === p.title ? null : p.title)}
              />
            </Reveal>
          ))}
        </div>

        {/* ── résumé strip: experience + education beside a grouped toolbox ── */}
        <h2 className="sr-only">Résumé</h2>
        <div className="rs-grid">
          <Reveal style={{ display: "flex", gridArea: "exp" }}>
            <div className="pbox rs-card" style={resumeCardDark}>
              <div style={cardLabel(true)}>Experience</div>
              <div style={{ marginTop: "14px" }}>
                <div className="rs-entry">
                  <div className="rs-title">NVIDIA AI &amp; Machine Learning Instructor</div>
                  <div className="rs-meta">iD Tech · Stanford, CA · Jun 2026 – Present</div>
                </div>
                <div className="rs-entry">
                  <div className="rs-title">Software Engineering Intern</div>
                  <div className="rs-meta">Sports Media Inc. · Jun 2025 – Aug 2025</div>
                </div>
              </div>
              <a className="rs-pdf" href={RESUME_PDF} target="_blank" rel="noopener noreferrer">
                Full résumé (PDF) <ArrowUpRight size={13} strokeWidth={2.4} aria-hidden />
              </a>
            </div>
          </Reveal>

          <Reveal delay={70} style={{ display: "flex", gridArea: "edu" }}>
            <div className="pbox rs-card" style={resumeCard}>
              <div style={cardLabel()}>Education &amp; Leadership</div>
              <div style={{ marginTop: "14px" }}>
                <div className="rs-entry">
                  <div className="rs-title">Augustana College</div>
                  <div className="rs-meta" style={{ color: C.moss }}>
                    B.A. Computer Science &amp; Data Science · Minor in Math · Expected 05/2027
                  </div>
                </div>
              </div>
              <div className="rs-divider" />
              <p className="rs-meta" style={{ color: C.moss, margin: 0, lineHeight: 1.6 }}>
                Community Advisor · Google Dev Group Co-Lead — mentored 200+ students, ran workshops &amp; hackathons.
              </p>
            </div>
          </Reveal>

          <Reveal delay={140} style={{ display: "flex", gridArea: "tools" }}>
            <div className="pbox rs-card" style={resumeCard}>
              <div style={cardLabel()}>Toolbox</div>
              <div className="rs-groups">
                {TOOLBOX.map((g) => (
                  <div key={g.label}>
                    <div className="rs-group-label">{g.label}</div>
                    <ul className="rs-chips" aria-label={g.label}>
                      {g.items.map((skill) => (
                        <li key={skill} className="rs-chip">
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* ── closing CTA: lit from below as it arrives ── */}
        <Reveal style={{ marginTop: "20px" }}>
          <section
            aria-labelledby="works-cta-title"
            className="closing-cta"
            style={{
              background: DARK_GRAD,
              borderRadius: "20px",
              border: "1px solid rgba(234,170,34,0.16)",
              padding: "26px 28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "18px",
            }}
          >
            <h2
              id="works-cta-title"
              className="serif"
              style={{
                margin: 0,
                fontFamily: SERIF,
                fontWeight: 600,
                fontSize: "clamp(20px, 2vw, 26px)",
                color: C.cream,
                lineHeight: 1.3,
                letterSpacing: "-0.01em",
                textWrap: "balance",
              }}
            >
              Let&apos;s build something{" "}
              <span className="cta-accent" style={{ color: C.sun }}>
                useful
              </span>{" "}
              <span aria-hidden="true">✦</span>
            </h2>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => goTo("welcome")}
                className="btn-quiet cta-back"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
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
                <ArrowLeft size={14} strokeWidth={2.4} aria-hidden /> Back to start
              </button>
              <a
                href={RESUME_PDF}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-quiet cta-back"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  borderRadius: "999px",
                  padding: "11px 18px",
                  textDecoration: "none",
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: "13px",
                  color: C.cream,
                }}
              >
                <FileText size={14} strokeWidth={2.2} aria-hidden /> Résumé (PDF)
              </a>
              <a
                href={MAILTO}
                className="btn-quiet btn-gold"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  borderRadius: "999px",
                  padding: "11px 18px",
                  textDecoration: "none",
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: "13px",
                  color: "#080909",
                }}
              >
                Say hello <Mail size={14} strokeWidth={2.4} aria-hidden />
              </a>
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
