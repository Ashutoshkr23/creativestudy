"use client";

import { useState } from "react";
import { usePlayer } from "../PlayerContext";
import { useFeedbackSounds } from "../useBeep";

// Decision-fail scenario (same pattern as the history mission games): pick a
// remedy, wrong choices fail forward with a consequence, right one explains why.

export type MissionChoice = { id: string; label: string; correct?: boolean; outcome: string };
export type MissionProps = {
  emoji: string;
  title: string;
  situation: string;
  question: string;
  choices: MissionChoice[];
  explain: string;
};

export function RescueMission(props: Record<string, unknown>) {
  const { emoji, title, situation, question, choices, explain } = props as MissionProps;
  const { next } = usePlayer();
  const sounds = useFeedbackSounds();
  const [picked, setPicked] = useState<MissionChoice | null>(null);
  const [solved, setSolved] = useState(false);

  const pick = (choice: MissionChoice) => {
    if (solved) return;
    setPicked(choice);
    if (choice.correct) {
      sounds.correct();
      setSolved(true);
    } else {
      sounds.wrong();
    }
  };

  return (
    <>
      <div className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
        🚨 Rescue Mission
      </div>
      <h2 className="mb-2.5 text-2xl sm:text-3xl">
        {emoji} {title}
      </h2>
      <p className="mb-3 max-w-lg text-sm text-ink-secondary">{situation}</p>
      <p className="mb-4 max-w-lg font-head text-base font-semibold">{question}</p>

      <div className="flex w-full max-w-sm flex-col gap-2.5">
        {choices.map((choice) => {
          let cls = "border-line bg-surface hover:border-line-strong";
          if (picked?.id === choice.id) {
            cls = choice.correct ? "border-teal/60 bg-teal/15 text-teal" : "border-coral bg-coral/15";
          } else if (solved) {
            cls = "border-line bg-surface opacity-60";
          }
          return (
            <button
              key={choice.id}
              disabled={solved}
              onClick={() => pick(choice)}
              className={`rounded-btn border px-4 py-3 text-left text-sm transition-colors ${cls}`}
            >
              {choice.label}
            </button>
          );
        })}
      </div>

      {picked && (
        <div
          className={`mt-4 max-w-md rounded-card border p-4 text-sm ${
            picked.correct ? "border-teal/40 bg-teal/10" : "border-coral/40 bg-coral/10"
          }`}
        >
          <p className={`mb-1 font-head font-semibold ${picked.correct ? "text-teal" : "text-coral"}`}>
            {picked.correct ? "Mission accomplished! 🎉" : "Oh no…"}
          </p>
          <p className="text-ink-secondary">{picked.outcome}</p>
          {picked.correct && <p className="mt-2 text-ink-secondary">{explain}</p>}
          {!picked.correct && <p className="mt-2 text-xs text-ink-muted">Try another remedy ↑</p>}
          {solved && (
            <div className="mt-3 text-center">
              <button
                onClick={next}
                className="rounded-btn px-6 py-3 font-head font-semibold text-white"
                style={{ background: "var(--accent)" }}
              >
                Next mission ↓
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
