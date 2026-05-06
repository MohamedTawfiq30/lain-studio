import type { Slot, AnimType, Template } from "./types";
import * as E from "./easing";

export const CANVAS_W = 360;
export const CANVAS_H = 640;
export const CX = CANVAS_W / 2;
export const CY = CANVAS_H / 2;

export const SLOT_DELAYS = [0, 80, 170, 210];
export const IN_DURATION_BASE = 480;
export const OUT_DURATION_BASE = 380;
export const HOLD_BASE = 900;

interface AnimState {
  dx: number; dy: number; alpha: number; scale: number;
  rotate: number; skew: number; blur: number; clipTop: number;
  glowPulse: number;
}

const idle = (): AnimState => ({ dx: 0, dy: 0, alpha: 1, scale: 1, rotate: 0, skew: 0, blur: 0, clipTop: 0, glowPulse: 0 });

function computeAnim(type: AnimType, p: number, dir: "in" | "out"): AnimState {
  const s = idle();
  // p: 0..1 progress within phase; for "in" we go from start->idle, for "out" from idle->end.
  if (dir === "in") {
    switch (type) {
      case "slideLeft": { const e = E.easeOutExpo(p); s.dx = (1 - e) * 220; s.alpha = e; break; }
      case "slideRight": { const e = E.easeOutExpo(p); s.dx = (1 - e) * -220; s.alpha = e; break; }
      case "slideUp": { const e = E.easeOutExpo(p); s.dy = (1 - e) * 120; s.alpha = e; break; }
      case "slideDown": { const e = E.easeOutExpo(p); s.dy = (1 - e) * -120; s.alpha = e; break; }
      case "punchUp": { const e = E.easeOutBack(p); s.dy = (1 - e) * 160; s.scale = 0.5 + e * 0.5; s.alpha = p; s.blur = (1 - p) * 12; break; }
      case "riseBlur": { const e = E.easeOutExpo(p); s.dy = (1 - e) * 90; s.blur = (1 - p) * 26; s.alpha = p; break; }
      case "riseGlow": { const e = E.easeOutExpo(p); s.dy = (1 - e) * 80; s.alpha = p; s.glowPulse = (1 - p) * 40; break; }
      case "glitch": { s.dx = Math.sin(p * 40) * (1 - p) * 20; s.alpha = p; break; }
      case "elastic": { const e = E.easeOutElastic(p); s.dy = (1 - e) * 100; s.alpha = Math.min(1, p * 2); break; }
      case "bounce": { const e = E.easeOutBounce(p); s.dy = (1 - e) * -120; s.alpha = Math.min(1, p * 2); break; }
      case "scalePop": { const e = E.easeOutBack(p); s.scale = 0.1 + e * 0.9; s.alpha = p; break; }
      case "rotateIn": { const e = E.easeOutExpo(p); s.rotate = (1 - e) * -30; s.dy = (1 - e) * 40; s.alpha = p; break; }
      case "skew": { const e = E.easeOutExpo(p); s.skew = (1 - e) * -20; s.dx = (1 - e) * -120; s.alpha = p; break; }
      case "fadeOnly": { s.alpha = E.easeOutSine(p); break; }
      case "wipeUp": { s.clipTop = 1 - E.easeOutExpo(p); s.alpha = 1; break; }
    }
  } else {
    const q = 1 - p;
    switch (type) {
      case "slideLeft": { const e = E.easeInExpo(p); s.dx = -e * 240; s.alpha = q; break; }
      case "slideRight": { const e = E.easeInExpo(p); s.dx = e * 240; s.alpha = q; break; }
      case "slideUp": { const e = E.easeInExpo(p); s.dy = -e * 140; s.alpha = q; break; }
      case "slideDown": { const e = E.easeInExpo(p); s.dy = e * 140; s.alpha = q; break; }
      case "punchUp": { s.scale = 1 + p * 0.3; s.alpha = q; s.blur = p * 14; break; }
      case "riseBlur": { s.dy = -p * 60; s.blur = p * 22; s.alpha = q; break; }
      case "riseGlow": { s.dy = -p * 40; s.alpha = q; s.glowPulse = p * 30; break; }
      case "glitch": { s.dx = Math.sin(p * 40) * p * 20; s.alpha = q; break; }
      case "elastic": { s.dy = E.easeInExpo(p) * 80; s.alpha = q; break; }
      case "bounce": { s.dy = E.easeInExpo(p) * 120; s.alpha = q; break; }
      case "scalePop": { s.scale = 1 - p * 0.7; s.alpha = q; break; }
      case "rotateIn": { s.rotate = p * 20; s.dy = p * 30; s.alpha = q; break; }
      case "skew": { s.skew = p * 18; s.dx = p * 100; s.alpha = q; break; }
      case "fadeOnly": { s.alpha = q; break; }
      case "wipeUp": { s.clipTop = E.easeInExpo(p); s.alpha = 1; break; }
    }
  }
  return s;
}

