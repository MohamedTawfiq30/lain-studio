import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { PreviewCanvas } from "@/components/cinetext/PreviewCanvas";
import { PhoneFrame } from "@/components/cinetext/PhoneFrame";
import { TEMPLATES, getTemplate } from "@/lib/cinetext/templates";
import type { AnimType } from "@/lib/cinetext/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lain Studio — Cinematic text animations for Reels & Shorts" },
      { name: "description", content: "Generate viral cinematic text animations in seconds. 6 templates, 15 animation styles, MP4 + green screen export. Built for creators." },
      { property: "og:title", content: "Lain Studio" },
      { property: "og:description", content: "Cinematic text animations for Reels & Shorts." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-[#05060d] text-white overflow-x-hidden" style={{ fontFamily: '"Inter", "Oswald", system-ui, sans-serif' }}>
      <Aurora />
      <Nav />
      <Hero />
      <Marquee />
      <Features />
      <TemplatesShowcase />
      <HowItWorks />
      <CTASection />
      <Footer />
    </div>
  );
}

/* ---------------- Aurora background ---------------- */
function Aurora() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#05060d]" />
      <div
        className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full opacity-40 blur-[120px]"
        style={{ background: "radial-gradient(circle, #4f46e5 0%, transparent 60%)" }}
      />
      <div
        className="absolute top-[30%] -right-[10%] w-[50vw] h-[50vw] rounded-full opacity-30 blur-[140px]"
        style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 60%)" }}
      />
      <div
        className="absolute bottom-[-10%] left-[20%] w-[55vw] h-[55vw] rounded-full opacity-25 blur-[160px]"
        style={{ background: "radial-gradient(circle, #1e1e5a 0%, transparent 60%)" }}
      />
      {/* grid */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        }}
      />
      {/* noise */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
    </div>
  );
}

