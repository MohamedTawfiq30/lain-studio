export type AnimType =
  | "slideLeft" | "slideRight" | "slideUp" | "slideDown"
  | "punchUp" | "riseBlur" | "riseGlow" | "glitch"
  | "elastic" | "bounce" | "scalePop" | "rotateIn"
  | "skew" | "fadeOnly" | "wipeUp";

export const ANIM_TYPES: { id: AnimType; label: string; icon: string }[] = [
  { id: "slideLeft", label: "Slide Left", icon: "←" },
  { id: "slideRight", label: "Slide Right", icon: "→" },
  { id: "slideUp", label: "Slide Up", icon: "↑" },
  { id: "slideDown", label: "Slide Down", icon: "↓" },
  { id: "punchUp", label: "Punch", icon: "✦" },
  { id: "riseBlur", label: "Rise Blur", icon: "≈" },
  { id: "riseGlow", label: "Rise Glow", icon: "✺" },
  { id: "glitch", label: "Glitch", icon: "▓" },
  { id: "elastic", label: "Elastic", icon: "∿" },
  { id: "bounce", label: "Bounce", icon: "◉" },
  { id: "scalePop", label: "Scale", icon: "◎" },
  { id: "rotateIn", label: "Rotate", icon: "↻" },
  { id: "skew", label: "Skew", icon: "/" },
  { id: "fadeOnly", label: "Fade", icon: "○" },
  { id: "wipeUp", label: "Wipe", icon: "▲" },
];

export interface Slot {
  text: string;
  font: string;
  size: number;
  color: string;
  weight: number;
  italic: boolean;
  caps: boolean;
  tracking: number;
  x: number; // offset from center
  y: number;
  align: "left" | "center" | "right";
  shadow3D: boolean;
  shadowDepth: number;
  shadowColor: string;
  glow: boolean;
  glowColor: string;
  glowRadius: number;
  chromatic: boolean;
}

export interface Card {
  slots: Slot[];
}

export interface Template {
  id: string;
  name: string;
  emoji: string;
  accent: string;
  bg: string; // css color or gradient
  bgIsGradient?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
  bokeh?: boolean;
  scanlines?: boolean;
  buildCard: (words: string[]) => Card;
}

export const FONT_FAMILIES = [
  "Anton", "Bebas Neue", "Oswald", "Montserrat", "Barlow Condensed",
  "Playfair Display", "DM Serif Display", "Cinzel", "Black Han Sans", "Russo One",
  "Unbounded", "Archivo Black", "Outfit", "Instrument Serif", "Big Shoulders Display", "Space Grotesk", "Syne", "Cormorant Garamond",
];