function fontString(slot: Slot, sizeMult: number) {
  const italic = slot.italic ? "italic " : "";
  return `${italic}${slot.weight} ${Math.round(slot.size * sizeMult)}px "${slot.font}", system-ui, sans-serif`;
}

function drawSlot(ctx: CanvasRenderingContext2D, slot: Slot, state: AnimState, sizeMult: number) {
  const text = slot.caps ? slot.text.toUpperCase() : slot.text;
  if (!text) return;
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, state.alpha));
  ctx.font = fontString(slot, sizeMult);
  ctx.textAlign = slot.align;
  ctx.textBaseline = "middle";
  (ctx as any).letterSpacing = `${slot.tracking}px`;

  const x = CX + slot.x + state.dx;
  const y = CY + slot.y + state.dy;

  if (state.clipTop > 0) {
    const size = slot.size * sizeMult;
    ctx.beginPath();
    ctx.rect(0, y - size + state.clipTop * size * 2, CANVAS_W, size * 2);
    ctx.clip();
  }

  ctx.translate(x, y);
  ctx.rotate((state.rotate * Math.PI) / 180);
  if (state.skew !== 0) ctx.transform(1, 0, Math.tan((state.skew * Math.PI) / 180), 1, 0, 0);
  ctx.scale(state.scale, state.scale);
  if (state.blur > 0) (ctx as any).filter = `blur(${state.blur}px)`;

  // 3D shadow extrusion
  if (slot.shadow3D) {
    for (let d = slot.shadowDepth; d >= 1; d--) {
      ctx.fillStyle = slot.shadowColor;
      ctx.fillText(text, d, d);
    }
  }

  // Glow passes
  const glowR = slot.glowRadius + state.glowPulse;
  if (slot.glow || state.glowPulse > 0) {
    for (let g = 1; g <= 3; g++) {
      ctx.save();
      ctx.shadowColor = slot.glowColor;
      ctx.shadowBlur = glowR * g * 0.55;
      ctx.globalAlpha = 0.35 * (state.alpha);
      ctx.fillStyle = slot.color;
      ctx.fillText(text, 0, 0);
      ctx.restore();
    }
  }

  // Chromatic aberration
  if (slot.chromatic) {
    ctx.save();
    (ctx as any).globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.5 * state.alpha;
    ctx.fillStyle = "#ff2030";
    ctx.fillText(text, 4, 0);
    ctx.fillStyle = "#20e0ff";
    ctx.fillText(text, -4, 0);
    ctx.restore();
  }

  ctx.fillStyle = slot.color;
  ctx.fillText(text, 0, 0);

  ctx.restore();
}

function drawBackground(ctx: CanvasRenderingContext2D, t: Template) {
  if (t.bgIsGradient && t.gradientFrom && t.gradientTo) {
    const g = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    g.addColorStop(0, t.gradientFrom);
    g.addColorStop(1, t.gradientTo);
    ctx.fillStyle = g;
  } else {
    ctx.fillStyle = t.bg;
  }
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
}