/* ---------------- Nav ---------------- */
function Nav() {
  const auth = useAuth();
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#05060d]/60 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#4f46e5,#818cf8)", boxShadow: "0 0 24px #4f46e599" }}>
            <span className="text-white font-black">L</span>
          </div>
          <span className="font-bold text-lg tracking-tight">Lain<span className="text-indigo-400">.</span></span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#templates" className="hover:text-white transition-colors">Templates</a>
          <a href="#how" className="hover:text-white transition-colors">How it works</a>
        </div>
        <div className="flex items-center gap-2">
          {auth.user ? (
            <Link to="/studio" className="px-4 py-2 rounded-md text-sm font-semibold text-black bg-white hover:bg-white/90 transition-colors">Open Studio →</Link>
          ) : (
            <Link to="/studio" className="px-4 py-2 rounded-md text-sm font-semibold text-black bg-white hover:bg-white/90 transition-colors">Try free →</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

/* ---------------- Hero ---------------- */
function Hero() {
  return (
    <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-32">
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-16 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-xs text-white/70">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            New · Green-screen export for chroma key
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-[-0.04em] leading-[0.95]">
            Cinematic text<br />
            <span className="bg-gradient-to-r from-indigo-300 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
              that stops the scroll.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-xl leading-relaxed">
            Build viral text animations for Reels & Shorts in seconds. 15 motion presets, 6 cinematic templates, browser-native MP4 export. No After Effects required.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/studio"
              className="group relative px-7 py-4 rounded-xl font-semibold text-black bg-white hover:bg-white/90 transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(99,102,241,0.4)] hover:-translate-y-0.5"
            >
              Start creating — it's free
              <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <a href="#templates" className="px-7 py-4 rounded-xl font-semibold border border-white/15 hover:bg-white/5 transition-colors">
              See templates
            </a>
          </div>
          <div className="flex items-center gap-6 pt-4 text-sm text-white/40">
            <div className="flex -space-x-2">
              {["#4f46e5", "#818cf8", "#a78bfa", "#f0abfc"].map((c) => (
                <div key={c} className="w-8 h-8 rounded-full border-2 border-[#05060d]" style={{ background: c }} />
              ))}
            </div>
            <span>Trusted by 12,000+ creators worldwide</span>
          </div>
        </div>

        <HeroPreview />
      </div>
    </section>
  );
}

function HeroPreview() {
  const [tplIdx, setTplIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTplIdx((i) => (i + 1) % TEMPLATES.length), 5200);
    return () => clearInterval(id);
  }, []);
  const template = getTemplate(TEMPLATES[tplIdx].id);
  const cards = [
    template.buildCard(["EVERY", "DETAIL", "MATTERS"]).slots,
    template.buildCard(["THE", "FUTURE", "IS NOW"]).slots,
  ];
  const intros: AnimType[] = ["punchUp", "riseGlow", "scalePop", "elastic", "rotateIn", "riseBlur"];
  return (
    <div className="relative flex justify-center">
      <div
        className="absolute inset-0 -m-10 rounded-[60px] opacity-40 blur-3xl"
        style={{ background: `radial-gradient(circle, ${template.accent} 0%, transparent 60%)` }}
      />
      <div className="relative">
        <PhoneFrame accent={template.accent}>
          <PreviewCanvas
            template={template}
            cards={cards}
            currentCard={0}
            setCurrentCard={() => {}}
            introAnim={intros[tplIdx % intros.length]}
            outroAnim="slideUp"
            speed={1}
            sizeMult={1}
          />
        </PhoneFrame>
        {/* floating chips */}
        <div className="absolute -left-6 top-12 px-3 py-1.5 rounded-lg bg-white/5 backdrop-blur border border-white/10 text-xs font-mono text-white/80 animate-pulse">
          15 animations
        </div>
        <div className="absolute -right-8 bottom-24 px-3 py-1.5 rounded-lg bg-white/5 backdrop-blur border border-white/10 text-xs font-mono text-white/80">
          MP4 · 720×1280
        </div>
      </div>
    </div>
  );
}

/* ---------------- Marquee ---------------- */
function Marquee() {
  const items = [
    "PUNCH UP", "RISE BLUR", "GLITCH", "ELASTIC", "BOUNCE", "SCALE POP",
    "ROTATE IN", "SKEW", "WIPE UP", "RISE GLOW", "SLIDE LEFT", "FADE",
  ];
  return (
    <div className="border-y border-white/5 py-6 overflow-hidden">
      <div className="flex gap-12 whitespace-nowrap animate-[scroll_30s_linear_infinite]">
        {[...items, ...items, ...items].map((it, i) => (
          <span key={i} className="text-2xl md:text-3xl font-bold tracking-tight text-white/20 hover:text-white/60 transition-colors">
            {it} <span className="text-indigo-500/40 ml-12">✦</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes scroll { from { transform: translateX(0); } to { transform: translateX(-33.333%); } }`}</style>
    </div>
  );
}

/* ---------------- Features ---------------- */
function Features() {
  const items = [
    { t: "15 motion presets", d: "Punch, glitch, elastic, bounce, rise-blur and more — manually-tuned easing for every taste.", icon: "✦" },
    { t: "Chroma-key export", d: "One toggle for solid green-screen background — drop into CapCut, Premiere, DaVinci.", icon: "🟢" },
    { t: "Letter & line spacing", d: "Pixel-perfect control over tracking and line height. Compose like a typographer.", icon: "Aa" },
    { t: "MP4 in your browser", d: "MediaRecorder-powered, 30fps, 720×1280, no upload. Your text never leaves the device.", icon: "↓" },
    { t: "SRT-aware script", d: "Paste subtitles from Whisper or YouTube — auto-parsed into cards instantly.", icon: "≡" },
    { t: "6 cinematic templates", d: "From Amro Stacked to Neon Purple — every detail editable per word slot.", icon: "◐" },
  ];
  return (
    <section id="features" className="max-w-7xl mx-auto px-6 py-24">
      <div className="max-w-2xl mb-16">
        <div className="text-xs uppercase tracking-[0.3em] text-indigo-400 mb-3">Built for creators</div>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Pro-grade controls.<br />Designed for the feed.</h2>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
        {items.map((it) => (
          <div key={it.t} className="bg-[#0a0c1c] p-8 hover:bg-[#0d1027] transition-colors">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center text-indigo-300 font-bold mb-5">{it.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{it.t}</h3>
            <p className="text-sm text-white/50 leading-relaxed">{it.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Templates Showcase ---------------- */
function TemplatesShowcase() {
  return (
    <section id="templates" className="max-w-7xl mx-auto px-6 py-24">
      <div className="max-w-2xl mb-16">
        <div className="text-xs uppercase tracking-[0.3em] text-indigo-400 mb-3">Templates</div>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Six looks. Infinite remixes.</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {TEMPLATES.map((t) => (
          <div key={t.id} className="group relative aspect-[9/16] rounded-2xl overflow-hidden border border-white/10" style={{ background: t.bg }}>
            <div className="absolute inset-0 flex flex-col justify-center items-center p-4">
              <div className="text-3xl mb-2">{t.emoji}</div>
              <div className="font-black uppercase text-center text-lg leading-tight tracking-tight" style={{ color: t.accent, textShadow: `0 0 20px ${t.accent}88` }}>{t.name}</div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <span className="text-xs uppercase tracking-widest" style={{ color: t.accent }}>Use this →</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- How it works ---------------- */
function HowItWorks() {
  const steps = [
    { n: "01", t: "Write your script", d: "Type lines, paste SRT or split words with |" },
    { n: "02", t: "Pick a template", d: "Six cinematic looks with editable word slots" },
    { n: "03", t: "Tune & export", d: "Control speed, animation, spacing — download MP4" },
  ];
  return (
    <section id="how" className="max-w-7xl mx-auto px-6 py-24">
      <div className="max-w-2xl mb-16">
        <div className="text-xs uppercase tracking-[0.3em] text-indigo-400 mb-3">Workflow</div>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">From idea to export in 60 seconds.</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((s) => (
          <div key={s.n} className="relative p-8 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-indigo-400/30 hover:bg-white/[0.04] transition-all">
            <div className="text-6xl font-bold text-indigo-500/20 mb-4">{s.n}</div>
            <h3 className="text-xl font-semibold mb-2">{s.t}</h3>
            <p className="text-white/50 text-sm leading-relaxed">{s.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- CTA ---------------- */
function CTASection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 p-12 md:p-20 text-center" style={{ background: "linear-gradient(135deg, #0d0d2a 0%, #1e1e5a 100%)" }}>
        <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(circle at center, #4f46e5 0%, transparent 60%)" }} />
        <div className="relative space-y-8">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl mx-auto leading-tight">
            Make your next reel <span className="bg-gradient-to-r from-indigo-300 to-violet-400 bg-clip-text text-transparent">unscrollable.</span>
          </h2>
          <p className="text-white/60 max-w-xl mx-auto">Free to try. Sign in only to download. No credit card.</p>
          <Link
            to="/studio"
            className="inline-block px-8 py-4 rounded-xl font-semibold text-black bg-white hover:bg-white/90 transition-all shadow-[0_0_60px_rgba(99,102,241,0.4)] hover:-translate-y-0.5"
          >
            Open Lain Studio →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Footer ---------------- */
function Footer() {
  return (
    <footer className="border-t border-white/5 mt-12">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/40">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md" style={{ background: "linear-gradient(135deg,#4f46e5,#818cf8)" }} />
          <span>© {new Date().getFullYear()} Lain Studio. Made for creators.</span>
        </div>
        <div className="flex gap-6">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#templates" className="hover:text-white transition-colors">Templates</a>
          <Link to="/studio" className="hover:text-white transition-colors">Studio</Link>
        </div>
      </div>
    </footer>
  );
}

// silence unused import warning if any
void useRef;
