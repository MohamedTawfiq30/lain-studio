interface Props {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  label: string;
  display?: string;
  accent: string;
}

export function RangeSlider({ value, onChange, min, max, step = 1, label, display, accent }: Props) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs uppercase tracking-wider">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-foreground">{display ?? value}</span>
      </div>
      <div className="relative h-6 flex items-center">
        <div className="absolute inset-x-0 h-1 rounded-full bg-[#181818]" />
        <div
          className="absolute h-1 rounded-full"
          style={{ width: `${pct}%`, background: accent, boxShadow: `0 0 8px ${accent}88` }}
        />
        <div
          className="absolute h-3 w-3 rounded-full -translate-x-1/2 pointer-events-none"
          style={{ left: `${pct}%`, background: accent, boxShadow: `0 0 10px ${accent}` }}
        />
        <input
          type="range"
          min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-6 opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}