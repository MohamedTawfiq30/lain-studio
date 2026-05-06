import type { ReactNode } from "react";

export function PhoneFrame({ children, accent }: { children: ReactNode; accent: string }) {
  return (
    <div
      className="relative p-3 mx-auto"
      style={{
        width: 308,
        borderRadius: 40,
        background: "linear-gradient(180deg, #1a1a1a, #050505)",
        boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px #1f1f1f, 0 0 60px ${accent}22`,
      }}
    >
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 rounded-full bg-black z-10" />
      <div
        className="relative overflow-hidden"
        style={{ borderRadius: 24, background: "#000" }}
      >
        {children}
      </div>
      <div className="mt-3 mx-auto h-1 w-24 rounded-full bg-[#2a2a2a]" />
    </div>
  );
}