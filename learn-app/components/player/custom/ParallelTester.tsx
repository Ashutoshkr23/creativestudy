"use client";

import { useState } from "react";
import { usePlayer } from "../PlayerContext";
import { useFeedbackSounds } from "../useBeep";

// The converse test as a judging game: figures are deliberately NOT drawn to
// scale, so eyes can't help — only the angle rules can. Corresponding or
// alternate equal → parallel; co-interior summing to 180° → parallel.

type Round = {
  kind: "corresponding" | "alternate" | "co-interior";
  a: number;
  b: number;
  parallel: boolean;
  explain: string;
};

const ROUNDS: Round[] = [
  { kind: "corresponding", a: 70, b: 70, parallel: true, explain: "Corresponding angles are EQUAL (70° = 70°) → the lines are parallel." },
  { kind: "co-interior", a: 110, b: 80, parallel: false, explain: "Co-interior angles must add to 180°, but 110° + 80° = 190° → NOT parallel." },
  { kind: "alternate", a: 60, b: 60, parallel: true, explain: "Alternate angles are EQUAL (60° = 60°) → parallel." },
  { kind: "corresponding", a: 85, b: 80, parallel: false, explain: "Corresponding angles differ (85° ≠ 80°) → NOT parallel." },
  { kind: "co-interior", a: 120, b: 60, parallel: true, explain: "Co-interior angles: 120° + 60° = 180° exactly → parallel!" },
];

// Label positions per kind: [top crossing, bottom crossing] around the same
// figure geometry as the Letter Hunt.
const LABEL_POS: Record<Round["kind"], [{ x: number; y: number }, { x: number; y: number }]> = {
  corresponding: [
    { x: 152, y: 50 },
    { x: 120, y: 130 },
  ],
  alternate: [
    { x: 146, y: 80 },
    { x: 74, y: 128 },
  ],
  "co-interior": [
    { x: 146, y: 80 },
    { x: 118, y: 128 },
  ],
};

export function ParallelTester() {
  const { next } = usePlayer();
  const sounds = useFeedbackSounds();
  const [idx, setIdx] = useState(0);
  const [verdict, setVerdict] = useState<"" | "right" | "wrong">("");
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const round = ROUNDS[idx];
  const [posA, posB] = LABEL_POS[round.kind];

  const judge = (saysParallel: boolean) => {
    if (verdict === "right") return;
    if (saysParallel === round.parallel) {
      sounds.correct();
      setScore((s) => s + (verdict === "" ? 1 : 0));
      setVerdict("right");
    } else {
      sounds.wrong();
      setVerdict("wrong");
    }
  };

  const nextRound = () => {
    if (idx === ROUNDS.length - 1) {
      setDone(true);
      return;
    }
    setIdx((i) => i + 1);
    setVerdict("");
  };

  if (done) {
    return (
      <>
        <div className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
          ⚖️ Parallel or Not
        </div>
        <h2 className="mb-2.5 text-2xl sm:text-3xl">Case closed: {score}/{ROUNDS.length} first-try verdicts</h2>
        <div className="max-w-md rounded-card border border-teal/40 bg-teal/10 p-4 text-sm">
          <p className="mb-2 text-ink-secondary">
            The test for parallel lines: two lines cut by a transversal are parallel if{" "}
            <b className="text-ink">alternate angles are equal</b>, OR{" "}
            <b className="text-ink">corresponding angles are equal</b>, OR{" "}
            <b className="text-ink">co-interior angles add to 180°</b>. Never trust how a figure LOOKS — trust the
            angles!
          </p>
          <div className="text-center">
            <button onClick={next} className="rounded-btn px-6 py-3 font-head font-semibold text-white" style={{ background: "var(--accent)" }}>
              Continue ↓
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
        ⚖️ Parallel or Not · {idx + 1}/{ROUNDS.length}
      </div>
      <h2 className="mb-2.5 text-2xl sm:text-3xl">Judge the lines</h2>
      <p className="mb-4 max-w-lg text-sm text-ink-secondary">
        The figure is <b className="text-ink">not drawn to scale</b> — your eyes can&apos;t decide this. The two marked
        angles are <b className="text-ink">{round.kind}</b> angles. Are the lines parallel?
      </p>

      <svg viewBox="0 0 240 200" className="w-full max-w-sm rounded-card border border-line bg-surface">
        <line x1="12" y1="60" x2="228" y2="60" stroke="rgba(255,255,255,0.75)" strokeWidth="2.5" />
        <line x1="12" y1="140" x2="228" y2="140" stroke="rgba(255,255,255,0.75)" strokeWidth="2.5" />
        <line x1="142" y1="20" x2="78" y2="180" stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" />
        <circle cx="126" cy="60" r="3" fill="#fff" />
        <circle cx="94" cy="140" r="3" fill="#fff" />
        <text x={posA.x} y={posA.y} fill="var(--accent)" fontSize="14" fontWeight="bold" textAnchor="middle">
          {round.a}°
        </text>
        <text x={posB.x} y={posB.y} fill="var(--accent)" fontSize="14" fontWeight="bold" textAnchor="middle">
          {round.b}°
        </text>
      </svg>

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => judge(true)}
          disabled={verdict === "right"}
          className="rounded-btn bg-teal px-6 py-3 font-head font-semibold text-white transition-transform active:scale-95"
        >
          Parallel ∥
        </button>
        <button
          onClick={() => judge(false)}
          disabled={verdict === "right"}
          className="rounded-btn bg-coral px-6 py-3 font-head font-semibold text-white transition-transform active:scale-95"
        >
          Not parallel ✗
        </button>
      </div>

      {verdict === "wrong" && (
        <p className="mt-3 max-w-md text-sm text-coral">
          Hmm — check the rule for {round.kind} angles again. {round.kind === "co-interior" ? "They must ADD to 180°." : "They must be EQUAL."}
        </p>
      )}
      {verdict === "right" && (
        <div className="mt-3 flex flex-col items-center gap-2">
          <p className="max-w-md font-head text-sm text-teal">✓ {round.explain}</p>
          <button onClick={nextRound} className="rounded-btn px-6 py-3 font-head font-semibold text-white" style={{ background: "var(--accent)" }}>
            {idx === ROUNDS.length - 1 ? "Finish →" : "Next case →"}
          </button>
        </div>
      )}
    </>
  );
}
