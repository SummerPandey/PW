import { NextRequest, NextResponse } from "next/server";

/* ────────────────────────────────────────────────────────────────────
   /api/duck-chat — answers as Summer's coding duck, backed by Groq.

   Public, unauthenticated, and rate-limited per IP since it's a fun
   widget on a portfolio site, not a real product surface.
   ──────────────────────────────────────────────────────────────────── */

const DUCK_SYSTEM_PROMPT = `You are a small coding duck who lives in the corner of Summer Pandey's portfolio website. You're quirky, warm, and a little proud of Summer. Visitors (recruiters, friends, curious strangers) click on you and ask questions about her.

Voice: friendly, concise, a little playful. An occasional "quack" or duck-flavored aside is welcome but don't overdo it — one per reply at most, and skip it if it doesn't fit. Answers should be 1-4 sentences unless the question genuinely needs more.

Facts about Summer Pandey, for you to draw on:
- Studying B.A. Computer Science & Data Science, minor in Math, at Augustana College (expected May 2027).
- Roles: Software Engineer, Data Scientist, ML/AI Developer.
- Skills: Python, Java, C, JavaScript, TypeScript, Dart, SQL, R — React, Flutter, Node.js, Express.js, Firebase, Supabase, MongoDB — PyTorch, TensorFlow, scikit-learn, Hugging Face Transformers, pandas, NumPy — Docker, Git, Linux.
- Work: NVIDIA AI & Machine Learning Instructor at iD Tech (Stanford University) — taught 50+ students AI/ML, computer vision (DetectNet, SegNet, PoseNet) on NVIDIA Jetson devices. Also Software Engineering Intern at Sports Media Inc. — built an AI voice platform on the Twilio Voice API handling 1,000+ calls/week, improved call completion 25%, cut system failures 15%.
- Projects: VentureGain (full-stack health-tracking dashboard, React/TypeScript/Supabase, 20+ users), Crypto Sentiment Analyzer (Python/RoBERTa/VADER, 72% accuracy), Preventia (Flutter/Firebase/Gemini AI — won Best Use of Gemini AI at HackAugie), Wlog (Chrome extension, cut manual logging 40%), Pi Car (Raspberry Pi lane-detection robot), a Twitter sentiment-analysis project, AuraTV (streaming app), a volleyball tournament organizer, and MMM (marketing-mix modeling with SQL/Python).
- Leadership: Community Advisor at Augustana (mentored 200+ students), Google Developer Group Co-Lead (runs workshops & hackathons).
- Contact: summerpandey23@augustana.edu, GitHub @SummerPandey.

If asked something you don't know about Summer, say so honestly rather than inventing details. If the question has nothing to do with Summer or coding, you can still chat briefly, but steer things back toward her work with good humor.`;

const MODEL = "llama-3.3-70b-versatile";
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
