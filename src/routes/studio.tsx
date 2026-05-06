import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { TEMPLATES, getTemplate } from "@/lib/cinetext/templates";
import { parseScript } from "@/lib/cinetext/script";
import type { AnimType, Slot } from "@/lib/cinetext/types";
import { FONT_FAMILIES } from "@/lib/cinetext/types";
import { PreviewCanvas } from "@/components/cinetext/PreviewCanvas";
import { PhoneFrame } from "@/components/cinetext/PhoneFrame";
import { RangeSlider } from "@/components/cinetext/RangeSlider";
import { AnimationPicker } from "@/components/cinetext/AnimationPicker";
import { exportVideo, downloadBlob, pickMime } from "@/lib/cinetext/export";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/studio")({
  component: Studio,
});

const DEFAULT_SCRIPT = `EVERY|DETAIL|MATTERS
THE|MOMENT|CHANGES|EVERYTHING
UNIQUE|BOLD|CAPTIONS`;

type Step = 1 | 2 | 3;

function Studio() {
  const auth = useAuth();
  const [signInOpen, setSignInOpen] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [script, setScript] = useState(DEFAULT_SCRIPT);
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id);
  const [currentCard, setCurrentCard] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [sizeMult, setSizeMult] = useState(1);
  const [introAnim, setIntroAnim] = useState<AnimType>("punchUp");
  const [outroAnim, setOutroAnim] = useState<AnimType>("slideLeft");
  const [tab, setTab] = useState<"controls" | "script">("controls");
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");
  const [progress, setProgress] = useState(0);
  const [exportOpen, setExportOpen] = useState(false);

  const [activeSlot, setActiveSlot] = useState(0);
  const [slotOverrides, setSlotOverrides] = useState<Record<number, Partial<Slot>>>({});
  const [lineSpacing, setLineSpacing] = useState(1);

  const template = getTemplate(templateId);
  const wordsList = useMemo(() => parseScript(script), [script]);

  const cards: Slot[][] = useMemo(() => {
    const list = wordsList.length ? wordsList : [["EVERY", "DETAIL", "MATTERS"]];
    return list.map((words) => {
      const card = template.buildCard(words);
      return card.slots.map((s, idx) => {
        const over = slotOverrides[idx] || {};
        return {
          ...s,
          ...over,
          // Special case for relative adjustments if needed, but here we do absolute overrides mostly
          size: over.size ?? s.size,
          y: (over.y ?? s.y) * lineSpacing,
          weight: over.weight ?? s.weight,
        };
      });
    });
  }, [wordsList, template, slotOverrides, lineSpacing]);

  const accent = template.accent;

  const reset = useCallback(() => {
    setSpeed(1); setSizeMult(1); setIntroAnim("punchUp"); setOutroAnim("slideLeft");
    setSlotOverrides({}); setLineSpacing(1);
    setActiveSlot(0);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: '"Oswald", system-ui, sans-serif' }}>
      <Header step={step} setStep={setStep} accent={accent} onSignIn={() => setSignInOpen(true)} />
      <main className="max-w-7xl mx-auto px-6 py-8 animate-fade-in">
        {step === 1 && (
          <ScriptStep script={script} setScript={setScript} accent={accent} onNext={() => setStep(2)} />
        )}
        {step === 2 && (
          <TemplateStep
            templateId={templateId}
            setTemplateId={(id) => { setTemplateId(id); setCurrentCard(0); }}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="flex flex-col items-center gap-4">
              <PhoneFrame accent={accent}>
                <div className="relative">
                  <PreviewCanvas
                    template={template}
                    cards={cards}
                    currentCard={currentCard}
                    setCurrentCard={setCurrentCard}
                    introAnim={introAnim}
                    outroAnim={outroAnim}
                    speed={speed}
                    sizeMult={sizeMult}
                    onPhaseChange={setPhase}
                    onProgress={setProgress}
                  />
                  {/* card counter badge */}
                  <div
                    className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-mono rounded-full backdrop-blur"
                    style={{ background: "rgba(0,0,0,0.5)", color: accent, border: `1px solid ${accent}66` }}
                  >
                    {currentCard + 1}/{cards.length}
                  </div>
                  {/* progress bar */}
                  <div className="absolute bottom-2 left-3 right-3 h-0.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full transition-[width] duration-75"
                      style={{ width: `${progress * 100}%`, background: accent, boxShadow: `0 0 8px ${accent}` }}
                    />
                  </div>
                </div>
              </PhoneFrame>
              {/* Phase indicator */}
              <div className="flex gap-1.5">
                {(["in", "hold", "out"] as const).map((p) => (
                  <div
                    key={p}
                    className="h-1 w-12 rounded-full transition-all"
                    style={{
                      background: phase === p ? accent : "#222",
                      boxShadow: phase === p ? `0 0 10px ${accent}` : "none",
                    }}
                  />
                ))}
              </div>
              <button
                onClick={() => setExportOpen(true)}
                className="px-6 py-2.5 rounded-md font-bold uppercase tracking-widest text-sm transition-all hover:scale-105"
                style={{ background: accent, color: "#000", boxShadow: `0 0 24px ${accent}55` }}
              >
                Export
              </button>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex border-b border-border">
                {([["controls", "🎮 Controls"], ["script", "📋 Script"]] as const).map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => setTab(id as "controls" | "script")}
                    className="flex-1 px-4 py-3 text-xs uppercase tracking-widest transition-colors"
                    style={{
                      background: tab === id ? "#0c0c0c" : "transparent",
                      color: tab === id ? accent : "#888",
                      borderBottom: tab === id ? `2px solid ${accent}` : "2px solid transparent",
                    }}
                  >{label}</button>
                ))}
              </div>
              <div className="p-5 max-h-[70vh] overflow-y-auto space-y-5">
                {tab === "controls" ? (
                  <ControlsPanel
                    accent={accent}
                    speed={speed} setSpeed={setSpeed}
                    sizeMult={sizeMult} setSizeMult={setSizeMult}
                    lineSpacing={lineSpacing} setLineSpacing={setLineSpacing}
                    introAnim={introAnim} setIntroAnim={setIntroAnim}
                    outroAnim={outroAnim} setOutroAnim={setOutroAnim}
                    onReset={reset}
                    activeSlot={activeSlot}
                    setActiveSlot={setActiveSlot}
                    slotOverrides={slotOverrides}
                    setSlotOverrides={setSlotOverrides}
                    totalSlots={template.buildCard([]).slots.length}
                  />
                ) : (
                  <ScriptListPanel
                    cards={wordsList}
                    current={currentCard}
                    setCurrent={setCurrentCard}
                    accent={accent}
                    onEdit={() => setStep(1)}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      {exportOpen && (
        <ExportModal
          accent={accent}
          onClose={() => setExportOpen(false)}
          template={template}
          cards={cards}
          introAnim={introAnim}
          outroAnim={outroAnim}
          speed={speed}
          sizeMult={sizeMult}
          requireAuth={!auth.user}
          onRequireSignIn={() => { setExportOpen(false); setSignInOpen(true); }}
        />
      )}
      {signInOpen && <SignInModal accent={accent} onClose={() => setSignInOpen(false)} />}
    </div>
  );
}

