"use client";

import { useMemo, useState } from "react";
import { useFeedbackSounds } from "@/components/player/useBeep";
import { SIGHT_WORDS_SLUG, type SightLevel } from "@/content/sight-words";

// Sight-word spelling game: a word with one letter hidden, four letters to
// choose from. Objective (unlike the honesty-based flash practice), so every
// correct pick earns tracked XP.

const ROUND_SIZE = 10;
const ALPHABET = "abcdefghijklmnopqrstuvwxyz";

type LetterQuestion = { word: string; blankIndex: number; options: string[]; correct: string };

function buildQuestion(word: string): LetterQuestion {
  // Seeded by the word so the same word always blanks the same letter.
  let seed = 2166136261;
  for (let i = 0; i < word.length; i++) seed = Math.imul(seed ^ word.charCodeAt(i), 16777619);
  const random = () => {
    seed = Math.imul(seed ^ (seed >>> 15), seed | 1);
    seed ^= seed + Math.imul(seed ^ (seed >>> 7), seed | 61);
    return ((seed ^ (seed >>> 14)) >>> 0) / 4294967296;
  };
  const blankIndex = 1 + Math.floor(random() * (word.length - 1));
  const correct = word[blankIndex].toLowerCase();
  const distractors = new Set<string>();
  while (distractors.size < 3) {
    const letter = ALPHABET[Math.floor(random() * 26)];
    if (letter !== correct) distractors.add(letter);
  }
  const options = [correct, ...distractors];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return { word, blankIndex, options, correct };
}

export function MissingLetter({ level, accent, onExit }: { level: SightLevel; accent: string; onExit: () => void }) {
  const sounds = useFeedbackSounds();
  // Mounted only after a click, so Math.random here is hydration-safe.
  const questions = useMemo(() => {
    const eligible = level.words.filter((w) => w.length >= 3 && !w.includes("'"));
    const shuffled = [...eligible];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, ROUND_SIZE).map(buildQuestion);
  }, [level]);

  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[index];
  const answered = chosen !== null;

  const answer = (letter: string) => {
    if (answered) return;
    setChosen(letter);
    const correct = letter === q.correct;
    if (correct) {
      sounds.correct();
      setCorrectCount((c) => c + 1);
    } else {
      sounds.wrong();
    }
    fetch("/api/attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chapterSlug: SIGHT_WORDS_SLUG,
        questionId: `sw-letter:${level.id}:${q.word}`,
        isCorrect: correct,
        chosen: letter,
        kind: "book-question",
      }),
    }).catch(() => {});
  };

  const next = () => {
    if (index === questions.length - 1) setFinished(true);
    else {
      setIndex((i) => i + 1);
      setChosen(null);
    }
  };

  if (finished) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col items-center justify-center px-5 py-6 text-center">
        <h1 className="mb-3 font-head text-3xl font-bold">
          {correctCount === questions.length ? "Perfect round! 🏆" : "Round complete! 🎉"}
        </h1>
        <div className="mb-4 font-head text-6xl font-bold" style={{ color: accent }}>
          {correctCount} / {questions.length}
        </div>
        <p className="mb-6 text-sm text-ink-secondary">⭐ +{correctCount * 10} XP</p>
        <button
          onClick={onExit}
          className="rounded-btn px-6 py-3 font-head font-semibold text-white"
          style={{ background: accent }}
        >
          Done →
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-5 py-6">
      <header className="mb-6 flex items-center gap-3">
        <button
          onClick={onExit}
          aria-label="Back to vocabulary"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface transition-colors hover:border-line-strong"
        >
          ←
        </button>
        <span className="font-head text-sm font-semibold">🔍 Missing letter · {level.name}</span>
        <span className="ml-auto text-xs text-ink-secondary">
          {index + 1} / {questions.length}
        </span>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <p className="text-sm text-ink-secondary">Which letter completes the word?</p>
        <div className="flex gap-1.5">
          {q.word.split("").map((letter, i) => (
            <span
              key={i}
              className={`flex h-14 w-11 items-center justify-center rounded-btn border font-head text-2xl font-bold sm:h-16 sm:w-12 ${
                i === q.blankIndex
                  ? answered
                    ? chosen === q.correct
                      ? "border-teal/60 bg-teal/15 text-teal"
                      : "border-coral bg-coral/15 text-coral"
                    : "border-dashed border-line-strong bg-surface-2 text-ink-muted"
                  : "border-line bg-surface"
              }`}
            >
              {i === q.blankIndex ? (answered ? q.correct : "?") : letter}
            </span>
          ))}
        </div>

        <div className="flex gap-2.5">
          {q.options.map((letter) => {
            let state = "border-line bg-surface hover:border-line-strong";
            if (answered && letter === q.correct) state = "border-teal/60 bg-teal/15 text-teal";
            else if (answered && letter === chosen) state = "border-coral bg-coral/15";
            else if (answered) state = "border-line bg-surface opacity-60";
            return (
              <button
                key={letter}
                disabled={answered}
                onClick={() => answer(letter)}
                className={`h-14 w-14 rounded-btn border font-head text-xl font-bold transition-colors ${state}`}
              >
                {letter}
              </button>
            );
          })}
        </div>

        {answered && (
          <div className="flex flex-col items-center gap-3">
            <p className={`font-head text-sm ${chosen === q.correct ? "text-teal" : "text-coral"}`}>
              {chosen === q.correct ? `Correct — "${q.word}"! +10 XP 🎉` : `It spells "${q.word}" — you'll get it next time!`}
            </p>
            <button
              onClick={next}
              className="rounded-btn px-6 py-3 font-head font-semibold text-white"
              style={{ background: accent }}
            >
              {index === questions.length - 1 ? "See my score →" : "Next word →"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