let bokehSeed: { x: number; y: number; r: number; vy: number; c: string }[] | null = null;
function getBokeh() {
  if (!bokehSeed) {
    bokehSeed = Array.from({ length: 20 }, () => ({
      x: Math.random() * CANVAS_W,
      y: Math.random() * CANVAS_H,
      r: 6 + Math.random() * 22,
      vy: 0.2 + Math.random() * 0.6,
      c: ["#ff9a3c", "#ffd27a", "#ffb066", "#ffe0a8"][Math.floor(Math.random() * 4)],
    }));
  }
  return bokehSeed;
}

function drawBokeh(ctx: CanvasRenderingContext2D, time: number) {
  const list = getBokeh();
  ctx.save();
  (ctx as any).globalCompositeOperation = "lighter";
  list.forEach((b, i) => {
    const y = ((b.y - (time * 0.02 * b.vy)) % CANVAS_H + CANVAS_H) % CANVAS_H;
    const grd = ctx.createRadialGradient(b.x, y, 0, b.x, y, b.r);
    grd.addColorStop(0, b.c + "cc");
    grd.addColorStop(1, b.c + "00");
    ctx.fillStyle = grd;
    ctx.beginPath(); ctx.arc(b.x, y, b.r, 0, Math.PI * 2); ctx.fill();
    void i;
  });
  ctx.restore();
}

function drawScanlines(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  for (let y = 0; y < CANVAS_H; y += 4) ctx.fillRect(0, y, CANVAS_W, 1);
  ctx.restore();
}

function drawVignette(ctx: CanvasRenderingContext2D) {
  const g = ctx.createRadialGradient(CX, CY, CANVAS_H * 0.3, CX, CY, CANVAS_H * 0.7);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
}

function drawGrain(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.globalAlpha = 0.028;
  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 700; i++) {
    ctx.fillRect(Math.random() * CANVAS_W, Math.random() * CANVAS_H, 1, 1);
  }
  ctx.restore();
}

export interface RenderArgs {
  ctx: CanvasRenderingContext2D;
  template: Template;
  slots: Slot[];
  introAnim: AnimType;
  outroAnim: AnimType;
  cardElapsed: number; // ms within current card
  cardDuration: number; // total ms
  speed: number;
  sizeMult: number;
  time: number;
  bgOverride?: string;
  disableEffects?: boolean;
}

export function renderFrame(args: RenderArgs) {
  const { ctx, template, slots, introAnim, outroAnim, cardElapsed, cardDuration, speed, sizeMult, time, bgOverride, disableEffects } = args;
  const inDur = IN_DURATION_BASE / speed;
  const outDur = OUT_DURATION_BASE / speed;

  if (bgOverride) {
    ctx.fillStyle = bgOverride;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  } else {
    drawBackground(ctx, template);
    if (template.bokeh) drawBokeh(ctx, time);
  }

  slots.forEach((slot, i) => {
    const delay = (SLOT_DELAYS[i] ?? 0) / speed;
    const localElapsed = cardElapsed - delay;
    let state: AnimState;
    if (localElapsed < 0) {
      state = computeAnim(introAnim, 0, "in");
    } else if (localElapsed < inDur) {
      state = computeAnim(introAnim, localElapsed / inDur, "in");
    } else {
      const outStart = cardDuration - outDur;
      if (cardElapsed < outStart) {
        state = idle();
      } else {
        const p = Math.min(1, (cardElapsed - outStart) / outDur);
        state = computeAnim(outroAnim, p, "out");
      }
    }
    drawSlot(ctx, slot, state, sizeMult);
  });

  if (!disableEffects) {
    if (template.scanlines) drawScanlines(ctx);
    drawVignette(ctx);
    drawGrain(ctx);
  }
}

export function getCardDuration(speed: number) {
  return (IN_DURATION_BASE + HOLD_BASE + OUT_DURATION_BASE) / speed;
}

export function getPhase(elapsed: number, speed: number): "in" | "hold" | "out" {
  const inDur = IN_DURATION_BASE / speed;
  const outDur = OUT_DURATION_BASE / speed;
  const total = getCardDuration(speed);
  if (elapsed < inDur) return "in";
  if (elapsed < total - outDur) return "hold";
  return "out";
}