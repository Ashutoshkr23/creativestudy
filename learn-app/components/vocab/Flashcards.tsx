"use client";

import { useState } from "react";
import { useFeedbackSounds } from "@/components/player/useBeep";
import { SIGHT_WORDS_SLUG } from "@/content/sight-words";

// Two flavours:
// - flip cards (chapter vocab): front = word, tap to reveal the meaning.
// - self-check (sight words): read the big word aloud, then be honest —
//   "I read it!" or "Still learning". Tricky words loop back for another go,
//   and each self-check is saved as an attempt so XP/streaks accrue.

type Card = { front: string; back?: string };

export function Flashcards({
  title,
  accent,
  cards,
  selfCheck,
  onExit,
}: {
  title: string;
  accent: string;
  cards: Card[];
  selfCheck?: { levelId: string };
  onExit: () => void;
}) {
  const sounds = useFeedbackSounds();
  const [deck, setDeck] = useState(cards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knewCount, setKnewCount] = useState(0);
  const [tricky, setTricky] = useState<Card[]>([]);
  const [finished, setFinished] = useState(false);

  const card = deck[index];

  const advance = () => {
    setFlipped(false);
    if (index === deck.length - 1) setFinished(true);
    else setIndex((i) => i + 1);
  };

  const mark = (knewIt: boolean) => {
    if (knewIt) {
      sounds.correct();
      setKnewCount((c) => c + 1);
    } else {
      sounds.wrong();
      setTricky((t) => [...t, card]);
    }
    if (selfCheck) {
      fetch("/api/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterSlug: SIGHT_WORDS_SLUG,
          questionId: `sw:${selfCheck.levelId}:${card.front}`,
          isCorrect: knewIt,
          chosen: knewIt ? "knew" : "learning",
          kind: "book-question",
        }),
      }).catch(() => {});
    }
    advance();
  };

  const practiseTricky = () => {
    setDeck(tricky);
    setTricky([]);
    setIndex(0);
    setKnewCount(0);
    setFinished(false);
    setFlipped(false);
  };

  if (finished) {
    return (
      <main
        className="mx-auto flex min-h-dvh w-full max-w-xl flex-col items-center justify-center px-5 py-6 text-center"
        style={{ "--accent": accent } as React.CSSProperties}
      >
        <h1 className="mb-3 font-head text-3xl font-bold">Deck done! 🎉</h1>
        {selfCheck ? (
          <>
            <p className="mb-6 text-sm text-ink-secondary">
              ✅ Read instantly: <b className="text-ink">{knewCount}</b> · 🔁 Still learning:{" "}
              <b className="text-ink">{tricky.length}</b>
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {tricky.length > 0 && (
                <button
                  onClick={practiseTricky}
                  className="rounded-btn px-6 py-3 font-head font-semibold text-white"
                  style={{ background: accent }}
                >
                  Practise the tricky ones 🔁
                </button>
              )}
              <button
                onClick={onExit}
                className="rounded-btn border border-line bg-surface px-6 py-3 font-head font-semibold"
              >
                Done →
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={onExit}
            className="rounded-btn px-6 py-3 font-head font-semibold text-white"
            style={{ background: accent }}
          >
            Done →
          </button>
        )}
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
          aria-label="Back to vocabulary"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface transition-colors hover:border-line-strong"
        >
          ←
        </button>
        <span className="font-head text-sm font-semibold">{title}</span>
        <span className="ml-auto text-xs text-ink-secondary">
          {index + 1} / {deck.length}
        </span>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        {selfCheck ? (
          <>
            <div className="flex h-44 w-full max-w-sm items-center justify-center rounded-card border border-line bg-surface">
              <span className="px-4 text-center font-head text-5xl font-bold">{card.front}</span>
            </div>
            <p className="text-sm text-ink-secondary">Read it aloud — did you know it instantly?</p>
            <div className="flex gap-3">
              <button
                onClick={() => mark(true)}
                className="rounded-btn bg-teal px-6 py-3 font-head font-semibold text-white transition-transform active:scale-95"
              >
                I read it! ✓
              </button>
              <button
                onClick={() => mark(false)}
                className="rounded-btn bg-coral px-6 py-3 font-head font-semibold text-white transition-transform active:scale-95"
              >
                Still learning 🔁
              </button>
            </div>
          </>
        ) : (
          <>
            <button onClick={() => setFlipped((f) => !f)} className="h-56 w-full max-w-sm [perspective:900px]">
              <div
                className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]"
                style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
              >
                <div className="absolute inset-0 flex items-center justify-center rounded-card border border-line bg-surface p-4 [backface-visibility:hidden]">
                  <span className="text-center font-head text-3xl font-bold">{card.front}</span>
                </div>
                <div
                  className="absolute inset-0 flex items-center justify-center rounded-card border bg-surface-2 p-5 [backface-visibility:hidden] [transform:rotateY(180deg)]"
                  style={{ borderColor: accent }}
                >
                  <span className="text-center text-sm text-ink-secondary">{card.back}</span>
                </div>
              </div>
            </button>
            <p className="text-xs text-ink-muted">tap the card to flip</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setFlipped(false);
                  setIndex((i) => Math.max(0, i - 1));
                }}
                disabled={index === 0}
                className="rounded-btn border border-line bg-surface px-5 py-2.5 text-sm disabled:opacity-40"
              >
                ← Back
              </button>
              <button
                onClick={advance}
                className="rounded-btn px-6 py-2.5 font-head text-sm font-semibold text-white"
                style={{ background: accent }}
              >
                {index === deck.length - 1 ? "Finish →" : "Next →"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
