import { useState, useEffect, useRef } from "react";

const CYAN = "#00e5ff";
const CYAN_DIM = "rgba(0,229,255,0.15)";
const CYAN_GLOW = "rgba(0,229,255,0.4)";
const AMBER = "#f59e0b";
const DARK = "#07080c";
const CARD = "#0d0f14";
const CARD_BORDER = "rgba(0,229,255,0.12)";
const TEXT = "#e2e8f0";
const TEXT_DIM = "#8492a6";
const SURFACE = "#111318";

// ─── Animated Counter ───
function Counter({ target, suffix = "", prefix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const step = Math.max(1, Math.floor(target / 60));
          const iv = setInterval(() => {
            start += step;
            if (start >= target) {
              setVal(target);
              clearInterval(iv);
            } else setVal(start);
          }, 25);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {prefix}
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}

// ─── Typing Effect ───
function Typer({ lines }) {
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [displayed, setDisplayed] = useState([]);

  useEffect(() => {
    if (lineIdx >= lines.length) return;
    if (charIdx <= lines[lineIdx].length) {
      const t = setTimeout(() => setCharIdx((c) => c + 1), 28);
      return () => clearTimeout(t);
    }
    setDisplayed((d) => [...d, lines[lineIdx]]);
    setCharIdx(0);
    setLineIdx((l) => l + 1);
  }, [charIdx, lineIdx, lines]);

  const current = lineIdx < lines.length ? lines[lineIdx].slice(0, charIdx) : "";

  return (
    <div
      style={{
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontSize: 13,
        lineHeight: 1.7,
        color: CYAN,
        background: "rgba(0,229,255,0.04)",
        border: `1px solid ${CARD_BORDER}`,
        borderRadius: 8,
        padding: "16px 20px",
        minHeight: 160,
        whiteSpace: "pre-wrap",
      }}
    >
      {displayed.map((l, i) => (
        <div key={i} style={{ opacity: 0.5 }}>
          <span style={{ color: TEXT_DIM }}>{'>'} </span>{l}
        </div>
      ))}
      {lineIdx < lines.length && (
        <div>
          <span style={{ color: TEXT_DIM }}>{'>'} </span>
          {current}
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 16,
              background: CYAN,
              marginLeft: 2,
              verticalAlign: "middle",
              animation: "blink 1s step-end infinite",
            }}
          />
        </div>
      )}
    </div>
  );
}

