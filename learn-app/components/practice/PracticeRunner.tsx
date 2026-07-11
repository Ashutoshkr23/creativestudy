"use client";

import { useMemo, useState } from "react";
import type { PracticeQuestion } from "@/lib/question-bank";
import { useFeedbackSounds } from "@/components/player/useBeep";
import { QuestionFigure } from "./QuestionFigure";

// Standalone MCQ runner for the Practice Arena (not tied to ChapterPlayer).
// Score + in-run streak, instant feedback, no timers. Each answer is saved via
// /api/attempt (silently skipped when not a student session or DB is offline).

export function PracticeRunner({
  questions,
  accent,
  title,
  onExit,
  exitLabel = "Practise again →",
}: {
  questions: PracticeQuestion[];
  accent: string;
  title: string;
  onExit: () => void;
  exitLabel?: string;
}) {
  const sounds = useFeedbackSounds();
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [runStreak, setRunStreak] = useState(0);
  const [bestRunStreak, setBestRunStreak] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = questions[index];
  const answered = chosen !== null;
  // Shuffle option order per view — only ever runs client-side (this component
  // mounts after a user click), so Math.random is hydration-safe here.
  const displayOptions = useMemo(() => {
    const copy = [...question.options];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }, [question]);

  const answer = (optionId: string) => {
    if (answered) return;
    setChosen(optionId);
    const correct = optionId === question.correct;
    if (correct) {
      sounds.correct();
      setCorrectCount((c) => c + 1);
      setRunStreak((s) => {
        const next = s + 1;
        setBestRunStreak((b) => Math.max(b, next));
        return next;
      });
    } else {
      sounds.wrong();
      setRunStreak(0);
    }
    fetch("/api/attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chapterSlug: question.chapterSlug,
        questionId: question.questionId,
        isCorrect: correct,
        chosen: optionId,
        kind: "book-question",
      }),
    }).catch(() => {});
  };

  const nextQuestion = () => {
    if (index === questions.length - 1) setFinished(true);
    else {
      setIndex((i) => i + 1);
      setChosen(null);
    }
  };

  if (finished) {
    const score = Math.round((correctCount / questions.length) * 100);
    return (
      <main
        className="mx-auto flex min-h-dvh w-full max-w-xl flex-col items-center justify-center px-5 py-6 text-center"
        style={{ "--accent": accent } as React.CSSProperties}
      >
        <div className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color: accent }}>
          Practice complete
        </div>
        <h1 className="mb-3 font-head text-3xl font-bold">
          {score >= 80 ? "Outstanding! 🏆" : score >= 50 ? "Good practice! 💪" : "Practice makes perfect 🌱"}
        </h1>
        <div className="mb-4 font-head text-6xl font-bold" style={{ color: accent }}>
          {correctCount} / {questions.length}
        </div>
        <div className="mb-6 flex gap-4 text-sm text-ink-secondary">
          <span>⭐ +{correctCount * 10} XP</span>
          {bestRunStreak >= 2 && <span>🔥 best run: {bestRunStreak} in a row</span>}
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={onExit}
            className="rounded-btn px-6 py-3 font-head font-semibold text-white"
            style={{ background: accent }}
          >
            {exitLabel}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-5 py-6"
      style={{ "--accent": accent } as React.CSSProperties}
    >
      <header className="mb-6 flex items-center gap-3">
        <button
          onClick={onExit}
          aria-label="Quit practice"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface transition-colors hover:border-line-strong"
        >
          ←
        </button>
        <span className="font-head text-sm font-semibold">{title}</span>
        <span className="ml-auto text-xs text-ink-secondary">
          {index + 1} / {questions.length}
        </span>
      </header>

      <div className="mb-6 h-1 w-full rounded-full bg-surface">
        <div
          className="h-1 rounded-full transition-all duration-300"
          style={{ width: `${((index + (answered ? 1 : 0)) / questions.length) * 100}%`, background: accent }}
        />
      </div>

      <div className="mb-4 flex items-center gap-4 text-xs text-ink-secondary">
        <span>✅ {correctCount}</span>
        {runStreak >= 2 && <span className="text-amber">🔥 {runStreak} in a row</span>}
      </div>

      <h2 className="mb-5 whitespace-pre-line font-head text-lg sm:text-xl">{question.prompt}</h2>

      {question.figure && <QuestionFigure figure={question.figure} />}

      <div className="flex w-full flex-col gap-2.5">
        {displayOptions.map((option) => {
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
          <p className={`font-head text-sm ${chosen === question.correct ? "text-teal" : "text-coral"}`}>
            {chosen === question.correct ? "Correct! +10 XP 🎉" : "Not quite — remember this one!"}
          </p>
          {question.explain && (
            <p className="max-w-lg text-center text-sm text-ink-secondary">{question.explain}</p>
          )}
          <button
            onClick={nextQuestion}
            className="rounded-btn px-6 py-3 font-head font-semibold text-white"
            style={{ background: accent }}
          >
            {index === questions.length - 1 ? "See my score →" : "Next →"}
          </button>
        </div>
      )}
    </main>
  );
}
