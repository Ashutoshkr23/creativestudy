"use client";

import { useState } from "react";
import type { BookQuestionScene } from "@/content/types";
import { Eyebrow, Explain } from "./SceneView";
import { useFeedbackSounds } from "../useBeep";
import { usePlayer } from "../PlayerContext";

export function BookQuestionSceneView({ scene }: { scene: BookQuestionScene }) {
  const sounds = useFeedbackSounds();
  const { next, report } = usePlayer();
  const [chosen, setChosen] = useState<string | null>(null);
  const [reported, setReported] = useState(false);

  const answered = chosen !== null;
  const isCorrect = chosen === scene.correct;

  const answer = (optionId: string) => {
    if (answered) return;
    setChosen(optionId);
    const correct = optionId === scene.correct;
    if (correct) sounds.correct();
    else sounds.wrong();
    // Only the first answer counts — retries are for learning, not the record.
    if (!reported) {
      setReported(true);
      report({
        questionId: scene.questionId,
        isCorrect: correct,
        chosen: optionId,
        kind: "book-question",
      });
    }
  };

  return (
    <>
      <Eyebrow>{scene.eyebrow ?? "📖 Practice"}</Eyebrow>
      <h2 className="mb-4 max-w-xl text-xl sm:text-2xl">{scene.prompt}</h2>
      {scene.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={scene.image}
          alt="Question from the textbook"
          className="mb-4 max-h-64 rounded-card border border-line"
        />
      )}
      <div className="flex w-full max-w-sm flex-col gap-2.5">
        {scene.options.map((option) => {
          let state = "border-line bg-surface hover:border-line-strong";
          if (answered && option.id === scene.correct) state = "border-teal/60 bg-teal/15 text-teal";
          else if (answered && option.id === chosen) state = "border-coral bg-coral/15";
          else if (answered) state = "border-line bg-surface opacity-60";
          return (
            <button
              key={option.id}
              disabled={answered}
              onClick={() => answer(option.id)}
              className={`rounded-btn border px-4 py-3 text-left text-sm transition-colors ${state}`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="mt-5 flex flex-col items-center gap-3">
          <p className={`font-head ${isCorrect ? "text-teal" : "text-coral"}`}>
            {isCorrect ? "Correct! +10 XP 🎉" : "Not quite."}
          </p>
          {scene.explain && <Explain>{scene.explain}</Explain>}
          {!isCorrect && (
            <button
              onClick={() => setChosen(null)}
              className="rounded-btn border border-line bg-surface px-5 py-2.5 text-sm hover:border-line-strong"
            >
              Try again 🔁
            </button>
          )}
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