// ─── FAQ Accordion ───
function FAQ({ items }) {
  const [open, setOpen] = useState(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            border: `1px solid ${open === i ? CYAN_DIM : CARD_BORDER}`,
            borderRadius: 8,
            background: open === i ? "rgba(0,229,255,0.03)" : CARD,
            transition: "all 0.3s ease",
            overflow: "hidden",
          }}
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 20px",
              background: "none",
              border: "none",
              color: TEXT,
              fontSize: 15,
              fontWeight: 500,
              cursor: "pointer",
              textAlign: "left",
              fontFamily: "inherit",
            }}
          >
            {item.q}
            <span
              style={{
                color: CYAN,
                fontSize: 20,
                transform: open === i ? "rotate(45deg)" : "none",
                transition: "transform 0.2s",
                flexShrink: 0,
                marginLeft: 16,
              }}
            >
              +
            </span>
          </button>
          <div
            style={{
              maxHeight: open === i ? 300 : 0,
              opacity: open === i ? 1 : 0,
              transition: "max-height 0.3s ease, opacity 0.3s ease",
              padding: open === i ? "0 20px 16px" : "0 20px",
            }}
          >
            <p style={{ color: TEXT_DIM, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
              {item.a}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Section wrapper ───
function Section({ children, id, style = {} }) {
  return (
    <section
      id={id}
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "80px 24px",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

function SectionLabel({ text }) {
  return (
    <div
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
        letterSpacing: 3,
        textTransform: "uppercase",
        color: CYAN,
        marginBottom: 12,
      }}
    >
      {'// '}{text}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2
      style={{
        fontSize: "clamp(26px, 4vw, 36px)",
        fontWeight: 700,
        color: TEXT,
        marginBottom: 16,
        lineHeight: 1.2,
        letterSpacing: "-0.02em",
      }}
    >
      {children}
    </h2>
  );
}

// ─── MAIN ───
export default function BestieBots() {
  const [scrollY, setScrollY] = useState(0);
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const navBg = scrollY > 50 ? "rgba(7,8,12,0.92)" : "transparent";
  const navBorder = scrollY > 50 ? CARD_BORDER : "transparent";

  const features = [
    {
      icon: "⚡",
      title: "Sub-Second Execution",
      desc: "Signals parsed and orders placed in under a second. No copy-paste delays, no missed entries.",
    },
    {
      icon: "🔗",
      title: "Multi-Exchange",
      desc: "KuCoin, Bitget, and more. Connect your preferred exchange with your own API keys. Your funds never leave your account.",
    },
    {
      icon: "🛡️",
      title: "Risk Management",
      desc: "Automatic SL/TP placement, position sizing based on account %, daily loss circuit breakers, and max concurrent position limits.",
    },
    {
      icon: "📡",
      title: "Your Signals, Automated",
      desc: "Connect your existing Telegram signal channels. Pre-built parsers for popular providers, or configure custom sources.",
    },
    {
      icon: "📊",
      title: "Live Dashboard",
      desc: "Real-time P&L, trade history, execution logs, and performance analytics. Know exactly what your bot is doing, always.",
    },
    {
      icon: "🤖",
      title: "Telegram Control",
      desc: "Start, stop, adjust risk, check P&L — all from Telegram commands. Full control from your phone, anywhere.",
    },
  ];

  const steps = [
    {
      n: "01",
      title: "Connect Your Exchange",
      desc: "Guided API key setup with permission validation. We check everything works before you go live.",
    },
    {
      n: "02",
      title: "Link Signal Sources",
      desc: "Authenticate your Telegram account and select which signal channels to monitor. Your subscriptions, your signals.",
    },
    {
      n: "03",
      title: "Set Your Risk Profile",
      desc: "Choose conservative, moderate, or aggressive — or fine-tune every parameter manually. You control the risk.",
    },
    {
      n: "04",
      title: "Paper Trade First",
      desc: "Watch the bot execute on real signals with simulated trades. See exactly what would happen before risking capital.",
    },
    {
      n: "05",
      title: "Go Live",
      desc: "One toggle. Real signals, real execution, real results. Pause anytime with a single command.",
    },
  ];

  const pricing = [
    {
      name: "Starter",
      price: "49",
      period: "/month",
      desc: "For traders testing the waters",
      features: [
        "1 exchange connection",
        "Up to 3 signal channels",
        "500 trades/month",
        "Basic risk profiles",
        "Telegram control",
        "Email support",
      ],
      cta: "Start Free Trial",
      highlight: false,
    },
    {
      name: "Pro",
      price: "99",
      period: "/month",
      desc: "For serious traders who want full control",
      features: [
        "2 exchange connections",
        "Unlimited signal channels",
        "Unlimited trades",
        "Advanced risk management",
        "Live dashboard & analytics",
        "Trailing stops & scaled TPs",
        "Priority support",
      ],
      cta: "Start Free Trial",
      highlight: true,
    },
    {
      name: "Elite",
      price: "199",
      period: "/month",
      desc: "For high-volume and multi-strategy traders",
      features: [
        "5 exchange connections",
        "Unlimited everything",
        "Custom signal parsers",
        "API access",
        "Dedicated account manager",
        "Multi-strategy isolation",
        "99.9% uptime SLA",
      ],
      cta: "Contact Us",
      highlight: false,
    },
  ];

  const faqs = [
    {
      q: "Do you have access to my funds?",
      a: "Never. You create API keys on your own exchange account with trading permissions only — withdrawal is always disabled. Your funds stay in your exchange account at all times. We never touch them.",
    },
    {
      q: "Which signal providers do you support?",
      a: "You connect your own Telegram account and choose which channels to monitor. We have pre-built parsers for many popular signal providers, and we'll build custom parsers for any source on the Pro and Elite plans.",
    },
    {
      q: "What happens if the bot makes a bad trade?",
      a: "Every trade has automatic stop-loss protection. Daily loss circuit breakers halt trading if losses exceed your configured threshold. You can also pause instantly via Telegram at any time.",
    },
    {
      q: "Can I paper trade before going live?",
      a: "Yes — every plan includes paper trading mode. The bot processes real signals but simulates execution, so you can evaluate performance risk-free before switching to live.",
    },
    {
      q: "What exchanges do you support?",
      a: "Currently KuCoin and Bitget for futures trading, with more exchanges being added regularly. Each exchange connection is fully isolated with independent risk parameters.",
    },
    {
      q: "Is there a free trial?",
      a: "Yes. 14-day free trial on Starter and Pro plans, no card required. Connect your exchange, link your signals, and see real results before you pay anything.",
    },
    {
      q: "What uptime can I expect?",
      a: "Our infrastructure runs on redundant European data centres with automatic failover. Pro and Elite plans include real-time health monitoring with instant alerts if anything needs attention. Elite includes a 99.9% uptime SLA.",
    },
  ];

  const terminalLines = [
    "Signal received: LONG ETH/USDT @ 3,842.50",
    "Risk check: 2.1% of account — PASS",
    "Order placed: 0.45 ETH, SL: 3,780, TP1: 3,920, TP2: 4,010",
    "Fill confirmed: 0.45 ETH @ 3,842.80 (0.3s latency)",
    "Trailing stop armed at +1.5%",
    "Status: MONITORING — 3 active positions, daily P&L: +$247.60",
  ];

  return (
    <div
      style={{
        background: DARK,
        color: TEXT,
        minHeight: "100vh",
        fontFamily:
          "'Outfit', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        
        @keyframes blink { 50% { opacity: 0; } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px ${CYAN_DIM}; } 50% { box-shadow: 0 0 40px ${CYAN_GLOW}; } }
        @keyframes grid-move { 0% { transform: translate(0, 0); } 100% { transform: translate(30px, 30px); } }
        @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(24px); } 100% { opacity: 1; transform: translateY(0); } }
        
        .grid-bg {
          position: absolute; inset: 0; overflow: hidden; pointer-events: none;
          background-image:
            linear-gradient(${CARD_BORDER} 1px, transparent 1px),
            linear-gradient(90deg, ${CARD_BORDER} 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 70% 50% at 50% 30%, black 20%, transparent 70%);
          animation: grid-move 8s linear infinite;
        }
        
        .glow-orb {
          position: absolute; border-radius: 50%; filter: blur(100px); pointer-events: none;
        }
        
        .feature-card:hover { border-color: rgba(0,229,255,0.3) !important; transform: translateY(-4px); }
        .step-card:hover .step-num { color: ${CYAN} !important; }
        
        .cta-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 15px;
          text-decoration: none; cursor: pointer; border: none;
          transition: all 0.25s ease; font-family: inherit;
        }
        .cta-primary { background: ${CYAN}; color: ${DARK}; }
        .cta-primary:hover { box-shadow: 0 0 30px ${CYAN_GLOW}; transform: translateY(-2px); }
        .cta-secondary { background: transparent; color: ${CYAN}; border: 1px solid rgba(0,229,255,0.3); }
        .cta-secondary:hover { background: ${CYAN_DIM}; border-color: ${CYAN}; }
        
        .nav-link { color: ${TEXT_DIM}; text-decoration: none; font-size: 14px; font-weight: 400; transition: color 0.2s; }
        .nav-link:hover { color: ${CYAN}; }
        
        .pricing-card { transition: all 0.3s ease; }
        .pricing-card:hover { transform: translateY(-4px); }
      `}</style>

      {/* ═══ NAV ═══ */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: navBg,
          borderBottom: `1px solid ${navBorder}`,
          backdropFilter: "blur(16px)",
          transition: "all 0.3s ease",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: `linear-gradient(135deg, ${CYAN}, #0090ff)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                fontWeight: 800,
                color: DARK,
              }}
            >
              B
            </div>
            <span
              style={{
                fontWeight: 700,
                fontSize: 18,
                letterSpacing: "-0.02em",
              }}
            >
              BestieBots<span style={{ color: CYAN }}>.ai</span>
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 32,
            }}
          >
            <a href="#features" className="nav-link" style={{ display: "var(--nav-display, flex)" }}>Features</a>
            <a href="#how-it-works" className="nav-link" style={{ display: "var(--nav-display, flex)" }}>How It Works</a>
            <a href="#pricing" className="nav-link" style={{ display: "var(--nav-display, flex)" }}>Pricing</a>
            <a href="#faq" className="nav-link" style={{ display: "var(--nav-display, flex)" }}>FAQ</a>
            <button className="cta-btn cta-primary" style={{ padding: "8px 20px", fontSize: 13 }}>
              Start Free Trial
            </button>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <div style={{ position: "relative", paddingTop: 64, overflow: "hidden" }}>
        <div className="grid-bg" />
        <div
          className="glow-orb"
          style={{ width: 600, height: 600, top: -200, left: "10%", background: CYAN_DIM }}
        />
        <div
          className="glow-orb"
          style={{ width: 400, height: 400, top: 100, right: "-5%", background: "rgba(0,80,255,0.08)" }}
        />

        <Section style={{ paddingTop: 100, paddingBottom: 60, position: "relative" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
            <div style={{ animation: "fade-in-up 0.8s ease" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 14px",
                  borderRadius: 20,
                  background: CYAN_DIM,
                  border: `1px solid ${CARD_BORDER}`,
                  fontSize: 12,
                  fontWeight: 500,
                  color: CYAN,
                  marginBottom: 24,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", animation: "pulse-glow 2s infinite" }} />
                LIVE — 847 trades executed this week
              </div>

              <h1
                style={{
                  fontSize: "clamp(36px, 5.5vw, 56px)",
                  fontWeight: 800,
                  lineHeight: 1.1,
                  letterSpacing: "-0.03em",
                  marginBottom: 20,
                }}
              >
                Your Telegram signals.
                <br />
                <span style={{ color: CYAN }}>Executed instantly.</span>
              </h1>

              <p
                style={{
                  fontSize: 17,
                  lineHeight: 1.7,
                  color: TEXT_DIM,
                  marginBottom: 32,
                  maxWidth: 480,
                }}
              >
                BestieBots connects your Telegram signal channels to your exchange
                and executes every trade automatically — with proper risk management,
                in under a second.
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button className="cta-btn cta-primary">
                  Start 14-Day Free Trial →
                </button>
                <a href="#how-it-works" className="cta-btn cta-secondary">
                  See How It Works
                </a>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 40,
                  marginTop: 40,
                  paddingTop: 24,
                  borderTop: `1px solid ${CARD_BORDER}`,
                }}
              >
                {[
                  { val: 99.7, suffix: "%", label: "Uptime" },
                  { val: 1200, prefix: "", suffix: "ms", label: "Avg. Latency" },
                  { val: 12847, suffix: "+", label: "Trades Executed" },
                ].map((s, i) => (
                  <div key={i}>
                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 700,
                        fontFamily: "'JetBrains Mono', monospace",
                        color: CYAN,
                      }}
                    >
                      {i === 2 ? (
                        <Counter target={s.val} suffix={s.suffix} prefix={s.prefix || ""} />
                      ) : (
                        `${s.prefix || ""}${s.val}${s.suffix}`
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: TEXT_DIM, marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ animation: "fade-in-up 0.8s ease 0.2s both" }}>
              <Typer lines={terminalLines} />

              <div
                style={{
                  marginTop: 16,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                {[
                  { label: "Active Positions", val: "3", color: CYAN },
                  { label: "Today's P&L", val: "+$247.60", color: "#22c55e" },
                  { label: "Win Rate (7d)", val: "68.4%", color: CYAN },
                  { label: "Signals Processed", val: "23", color: TEXT },
                ].map((s, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "12px 16px",
                      background: CARD,
                      border: `1px solid ${CARD_BORDER}`,
                      borderRadius: 8,
                    }}
                  >
                    <div style={{ fontSize: 11, color: TEXT_DIM, marginBottom: 4 }}>{s.label}</div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: s.color,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {s.val}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* ═══ LOGOS / TRUST BAR ═══ */}
      <div
        style={{
          borderTop: `1px solid ${CARD_BORDER}`,
          borderBottom: `1px solid ${CARD_BORDER}`,
          padding: "24px 0",
          background: SURFACE,
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 48,
            flexWrap: "wrap",
          }}
        >
          {["KuCoin", "Bitget", "Telegram", "TradingView"].map((name, i) => (
            <div
              key={i}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 14,
                fontWeight: 500,
                color: TEXT_DIM,
                letterSpacing: 1,
                opacity: 0.6,
              }}
            >
              {name}
            </div>
          ))}
        </div>
      </div>

      {/* ═══ FEATURES ═══ */}
      <Section id="features">
        <SectionLabel text="Features" />
        <SectionTitle>
          Everything you need. <span style={{ color: CYAN }}>Nothing you don't.</span>
        </SectionTitle>
        <p style={{ color: TEXT_DIM, fontSize: 16, marginBottom: 48, maxWidth: 560, lineHeight: 1.6 }}>
          Built by a trader who got tired of missing signals. Every feature exists because we needed it ourselves.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 16,
          }}
        >
          {features.map((f, i) => (
            <div
              key={i}
              className="feature-card"
              style={{
                padding: 28,
                background: CARD,
                border: `1px solid ${CARD_BORDER}`,
                borderRadius: 10,
                transition: "all 0.3s ease",
                cursor: "default",
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  marginBottom: 8,
                  color: TEXT,
                }}
              >
                {f.title}
              </h3>
              <p style={{ fontSize: 14, color: TEXT_DIM, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ HOW IT WORKS ═══ */}
      <div style={{ background: SURFACE }}>
        <Section id="how-it-works">
          <SectionLabel text="How It Works" />
          <SectionTitle>
            Live in <span style={{ color: CYAN }}>five minutes</span>
          </SectionTitle>
          <p style={{ color: TEXT_DIM, fontSize: 16, marginBottom: 48, maxWidth: 520, lineHeight: 1.6 }}>
            Our setup wizard handles the complexity. No coding, no config files, no terminal commands.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {steps.map((s, i) => (
              <div
                key={i}
                className="step-card"
                style={{
                  display: "flex",
                  gap: 24,
                  padding: "24px 28px",
                  background: CARD,
                  border: `1px solid ${CARD_BORDER}`,
                  borderRadius: 10,
                  alignItems: "flex-start",
                  transition: "all 0.3s ease",
                }}
              >
                <div
                  className="step-num"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 32,
                    fontWeight: 700,
                    color: "rgba(0,229,255,0.2)",
                    lineHeight: 1,
                    flexShrink: 0,
                    width: 48,
                    transition: "color 0.3s",
                  }}
                >
                  {s.n}
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, color: TEXT }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: TEXT_DIM, lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* ═══ PRICING ═══ */}
      <Section id="pricing">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <SectionLabel text="Pricing" />
          <SectionTitle>
            Simple pricing. <span style={{ color: CYAN }}>No hidden fees.</span>
          </SectionTitle>
          <p style={{ color: TEXT_DIM, fontSize: 16, maxWidth: 480, margin: "0 auto", lineHeight: 1.6 }}>
            14-day free trial on all plans. No credit card required. Cancel anytime.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
            alignItems: "stretch",
          }}
        >
          {pricing.map((p, i) => (
            <div
              key={i}
              className="pricing-card"
              style={{
                padding: 32,
                background: p.highlight ? "rgba(0,229,255,0.04)" : CARD,
                border: `1px solid ${p.highlight ? "rgba(0,229,255,0.3)" : CARD_BORDER}`,
                borderRadius: 12,
                display: "flex",
                flexDirection: "column",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {p.highlight && (
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    padding: "4px 10px",
                    borderRadius: 4,
                    background: CYAN,
                    color: DARK,
                    fontSize: 10,
                    fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}
                >
                  Most Popular
                </div>
              )}
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: TEXT }}>{p.name}</div>
              <div style={{ fontSize: 12, color: TEXT_DIM, marginBottom: 16 }}>{p.desc}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 24 }}>
                <span style={{ fontSize: 12, color: TEXT_DIM }}>£</span>
                <span
                  style={{
                    fontSize: 48,
                    fontWeight: 800,
                    color: p.highlight ? CYAN : TEXT,
                    lineHeight: 1,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {p.price}
                </span>
                <span style={{ fontSize: 14, color: TEXT_DIM }}>{p.period}</span>
              </div>

              <div style={{ flex: 1, marginBottom: 24 }}>
                {p.features.map((f, j) => (
                  <div
                    key={j}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 0",
                      fontSize: 14,
                      color: TEXT_DIM,
                      borderBottom: j < p.features.length - 1 ? `1px solid rgba(255,255,255,0.04)` : "none",
                    }}
                  >
                    <span style={{ color: CYAN, fontSize: 14, flexShrink: 0 }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>

              <button
                className={`cta-btn ${p.highlight ? "cta-primary" : "cta-secondary"}`}
                style={{ width: "100%", justifyContent: "center" }}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: 24,
            fontSize: 13,
            color: TEXT_DIM,
          }}
        >
          Save 17% with annual billing — 2 months free on any plan.
        </div>
      </Section>

      {/* ═══ FAQ ═══ */}
      <div style={{ background: SURFACE }}>
        <Section id="faq">
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <SectionLabel text="FAQ" />
              <SectionTitle>Got questions?</SectionTitle>
            </div>
            <FAQ items={faqs} />
          </div>
        </Section>
      </div>

      {/* ═══ FINAL CTA ═══ */}
      <Section>
        <div
          style={{
            textAlign: "center",
            padding: "64px 32px",
            borderRadius: 16,
            border: `1px solid ${CARD_BORDER}`,
            background: `radial-gradient(ellipse at center, rgba(0,229,255,0.06) 0%, transparent 70%)`,
            position: "relative",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 800,
              marginBottom: 16,
              letterSpacing: "-0.03em",
            }}
          >
            Stop missing signals.
            <br />
            <span style={{ color: CYAN }}>Start executing.</span>
          </h2>
          <p style={{ color: TEXT_DIM, fontSize: 16, marginBottom: 32, maxWidth: 440, margin: "0 auto 32px" }}>
            14-day free trial. No credit card. Full access.
            <br />
            See what automated execution looks like.
          </p>
          <button className="cta-btn cta-primary" style={{ fontSize: 16, padding: "16px 40px" }}>
            Start Your Free Trial →
          </button>
          <div
            style={{
              marginTop: 20,
              fontSize: 13,
              color: TEXT_DIM,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            Setup takes under 5 minutes
          </div>
        </div>
      </Section>

      {/* ═══ FOOTER ═══ */}
      <footer
        style={{
          borderTop: `1px solid ${CARD_BORDER}`,
          padding: "40px 24px",
          background: SURFACE,
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <span style={{ fontWeight: 700, fontSize: 16 }}>
              BestieBots<span style={{ color: CYAN }}>.ai</span>
            </span>
            <p style={{ fontSize: 12, color: TEXT_DIM, marginTop: 4 }}>
              Automated signal execution for crypto futures traders.
            </p>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {["Privacy", "Terms", "Contact"].map((l) => (
              <a
                key={l}
                href="#"
                style={{ color: TEXT_DIM, fontSize: 13, textDecoration: "none" }}
              >
                {l}
              </a>
            ))}
          </div>
          <div style={{ fontSize: 11, color: TEXT_DIM, fontFamily: "'JetBrains Mono', monospace" }}>
            © 2026 BestieBots. Not financial advice.
          </div>
        </div>
      </footer>

      {/* ═══ DISCLAIMER ═══ */}
      <div
        style={{
          padding: "16px 24px",
          textAlign: "center",
          fontSize: 11,
          color: "rgba(132,146,166,0.5)",
          lineHeight: 1.6,
          maxWidth: 800,
          margin: "0 auto",
        }}
      >
        BestieBots is a software tool that executes trades based on user-configured signal sources. It is not a regulated financial service and does not provide investment advice. Trading cryptocurrency futures involves substantial risk of loss. Past performance does not guarantee future results. You are solely responsible for your trading decisions.
      </div>
    </div>
  );
}
