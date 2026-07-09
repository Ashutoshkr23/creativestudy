"use client";

import { useState } from "react";
import { usePlayer } from "../PlayerContext";
import { useFeedbackSounds } from "../useBeep";

// The chapter's hook: make a change happen, then hit the big UNDO button.
// The universe allows it for some changes and flatly refuses for others —
// including the sneaky case of cut paper (can't rejoin it, yet it's still
// paper), which sets up physical-vs-chemical later.

type Scenario = {
  id: string;
  title: string;
  before: string;
  after: string;
  action: string;
  undoWorks: boolean;
  verdict: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: "ice",
    title: "Melt the ice",
    before: "🧊",
    after: "💧",
    action: "🔥 Warm it up",
    undoWorks: true,
    verdict: "UNDONE! Put the water back in the freezer and it's ice again. Reversible ✓",
  },
  {
    id: "steam",
    title: "Boil the water",
    before: "💧",
    after: "♨️",
    action: "🔥 Boil it",
    undoWorks: true,
    verdict: "UNDONE! Cool the steam on a cold surface and it condenses back to water. Reversible ✓",
  },
  {
    id: "paper-cut",
    title: "Cut the paper",
    before: "📄",
    after: "✂️📄📄",
    action: "✂️ Snip snip",
    undoWorks: false,
    verdict: "UNDO FAILED — the pieces won't rejoin. But look closely: every piece is STILL paper…",
  },
  {
    id: "paper-burn",
    title: "Burn the paper",
    before: "📄",
    after: "🔥⚫",
    action: "🔥 Light it",
    undoWorks: false,
    verdict: "UNDO FAILED — completely! Ash and smoke can NEVER become paper again. Something new was made.",
  },
  {
    id: "curd",
    title: "Turn milk into curd",
    before: "🥛",
    after: "🥣",
    action: "🦠 Add a little curd, wait overnight",
    undoWorks: false,
    verdict: "UNDO FAILED — curd will never be milk again. A new substance was formed.",
  },
];

export function UndoLab() {
  const { next } = usePlayer();
  const sounds = useFeedbackSounds();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"ready" | "changed" | "verdict">("ready");
  const [done, setDone] = useState(false);

  const scenario = SCENARIOS[index];

  const makeChange = () => {
    sounds.tap();
    setPhase("changed");
  };

  const pressUndo = () => {
    if (scenario.undoWorks) sounds.correct();
    else sounds.wrong();
    setPhase("verdict");
  };

  const nextScenario = () => {
    if (index === SCENARIOS.length - 1) setDone(true);
    else {
      setIndex((i) => i + 1);
      setPhase("ready");
    }
  };

  if (done) {
    return (
      <>
        <div className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
          🕹️ The Undo Button
        </div>
        <h2 className="mb-2.5 text-2xl sm:text-3xl">What did the UNDO button teach us?</h2>
        <div className="max-w-md rounded-card border border-teal/40 bg-teal/10 p-4 text-left text-sm">
          <p className="mb-2 text-ink-secondary">
            ✅ Some changes can be <b className="text-ink">reversed</b> — ice ↔ water ↔ steam.
          </p>
          <p className="mb-2 text-ink-secondary">
            ❌ Some can&apos;t — and here&apos;s the clever bit: cut paper couldn&apos;t be undone, but it was{" "}
            <b className="text-ink">still paper</b>. Burnt paper became <b className="text-ink">something completely new</b>{" "}
            — ash, smoke, gases.
          </p>
          <p className="mb-3 text-ink-secondary">
            So there&apos;s something deeper than &quot;can I undo it&quot;: did a{" "}
            <b className="text-ink">NEW SUBSTANCE</b> form? That question splits every change in the universe into two
            families…
          </p>
          <div className="text-center">
            <button
              onClick={next}
              className="rounded-btn px-6 py-3 font-head font-semibold text-white"
              style={{ background: "var(--accent)" }}
            >
              Meet the two families ↓
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
        🕹️ The Undo Button · {index + 1}/{SCENARIOS.length}
      </div>
      <h2 className="mb-2.5 text-2xl sm:text-3xl">{scenario.title}</h2>
      <p className="mb-5 max-w-lg text-sm text-ink-secondary">
        Make the change happen, then hit UNDO and see if the universe allows it.
      </p>

      <div className="flex h-32 w-full max-w-sm items-center justify-center rounded-card border border-line bg-surface">
        <span
          className="text-6xl transition-all duration-500"
          style={{ transform: phase === "ready" ? "scale(1)" : "scale(1.05)" }}
        >
          {phase === "ready" ? scenario.before : phase === "verdict" && scenario.undoWorks ? scenario.before : scenario.after}
        </span>
      </div>

      <div className="mt-5 flex flex-col items-center gap-3">
        {phase === "ready" && (
          <button
            onClick={makeChange}
            className="rounded-btn px-6 py-3 font-head font-semibold text-white transition-transform active:scale-95"
            style={{ background: "var(--accent)" }}
          >
            {scenario.action}
          </button>
        )}
        {phase === "changed" && (
          <button
            onClick={pressUndo}
            className="rounded-btn bg-primary px-8 py-3.5 font-head text-lg font-bold text-white transition-transform active:scale-95"
          >
            ⟲ UNDO
          </button>
        )}
        {phase === "verdict" && (
          <>
            <p
              className={`max-w-md text-sm font-medium ${scenario.undoWorks ? "text-teal" : "text-coral"}`}
            >
              {scenario.verdict}
            </p>
            <button
              onClick={nextScenario}
              className="rounded-btn border border-line bg-surface px-6 py-3 font-head font-semibold transition-colors hover:border-line-strong"
            >
              {index === SCENARIOS.length - 1 ? "So what's the pattern? →" : "Next change →"}
            </button>
          </>
        )}
      </div>
    </>
  );
}
