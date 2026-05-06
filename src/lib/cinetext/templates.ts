import type { Template, Slot, Card } from "./types";

const baseSlot = (overrides: Partial<Slot>): Slot => ({
  text: "", font: "Anton", size: 80, color: "#FFFFFF",
  weight: 900, italic: false, caps: true, tracking: 0,
  x: 0, y: 0, align: "center",
  shadow3D: false, shadowDepth: 8, shadowColor: "#000000",
  glow: false, glowColor: "#FFFFFF", glowRadius: 20,
  chromatic: false,
  ...overrides,
});

export const TEMPLATES: Template[] = [
  {
    id: "amro", name: "Amro Stacked", emoji: "🎬", accent: "#FF4400",
    bg: "#0a0606",
    buildCard: (w): Card => ({
      slots: [
        baseSlot({ text: w[0] ?? "EVERY", font: "Unbounded", size: 84, x: -120, y: -110, align: "left", color: "#FFFFFF", shadow3D: true, shadowDepth: 6, shadowColor: "#1a0f00", chromatic: true }),
        baseSlot({ text: w[1] ?? "DETAIL", font: "Unbounded", size: 110, x: -120, y: -10, align: "left", color: "#FFFFFF", shadow3D: true, shadowDepth: 8, shadowColor: "#1a0f00", chromatic: true }),
        baseSlot({ text: w[2] ?? "MATTERS", font: "Unbounded", size: 126, x: -120, y: 110, align: "left", color: "#E8A000", shadow3D: true, shadowDepth: 10, shadowColor: "#3a1f00", chromatic: true }),
      ],
    }),
  },
  {
    id: "extrude3d", name: "3D Extrude", emoji: "🧊", accent: "#3B9EFF",
    bg: "#050810",
    buildCard: (w): Card => ({
      slots: [
        baseSlot({ text: w[0] ?? "WHEN YOU", font: "Space Grotesk", size: 44, weight: 700, x: 0, y: -180, color: "#9EC5FF" }),
        baseSlot({ text: w[1] ?? "FINALLY SEE", font: "Space Grotesk", size: 44, weight: 700, x: 0, y: -130, color: "#9EC5FF" }),
        baseSlot({ text: w[2] ?? "TRUTH", font: "Archivo Black", size: 160, x: 0, y: 60, color: "#FFFFFF", shadow3D: true, shadowDepth: 14, shadowColor: "#0a4a8a", glow: true, glowColor: "#3B9EFF", glowRadius: 40 }),
      ],
    }),
  },
  {
    id: "boldTitle", name: "Bold Title", emoji: "✨", accent: "#FFD600",
    bg: "#0a0a05",
    buildCard: (w): Card => ({
      slots: [
        baseSlot({ text: w[0] ?? "DREAMS", font: "Outfit", size: 108, weight: 900, x: 0, y: -40, color: "#FFD600", shadow3D: true, shadowDepth: 6, shadowColor: "#3a2a00" }),
        baseSlot({ text: w[1] ?? "never sleep", font: "Instrument Serif", size: 56, italic: true, caps: false, x: 0, y: 60, color: "#FFFFFF" }),
      ],
    }),
  },
  {
    id: "orange3d", name: "Orange 3D", emoji: "🔥", accent: "#FFB800",
    bg: "#0a0604",
    buildCard: (w): Card => ({
      slots: [
        baseSlot({ text: w[0] ?? "POV", font: "Big Shoulders Display", size: 50, weight: 700, x: 0, y: -200, color: "#FFB800" }),
        baseSlot({ text: w[1] ?? "you finally", font: "Big Shoulders Display", size: 44, weight: 400, caps: false, x: 0, y: -130, color: "#FFFFFF" }),
        baseSlot({ text: w[2] ?? "started", font: "Big Shoulders Display", size: 44, weight: 400, caps: false, x: 0, y: -80, color: "#FFFFFF" }),
        baseSlot({ text: w[3] ?? "WINNING", font: "Unbounded", size: 148, x: 0, y: 80, color: "#FFB800", shadow3D: true, shadowDepth: 13, shadowColor: "#3a1a00", chromatic: true }),
      ],
    }),
  },
  {
    id: "neonPurple", name: "Neon Purple", emoji: "💜", accent: "#AA44FF",
    bg: "#08040f", scanlines: true,
    buildCard: (w): Card => ({
      slots: [
        baseSlot({ text: w[0] ?? "THE", font: "Syne", size: 72, weight: 800, x: 0, y: -150, color: "#00FFFF", glow: true, glowColor: "#00FFFF", glowRadius: 24 }),
        baseSlot({ text: w[1] ?? "FUTURE", font: "Archivo Black", size: 140, x: 0, y: -10, color: "#FFFFFF", glow: true, glowColor: "#AA44FF", glowRadius: 36, shadow3D: true, shadowDepth: 8, shadowColor: "#3a0a5a" }),
        baseSlot({ text: w[2] ?? "IS NOW", font: "Syne", size: 64, weight: 800, x: 0, y: 110, color: "#AA44FF", glow: true, glowColor: "#AA44FF", glowRadius: 22 }),
      ],
    }),
  },
  {
    id: "cleanWhite", name: "Clean White", emoji: "🤍", accent: "#6B5CE7",
    bg: "#F0F0F0",
    buildCard: (w): Card => ({
      slots: [
        baseSlot({ text: w[0] ?? "moments", font: "Cormorant Garamond", size: 84, weight: 700, italic: true, caps: false, x: 0, y: -50, color: "#1a1a1a" }),
        baseSlot({ text: w[1] ?? "THAT", font: "Outfit", size: 108, weight: 900, x: 0, y: 30, color: "#1a1a1a" }),
        baseSlot({ text: w[2] ?? "MATTER", font: "Outfit", size: 108, weight: 900, x: 0, y: 110, color: "#6B5CE7" }),
      ],
    }),
  },
];

export const getTemplate = (id: string) => TEMPLATES.find(t => t.id === id) ?? TEMPLATES[0];