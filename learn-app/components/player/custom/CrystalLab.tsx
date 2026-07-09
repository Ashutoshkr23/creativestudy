"use client";

import { useState } from "react";
import { usePlayer } from "../PlayerContext";
import { useFeedbackSounds } from "../useBeep";

// Grow pure copper sulphate crystals from a dirty sample by performing the
// crystallisation steps in the right order (the book's Activity 2 as a game).

const STEPS = [
  { id: "dissolve", label: "🥣 Dissolve the impure powder in a little water", beaker: "🟦", note: "Blue solution — with dirt floating in it." },
  { id: "filter", label: "🫙 Filter the solution", beaker: "🟦", note: "Insoluble dirt caught by the filter paper. Solution is clean… but soluble impurities still hide inside!" },
  { id: "boil", label: "🔥 Boil to remove extra water", beaker: "🌡️", note: "The solution gets stronger and stronger (saturated)." },
  { id: "cool", label: "❄️ Let it cool down slowly", beaker: "🫧", note: "Patience… crystals begin to appear as it cools." },
  { id: "collect", label: "💎 Collect and dry the crystals", beaker: "💎✨", note: "Beautiful flat-faced, straight-edged blue crystals — PURE copper sulphate!" },
];

// Deterministic display order (not the solution order) so it's a real puzzle.
const DISPLAY_ORDER = [2, 0, 4, 1, 3];

export function CrystalLab() {
  const { next } = usePlayer();
  const sounds = useFeedbackSounds();
  const [doneCount, setDoneCount] = useState(0);
  const [shakeId, setShakeId] = useState<string | null>(null);

  const finished = doneCount === STEPS.length;
  const current = finished ? STEPS[STEPS.length - 1] : STEPS[Math.max(0, doneCount - 1)];

  const tryStep = (stepId: string) => {
    if (finished) return;
    if (STEPS[doneCount].id === stepId) {
      sounds.correct();
      setDoneCount((c) => c + 1);
    } else {
      sounds.wrong();
      setShakeId(stepId);
      setTimeout(() => setShakeId(null), 450);
    }
  };

  return (
    <>
      <div className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
        💎 The Crystal Factory
      </div>
      <h2 className="mb-2.5 text-2xl sm:text-3xl">Grow pure crystals from dirty powder</h2>
      <p className="mb-4 max-w-lg text-sm text-ink-secondary">
        You have impure copper sulphate — blue powder mixed with dirt. Perform the{" "}
        <b className="text-ink">crystallisation</b> steps in the correct order to get perfectly pure crystals.
      </p>

      <div className="flex h-24 w-full max-w-sm items-center justify-center rounded-card border border-line bg-surface">
        <span className="text-4xl">{doneCount === 0 ? "🟫" : current.beaker}</span>
      </div>
      <p className="mt-2 min-h-8 max-w-md text-xs text-ink-secondary">
        {doneCount === 0 ? "Dirty blue powder, waiting for a scientist." : current.note}
      </p>

      <div className="mt-3 flex w-full max-w-md flex-col gap-2">
        {DISPLAY_ORDER.map((stepIdx) => {
          const step = STEPS[stepIdx];
          const stepDone = STEPS.findIndex((s) => s.id === step.id) < doneCount;
          return (
            <button
              key={step.id}
              disabled={stepDone}
              onClick={() => tryStep(step.id)}
              className={`rounded-btn border px-4 py-2.5 text-left text-sm transition-all ${
                stepDone
                  ? "border-teal/60 bg-teal/15 text-teal"
                  : shakeId === step.id
                    ? "translate-x-1 border-coral bg-coral/15"
                    : "border-line bg-surface hover:border-line-strong"
              }`}
            >
              {stepDone ? "✓ " : ""}
              {step.label}
            </button>
          );
        })}
      </div>

      {finished && (
        <div className="mt-4 max-w-md rounded-card border border-teal/40 bg-teal/10 p-4 text-sm">
          <p className="mb-1 font-head font-semibold text-teal">💎 Perfect crystals! </p>
          <p className="mb-3 text-ink-secondary">
            Filtering removed the <b className="text-ink">insoluble</b> dirt; crystallisation left the{" "}
            <b className="text-ink">soluble</b> impurities behind in the solution. Crystals are solids with flat faces,
            straight edges and regular shapes — and this same process gives us table salt from sea water!
          </p>
          <div className="text-center">
            <button
              onClick={next}
              className="rounded-btn px-6 py-3 font-head font-semibold text-white"
              style={{ background: "var(--accent)" }}
            >
              Continue ↓
            </button>
          </div>
        </div>
      )}
    </>
  );
}
