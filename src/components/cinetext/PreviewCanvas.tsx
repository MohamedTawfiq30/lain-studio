import { useEffect, useRef } from "react";
import { CANVAS_W, CANVAS_H, getCardDuration, getPhase, renderFrame } from "@/lib/cinetext/renderer";
import type { Slot, AnimType, Template } from "@/lib/cinetext/types";

interface Props {
  template: Template;
  cards: Slot[][];
  currentCard: number;
  setCurrentCard: (i: number) => void;
  introAnim: AnimType;
  outroAnim: AnimType;
  speed: number;
  sizeMult: number;
  onPhaseChange?: (phase: "in" | "hold" | "out") => void;
  onProgress?: (p: number) => void;
  width?: number;
  height?: number;
}

export function PreviewCanvas({
  template, cards, currentCard, setCurrentCard,
  introAnim, outroAnim, speed, sizeMult,
  onPhaseChange, onProgress, width = 280, height = 497,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startRef = useRef<number>(0);
  const cardRef = useRef<number>(currentCard);
  const rafRef = useRef<number>(0);

  useEffect(() => { cardRef.current = currentCard; startRef.current = performance.now(); }, [currentCard]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    startRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const dur = getCardDuration(speed);
      if (elapsed >= dur) {
        const next = (cardRef.current + 1) % Math.max(1, cards.length);
        cardRef.current = next;
        startRef.current = now;
        setCurrentCard(next);
      }
      const slots = cards[cardRef.current] ?? [];
      renderFrame({
        ctx, template, slots,
        introAnim, outroAnim,
        cardElapsed: elapsed, cardDuration: dur,
        speed, sizeMult, time: now,
      });
      const phase = getPhase(elapsed, speed);
      onPhaseChange?.(phase);
      onProgress?.(Math.min(1, elapsed / dur));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [template, cards, introAnim, outroAnim, speed, sizeMult, setCurrentCard, onPhaseChange, onProgress]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      style={{ width, height, display: "block", borderRadius: 20 }}
    />
  );
}