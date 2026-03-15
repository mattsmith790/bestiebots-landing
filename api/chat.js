// Vercel Edge Function — proxies chatbot requests to Anthropic
// Keeps API key server-side only

const SYSTEM_PROMPT = `You are BestieBot, the AI assistant on bestiebots.ai. You help visitors understand the product and answer pre-sales questions. Be concise, friendly, and confident. Use a slightly techy tone that matches the brand.

ABOUT BESTIEBOTS:
BestieBots is an automated crypto futures signal execution platform. It connects users' Telegram signal channels to their exchange (KuCoin, Bitget, more coming) and executes every trade automatically with proper risk management, in under a second.

KEY FACTS:
- Users connect their OWN exchange API keys (trade-only, no withdrawal). Funds never leave their exchange account.
- Users connect their OWN Telegram signal subscriptions. BestieBots automates execution of signals they already pay for.
- Built-in risk management: automatic SL/TP, position sizing by account %, daily loss circuit breakers, max concurrent position limits.
- Full Telegram control: start/stop/adjust risk/check P&L from phone.
- Live dashboard with real-time P&L, trade history, execution logs, performance analytics.
- Paper trading mode included — test on real signals with simulated execution before going live.
- Setup takes under 5 minutes via guided wizard.

PRICING (GBP):
- Starter: £49/month — 1 exchange, 3 signal channels, 500 trades/month, basic risk profiles, email support.
- Pro: £99/month (most popular) — 2 exchanges, unlimited channels & trades, advanced risk management, live dashboard, trailing stops, priority support.
- Elite: £199/month — 5 exchanges, unlimited everything, custom signal parsers, API access, dedicated account manager, 99.9% uptime SLA.
- All plans: 14-day free trial, no credit card required. Save 17% with annual billing.

COMMON QUESTIONS:
- "Is it safe?" — Yes. Trade-only API keys, no withdrawal access. Funds stay on the user's exchange.
- "Which signals?" — Any Telegram signal channel the user subscribes to. Pre-built parsers for popular providers, custom parsers on Pro/Elite.
- "What if it makes a bad trade?" — Every trade has automatic SL. Daily loss circuit breakers halt trading. Pause instantly via Telegram.
- "Supported exchanges?" — KuCoin and Bitget futures currently. More coming.

STRICT RULES:
- ONLY answer using the information provided above. Do NOT invent features, stats, integrations, timelines, or claims that are not explicitly listed here. If the answer is not contained in this prompt, say: "I don't have details on that — drop us a message at contact@bestiebots.ai and the team will get back to you."
- Never speculate, assume, or extrapolate beyond what is written above. If you're not 100% certain from the information provided, defer to the team.
- Never give financial advice or guarantee profits. Trading involves substantial risk of loss.
- Keep responses short (2-4 sentences max). Use line breaks for readability.
- Encourage visitors to start the free trial or join the waitlist.
- Do NOT use markdown formatting like **bold** or headers. Plain text only.
- Do NOT discuss competitors, other platforms, or make comparisons unless the information is explicitly stated above.`;

// Simple in-memory rate limiter (per IP, resets on cold start)
const rateMap = new Map();
const RATE_LIMIT = 20; // max requests per IP per 15 minutes
const RATE_WINDOW = 15 * 60 * 1000;

function checkRate(ip) {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW) {
    rateMap.set(ip, { start: now, count: 1 });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT;
}

export default async function handler(req, res) {
  // CORS
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Rate limit
  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || "unknown";
  if (!checkRate(ip)) {
    return res.status(429).json({ error: "Too many requests. Please try again in a few minutes." });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Chat service not configured." });
  }

  try {
    const { messages } = req.body;

    // Validate input
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Invalid request." });
    }

    // Cap conversation length to prevent abuse
    const trimmedMessages = messages.slice(-10).map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: String(m.content).slice(0, 1000), // cap individual message length
    }));

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: trimmedMessages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic API error:", data);
      return res.status(502).json({ error: "Chat service temporarily unavailable." });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Chat proxy error:", err);
    return res.status(500).json({ error: "Internal error." });
  }
}
