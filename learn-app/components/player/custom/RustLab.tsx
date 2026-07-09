"use client";

import { useEffect, useRef, useState } from "react";
import { usePlayer } from "../PlayerContext";
import { useFeedbackSounds } from "../useBeep";

// The book's Activity 1 as a simulation: three test tubes with an iron nail
// each — dry air only, water only (oil seal), and air + water. Fast-forward
// four days and see which nail rusts, then answer what rust really needs.

const TUBES = [
  { id: "air", label: "Tube A", condition: "Dry air only", detail: "calcium chloride soaks up all moisture", emoji: "🌬️" },
  { id: "water", label: "Tube B", condition: "Water only", detail: "boiled water + oil layer keeps air out", emoji: "💧" },
  { id: "both", label: "Tube C", condition: "Air + water", detail: "ordinary water, open to air", emoji: "🌬️💧" },
];

const OPTIONS = [
  { id: "a", label: "Only air" },
  { id: "b", label: "Only water" },
  { id: "c", label: "BOTH air and water" },
  { id: "d", label: "Neither — iron rusts on its own" },
];

export function RustLab() {
  const { next } = usePlayer();
  const sounds = useFeedbackSounds();
  const [day, setDay] = useState(0);
  const [running, setRunning] = useState(false);
  const [chosen, setChosen] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  const fastForward = () => {
    if (running || day >= 4) return;
    setRunning(true);
    sounds.tap();
    timer.current = setInterval(() => {
      setDay((d) => {
        if (d >= 3) {
          if (timer.current) clearInterval(timer.current);
          setRunning(false);
          return 4;
        }
        return d + 1;
      });
    }, 600);
  };

  const finished = day >= 4;
  const answered = chosen !== null;
  const correct = chosen === "c";

  const pick = (id: string) => {
    if (answered && correct) return;
    setChosen(id);
    if (id === "c") sounds.correct();
    else sounds.wrong();
  };

  return (
    <>
      <div className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
        🧲 The Rust Experiment
      </div>
      <h2 className="mb-2.5 text-2xl sm:text-3xl">What does rust really need?</h2>
      <p className="mb-5 max-w-lg text-sm text-ink-secondary">
        Three clean iron nails, three different worlds. Fast-forward four days and watch closely.
      </p>

      <div className="grid w-full max-w-lg grid-cols-3 gap-2.5">
        {TUBES.map((tube) => {
          const rusted = finished && tube.id === "both";
          return (
            <div key={tube.id} className="flex flex-col items-center gap-1.5 rounded-card border border-line bg-surface p-3">
              <span className="text-lg">{tube.emoji}</span>
              <span className="font-head text-sm font-bold">{tube.label}</span>
              <span className="text-center text-[10px] text-ink-secondary">{tube.condition}</span>
              <div
                className="my-1 flex h-14 w-4 items-end justify-center rounded-full border transition-colors duration-700"
                style={{
                  borderColor: rusted ? "#a0522d" : "rgba(255,255,255,0.2)",
                  background: rusted ? "linear-gradient(#8a8f98 30%, #a0522d 30%)" : "#8a8f98",
                }}
                aria-label={rusted ? "rusted nail" : "clean nail"}
              />
              <span className={`text-[10px] font-semibold ${rusted ? "text-coral" : "text-ink-muted"}`}>
                {finished ? (rusted ? "🟤 RUSTED!" : "✨ still clean") : "…"}
              </span>
              <span className="text-center text-[9px] text-ink-muted">{tube.detail}</span>
            </div>
          );
        })}
      </div>

      {!finished ? (
        <button
          onClick={fastForward}
          disabled={running}
          className="mt-5 rounded-btn px-6 py-3 font-head font-semibold text-white transition-transform active:scale-95 disabled:opacity-60"
          style={{ background: "var(--accent)" }}
        >
          {running ? `Day ${day}…` : "⏩ Fast-forward 4 days"}
        </button>
      ) : !(answered && correct) ? (
        <div className="mt-5 flex flex-col items-center gap-2">
          <p className="font-head text-sm font-semibold">Only Tube C rusted. So rusting needs…</p>
          <div className="flex max-w-md flex-wrap justify-center gap-2">
            {OPTIONS.map((o) => (
              <button
                key={o.id}
                onClick={() => pick(o.id)}
                className={`rounded-btn border px-4 py-2.5 text-sm transition-colors ${
                  chosen === o.id && !correct ? "border-coral bg-coral/15" : "border-line bg-surface hover:border-line-strong"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
          {answered && !correct && (
            <p className="text-xs text-coral">Look at the tubes again — which single tube rusted, and what did it have?</p>
          )}
        </div>
      ) : (
        <div className="mt-5 max-w-md rounded-card border border-teal/40 bg-teal/10 p-4 text-sm">
          <p className="mb-1 font-head font-semibold text-teal">Exactly — BOTH air and water! 🎉</p>
          <p className="mb-1 font-head text-ink">Iron + Oxygen + Water → Iron oxide (rust)</p>
          <p className="mb-3 text-ink-secondary">
            Rust is soft and flaky — it keeps falling off so fresh iron underneath keeps rusting, slowly eating bridges,
            gates and car bodies. A chemical change we very much want to STOP…
          </p>
          <div className="text-center">
            <button
              onClick={next}
              className="rounded-btn px-6 py-3 font-head font-semibold text-white"
              style={{ background: "var(--accent)" }}
            >
              How do we stop it? ↓
            </button>
          </div>
        </div>
      )}
    </>
  );
}
