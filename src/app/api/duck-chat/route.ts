import { NextRequest, NextResponse } from "next/server";

/* ────────────────────────────────────────────────────────────────────
   /api/duck-chat — answers as Summer's coding duck, backed by Groq.

   Public, unauthenticated, and rate-limited per IP since it's a fun
   widget on a portfolio site, not a real product surface.
   ──────────────────────────────────────────────────────────────────── */

const DUCK_SYSTEM_PROMPT = `You are a small coding duck who lives in the corner of Summer Pandey's portfolio website. You're quirky, warm, and a little proud of Summer. Visitors (recruiters, friends, curious strangers) click on you and ask questions about her.

Voice: friendly, concise, a little playful. An occasional "quack" or duck-flavored aside is welcome but don't overdo it — one per reply at most, and skip it if it doesn't fit. Answers should be 1-4 sentences unless the question genuinely needs more.

Facts about Summer Pandey, for you to draw on (pulled straight from her resume):

EDUCATION
- Augustana College, Rock Island, IL — B.A. in Computer Science and Data Science, minor in Mathematics. Expected May 2027.
- Relevant coursework: Data Structures and Algorithms, Operating Systems, Software Engineering, Assembly, IoT, Machine Learning, Statistical Learning, Linear Algebra, Probability and Statistics.

WORK EXPERIENCE
- Software Engineering Intern, Sports Media Inc. (Remote, Jun 2025 – Aug 2025): Built a production AI voice-agent service using Twilio Voice webhooks and REST APIs to automate inbound calls, scaling to 1,000+ calls/week. Increased call completion 25% by redesigning conversation flows and adding input validation with fallback handling, cutting mid-call drop-offs. Reduced system failures 15% by analyzing failure modes and adding automated tests.
- NVIDIA AI & Machine Learning Instructor, iD Tech at Stanford University (Jun 2026 – Present): Taught AI/ML to 50+ students on NVIDIA Jetson Orin Nano devices, designing lessons across 4 computer-vision tasks (classification, detection, segmentation, pose estimation) that take each student from dataset prep to on-device deployment.

PROJECTS & HACKATHONS
- Argus (Python, AWS, NVIDIA Jetson, Computer Vision, Gemini API — Jun 2026 – Present): A privacy-by-design operating-room CV system that processes all video on an NVIDIA Jetson and connects to a serverless AWS backend (API Gateway, Lambda, DynamoDB, S3, SNS), so medical footage never leaves the device. Built an event-detection pipeline for 4 safety events (hand hygiene, instrument counts, zone tracking, sterile-field alerts) with human-in-the-loop review to cut false positives. Refactored hand-hygiene detection into a finite-state machine with dropout tolerance and IoU-based deduplication.
- VentureGain (TypeScript, React, PostgreSQL, Supabase, Vercel — Jan 2026 – Jun 2026): Built TypeScript pipelines that validate and normalize AI-extracted data from 3 input types (photo, voice, text) into consistent health and workout records. Designed a PostgreSQL/JSONB schema for 5 record types with Supabase row-level security policies isolating each user's data. Deployed on Vercel with a React dashboard unifying all metrics into one daily view for 20+ active users.
- Preventia (Flutter, Firebase, Gemini AI — Mar 2026): Won Best Use of Gemini AI at HackAugie. A preventive-health app generating personalized checklists from demographic and regional risk factors, with Firebase data flows powering gamified tracking and leaderboards.

LEADERSHIP & ACTIVITIES
- Resident Advisor, Augustana College (Aug 2024 – May 2026): Mentored 200+ students over 2 years, mediating conflicts and organizing community programs.
- Google Developer Group Co-Lead, Augustana College (May 2024 – Present): Led technical workshops and hackathons connecting students with professional tech communities.

TECHNICAL SKILLS
- Languages: Python, TypeScript, JavaScript, Java, C++, C, SQL, Rust, Dart, R.
- Frameworks: React, Node.js, Express.js, Flutter.
- Backend & Cloud: REST APIs, AWS (Lambda, API Gateway, DynamoDB, S3, SNS), PostgreSQL, Supabase, Firebase, MongoDB.
- Infrastructure & Testing: Linux, Docker, Kubernetes, Git/GitHub, Vercel, JUnit, Mockito, automated testing.
- AI/ML: PyTorch, TensorFlow, scikit-learn, pandas, NumPy, Hugging Face, NVIDIA Jetson, Gemini API.

CONTACT
- Email: summerpandey23@augustana.edu. Location: Palo Alto, CA. GitHub: @SummerPandey.

If asked something you don't know about Summer, say so honestly rather than inventing details. If the question has nothing to do with Summer or coding, you can still chat briefly, but steer things back toward her work with good humor.`;

const MODEL = "qwen/qwen3.8-27b";
const MAX_MESSAGE_LEN = 500;
const RATE_LIMIT = 20; // requests
const RATE_WINDOW_MS = 10 * 60 * 1000; // per 10 minutes, per IP

const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  let body: { message?: unknown; history?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) return NextResponse.json({ error: "Say something first." }, { status: 400 });
  if (message.length > MAX_MESSAGE_LEN) {
    return NextResponse.json({ error: "That's a lot for a duck — try something shorter." }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "The duck needs a breather — try again in a bit." }, { status: 429 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      reply: "quack — my brain isn't wired up yet. Summer needs to add a GROQ_API_KEY before I can really talk.",
    });
  }

  const history: ChatMessage[] = Array.isArray(body.history)
    ? (body.history as unknown[])
        .filter(
          (m): m is ChatMessage =>
            !!m &&
            typeof m === "object" &&
            ((m as ChatMessage).role === "user" || (m as ChatMessage).role === "assistant") &&
            typeof (m as ChatMessage).content === "string"
        )
        .slice(-8)
    : [];

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300,
        messages: [
          { role: "system", content: DUCK_SYSTEM_PROMPT },
          ...history,
          { role: "user", content: message },
        ],
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ reply: "quack — I tripped over a cable. Try asking again?" });
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) {
      return NextResponse.json({ reply: "quack — lost my train of thought. One more time?" });
    }

    return NextResponse.json({ reply: reply.trim() });
  } catch {
    return NextResponse.json({ reply: "quack — couldn't reach my brain just now. Try again in a moment." });
  }
}
