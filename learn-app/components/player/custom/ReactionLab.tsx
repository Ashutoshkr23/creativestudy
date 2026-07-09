"use client";

import { useState } from "react";
import { usePlayer } from "../PlayerContext";
import { useFeedbackSounds } from "../useBeep";

// Perform three famous reactions from the book and, after each one, spot
// which SIGN of a chemical change it showed. The signs checklist is the
// detector card the student walks away with.

type Sign = "gas" | "colour" | "light";

const SIGN_LABELS: Record<Sign, string> = {
  gas: "🫧 A gas formed",
  colour: "🎨 Colour changed",
  light: "✨ Heat & light given out",
};

type Experiment = {
  id: string;
  title: string;
  action: string;
  beforeVisual: string;
  afterVisual: string;
  result: string;
  extra?: { action: string; visual: string; result: string };
  sign: Sign;
};

const EXPERIMENTS: Experiment[] = [
  {
    id: "fizz",
    title: "Vinegar meets baking soda",
    action: "🫗 Pour the vinegar",
    beforeVisual: "🥣",
    afterVisual: "🥣🫧🫧🫧",
    result: "FSSSSS! Bubbles everywhere — a gas is escaping!",
    extra: {
      action: "🧪 Pass the gas through lime water",
      visual: "🥛",
      result: "The lime water turned MILKY — that's the standard test: the gas is carbon dioxide (CO₂)!",
    },
    sign: "gas",
  },
  {
    id: "copper",
    title: "Iron nail in copper sulphate",
    action: "🔩 Dip the iron nail",
    beforeVisual: "🟦",
    afterVisual: "🟩",
    result: "The BLUE solution slowly turned GREEN (iron sulphate), and the nail grew a brown copper coat!",
    sign: "colour",
  },
  {
    id: "magnesium",
    title: "Burn the magnesium ribbon",
    action: "🔥 Light the ribbon",
    beforeVisual: "➰",
    afterVisual: "💥⚪",
    result: "A BRILLIANT white flash — and the shiny ribbon became powdery white ash (magnesium oxide).",
    sign: "light",
  },
];

export function ReactionLab() {
  const { next } = usePlayer();
  const sounds = useFeedbackSounds();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"ready" | "reacted" | "extra" | "pick" | "picked">("ready");
  const [collected, setCollected] = useState<Set<Sign>>(new Set());
  const [wrongPick, setWrongPick] = useState<Sign | null>(null);
  const [done, setDone] = useState(false);

  const exp = EXPERIMENTS[index];

  const react = () => {
    sounds.correct();
    setPhase("reacted");
  };

  const runExtra = () => {
    sounds.correct();
    setPhase("extra");
  };

  const pickSign = (sign: Sign) => {
    if (sign === exp.sign) {
      sounds.correct();
      setCollected((c) => new Set(c).add(sign));
      setWrongPick(null);
      setPhase("picked");
    } else {
      sounds.wrong();
      setWrongPick(sign);
      setTimeout(() => setWrongPick(null), 500);
    }
  };

  const nextExperiment = () => {
    if (index === EXPERIMENTS.length - 1) setDone(true);
    else {
      setIndex((i) => i + 1);
      setPhase("ready");
    }
  };

  if (done) {
    return (
      <>
        <div className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
          🔬 Reaction Lab
        </div>
        <h2 className="mb-2.5 text-2xl sm:text-3xl">Your chemical-change detector</h2>
        <div className="max-w-md rounded-card border border-teal/40 bg-teal/10 p-4 text-left text-sm">
          <p className="mb-2 text-ink-secondary">
            Every experiment made a <b className="text-ink">brand-new substance</b> — CO₂ gas, iron sulphate + copper,
            magnesium oxide. That&apos;s what makes them <b className="text-ink">chemical changes</b>. The tell-tale signs:
          </p>
          <ul className="mb-3 flex flex-col gap-1 text-ink-secondary">
            <li>🫧 a gas may form</li>
            <li>🎨 a colour may change</li>
            <li>✨ heat, light or sound may be given out</li>
            <li>👃 a new smell may appear (like spoiled food!)</li>
          </ul>
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
      </>
    );
  }

  return (
    <>
      <div className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
        🔬 Reaction Lab · experiment {index + 1}/{EXPERIMENTS.length}
      </div>
      <h2 className="mb-2.5 text-2xl sm:text-3xl">{exp.title}</h2>

      <div className="flex h-32 w-full max-w-sm items-center justify-center rounded-card border border-line bg-surface">
        <span className="text-5xl transition-all duration-500">
          {phase === "ready" ? exp.beforeVisual : phase === "extra" ? exp.extra?.visual : exp.afterVisual}
        </span>
      </div>

      <div className="mt-4 flex flex-col items-center gap-3">
        {phase === "ready" && (
          <button
            onClick={react}
            className="rounded-btn px-6 py-3 font-head font-semibold text-white transition-transform active:scale-95"
            style={{ background: "var(--accent)" }}
          >
            {exp.action}
          </button>
        )}

        {phase !== "ready" && (
          <p className="max-w-md text-sm text-ink-secondary">
            {phase === "extra" ? exp.extra?.result : exp.result}
          </p>
        )}

        {phase === "reacted" && exp.extra && (
          <button
            onClick={runExtra}
            className="rounded-btn border border-line bg-surface px-5 py-2.5 text-sm font-semibold transition-colors hover:border-line-strong"
          >
            {exp.extra.action}
          </button>
        )}
        {phase === "reacted" && (
          <button
            onClick={() => setPhase("pick")}
            className="rounded-btn px-5 py-2.5 font-head text-sm font-semibold text-white"
            style={{ background: "var(--accent)" }}
          >
            What sign was that? →
          </button>
        )}
        {phase === "extra" && (
          <button
            onClick={() => setPhase("pick")}
            className="rounded-btn px-5 py-2.5 font-head text-sm font-semibold text-white"
            style={{ background: "var(--accent)" }}
          >
            What sign was that? →
          </button>
        )}

        {phase === "pick" && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs text-ink-secondary">Which sign of a chemical change did you just see most clearly?</p>
            <div className="flex flex-wrap justify-center gap-2">
              {(Object.keys(SIGN_LABELS) as Sign[]).map((sign) => (
                <button
                  key={sign}
                  onClick={() => pickSign(sign)}
                  className={`rounded-btn border px-4 py-2.5 text-sm transition-colors ${
                    wrongPick === sign ? "border-coral bg-coral/15" : "border-line bg-surface hover:border-line-strong"
                  }`}
                >
                  {SIGN_LABELS[sign]}
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === "picked" && (
          <>
            <p className="font-head text-sm text-teal">✓ Sign collected: {SIGN_LABELS[exp.sign]}</p>
            <button
              onClick={nextExperiment}
              className="rounded-btn px-6 py-3 font-head font-semibold text-white"
              style={{ background: "var(--accent)" }}
            >
              {index === EXPERIMENTS.length - 1 ? "Show my detector card →" : "Next experiment →"}
            </button>
          </>
        )}
      </div>

      <div className="mt-5 flex gap-1.5">
        {(Object.keys(SIGN_LABELS) as Sign[]).map((sign) => (
          <span
            key={sign}
            className={`rounded-full border px-3 py-1 text-[10px] ${
              collected.has(sign) ? "border-teal/60 bg-teal/15 text-teal" : "border-line bg-surface text-ink-muted"
            }`}
          >
            {SIGN_LABELS[sign]}
          </span>
        ))}
      </div>
    </>
  );
}
