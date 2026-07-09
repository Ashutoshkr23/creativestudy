"use client";

import { useState } from "react";
import { usePlayer } from "../PlayerContext";
import { useFeedbackSounds } from "../useBeep";
import { PH_COLORS } from "./PhSlider";

// A beaker of strong acid and a dropper of base: neutralise it drop by drop.
// Overshooting past 7 is half the lesson.

export function NeutralisationMixer() {
  const { next } = usePlayer();
  const sounds = useFeedbackSounds();
  const [ph, setPh] = useState(2);
  const [drops, setDrops] = useState(0);
  const [everNeutral, setEverNeutral] = useState(false);

  const isNeutral = ph === 7;

  const add = (delta: number) => {
    const newPh = Math.min(14, Math.max(1, ph + delta));
    setPh(newPh);
    setDrops((d) => d + 1);
    if (newPh === 7) {
      sounds.correct();
      setEverNeutral(true);
    } else {
      sounds.tap();
    }
  };

  const message = isNeutral
    ? "⚖️ Perfectly balanced!"
    : ph < 7
      ? "Still acidic — add more base 🧴"
      : "Whoa, too much base — now it's basic! Add acid to come back 🧪";

  return (
    <>
      <div className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
        ⚗️ Experiment
      </div>
      <h2 className="mb-2.5 text-2xl sm:text-3xl">Tame the acid</h2>
      <p className="mb-5 max-w-lg text-sm text-ink-secondary">
        This beaker holds a strong acid (pH 2) with universal indicator in it. Add base{" "}
        <b className="text-ink">drop by drop</b> and get the beaker to exactly{" "}
        <b className="text-ink">pH 7</b>.
      </p>

      <div className="flex items-end gap-6">
        <div className="flex flex-col items-center">
          <div className="h-40 w-28 overflow-hidden rounded-b-2xl rounded-t-md border-2 border-white/20">
            <div className="h-1/5 bg-transparent" />
            <div
              className="h-4/5 w-full transition-colors duration-500"
              style={{ background: PH_COLORS[ph] }}
            >
              <div className="pt-2 text-center text-3xl">{isNeutral ? "😌" : ph < 7 ? "😖" : "🫢"}</div>
            </div>
          </div>
          <span className="mt-2 text-xs text-ink-muted">the beaker</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="rounded-card border border-line bg-surface px-4 py-2 text-center">
            <div className="font-head text-3xl font-bold" style={{ color: PH_COLORS[ph] }}>
              {ph}
            </div>
            <div className="text-[10px] uppercase tracking-wide text-ink-secondary">pH meter</div>
          </div>
          <button
            onClick={() => add(1)}
            className="w-36 rounded-btn bg-teal px-4 py-2.5 text-sm font-semibold text-white transition-transform active:scale-95"
          >
            + drop of base 🧴
          </button>
          <button
            onClick={() => add(-1)}
            className="w-36 rounded-btn bg-coral px-4 py-2.5 text-sm font-semibold text-white transition-transform active:scale-95"
          >
            + drop of acid 🧪
          </button>
          <span className="text-[10px] text-ink-muted">drops used: {drops}</span>
        </div>
      </div>

      <p className={`mt-4 text-sm font-medium ${isNeutral ? "text-teal" : "text-ink-secondary"}`}>{message}</p>

      {everNeutral && (
        <div className="mt-4 max-w-md rounded-card border border-teal/40 bg-teal/10 p-4 text-sm">
          <p className="mb-1 font-head font-semibold text-teal">✨ You just did a neutralisation reaction!</p>
          <p className="mb-1 font-head text-ink">Acid + Base → Salt + Water + heat</p>
          <p className="mb-3 text-ink-secondary">
            The acid and base destroyed each other, leaving salt dissolved in water — and if you touched
            the beaker now, it would feel slightly <b className="text-ink">warm</b> 🔥. That heat is part
            of the reaction.
          </p>
          <button
            onClick={next}
            className="rounded-btn px-6 py-3 font-head font-semibold text-white"
            style={{ background: "var(--accent)" }}
          >
            Continue ↓
          </button>
        </div>
      )}
    </>
  );
}