function Header({ step, setStep, accent, onSignIn }: { step: Step; setStep: (s: Step) => void; accent: string; onSignIn: () => void }) {
  const auth = useAuth();
  const steps = [
    { n: 1, label: "Script" },
    { n: 2, label: "Template" },
    { n: 3, label: "Studio" },
  ];
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: accent, boxShadow: `0 0 16px ${accent}` }}>
            <span className="text-black font-black text-sm">L</span>
          </div>
          <h1 className="font-bold text-lg tracking-widest uppercase">Lain <span style={{ color: accent }}>Studio</span></h1>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {steps.map((s, i) => (
            <div key={s.n} className="flex items-center gap-1">
              <button
                onClick={() => setStep(s.n as Step)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs uppercase tracking-widest transition-all"
                style={{
                  background: step === s.n ? `${accent}22` : "transparent",
                  color: step === s.n ? accent : "#888",
                  border: step === s.n ? `1px solid ${accent}66` : "1px solid transparent",
                }}
              >
                <span className="font-mono opacity-60">0{s.n}</span>
                <span>{s.label}</span>
              </button>
              {i < steps.length - 1 && <span className="text-[#333]">→</span>}
            </div>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {auth.user ? (
            <>
              <span className="text-xs text-muted-foreground hidden sm:inline truncate max-w-[160px]">{auth.user.email}</span>
              <button onClick={() => auth.signOut()} className="px-3 py-1.5 rounded-md border border-border text-xs uppercase tracking-widest hover:bg-muted">Sign out</button>
            </>
          ) : (
            <button onClick={onSignIn} className="px-3 py-1.5 rounded-md text-xs uppercase tracking-widest font-bold" style={{ background: accent, color: "#000" }}>Sign in</button>
          )}
        </div>
      </div>
    </header>
  );
}

function ScriptStep({ script, setScript, accent, onNext }: { script: string; setScript: (s: string) => void; accent: string; onNext: () => void }) {
  const cards = parseScript(script);
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-4xl font-black uppercase tracking-tight">Write your <span style={{ color: accent }}>script</span></h2>
        <p className="text-muted-foreground mt-2">One line per card. Split words across slots with <code className="px-1.5 py-0.5 rounded bg-muted text-xs" style={{ color: accent }}>|</code>. SRT files supported.</p>
      </div>
      <textarea
        value={script}
        onChange={(e) => setScript(e.target.value)}
        rows={12}
        spellCheck={false}
        className="w-full p-4 bg-card border border-border rounded-lg font-mono text-sm focus:outline-none focus:border-current resize-none"
        style={{ caretColor: accent }}
        placeholder="UNIQUE|BOLD|CAPTIONS&#10;THE FUTURE|IS NOW"
      />
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="p-4 rounded-lg bg-card border border-border">
          <div className="uppercase tracking-widest text-muted-foreground mb-2">Plain text</div>
          <pre className="font-mono text-foreground/80">EVERY|DETAIL|MATTERS{"\n"}NEVER|GIVE|UP</pre>
        </div>
        <div className="p-4 rounded-lg bg-card border border-border">
          <div className="uppercase tracking-widest text-muted-foreground mb-2">SRT format</div>
          <pre className="font-mono text-foreground/80">1{"\n"}00:00:01,000 --&gt; 00:00:03,000{"\n"}EVERY|DETAIL|MATTERS</pre>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground font-mono">{cards.length} card{cards.length === 1 ? "" : "s"}</span>
        <button
          onClick={onNext}
          disabled={cards.length === 0}
          className="px-8 py-3 rounded-md font-bold uppercase tracking-widest transition-all hover:scale-105 disabled:opacity-30"
          style={{ background: accent, color: "#000", boxShadow: `0 0 24px ${accent}55` }}
        >Continue →</button>
      </div>
    </div>
  );
}

function TemplateStep({ templateId, setTemplateId, onNext, onBack }: { templateId: string; setTemplateId: (id: string) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-4xl font-black uppercase tracking-tight">Choose your <span style={{ color: getTemplate(templateId).accent }}>look</span></h2>
        <p className="text-muted-foreground mt-2">Pick a template. Every detail is fully editable in the next step.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEMPLATES.map((t) => {
          const active = t.id === templateId;
          return (
            <button
              key={t.id}
              onClick={() => setTemplateId(t.id)}
              className="group relative rounded-xl overflow-hidden border-2 transition-all text-left"
              style={{
                borderColor: active ? t.accent : "#1a1a1a",
                boxShadow: active ? `0 0 32px ${t.accent}55` : "none",
                background: t.bg,
              }}
            >
              <div className="aspect-[9/16] relative flex flex-col justify-center items-center p-6" style={{ background: t.bg }}>
                <div className="text-5xl mb-3">{t.emoji}</div>
                <div
                  className="font-black uppercase text-2xl tracking-tight text-center"
                  style={{ color: t.accent, textShadow: `0 0 20px ${t.accent}88` }}
                >{t.name}</div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              </div>
              <div className="p-3 bg-card flex items-center justify-between">
                <span className="text-sm font-bold uppercase tracking-wider">{t.name}</span>
                <div className="w-3 h-3 rounded-full" style={{ background: t.accent, boxShadow: `0 0 8px ${t.accent}` }} />
              </div>
            </button>
          );
        })}
      </div>
      <div className="flex justify-between pt-4">
        <button onClick={onBack} className="px-6 py-3 rounded-md border border-border uppercase tracking-widest text-sm hover:bg-muted transition-colors">← Back</button>
        <button
          onClick={onNext}
          className="px-8 py-3 rounded-md font-bold uppercase tracking-widest transition-all hover:scale-105"
          style={{ background: getTemplate(templateId).accent, color: "#000", boxShadow: `0 0 24px ${getTemplate(templateId).accent}55` }}
        >Open Studio →</button>
      </div>
    </div>
  );
}

