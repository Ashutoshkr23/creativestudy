import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { listChapters } from "@/content";
import { getProgressForStudent } from "@/lib/queries";
import { isDbConfigured } from "@/lib/supabase";
import { earnedBadges } from "@/lib/gamify";
import { LogoutButton } from "@/components/LogoutButton";

export default async function StudentHome() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "teacher") redirect("/teacher");

  const progress =
    session.role === "student" && session.studentId && isDbConfigured()
      ? await getProgressForStudent(session.studentId)
      : [];
  const totalXp = progress.reduce((sum, p) => sum + p.xp, 0);
  const bestStreak = progress.reduce((max, p) => Math.max(max, p.current_streak), 0);
  const bestQuiz = progress.reduce<number | null>(
    (max, p) => (p.best_quiz_score !== null ? Math.max(max ?? 0, p.best_quiz_score) : max),
    null
  );
  const badges = earnedBadges({ xp: totalXp, currentStreak: bestStreak, bestQuizScore: bestQuiz });
  const chapters = listChapters();
  const progressBySlug = new Map(progress.map((p) => [p.chapter_slug, p]));

  return (
    <main className="mx-auto min-h-dvh w-full max-w-2xl px-5 py-6">
      <header className="mb-8 flex items-center gap-3">
        <h1 className="font-head text-2xl font-bold">
          learn<span className="text-primary">.</span>
        </h1>
        <span className="text-sm text-ink-secondary">Hi, {session.displayName}! 👋</span>
        <div className="ml-auto">
          <LogoutButton />
        </div>
      </header>

      <section className="mb-8 grid grid-cols-2 gap-3">
        <div className="rounded-card border border-line bg-surface p-4">
          <div className="font-head text-3xl font-bold text-amber">⭐ {totalXp}</div>
          <div className="mt-1 text-xs text-ink-secondary">XP earned</div>
        </div>
        <div className="rounded-card border border-line bg-surface p-4">
          <div className="font-head text-3xl font-bold text-coral">🔥 {bestStreak}</div>
          <div className="mt-1 text-xs text-ink-secondary">day streak</div>
        </div>
      </section>

      {badges.length > 0 && (
        <section className="mb-8 flex flex-wrap gap-2">
          {badges.map((b) => (
            <span
              key={b.id}
              className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs text-ink-secondary"
            >
              {b.emoji} {b.name}
            </span>
          ))}
        </section>
      )}

      <div className="mb-8 flex flex-col gap-3">
        <Link
          href="/app/practice"
          className="group flex items-center gap-3 rounded-card border border-primary/40 bg-primary/10 p-4 transition-all hover:-translate-y-0.5 hover:border-primary"
        >
          <span className="text-3xl">🎯</span>
          <div className="min-w-0">
            <div className="font-head font-semibold">Practice Arena</div>
            <div className="text-xs text-ink-secondary">
              Build your own quiz — any chapter, your pace, +10 XP per correct answer.
            </div>
          </div>
          <span className="ml-auto shrink-0 text-ink-muted transition-transform group-hover:translate-x-1">→</span>
        </Link>
        <Link
          href="/app/vocab"
          className="group flex items-center gap-3 rounded-card border border-teal/40 bg-teal/10 p-4 transition-all hover:-translate-y-0.5 hover:border-teal"
        >
          <span className="text-3xl">🔤</span>
          <div className="min-w-0">
            <div className="font-head font-semibold">Vocabulary</div>
            <div className="text-xs text-ink-secondary">
              Chapter words and sight words — flashcards, quizzes and the missing-letter game.
            </div>
          </div>
          <span className="ml-auto shrink-0 text-ink-muted transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>

      <h2 className="mb-4 font-head text-lg">Your chapters</h2>
      <div className="flex flex-col gap-3">
        {chapters.map((chapter) => {
          const p = progressBySlug.get(chapter.slug);
          return (
            <Link
              key={chapter.slug}
              href={`/app/chapter/${chapter.slug}`}
              className="group rounded-card border border-line bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-line-strong"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{chapter.emoji}</span>
                <div className="min-w-0">
                  <div className="font-head font-semibold">{chapter.title}</div>
                  <div className="truncate text-xs text-ink-secondary">{chapter.description}</div>
                </div>
                <span className="ml-auto shrink-0 text-ink-muted transition-transform group-hover:translate-x-1">
                  →
                </span>
              </div>
              {p && (
                <div className="mt-3 flex gap-4 text-xs text-ink-secondary">
                  <span>⭐ {p.xp} XP</span>
                  {p.best_quiz_score !== null && <span>🏆 best {p.best_quiz_score}%</span>}
                  {p.completed_at && <span className="text-teal">✓ completed</span>}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {!isDbConfigured() && (
        <p className="mt-8 rounded-card border border-amber/30 bg-amber/10 p-4 text-xs text-ink-secondary">
          ⚠️ Practice works, but progress isn&apos;t being saved yet — the database is not set up.
        </p>
      )}
    </main>
  );
}
