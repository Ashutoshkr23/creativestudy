"use client";

import type { FigureSpec } from "@/content/types";

// Parametric SVG figures for exercise questions. Two templates cover nearly
// every diagram in the angles/parallel-lines exercises:
// - "crossing": two lines through O, sector labels a (right), b (top),
//   c (left), d (bottom).
// - "transversal": two lines + a transversal, labels keyed by the book's
//   numbering (top crossing 1-4, bottom 5-8) — same geometry as LetterHunt.

const CROSSING_POS: Record<"a" | "b" | "c" | "d", { x: number; y: number }> = {
  a: { x: 172, y: 78 },
  b: { x: 120, y: 32 },
  c: { x: 64, y: 78 },
  d: { x: 118, y: 128 },
};

const TRANSVERSAL_POS: Record<string, { x: number; y: number }> = {
  "1": { x: 102, y: 48 },
  "2": { x: 152, y: 48 },
  "3": { x: 148, y: 78 },
  "4": { x: 98, y: 78 },
  "5": { x: 70, y: 128 },
  "6": { x: 120, y: 128 },
  "7": { x: 116, y: 158 },
  "8": { x: 66, y: 158 },
};

export function QuestionFigure({ figure }: { figure: FigureSpec }) {
  if (figure.kind === "crossing") {
    // Two lines crossing at O (one horizontal, one at 55°).
    const cx = 120;
    const cy = 78;
    const rad = (55 * Math.PI) / 180;
    const dx = 92 * Math.cos(rad);
    const dy = 92 * Math.sin(rad);
    return (
      <svg viewBox="0 0 240 150" className="mb-4 w-full max-w-xs self-center rounded-card border border-line bg-surface">
        <line x1={cx - 100} y1={cy} x2={cx + 100} y2={cy} stroke="rgba(255,255,255,0.75)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1={cx - dx} y1={cy + dy} x2={cx + dx} y2={cy - dy} stroke="rgba(255,255,255,0.75)" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="3.5" fill="#fff" />
        <text x={cx + 6} y={cy + 14} fill="rgba(255,255,255,0.45)" fontSize="9">O</text>
        {Object.entries(figure.labels).map(([key, label]) => {
          const p = CROSSING_POS[key as "a" | "b" | "c" | "d"];
          return (
            <text key={key} x={p.x} y={p.y} textAnchor="middle" fill="var(--accent, #6c63ff)" fontSize="13" fontWeight="bold">
              {label}
            </text>
          );
        })}
      </svg>
    );
  }

  // transversal
  return (
    <svg viewBox="0 0 240 200" className="mb-4 w-full max-w-xs self-center rounded-card border border-line bg-surface">
      <line x1="12" y1="60" x2="228" y2="60" stroke="rgba(255,255,255,0.75)" strokeWidth="2.5" />
      <line x1="12" y1="140" x2="228" y2="140" stroke="rgba(255,255,255,0.75)" strokeWidth="2.5" />
      <line x1="142" y1="20" x2="78" y2="180" stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" />
      {figure.parallel !== false && (
        <>
          <text x="228" y="52" fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="end">l</text>
          <text x="228" y="132" fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="end">m (l ∥ m)</text>
        </>
      )}
      <circle cx="126" cy="60" r="3" fill="#fff" />
      <circle cx="94" cy="140" r="3" fill="#fff" />
      {Object.entries(figure.labels).map(([key, label]) => {
        const p = TRANSVERSAL_POS[key];
        if (!p) return null;
        return (
          <text key={key} x={p.x} y={p.y} textAnchor="middle" fill="var(--accent, #6c63ff)" fontSize="13" fontWeight="bold">
            {label}
          </text>
        );
      })}
    </svg>
  );
}
