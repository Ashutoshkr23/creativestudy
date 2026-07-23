"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { QuestionType } from "@/content/types";
import { getQuestionBank, resolveQuestions, type PracticeQuestion } from "@/lib/question-bank";
import { PracticeRunner } from "./PracticeRunner";

// Student-customised practice: pick a chapter (grouped by subject), choose which
// question types to include (MCQ / True-False / Fill-in-the-blanks), and a size.
// "My Mistakes" re-practises every question whose latest attempt was wrong.

type ChapterInfo = {
  slug: string;
  title: string;
  emoji: string;
  color: string;
  subject: string;
  typeCounts: Record<QuestionType, number>;
};
type MistakeRef = { chapter_slug: string; question_id: string };

const COUNTS = [5, 10, 15];

const TYPE_META: { id: QuestionType; label: string; icon: string }[] = [
  { id: "mcq", label: "Multiple choice", icon: "🔘" },
  { id: "true-false", label: "True / False", icon: "⚖️" },
  { id: "fill-blank", label: "Fill in the blanks", icon: "✍️" },
];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function PracticeArena({ chapters, mistakes }: { chapters: ChapterInfo[]; mistakes: MistakeRef[] }) {
  const [chapterSlug, setChapterSlug] = useState(chapters[chapters.length - 1]?.slug ?? "");
  const [count, setCount] = useState(10);
  const [types, setTypes] = useState<Set<QuestionType>>(new Set<QuestionType>(["mcq", "true-false", "fill-blank"]));
  const [session, setSession] = useState<{ questions: PracticeQuestion[]; accent: string; title: string } | null>(null);

  const chapter = chapters.find((c) => c.slug === chapterSlug);
  const mistakeCount = resolveQuestions(mistakes).length;

  // Group chapters by subject (demo/tutorial last).
  const subjects = useMemo(() => {
    const map = new Map<string, ChapterInfo[]>();
    for (const c of chapters) {
      const key = c.subject === "Demo" ? "Tutorial" : c.subject;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    }
    return [...map.entries()].sort((a, b) =>
      a[0] === "Tutorial" ? 1 : b[0] === "Tutorial" ? -1 : a[0].localeCompare(b[0])
    );
  }, [chapters]);

  // How many questions the current chapter + selected types provide.
  const availableCount = chapter
    ? [...types].reduce((sum, t) => sum + (chapter.typeCounts[t] ?? 0), 0)
    : 0;

  const toggleType = (t: QuestionType) => {
    setTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) {
        if (next.size > 1) next.delete(t); // never allow zero types
      } else {
        next.add(t);
      }
      return next;
    });
  };

  const startChapterPractice = () => {
    if (!chapter) return;
    const pool = getQuestionBank(chapter.slug).filter((q) => types.has(q.qtype));
    const questions = shuffle(pool).slice(0, count);
    if (questions.length === 0) return;
    setSession({ questions, accent: chapter.color, title: `${chapter.emoji} ${chapter.title}` });
  };

  const startMistakesPractice = () => {
    const questions = shuffle(resolveQuestions(mistakes)).slice(0, 15);
    if (questions.length === 0) return;
    setSession({ questions, accent: "#ef9f27", title: "📒 My Mistakes" });
  };

  if (session) {
    return (
      <PracticeRunner
        questions={session.questions}
        accent={session.accent}
        title={session.title}
        onExit={() => setSession(null)}
      />
    );
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
        <h1 className="font-head text-2xl font-bold">🎯 Practice Arena</h1>
      </header>

      <section className="mb-6 rounded-card border border-line bg-surface p-5">
        <h2 className="mb-3 font-head text-lg">1 · Pick a chapter</h2>
        <div className="flex flex-col gap-4">
          {subjects.map(([subject, subjectChapters]) => (
            <div key={subject}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-ink-secondary">{subject}</h3>
              <div className="flex flex-col gap-2">
                {subjectChapters.map((c) => {
                  const total = c.typeCounts.mcq + c.typeCounts["true-false"] + c.typeCounts["fill-blank"];
                  return (
                    <button
                      key={c.slug}
                      onClick={() => setChapterSlug(c.slug)}
                      className={`flex items-center gap-3 rounded-btn border px-4 py-3 text-left text-sm transition-colors ${
                        chapterSlug === c.slug ? "bg-surface-2" : "border-line bg-surface hover:border-line-strong"
                      }`}
                      style={chapterSlug === c.slug ? { borderColor: c.color } : undefined}
                    >
                      <span className="text-xl">{c.emoji}</span>
                      <span className="min-w-0 flex-1 font-medium">{c.title}</span>
                      <span className="shrink-0 text-xs text-ink-muted">{total} questions</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-6 rounded-card border border-line bg-surface p-5">
        <h2 className="mb-1 font-head text-lg">2 · Question types</h2>
        <p className="mb-3 text-xs text-ink-secondary">Pick one or more. Tap to toggle.</p>
        <div className="flex flex-col gap-2">
          {TYPE_META.map((t) => {
            const n = chapter?.typeCounts[t.id] ?? 0;
            const on = types.has(t.id);
            const disabled = n === 0;
            return (
              <button
                key={t.id}
                onClick={() => !disabled && toggleType(t.id)}
                disabled={disabled}
                className={`flex items-center gap-3 rounded-btn border px-4 py-2.5 text-left text-sm transition-colors ${
                  disabled
                    ? "border-line bg-surface opacity-40"
                    : on
                      ? "border-primary bg-primary/15 text-ink"
                      : "border-line bg-surface text-ink-secondary hover:border-line-strong"
                }`}
              >
                <span>{t.icon}</span>
                <span className="flex-1 font-medium">{t.label}</span>
                <span className="text-xs text-ink-muted">{n}</span>
                <span className="w-4 text-right">{!disabled && on ? "✓" : ""}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mb-6 rounded-card border border-line bg-surface p-5">
        <h2 className="mb-3 font-head text-lg">3 · How many questions?</h2>
        <div className="flex gap-2">
          {COUNTS.map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={`rounded-btn border px-6 py-2.5 font-head font-semibold transition-colors ${
                count === n ? "border-primary bg-primary/15 text-ink" : "border-line bg-surface text-ink-secondary"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </section>

      <button
        onClick={startChapterPractice}
        disabled={!chapter || availableCount === 0}
        className="w-full rounded-btn bg-primary py-3.5 font-head text-base font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-40"
      >
        {availableCount === 0 ? "No questions for these types" : `Start practising (${Math.min(count, availableCount)}) →`}
      </button>

      <section className="mt-8 rounded-card border border-amber/30 bg-amber/10 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="font-head text-lg">📒 My Mistakes</h2>
            <p className="text-xs text-ink-secondary">
              {mistakeCount === 0
                ? "No unfixed mistakes — every question you got wrong, you've since answered correctly. 🎉"
                : `${mistakeCount} question${mistakeCount === 1 ? "" : "s"} you got wrong and haven't fixed yet. Beat them!`}
            </p>
          </div>
          {mistakeCount > 0 && (
            <button
              onClick={startMistakesPractice}
              className="rounded-btn bg-amber px-5 py-2.5 font-head text-sm font-bold text-black"
            >
              Fix my mistakes →
            </button>
          )}
        </div>
      </section>

      <p className="mt-6 text-center text-xs text-ink-muted">
        Every correct answer earns +10 XP and keeps your streak alive. No timers — take your time. 🧘
      </p>
    </main>
  );
}
