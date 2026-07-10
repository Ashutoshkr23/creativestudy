"use client";

import { useState } from "react";
import { usePlayer } from "../PlayerContext";
import { useFeedbackSounds } from "../useBeep";

// The book's own trick, made playable: hidden inside every parallel-lines
// figure are the letters F (corresponding), Z (alternate) and C (co-interior).
// Tap the partner angle; the letter draws itself when you're right.

// Geometry: lines l (y=60) and m (y=140); transversal through (126,60)-(94,140).
// Angle ids follow the book's table: top crossing 1(UL) 2(UR) 3(LR) 4(LL);
// bottom crossing 5(UL) 6(UR) 7(LR) 8(LL) — 3,4,5,6 are interior.
const POS: Record<number, { x: number; y: number }> = {
  1: { x: 104, y: 46 },
  2: { x: 150, y: 46 },
  3: { x: 146, y: 78 },
  4: { x: 100, y: 78 },
  5: { x: 72, y: 126 },
  6: { x: 118, y: 126 },
  7: { x: 114, y: 158 },
  8: { x: 68, y: 158 },
};

const LETTER_PATHS: Record<string, string> = {
  F: "M 142 20 L 94 140 M 126 60 L 216 60 M 94 140 L 184 140",
  Z: "M 210 60 L 126 60 L 94 140 L 12 140",
  C: "M 210 60 L 126 60 L 94 140 L 210 140",
};

type Round = {
  given: number;
  target: number;
  kind: "corresponding" | "alternate" | "co-interior";
  letter: "F" | "Z" | "C";
  values: string;
  hint: string;
};

const ROUNDS: Round[] = [
  {
    given: 2,
    target: 6,
    kind: "corresponding",
    letter: "F",
    values: "∠2 = ∠6 — EQUAL!",
    hint: "Corresponding angles sit at the SAME position at each crossing — ∠2 is top-right, so find the other top-right…",
  },
  {
    given: 3,
    target: 5,
    kind: "alternate",
    letter: "Z",
    values: "∠3 = ∠5 — EQUAL!",
    hint: "Alternate angles are INSIDE the parallel lines, on OPPOSITE sides of the transversal — like the two corners of a Z.",
  },
  {
    given: 4,
    target: 5,
    kind: "co-interior",
    letter: "C",
    values: "∠4 + ∠5 = 180° — SUPPLEMENTARY!",
    hint: "Co-interior angles are INSIDE, on the SAME side of the transversal — the two corners of a C.",
  },
  {
    given: 4,
    target: 8,
    kind: "corresponding",
    letter: "F",
    values: "∠4 = ∠8 — EQUAL!",
    hint: "Same position at each crossing: ∠4 is bottom-left of the top crossing…",
  },
  {
    given: 6,
    target: 4,
    kind: "alternate",
    letter: "Z",
    values: "∠4 = ∠6 — EQUAL!",
    hint: "Inside the parallel lines, opposite sides of the transversal — trace the Z!",
  },
];