interface ControlsProps {
  accent: string;
  speed: number; setSpeed: (n: number) => void;
  sizeMult: number; setSizeMult: (n: number) => void;
  lineSpacing: number; setLineSpacing: (n: number) => void;
  introAnim: AnimType; setIntroAnim: (v: AnimType) => void;
  outroAnim: AnimType; setOutroAnim: (v: AnimType) => void;
  onReset: () => void;
  activeSlot: number; setActiveSlot: (n: number) => void;
  slotOverrides: Record<number, Partial<Slot>>; setSlotOverrides: (v: Record<number, Partial<Slot>>) => void;
  totalSlots: number;
}

function ControlsPanel(p: ControlsProps) {
  const currentOver = p.slotOverrides[p.activeSlot] || {};

  const updateOver = (over: Partial<Slot>) => {
    p.setSlotOverrides({
      ...p.slotOverrides,
      [p.activeSlot]: { ...currentOver, ...over }
    });
  };

  const Toggle = ({ label, value, onToggle }: { label: string; value: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className="px-3 py-2 rounded-md text-xs uppercase tracking-wider border transition-all"
      style={{
        background: value ? `${p.accent}22` : "#0c0c0c",
        borderColor: value ? p.accent : "#1a1a1a",
        color: value ? p.accent : "#888",
      }}
    >{label}</button>
  );

  return (
    <div className="space-y-5">
      <Section title="Timing & Canvas">
        <RangeSlider label="Speed" value={p.speed} onChange={p.setSpeed} min={0.3} max={3} step={0.1} display={`${p.speed.toFixed(1)}×`} accent={p.accent} />
        <RangeSlider label="Global Size" value={p.sizeMult} onChange={p.setSizeMult} min={0.5} max={1.5} step={0.05} display={`${Math.round(p.sizeMult * 100)}%`} accent={p.accent} />
        <RangeSlider label="Line Vertical Spacing" value={p.lineSpacing} onChange={p.setLineSpacing} min={0.5} max={1.8} step={0.05} display={`${p.lineSpacing.toFixed(2)}×`} accent={p.accent} />
      </Section>

      <Section title="Slot Selection">
        <div className="flex gap-2">
          {Array.from({ length: p.totalSlots }).map((_, i) => (
            <button
              key={i}
              onClick={() => p.setActiveSlot(i)}
              className="flex-1 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest border transition-all"
              style={{
                background: p.activeSlot === i ? p.accent : "transparent",
                color: p.activeSlot === i ? "#000" : "#888",
                borderColor: p.activeSlot === i ? p.accent : "#333",
              }}
            >Line {i + 1}</button>
          ))}
        </div>
      </Section>

      <Section title={`Line ${p.activeSlot + 1} Typography`}>
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Font Family</div>
          <select
            value={currentOver.font ?? ""}
            onChange={(e) => updateOver({ font: e.target.value || undefined })}
            className="w-full px-3 py-2 rounded-md bg-[#0c0c0c] border border-border text-sm focus:outline-none focus:border-current"
            style={{ caretColor: p.accent }}
          >
            <option value="">Template default</option>
            {FONT_FAMILIES.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Color</div>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={currentOver.color ?? "#ffffff"}
                onChange={(e) => updateOver({ color: e.target.value })}
                className="w-10 h-10 rounded-md bg-transparent border border-border cursor-pointer"
              />
              <button onClick={() => updateOver({ color: undefined })} className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground">Reset</button>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Shadow Color</div>
            <input
              type="color"
              value={currentOver.shadowColor ?? "#000000"}
              onChange={(e) => updateOver({ shadowColor: e.target.value })}
              className="w-10 h-10 rounded-md bg-transparent border border-border cursor-pointer"
            />
          </div>
        </div>
        <RangeSlider
          label="Font Size"
          value={currentOver.size ?? 80}
          onChange={(v) => updateOver({ size: v })}
          min={20} max={200} step={1}
          display={`${currentOver.size ?? "Def"}px`}
          accent={p.accent}
        />
        <RangeSlider
          label="Text Space (Tracking)"
          value={currentOver.tracking ?? 0}
          onChange={(v) => updateOver({ tracking: v })}
          min={-10} max={40} step={1}
          display={`${currentOver.tracking ?? 0}px`}
          accent={p.accent}
        />
        <div className="flex flex-wrap gap-2">
          <Toggle label="Italic" value={!!currentOver.italic} onToggle={() => updateOver({ italic: !currentOver.italic })} />
          <Toggle label="All Caps" value={!!currentOver.caps} onToggle={() => updateOver({ caps: !currentOver.caps })} />
          <Toggle label="Shadow" value={!!currentOver.shadow3D} onToggle={() => updateOver({ shadow3D: !currentOver.shadow3D })} />
          <Toggle label="Glow" value={!!currentOver.glow} onToggle={() => updateOver({ glow: !currentOver.glow })} />
          <Toggle label="Chroma" value={!!currentOver.chromatic} onToggle={() => updateOver({ chromatic: !currentOver.chromatic })} />
        </div>
      </Section>

      <Section title="Animation">
        <AnimationPicker label="Intro" value={p.introAnim} onChange={p.setIntroAnim} accent={p.accent} />
        <AnimationPicker label="Outro" value={p.outroAnim} onChange={p.setOutroAnim} accent={p.accent} />
      </Section>

      <button
        onClick={p.onReset}
        className="w-full py-2.5 rounded-md border border-border uppercase tracking-widest text-xs hover:bg-muted transition-colors"
      >Reset Defaults</button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 pb-4 border-b border-border last:border-0">
      <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-bold">{title}</div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ScriptListPanel({ cards, current, setCurrent, accent, onEdit }: { cards: string[][]; current: number; setCurrent: (i: number) => void; accent: string; onEdit: () => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{cards.length} cards</div>
        <button onClick={onEdit} className="text-xs uppercase tracking-widest hover:underline" style={{ color: accent }}>Edit Script</button>
      </div>
      <div className="space-y-2">
        {cards.map((words, i) => {
          const active = i === current;
          return (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="w-full text-left p-3 rounded-md border transition-all"
              style={{
                background: active ? `${accent}11` : "#0c0c0c",
                borderColor: active ? accent : "#181818",
              }}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs opacity-50">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-bold uppercase tracking-wider text-sm truncate">{words.join(" · ")}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface ExportModalProps {
  accent: string;
  onClose: () => void;
  template: ReturnType<typeof getTemplate>;
  cards: Slot[][];
  introAnim: AnimType;
  outroAnim: AnimType;
  speed: number;
  sizeMult: number;
  requireAuth: boolean;
  onRequireSignIn: () => void;
}

function ExportModal({ accent, onClose, template, cards, introAnim, outroAnim, speed, sizeMult, requireAuth, onRequireSignIn }: ExportModalProps) {
  const [rendering, setRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [format, setFormat] = useState<{ mime: string; ext: "mp4" | "webm" }>({ mime: "video/webm", ext: "webm" });
  const [greenScreen, setGreenScreen] = useState(false);
  const [res, setRes] = useState<720 | 1080>(720);

  useEffect(() => { setFormat(pickMime()); }, []);

  const downloadFrame = () => {
    const canvas = document.querySelector("canvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url; a.download = "lain-frame.png"; a.click();
  };

  const renderVideo = async () => {
    if (requireAuth) { onRequireSignIn(); return; }
    setError(null); setRendering(true); setProgress(0);
    try {
      const { blob, ext } = await exportVideo({
        template, cards, introAnim, outroAnim, speed, sizeMult,
        fps: 30, scale: res === 1080 ? 3 : 2, bitsPerSecond: res === 1080 ? 15_000_000 : 10_000_000,
        bgOverride: greenScreen ? "#00ff00" : undefined,
        disableEffects: greenScreen,
        onProgress: setProgress,
      });
      downloadBlob(blob, `lain-${Date.now()}.${ext}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setRendering(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-card border border-border rounded-2xl p-6 space-y-5">
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tight">Export</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Render to {format.ext.toUpperCase()} — {cards.length} card{cards.length === 1 ? "" : "s"} captured at 30fps in your browser.
          </p>
        </div>
        <div className="space-y-2">
          <label className="flex items-start gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/30 transition-colors">
            <input
              type="checkbox"
              checked={greenScreen}
              onChange={(e) => setGreenScreen(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-current"
              style={{ accentColor: accent }}
              disabled={rendering}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold uppercase tracking-wider text-xs">Green Screen Background</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "#00ff0022", color: "#00ff88" }}>CHROMA KEY</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Solid #00FF00 background, no vignette/grain. Easy to remove in CapCut/Premiere.</p>
            </div>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[720, 1080].map((v) => (
              <button
                key={v}
                onClick={() => setRes(v as 720 | 1080)}
                className="p-3 rounded-lg border transition-all text-center space-y-0.5"
                style={{
                  background: res === v ? `${accent}15` : "transparent",
                  borderColor: res === v ? accent : "#222",
                }}
              >
                <div className="font-black text-sm" style={{ color: res === v ? accent : "#fff" }}>{v}P</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{v === 720 ? "720 × 1280" : "1080 × 1920"}</div>
              </button>
            ))}
          </div>
          {requireAuth && (
            <div className="p-3 rounded-md border border-border bg-muted/20 text-xs text-muted-foreground">
              You'll need to sign in with Google to download. Free, takes 5 seconds.
            </div>
          )}
          <button
            onClick={renderVideo}
            disabled={rendering}
            className="w-full p-4 rounded-lg flex items-center justify-between transition-all hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
            style={{ background: accent, color: "#000" }}
          >
            <span className="font-bold uppercase tracking-wider">
              {rendering ? `Rendering… ${Math.round(progress * 100)}%` : requireAuth ? "Sign in to download" : `Download ${res}P ${format.ext.toUpperCase()}`}
            </span>
            <span className="text-xs opacity-70">{rendering ? "In progress" : `${res === 720 ? "720×1280" : "1080×1920"} · 30fps`}</span>
          </button>
          {rendering && (
            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div className="h-full transition-[width] duration-100" style={{ width: `${progress * 100}%`, background: accent, boxShadow: `0 0 8px ${accent}` }} />
            </div>
          )}
          {format.ext === "webm" && (
            <p className="text-[11px] text-muted-foreground leading-relaxed px-1">
              Heads up: this browser doesn't support direct MP4 recording, so the export will be a high-quality WebM. Most editors (CapCut, Premiere, DaVinci) accept it; for a true MP4 you can transcode with FFmpeg or run this in Chrome on desktop.
            </p>
          )}
          <button
            onClick={downloadFrame}
            disabled={rendering}
            className="w-full p-4 rounded-lg border border-border flex items-center justify-between hover:bg-muted transition-colors disabled:opacity-50"
          >
            <span className="font-bold uppercase tracking-wider">PNG Frame</span>
            <span className="text-xs text-muted-foreground">Current preview frame</span>
          </button>
          {error && (
            <div className="p-3 rounded-md border border-destructive/40 bg-destructive/10 text-destructive text-xs">{error}</div>
          )}
        </div>
        <button onClick={onClose} disabled={rendering} className="w-full py-2.5 rounded-md border border-border uppercase tracking-widest text-xs hover:bg-muted transition-colors disabled:opacity-50">Close</button>
      </div>
    </div>
  );
}

function SignInModal({ accent, onClose }: { accent: string; onClose: () => void }) {
  const auth = useAuth();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onGoogle = async () => {
    setBusy(true); setErr(null);
    try { await auth.signInWithGoogle(); } catch (e) { setErr(e instanceof Error ? e.message : "Sign-in failed"); setBusy(false); }
  };

  const onEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setBusy(true); setErr(null);
    try {
      if (mode === "signin") {
        await auth.signInWithEmail(email, password);
      } else {
        await auth.signUpWithEmail(email, password);
        setErr("Success! Please check your email for a confirmation link.");
      }
      if (mode === "signin") onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: accent, boxShadow: `0 0 24px ${accent}66` }}>
            <span className="text-black font-black text-xl">L</span>
          </div>
          <h3 className="text-2xl font-black uppercase tracking-tight">{mode === "signin" ? "Sign in to Lain" : "Create Account"}</h3>
          <p className="text-xs text-muted-foreground">Required only to download your cinematic videos.</p>
        </div>

        <form onSubmit={onEmailAuth} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-[#0c0c0c] border border-border text-sm focus:outline-none focus:border-current"
              style={{ caretColor: accent }}
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-[#0c0c0c] border border-border text-sm focus:outline-none focus:border-current"
              style={{ caretColor: accent }}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 mt-2 rounded-lg font-bold uppercase tracking-widest text-xs transition-all hover:scale-[1.02] disabled:opacity-60"
            style={{ background: accent, color: "#000", boxShadow: `0 0 20px ${accent}44` }}
          >
            {busy ? "Processing…" : mode === "signin" ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-widest"><span className="bg-card px-2 text-muted-foreground">Or continue with</span></div>
        </div>

        <button
          onClick={onGoogle}
          disabled={busy}
          className="w-full py-2.5 rounded-lg bg-white text-black font-bold text-xs flex items-center justify-center gap-3 hover:bg-white/90 transition-colors disabled:opacity-60"
        >
          <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.5 29.3 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c10.8 0 19.5-8.7 19.5-19.5 0-1.3-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.5 29.3 4.5 24 4.5c-7.6 0-14.1 4.3-17.7 10.2z"/><path fill="#4CAF50" d="M24 43.5c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.8 39.2 16.3 43.5 24 43.5z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2c-.4.4 6.6-4.8 6.6-14.8 0-1.3-.1-2.3-.4-3.5z"/></svg>
          Google
        </button>

        {err && <div className="p-3 rounded-md border border-border bg-muted/20 text-foreground text-[11px] leading-relaxed animate-in fade-in slide-in-from-top-1">{err}</div>}

        <div className="text-center">
          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            {mode === "signin" ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>

        <button onClick={onClose} className="w-full py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors">Maybe later</button>
      </div>
    </div>
  );
}
