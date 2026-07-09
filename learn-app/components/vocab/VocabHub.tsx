"use client";

import { useState } from "react";
import Link from "next/link";
import { getChapterVocab } from "@/content";
import { getSightLevel } from "@/content/sight-words";
import { getQuestionBank } from "@/lib/question-bank";
import { PracticeRunner } from "@/components/practice/PracticeRunner";
import { Flashcards } from "./Flashcards";
import { MissingLetter } from "./MissingLetter";

// Vocabulary home: chapter word decks (flashcards + meaning quiz) and graded
// sight-word levels (flashcards with self-check + missing-letter game).

type ChapterDeck = { slug: string; title: string; emoji: string; color: string; wordCount: number };
type SightLevelInfo = { id: string; name: string; emoji: string; wordCount: number };

type View =
  | { kind: "hub" }
  | { kind: "flash-chapter"; slug: string }
  | { kind: "quiz-chapter"; slug: string }
  | { kind: "flash-sight"; levelId: string }
  | { kind: "letters-sight"; levelId: string };

export function VocabHub({ chapterDecks, sightLevels }: { chapterDecks: ChapterDeck[]; sightLevels: SightLevelInfo[] }) {
  const [view, setView] = useState<View>({ kind: "hub" });
  const exit = () => setView({ kind: "hub" });

  if (view.kind === "flash-chapter") {
    const deck = chapterDecks.find((d) => d.slug === view.slug)!;
    return (
      <Flashcards
        title={`${deck.emoji} ${deck.title}`}
        accent={deck.color}
        cards={getChapterVocab(view.slug).map((w) => ({ front: w.word, back: w.meaning }))}
        onExit={exit}
      />
    );
  }
  if (view.kind === "quiz-chapter") {
    const deck = chapterDecks.find((d) => d.slug === view.slug)!;
    const questions = getQuestionBank(view.slug).filter((q) => q.questionId.startsWith("gen-vocab"));
    return (
      <PracticeRunner
        questions={questions}
        accent={deck.color}
        title={`🔤 ${deck.title} — word quiz`}
        onExit={exit}
      />
    );
  }
  if (view.kind === "flash-sight") {
    const level = getSightLevel(view.levelId)!;
    return (
      <Flashcards
        title={`${level.emoji} ${level.name}`}
        accent="#1db88a"
        cards={level.words.map((w) => ({ front: w }))}
        selfCheck={{ levelId: level.id }}
        onExit={exit}
      />
    );
  }
  if (view.kind === "letters-sight") {
    const level = getSightLevel(view.levelId)!;
    return <MissingLetter level={level} accent="#6c63ff" onExit={exit} />;
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-2xl px-5 py-6">
      <header className="mb-8 flex items-center gap-3">
        <Link
          href="/app"
          aria-label="Back to home"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface transition-colors hover:border-line-strong"
        >
          ←
        </Link>
        <h1 className="font-head text-2xl font-bold">🔤 Vocabulary</h1>
      </header>

      <h2 className="mb-3 font-head text-lg">📚 Chapter words</h2>
      {chapterDecks.length === 0 ? (
        <p className="mb-8 rounded-card border border-line bg-surface p-4 text-sm text-ink-secondary">
          No chapter word decks yet — they appear as chapters are added.
        </p>
      ) : (
        <div className="mb-8 flex flex-col gap-3">
          {chapterDecks.map((deck) => (
            <div key={deck.slug} className="rounded-card border border-line bg-surface p-4">
              <div className="mb-3 flex items-center gap-3">
                <span className="text-2xl">{deck.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-head font-semibold">{deck.title}</div>
                  <div className="text-xs text-ink-secondary">{deck.wordCount} words</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setView({ kind: "flash-chapter", slug: deck.slug })}
                  className="rounded-btn border border-line bg-surface-2 px-4 py-2 text-sm transition-colors hover:border-line-strong"
                >
                  🃏 Flashcards
                </button>
                <button
                  onClick={() => setView({ kind: "quiz-chapter", slug: deck.slug })}
                  className="rounded-btn px-4 py-2 text-sm font-semibold text-white"
                  style={{ background: deck.color }}
                >
                  🎯 Meaning quiz
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="mb-1 font-head text-lg">👀 Sight words</h2>
      <p className="mb-3 text-xs text-ink-secondary">
        Words you should recognise instantly, without sounding them out. Start at Level 1 and climb!
      </p>
      <div className="flex flex-col gap-3">
        {sightLevels.map((level) => (
          <div key={level.id} className="rounded-card border border-line bg-surface p-4">
            <div className="mb-3 flex items-center gap-3">
              <span className="text-2xl">{level.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="font-head font-semibold">{level.name}</div>
                <div className="text-xs text-ink-secondary">{level.wordCount} words</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setView({ kind: "flash-sight", levelId: level.id })}
                className="rounded-btn border border-line bg-surface-2 px-4 py-2 text-sm transition-colors hover:border-line-strong"
              >
                ⚡ Flash practice
              </button>
              <button
                onClick={() => setView({ kind: "letters-sight", levelId: level.id })}
                className="rounded-btn bg-primary px-4 py-2 text-sm font-semibold text-white"
              >
                🔍 Missing letter
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
