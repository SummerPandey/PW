import { useEffect, useRef, useState } from "react";
import { Linkedin, Github, FileText, ArrowUpRight, Trophy, Copy, Check } from "lucide-react";
import {
  C,
  FONT,
  SERIF,
  DARK_GRAD,
  DOT_GRID,
  EYEBROW,
  EMAIL,
  MAILTO,
  RESUME_PDF,
  LINKEDIN,
  GITHUB,
  type Panel,
} from "./theme";
import { Typewriter, Sprout } from "./fx";
import "../styles/about.css";

/* ────────────────────────────────────────────────────────────────────
   AboutPage — a dense bento grid that fits on one screen:
   hero, roles & motto, three showcases, achievements, skills,
   contact, and a footer bar.

   Layout and motion live in styles/about.css. Every card is a
   [data-rv] block; when the panel slides in, the cards light up in one
   top-down wave, and cards further down join as they scroll into view.
   ──────────────────────────────────────────────────────────────────── */

/** Delay between cards in the entrance wave, and the cap on it, so a
    long batch never leaves the last card waiting. */
const WAVE_STEP = 55;
const WAVE_MAX = 8;
/** The headline starts typing once the hero card has begun to land. */
const TYPE_LEAD = 380;

const HEADLINE = "Building reliable\nAI for the\nreal world";

/* ── tiny building blocks ──────────────────────────────────────────── */

/** Small uppercase section label, e.g. "ROLES". */
function Label({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div style={{ ...EYEBROW, color: dark ? "rgba(255,249,232,0.55)" : C.muted }}>{children}</div>
  );
}

/** One bento box. `dark` flips to the golden-dusk gradient. `rv` makes
    it part of the entrance wave (pass "hero" for the hero's variant). */