export function LetterHunt() {
  const { next } = usePlayer();
  const sounds = useFeedbackSounds();
  const [idx, setIdx] = useState(0);
  const [solved, setSolved] = useState(false);
  const [wrongTap, setWrongTap] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [done, setDone] = useState(false);

  const round = ROUNDS[idx];

  const tap = (id: number) => {
    if (solved || done) return;
    if (id === round.given) return;
    if (id === round.target) {
      sounds.correct();
      setSolved(true);
      setWrongTap(null);
    } else {
      sounds.wrong();
      setWrongTap(id);
      setShowHint(true);
      setTimeout(() => setWrongTap(null), 500);
    }
  };

  const nextRound = () => {
    if (idx === ROUNDS.length - 1) {
      setDone(true);
      return;
    }
    setIdx((i) => i + 1);
    setSolved(false);
    setShowHint(false);
  };

  return (
    <>
      <div className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
        🔎 The Letter Hunt · {done ? "complete" : `${idx + 1}/${ROUNDS.length}`}
      </div>
      <h2 className="mb-2.5 text-2xl sm:text-3xl">
        {done ? "You found every hidden letter!" : `Find the ${round.kind.toUpperCase()} partner of ∠${round.given}`}
      </h2>
      {!done && (
        <p className="mb-4 max-w-lg text-sm text-ink-secondary">
          Lines l ∥ m are cut by a transversal. Secret letters hide in this figure —{" "}
          <b className="text-ink">F, Z and C</b>. Tap the partner angle of{" "}
          <b style={{ color: "var(--accent)" }}>∠{round.given}</b>!
        </p>
      )}

      {!done ? (
        <>
          <svg viewBox="0 0 240 200" className="w-full max-w-sm rounded-card border border-line bg-surface">
            <line x1="12" y1="60" x2="228" y2="60" stroke="rgba(255,255,255,0.75)" strokeWidth="2.5" />
            <line x1="12" y1="140" x2="228" y2="140" stroke="rgba(255,255,255,0.75)" strokeWidth="2.5" />
            <line x1="142" y1="20" x2="78" y2="180" stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" />
            <text x="230" y="64" fill="rgba(255,255,255,0.5)" fontSize="10">l</text>
            <text x="230" y="144" fill="rgba(255,255,255,0.5)" fontSize="10">m</text>
            {solved && (
              <path
                d={LETTER_PATHS[round.letter]}
                fill="none"
                stroke="#1db88a"
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.9"
              />
            )}
            {Object.entries(POS).map(([idStr, p]) => {
              const id = Number(idStr);
              const isGiven = id === round.given;
              const isTarget = solved && id === round.target;
              const isWrong = wrongTap === id;
              return (
                <g key={id} onClick={() => tap(id)} style={{ cursor: "pointer" }}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="13"
                    fill={isGiven ? "var(--accent)" : isTarget ? "#1db88a" : isWrong ? "#d85a30" : "rgba(255,255,255,0.08)"}
                    stroke={isGiven || isTarget ? "#fff" : "rgba(255,255,255,0.25)"}
                    strokeWidth="1.5"
                  />
                  <text x={p.x} y={p.y + 4} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">
                    {id}
                  </text>
                </g>
              );
            })}
          </svg>

          {showHint && !solved && <p className="mt-3 max-w-md text-sm text-coral">💡 {round.hint}</p>}

          {solved && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <p className="font-head text-base font-bold text-teal">
                The letter {round.letter}! {round.values}
              </p>
              <button onClick={nextRound} className="rounded-btn px-6 py-3 font-head font-semibold text-white" style={{ background: "var(--accent)" }}>
                {idx === ROUNDS.length - 1 ? "Finish the hunt →" : "Next letter →"}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="max-w-md rounded-card border border-teal/40 bg-teal/10 p-4 text-left text-sm">
          <p className="mb-1.5 text-ink-secondary">
            🔤 <b className="text-ink">F</b> → corresponding angles → <b className="text-ink">equal</b>
          </p>
          <p className="mb-1.5 text-ink-secondary">
            🔤 <b className="text-ink">Z</b> → alternate angles → <b className="text-ink">equal</b>
          </p>
          <p className="mb-1.5 text-ink-secondary">
            🔤 <b className="text-ink">C</b> → co-interior angles → <b className="text-ink">add up to 180°</b>
          </p>
          <p className="mb-3 text-ink-secondary">
            ⚠️ These three rules work <b className="text-ink">only when the lines are parallel</b> — which gives us a
            way to TEST parallelness…
          </p>
          <div className="text-center">
            <button onClick={next} className="rounded-btn px-6 py-3 font-head font-semibold text-white" style={{ background: "var(--accent)" }}>
              Continue ↓
            </button>
          </div>
        </div>
      )}
    </>
  );
}
