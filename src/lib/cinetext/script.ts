export function parseScript(input: string): string[][] {
  const trimmed = input.trim();
  if (!trimmed) return [];
  // SRT detection
  if (/\d+\s*\n\d{2}:\d{2}:\d{2}/.test(trimmed)) {
    const blocks = trimmed.split(/\n\s*\n/);
    return blocks
      .map((b) => {
        const lines = b.split("\n").filter(Boolean);
        const text = lines.slice(2).join(" ").trim();
        return text.split("|").map((s) => s.trim()).filter(Boolean);
      })
      .filter((arr) => arr.length > 0);
  }
  return trimmed
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split("|").map((s) => s.trim()).filter(Boolean));
}