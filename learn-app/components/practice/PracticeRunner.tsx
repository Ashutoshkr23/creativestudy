"use client";

import { useMemo, useState } from "react";
import type { PracticeQuestion } from "@/lib/question-bank";
import { useFeedbackSounds } from "@/components/player/useBeep";
import { QuestionFigure } from "./QuestionFigure";

// Standalone runner for the Practice Arena / Today's Review (not tied to
// ChapterPlayer). Handles MCQ + True/False (tap an option) and Fill-in-the-
// blank (type the answer). Score + in-run streak, instant feedback, no timers.
// Each answer is saved via /api/attempt (silently skipped when not a student
// session or the DB is offline).

function normalise(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.,!?;:]+$/, "");
}

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
  const [chosen, setChosen] = useState<string | null>(null); // MCQ option id
  const [entry, setEntry] = useState(""); // fill-blank typed text
  const [submitted, setSubmitted] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [runStreak, setRunStreak] = useState(0);
  const [bestRunStreak, setBestRunStreak] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = questions[index];
  const isFill = question.qtype === "fill-blank";

  // Shuffle option order per view — only ever runs client-side (this component
  // mounts after a user click), so Math.random is hydration-safe here.
  const displayOptions = useMemo(() => {
    const copy = [...(question.options ?? [])];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }, [question]);

  const record = (correct: boolean, chosenValue: string) => {
    if (correct) {
      sounds.correct();
      setCorrectCount((c) => c + 1);
      setRunStreak((s) => {
        const nextStreak = s + 1;
        setBestRunStreak((b) => Math.max(b, nextStreak));
        return nextStreak;
      });
    } else {
      sounds.wrong();
      setRunStreak(0);
    }
    setWasCorrect(correct);
    setSubmitted(true);
    fetch("/api/attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chapterSlug: question.chapterSlug,
        questionId: question.questionId,
        isCorrect: correct,
        chosen: chosenValue,
        kind: "book-question",
      }),
    }).catch(() => {});
  };

  const answerOption = (optionId: string) => {
    if (submitted) return;
    setChosen(optionId);
    record(optionId === question.correct, optionId);
  };

  const submitFill = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitted || entry.trim() === "") return;
    const accepted = (question.answers ?? []).map(normalise);
    record(accepted.includes(normalise(entry)), entry.trim());
  };

  const nextQuestion = () => {
    if (index === questions.length - 1) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setChosen(null);
    setEntry("");
    setSubmitted(false);
    setWasCorrect(false);
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
          style={{ width: `${((index + (submitted ? 1 : 0)) / questions.length) * 100}%`, background: accent }}
        />
      </div>

      <div className="mb-4 flex items-center gap-4 text-xs text-ink-secondary">
        <span>✅ {correctCount}</span>
        {runStreak >= 2 && <span className="text-amber">🔥 {runStreak} in a row</span>}
        {isFill && <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px]">✍️ type the answer</span>}
      </div>

      <h2 className="mb-5 whitespace-pre-line font-head text-lg sm:text-xl">{question.prompt}</h2>

      {question.figure && <QuestionFigure figure={question.figure} />}

      {isFill ? (
        <form onSubmit={submitFill} className="flex w-full flex-col gap-3">
          <input
            type="text"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            disabled={submitted}
            autoFocus
            autoComplete="off"
            placeholder="Type your answer…"
            aria-label="Your answer"
            className={`w-full rounded-btn border px-4 py-3 text-sm outline-none transition-colors ${
              submitted
                ? wasCorrect
                  ? "border-teal/60 bg-teal/15 text-teal"
                  : "border-coral bg-coral/15"
                : "border-line bg-surface focus:border-line-strong"
            }`}
          />
          {!submitted && (
            <button
              type="submit"
              disabled={entry.trim() === ""}
              className="self-start rounded-btn px-6 py-2.5 font-head text-sm font-semibold text-white transition-opacity disabled:opacity-40"
              style={{ background: accent }}
            >
              Check ✓
            </button>
          )}
        </form>
      ) : (
        <div className="flex w-full flex-col gap-2.5">
          {displayOptions.map((option) => {
            let state = "border-line bg-surface hover:border-line-strong";
            if (submitted && option.id === question.correct) state = "border-teal/60 bg-teal/15 text-teal";
            else if (submitted && option.id === chosen) state = "border-coral bg-coral/15";
            else if (submitted) state = "border-line bg-surface opacity-60";
            return (
              <button
                key={option.id}
                disabled={submitted}
                onClick={() => answerOption(option.id)}
                className={`rounded-btn border px-4 py-3 text-left text-sm transition-colors ${state}`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}

      {submitted && (
        <div className="mt-5 flex flex-col items-center gap-3">
          <p className={`font-head text-sm ${wasCorrect ? "text-teal" : "text-coral"}`}>
            {wasCorrect ? "Correct! +10 XP 🎉" : "Not quite — remember this one!"}
          </p>
          {!wasCorrect && isFill && question.answers?.[0] && (
            <p className="text-sm text-ink-secondary">
              Answer: <b className="text-ink">{question.answers[0].charAt(0).toUpperCase() + question.answers[0].slice(1)}</b>
            </p>
          )}
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