function Box({
  dark,
  children,
  style,
  className,
  rv,
}: {
  dark?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  rv?: boolean | "hero";
}) {
  return (
    <div
      data-rv={rv === "hero" ? "hero" : rv ? "" : undefined}
      className={["ab-box", dark && "ab-box--dark", className].filter(Boolean).join(" ")}
      style={{
        background: dark ? DARK_GRAD : C.panel,
        border: `1px solid ${dark ? "rgba(234,170,34,0.16)" : C.border}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** A showcase tile that opens Works. The whole tile is one real button
    laid over the content, so it works by keyboard, touch, and screen
    reader, and nothing interactive is nested inside anything else. */
function Door({
  label,
  onOpen,
  dark,
  className,
  children,
}: {
  label: string;
  onOpen: () => void;
  dark?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div data-rv="" className={["ab-door", className].filter(Boolean).join(" ")}>
      <Box dark={dark} style={{ minHeight: "98px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "12px" }}>
        {children}
        <span className="ab-arrow" aria-hidden="true">
          <ArrowUpRight size={15} color={C.sun} strokeWidth={2} opacity={0.85} />
        </span>
      </Box>
      <button type="button" className="ab-door-hit" aria-label={label} onClick={onOpen} />
    </div>
  );
}

/** Per-element index for staggered CSS delays. */
const idx = (i: number) => ({ "--i": i }) as React.CSSProperties;

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
// The figure and its label are split only so the figure can be set in
// the display serif; the facts are unchanged.
const WINS = [
  { value: "1,000+", label: "calls automated/week" },
  { value: "+25%", label: "call completion" },
  { value: "15%", label: "fewer service failures" },
  { value: "200+", label: "students mentored" },
  { value: "50+", label: "students taught" },
];

/** Shown as a status pill in the hero — edit when plans change. */
const AVAILABILITY = "Graduating May 2027 · open to SWE & AI/ML roles";

const SOCIALS = [
  { Icon: Linkedin, href: LINKEDIN, label: "LinkedIn" },
  { Icon: Github, href: GITHUB, label: "GitHub" },
  { Icon: FileText, href: RESUME_PDF, label: "Résumé (PDF)" },
];

/* ── behaviour ─────────────────────────────────────────────────────── */

/** Copies text to the clipboard, falling back to a hidden textarea
    where the async Clipboard API is unavailable (non-secure origins). */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

/** The entrance wave. Cards are queued while they intersect, but held
    until the panel has mostly slid in (the sentinel strip is >55%
    visible), then released together in document order, so the wave
    always runs top-down instead of following the slide direction.
    After that, cards reveal as they scroll into view. Classes are set
    directly on the DOM, so revealing never re-renders the page. */
function useEntranceWave(
  rootRef: React.RefObject<HTMLDivElement | null>,
  sentinelRef: React.RefObject<HTMLDivElement | null>,
  onHero: (delay: number) => void
) {
  const onHeroRef = useRef(onHero);
  useEffect(() => {
    onHeroRef.current = onHero;
  });

  useEffect(() => {
    const root = rootRef.current;
    const sentinel = sentinelRef.current;
    if (!root || !sentinel) return;
    const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-rv]"));

    const show = (els: HTMLElement[]) => {
      els.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
      els.forEach((el, i) => {
        const delay = Math.min(i, WAVE_MAX) * WAVE_STEP;
        el.style.setProperty("--rv-d", `${delay}ms`);
        el.classList.add("is-in");
        if (el.dataset.rv === "hero") onHeroRef.current(delay);
      });
    };

    if (typeof IntersectionObserver === "undefined") {
      show(cards);
      return;
    }

    let arrived = false;
    const pending = new Set<HTMLElement>();
    const flush = () => {
      const els = [...pending];
      pending.clear();
      els.forEach((el) => cardIO.unobserve(el));
      if (els.length) show(els);
    };

    const cardIO = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) pending.add(el);
          else pending.delete(el);
        }
        if (arrived) flush();
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    const gateIO = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.55) {
          arrived = true;
          gateIO.disconnect();
          flush();
        }
      },
      { threshold: [0, 0.55, 1] }
    );

    cards.forEach((el) => cardIO.observe(el));
    gateIO.observe(sentinel);
    return () => {
      cardIO.disconnect();
      gateIO.disconnect();
    };
  }, [rootRef, sentinelRef]);
}

/* ── the page ──────────────────────────────────────────────────────── */

export function AboutPage({ goTo }: { goTo: (p: Panel) => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // The headline's typewriter mounts once the hero card has landed.
  const [typing, setTyping] = useState(false);
  const typeTimer = useRef<number | undefined>(undefined);
  useEntranceWave(rootRef, sentinelRef, (delay) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.clearTimeout(typeTimer.current);
    typeTimer.current = window.setTimeout(() => setTyping(true), reduce ? 0 : delay + TYPE_LEAD);
  });

  // "Copy email" confirmation.
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<number | undefined>(undefined);
  useEffect(
    () => () => {
      window.clearTimeout(copiedTimer.current);
      window.clearTimeout(typeTimer.current);
    },
    []
  );
  const copyEmail = async () => {
    if (!(await copyText(EMAIL))) return; // the mailto pill beside it still works
    setCopied(true);
    window.clearTimeout(copiedTimer.current);
    copiedTimer.current = window.setTimeout(() => setCopied(false), 1800);
  };

  const openWorks = () => goTo("works");

  return (
    <div ref={rootRef} className="ab" style={{ minHeight: "100vh", fontFamily: FONT, color: C.dark, ...DOT_GRID }}>
      <div ref={sentinelRef} className="ab-sentinel" aria-hidden="true" />
      <div className="ab-wrap">
        <div className="ab-grid">
          {/* ── row 1: hero (left) + roles & motto (right) ── */}
          <Box
            dark
            rv="hero"
            className="ab-hero ab-6"
            style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "216px" }}
          >
            {/* sun-glow + swaying sprout, plus a headshot avatar */}
            <div className="ab-stage" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", ...idx(0) }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div className="sun-dot" style={{ width: "30px", height: "30px" }} />
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
                loading="lazy"
                decoding="async"
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "1.5px solid rgba(234,170,34,0.4)",
                  flexShrink: 0,
                }}
              />
            </div>

            <div>
              <div className="ab-stage" style={{ ...EYEBROW, color: "rgba(255,249,232,0.55)", ...idx(1) }}>
                Summer Pandey · Software Engineer
              </div>
              <div className="ab-status ab-stage" style={idx(2)}>
                <span className="ab-status-dot" aria-hidden="true" />
                {AVAILABILITY}
              </div>
              {/* sized for all three final lines up front, so the card doesn't grow as it types */}
              <h2
                className="serif ab-stage"
                style={{
                  fontFamily: SERIF,
                  fontWeight: 600,
                  fontSize: "clamp(22px, 2.4vw, 32px)",
                  color: C.cream,
                  lineHeight: 1.12,
                  letterSpacing: "-0.01em",
                  minHeight: "calc(3 * 1.12em)",
                  margin: "8px 0 0",
                  ...idx(3),
                }}
              >
                {typing ? (
                  <Typewriter text={HEADLINE} style={{ color: C.cream }} />
                ) : (
                  <>
                    <span className="ab-sr">{HEADLINE.replace(/\n/g, " ")}</span>
                    <span aria-hidden="true" className="cursor" style={{ color: C.sun }}>
                      ▮
                    </span>
                  </>
                )}
              </h2>
              <div
                className="ab-stage"
                style={{ marginTop: "10px", fontSize: "14px", fontWeight: 600, color: C.sun, letterSpacing: "0.02em", ...idx(4) }}
              >
                From edge computer vision to production voice systems.
              </div>
              <button
                type="button"
                className="btn-quiet btn-gold ab-stage"
                onClick={openWorks}
                style={{
                  marginTop: "16px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  border: "none",
                  borderRadius: "999px",
                  padding: "10px 16px",
                  cursor: "pointer",
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: "13px",
                  letterSpacing: "0.01em",
                  ...idx(5),
                }}
              >
                Explore my work <ArrowUpRight size={15} color="#080909" strokeWidth={2.5} />
              </button>
            </div>
          </Box>

          <div className="ab-stack ab-4">
            <Box rv>
              <Label>Roles</Label>
              <ul className="ab-list">
                {ROLES.map((role) => (
                  <li key={role} className="ab-role">
                    <span className="ab-star" aria-hidden="true">
                      ✦
                    </span>
                    {role}
                  </li>
                ))}
              </ul>
            </Box>

            <Box rv style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Label>My motto</Label>
              <ul className="ab-list">
                {MOTTOS.map((line) => (
                  <li key={line} className="ab-motto-line">
                    <span className="ab-star" aria-hidden="true">
                      ✦
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
            </Box>
          </div>

          {/* ── about text ── */}
          <Box rv>
            <p className="ab-bio">
              I&apos;m Summer Pandey, a Computer Science and Data Science student at Augustana College. I build{" "}
              <strong>human-centered AI products</strong> across edge computer vision, voice automation, and personal
              health. I care about <strong>privacy, reliability</strong>, and turning complex technology into{" "}
              <strong>tools people can actually use</strong>.
            </p>
          </Box>

          {/* ── row 2: three showcases, all leading to Works ── */}
          <Door dark label="Tech works: open the Works panel" onOpen={openWorks} className="ab-4 ab-lead">
            <Label dark>Tech works</Label>
            <div>
              <div style={{ display: "flex", gap: "8px", marginBottom: "9px" }}>
                {["Argus", "VentureGain"].map((name) => (
                  <span key={name} className="ab-chip">
                    {name}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: C.cream, letterSpacing: "0.01em", lineHeight: 1.45 }}>
                Privacy-first AI, edge vision, and full-stack products.
              </div>
            </div>
          </Door>

          <Door label="Experience: open the Works panel" onOpen={openWorks} className="ab-3">
            <Label>Experience</Label>
            <div
              style={{
                flex: 1,
                margin: 0,
                borderRadius: "12px",
                background: "linear-gradient(160deg, #2b2410, #121313)",
                minHeight: "40px",
                padding: "8px 10px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: "4px",
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: 700, color: C.cream, lineHeight: 1.4 }}>
                Sports Media Inc. <span style={{ fontWeight: 500, opacity: 0.85 }}>· Software Engineering Intern</span>
              </div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: C.cream, lineHeight: 1.4 }}>
                iD Tech <span style={{ fontWeight: 500, opacity: 0.85 }}>· NVIDIA AI &amp; Machine Learning Instructor</span>
              </div>
            </div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: C.dark, letterSpacing: "0.01em" }}>2 roles</div>
          </Door>

          <Door label="Projects: open the Works panel" onOpen={openWorks} className="ab-3">
            <Label>Projects</Label>
            <div
              style={{
                flex: 1,
                margin: 0,
                borderRadius: "12px",
                background: "linear-gradient(135deg, #3a3214, #151512)",
                minHeight: "40px",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                padding: "8px",
              }}
            >
              <span style={{ fontSize: "12px", fontWeight: 600, color: C.cream, letterSpacing: "0.01em", textAlign: "center" }}>
                Argus · VentureGain · Preventia
              </span>
            </div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: C.dark, letterSpacing: "0.01em" }}>
              3 products across edge AI, health, and data
            </div>
          </Door>

          {/* ── achievements: trophy badge + metric pills ── */}
          <Box rv style={{ paddingTop: "13px", paddingBottom: "14px" }}>
            <Label>Achievements · unlocked</Label>
            <div className="ab-ach-row">
              <a
                href="https://devpost.com/software/preventia-sblncy"
                target="_blank"
                rel="noopener noreferrer"
                className="badge btn-gold ab-trophy"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  borderRadius: "999px",
                  padding: "8px 14px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#080909",
                  letterSpacing: "0.02em",
                  textDecoration: "none",
                  ...idx(0),
                }}
              >
                <Trophy size={13} color="#080909" strokeWidth={2.2} />
                Best Use of Gemini AI · HackAugie
              </a>
              {WINS.map((win, i) => (
                <span
                  key={win.label}
                  className="badge"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    border: `1px solid ${C.border}`,
                    background: C.panel,
                    borderRadius: "999px",
                    padding: "7px 13px",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: C.moss,
                    letterSpacing: "0.01em",
                    ...idx(i + 1),
                  }}
                >
                  <span className="spark" style={{ color: C.leaf }} aria-hidden="true">
                    ✦
                  </span>
                  <span className="ab-num">{win.value}</span>
                  <span>{win.label}</span>
                </span>
              ))}
            </div>
          </Box>

          {/* ── row 3: skill chips (left) + contact (right) ── */}
          <Box rv className="ab-6 ab-skills" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <Label>In the stack</Label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
              {SKILLS.map((skill) => (
                <span
                  key={skill}
                  className="badge"
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: C.bark,
                    border: `1px solid ${C.border}`,
                    background: "rgba(234,170,34,0.12)",
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

          <Box dark rv className="ab-4 ab-contact" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: C.cream, lineHeight: 1.5, letterSpacing: "0.01em" }}>
              Have a problem worth building for?
            </div>
            <div style={{ marginTop: "6px", fontSize: "12px", fontWeight: 500, color: C.moss, lineHeight: 1.55 }}>
              I&apos;m open to software engineering, AI/ML, and product-focused roles. Email is fastest.
            </div>
            <div className="ab-contact-row">
              <a href={MAILTO} className="ab-pill ab-mail">
                {EMAIL}
              </a>
              <button
                type="button"
                className="ab-pill ab-copy"
                data-copied={copied}
                onClick={copyEmail}
                aria-label="Copy email address"
              >
                <span className="ab-swap" aria-hidden="true">
                  <span className="ab-swap-idle">
                    <Copy size={13} strokeWidth={2.2} /> Copy
                  </span>
                  <span className="ab-swap-done">
                    <Check size={13} strokeWidth={2.6} /> Copied
                  </span>
                </span>
              </button>
              <a href={RESUME_PDF} target="_blank" rel="noopener noreferrer" className="ab-pill ab-copy ab-resume">
                <FileText size={13} strokeWidth={2.2} aria-hidden="true" /> Résumé
              </a>
              <span role="status" className="ab-sr">
                {copied ? "Email address copied" : ""}
              </span>
            </div>
          </Box>

          {/* ── footer: sign-off + social links ── */}
          <Box dark rv style={{ paddingTop: "16px", paddingBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
              <div
                className="serif"
                style={{
                  fontFamily: SERIF,
                  fontWeight: 600,
                  fontSize: "clamp(20px, 2vw, 26px)",
                  color: C.cream,
                  lineHeight: 1.3,
                  letterSpacing: "-0.01em",
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
                    title={label}
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
        </div>
      </div>
    </div>
  );
}
