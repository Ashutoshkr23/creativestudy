"use client";

import { useState } from "react";
import type { QuizScene } from "@/content/types";
import { Eyebrow, SceneTitle, Explain } from "./SceneView";
import { useFeedbackSounds } from "../useBeep";
import { usePlayer } from "../PlayerContext";

// Boss quiz: score + in-quiz streak, one attempt per question, no timers ever.
export function QuizSceneView({ scene }: { scene: QuizScene; active: boolean }) {
  const sounds = useFeedbackSounds();
  const { report } = usePlayer();
  const [qIndex, setQIndex] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [runStreak, setRunStreak] = useState(0);
  const [finished, setFinished] = useState(false);

  const total = scene.questions.length;
  const question = scene.questions[qIndex];
  const answered = chosen !== null;

  const answer = (optionId: string) => {
    if (answered || finished) return;
    setChosen(optionId);
    const correct = optionId === question.correct;
    const newCorrectCount = correctCount + (correct ? 1 : 0);
    if (correct) {
      sounds.correct();
      setCorrectCount(newCorrectCount);
      setRunStreak((s) => s + 1);
    } else {
      sounds.wrong();
      setRunStreak(0);
    }
    const isLast = qIndex === total - 1;
    report({
      questionId: question.questionId,
      isCorrect: correct,
      chosen: optionId,
      kind: "quiz",
      ...(isLast
        ? { quizScore: Math.round((newCorrectCount / total) * 100), completed: true }
        : {}),
    });
  };

  const nextQuestion = () => {
    if (qIndex === total - 1) {
      setFinished(true);
    } else {
      setQIndex((i) => i + 1);
      setChosen(null);
    }
  };

  if (finished) {
    const score = Math.round((correctCount / total) * 100);
    return (
      <>
        <Eyebrow>{scene.eyebrow ?? "🏆 Boss Quiz"}</Eyebrow>
        <SceneTitle>
          {score >= 80 ? "Champion! 🏆" : score >= 50 ? "Good effort! 💪" : "Keep practising! 🌱"}
        </SceneTitle>
        <div className="my-4 font-head text-5xl font-bold" style={{ color: "var(--accent)" }}>
          {correctCount} / {total}
        </div>
        <Explain>
          {score >= 80
            ? "Outstanding — you own this chapter."
            : "Every attempt makes you stronger. Scroll back up to revisit anything, or try the quiz again another day."}
        </Explain>
      </>
    );
  }

  return (
    <>
      <Eyebrow>{scene.eyebrow ?? "🏆 Boss Quiz"}</Eyebrow>
      <SceneTitle>{scene.title}</SceneTitle>
      <div className="mb-4 flex items-center gap-4 text-xs text-ink-secondary">
        <span>
          Question {qIndex + 1} of {total}
        </span>
        <span>✅ {correctCount}</span>
        {runStreak >= 2 && <span className="text-amber">🔥 {runStreak} in a row</span>}
      </div>
      <h3 className="mb-5 max-w-lg font-head text-lg sm:text-xl">{question.prompt}</h3>
      <div className="flex w-full max-w-sm flex-col gap-2.5">
        {question.options.map((option) => {
          let state = "border-line bg-surface hover:border-line-strong";
          if (answered && option.id === question.correct) state = "border-teal/60 bg-teal/15 text-teal";
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
          {question.explain && <Explain>{question.explain}</Explain>}
          <button
            onClick={nextQuestion}
            className="rounded-btn px-6 py-3 font-head font-semibold text-white"
            style={{ background: "var(--accent)" }}
          >
            {qIndex === total - 1 ? "See my score →" : "Next question →"}
          </button>
        </div>
      )}
    </>
  );
}
