import { ANIM_TYPES, type AnimType } from "@/lib/cinetext/types";

interface Props {
  value: AnimType;
  onChange: (v: AnimType) => void;
  accent: string;
  label: string;
}

export function AnimationPicker({ value, onChange, accent, label }: Props) {
  return (
    <div className="space-y-2">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="grid grid-cols-5 gap-1.5">
        {ANIM_TYPES.map((a) => {
          const active = a.id === value;
          return (
            <button
              key={a.id}
              onClick={() => onChange(a.id)}
              title={a.label}
              className="aspect-square rounded-md border text-sm flex flex-col items-center justify-center transition-all hover:scale-105"
              style={{
                background: active ? `${accent}22` : "#0c0c0c",
                borderColor: active ? accent : "#1a1a1a",
                color: active ? accent : "#888",
                boxShadow: active ? `0 0 12px ${accent}55` : "none",
              }}
            >
              <span className="text-base leading-none">{a.icon}</span>
              <span className="text-[8px] mt-0.5 uppercase tracking-wider truncate w-full text-center">{a.label.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}