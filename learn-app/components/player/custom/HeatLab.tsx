"use client";

import { useState } from "react";
import { usePlayer } from "../PlayerContext";
import { useFeedbackSounds } from "../useBeep";

// Drive water between its three states with heat and cold. Every arrow the
// student travels gets its proper name (melting, freezing, boiling,
// condensation) — and all four are physical changes of the same H₂O.

const STATES = [
  { name: "ICE", emoji: "🧊", desc: "solid — molecules locked in place", color: "#5b7cfa" },
  { name: "WATER", emoji: "💧", desc: "liquid — molecules flow around", color: "#1db88a" },
  { name: "STEAM", emoji: "♨️", desc: "gas — molecules fly free", color: "#d4537e" },
] as const;

type Transition = "melting" | "freezing" | "boiling" | "condensation";

const TRANSITION_LABELS: Record<Transition, string> = {
  melting: "🔥 MELTING — ice → water",
  freezing: "❄️ FREEZING — water → ice",
  boiling: "🔥 BOILING — water → steam",
  condensation: "❄️ CONDENSATION — steam → water",
};

export function HeatLab() {
  const { next } = usePlayer();
  const sounds = useFeedbackSounds();
  const [level, setLevel] = useState(0); // 0 ice, 1 water, 2 steam
  const [visited, setVisited] = useState<Set<Transition>>(new Set());
  const [message, setMessage] = useState<string | null>(null);

  const state = STATES[level];
  const allFour = visited.size === 4;

  const apply = (delta: 1 | -1) => {
    const target = level + delta;
    if (target < 0) {
      setMessage("It's already frozen solid — the freezer can't do more! 🥶");
      sounds.wrong();
      return;
    }
    if (target > 2) {
      setMessage("It's all steam already — it just gets hotter! 🥵");
      sounds.wrong();
      return;
    }
    const transition: Transition =
      delta === 1 ? (level === 0 ? "melting" : "boiling") : level === 2 ? "condensation" : "freezing";
    sounds.correct();
    setLevel(target);
    setMessage(TRANSITION_LABELS[transition]);
    setVisited((v) => new Set(v).add(transition));
  };

  return (
    <>
      <div className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
        ⚗️ Simulation
      </div>
      <h2 className="mb-2.5 text-2xl sm:text-3xl">One water, three costumes</h2>
      <p className="mb-5 max-w-lg text-sm text-ink-secondary">
        Changes never happen on their own — they need a <b className="text-ink">cause</b>. Use heat and cold to push
        water through all its states. Collect all <b className="text-ink">four</b> famous changes!
      </p>

      <div
        className="flex h-36 w-36 flex-col items-center justify-center rounded-card border-2 transition-colors duration-500"
        style={{ borderColor: state.color, background: `${state.color}22` }}
      >
        <span className="text-6xl">{state.emoji}</span>
        <span className="mt-1 font-head text-sm font-bold" style={{ color: state.color }}>
          {state.name}
        </span>
      </div>
      <p className="mt-2 text-xs text-ink-muted">{state.desc}</p>

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => apply(-1)}
          className="rounded-btn px-6 py-3 font-head font-semibold text-white transition-transform active:scale-95"
          style={{ background: "#5b7cfa" }}
        >
          ❄️ Cool it
        </button>
        <button
          onClick={() => apply(1)}
          className="rounded-btn px-6 py-3 font-head font-semibold text-white transition-transform active:scale-95"
          style={{ background: "#d85a30" }}
        >
          🔥 Heat it
        </button>
      </div>

      {message && <p className="mt-4 font-head text-sm font-semibold">{message}</p>}

      <div className="mt-4 flex flex-wrap justify-center gap-1.5">
        {(Object.keys(TRANSITION_LABELS) as Transition[]).map((t) => (
          <span
            key={t}
            className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide ${
              visited.has(t) ? "border-teal/60 bg-teal/15 text-teal" : "border-line bg-surface text-ink-muted"
            }`}
          >
            {visited.has(t) ? "✓ " : ""}
            {t}
          </span>
        ))}
      </div>

      {allFour && (
        <div className="mt-4 max-w-md rounded-card border border-teal/40 bg-teal/10 p-4 text-sm">
          <p className="mb-2 text-ink-secondary">
            🎉 All four collected! Notice: through every change it stayed <b className="text-ink">the same water</b> —
            no new substance, just a change of state. These are all <b className="text-ink">physical changes</b>, and
            each one needed a cause: heat in, or heat out.
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
