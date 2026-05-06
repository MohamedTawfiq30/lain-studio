import { CANVAS_W, CANVAS_H, getCardDuration, renderFrame } from "./renderer";
import type { Slot, AnimType, Template } from "./types";

export interface ExportOpts {
  template: Template;
  cards: Slot[][];
  introAnim: AnimType;
  outroAnim: AnimType;
  speed: number;
  sizeMult: number;
  fps?: number;
  scale?: number;
  bitsPerSecond?: number;
  onProgress?: (p: number) => void;
  bgOverride?: string;
  disableEffects?: boolean;
}

export interface ExportResult {
  blob: Blob;
  mime: string;
  ext: "mp4" | "webm";
}

const MIME_CANDIDATES = [
  "video/mp4;codecs=avc1.42E01E",
  "video/mp4;codecs=avc1",
  "video/mp4",
  "video/webm;codecs=vp9",
  "video/webm;codecs=vp8",
  "video/webm",
];

export function pickMime(): { mime: string; ext: "mp4" | "webm" } {
  if (typeof MediaRecorder === "undefined") return { mime: "video/webm", ext: "webm" };
  for (const m of MIME_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(m)) {
      return { mime: m, ext: m.includes("mp4") ? "mp4" : "webm" };
    }
  }
  return { mime: "video/webm", ext: "webm" };
}

export async function exportVideo(opts: ExportOpts): Promise<ExportResult> {
  if (typeof MediaRecorder === "undefined") {
    throw new Error("MediaRecorder is not supported in this browser.");
  }

  const fps = opts.fps ?? 30;
  const scale = opts.scale ?? 2;
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_W * scale;
  canvas.height = CANVAS_H * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not acquire 2D canvas context.");
  ctx.scale(scale, scale);

  const stream = (canvas as HTMLCanvasElement & { captureStream: (fps?: number) => MediaStream }).captureStream(0);
  const track = stream.getVideoTracks()[0] as MediaStreamTrack & { requestFrame?: () => void };

  const { mime, ext } = pickMime();
  const recorder = new MediaRecorder(stream, {
    mimeType: mime,
    videoBitsPerSecond: opts.bitsPerSecond ?? 8_000_000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
  const stopped = new Promise<void>((res) => { recorder.onstop = () => res(); });

  recorder.start();

  const cardDur = getCardDuration(opts.speed);
  const frameDt = 1000 / fps;
  const totalMs = Math.max(cardDur, cardDur * opts.cards.length);
  const totalFrames = Math.ceil(totalMs / frameDt);

  for (let f = 0; f < totalFrames; f++) {
    const t = f * frameDt;
    const cardIdx = Math.min(opts.cards.length - 1, Math.floor(t / cardDur));
    const cardElapsed = t - cardIdx * cardDur;
    renderFrame({
      ctx,
      template: opts.template,
      slots: opts.cards[cardIdx] ?? [],
      introAnim: opts.introAnim,
      outroAnim: opts.outroAnim,
      cardElapsed,
      cardDuration: cardDur,
      speed: opts.speed,
      sizeMult: opts.sizeMult,
      time: t,
      bgOverride: opts.bgOverride,
      disableEffects: opts.disableEffects,
    });
    track.requestFrame?.();
    opts.onProgress?.(f / totalFrames);
    // Pace at real time so MediaRecorder samples cleanly.
    await new Promise((r) => setTimeout(r, frameDt));
  }

  // Allow recorder to flush the last frame.
  await new Promise((r) => setTimeout(r, 120));
  recorder.stop();
  await stopped;
  track.stop();

  opts.onProgress?.(1);
  return { blob: new Blob(chunks, { type: mime }), mime, ext };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}