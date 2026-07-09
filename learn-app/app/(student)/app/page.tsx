import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { listChapters } from "@/content";
import { getProgressForStudent, getAttemptHistory } from "@/lib/queries";
import { isDbConfigured } from "@/lib/supabase";
import { earnedBadges, BADGES, todayString } from "@/lib/gamify";
import { computeDueRefs, weeklyImprovement } from "@/lib/review";
import { resolveQuestions } from "@/lib/question-bank";
import { LogoutButton } from "@/components/LogoutButton";

export default async function StudentHome() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "teacher") redirect("/teacher");

  const dbReady = isDbConfigured();
  const [progress, history] =
    session.studentId && dbReady
      ? await Promise.all([getProgressForStudent(session.studentId), getAttemptHistory(session.studentId)])
      : [[], []];

  const totalXp = progress.reduce((sum, p) => sum + p.xp, 0);
  const bestStreak = progress.reduce((max, p) => Math.max(max, p.current_streak), 0);
  const bestQuiz = progress.reduce<number | null>(
    (max, p) => (p.best_quiz_score !== null ? Math.max(max ?? 0, p.best_quiz_score) : max),
    null
  );
  const trophyTotal = listChapters().filter((c) => c.trophy).length + BADGES.length;
  const trophyCount =
    progress.filter((p) => p.completed_at && listChapters().some((c) => c.slug === p.chapter_slug && c.trophy)).length +
    earnedBadges({ xp: totalXp, currentStreak: bestStreak, bestQuizScore: bestQuiz }).length;

  const today = todayString();
  const dueCount = resolveQuestions(
    computeDueRefs(history, today).map((r) => ({ chapter_slug: r.chapter_slug, question_id: r.question_id }))
  ).length;
  const improvement = weeklyImprovement(history, today);
  const showImprovement = improvement.thisWeek.count >= 5 && improvement.lastWeek.count >= 5 && improvement.delta > 0;

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

      <section className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-card border border-line bg-surface p-4">
          <div className="font-head text-3xl font-bold text-amber">⭐ {totalXp}</div>
          <div className="mt-1 text-xs text-ink-secondary">XP earned</div>
        </div>
        <div className="rounded-card border border-line bg-surface p-4">
          <div className="font-head text-3xl font-bold text-coral">🔥 {bestStreak}</div>
          <div className="mt-1 text-xs text-ink-secondary">day streak</div>
        </div>
      </section>

      {showImprovement && (
        <p className="mb-4 rounded-card border border-teal/40 bg-teal/10 px-4 py-3 text-sm text-teal">
          {`📈 ${improvement.thisWeek.pct}% correct this week — up ${improvement.delta} points on last week. You're getting stronger!`}
        </p>
      )}

      <div className="mb-8 flex flex-col gap-3">
        {dbReady && session.role === "student" && (
          <Link
            href="/app/review"
            className="group flex items-center gap-3 rounded-card border border-amber/40 bg-amber/10 p-4 transition-all hover:-translate-y-0.5 hover:border-amber"
          >
            <span className="text-3xl">📅</span>
            <div className="min-w-0">
              <div className="font-head font-semibold">Today&apos;s Review</div>
              <div className="text-xs text-ink-secondary">
                {dueCount > 0
                  ? `${dueCount} question${dueCount === 1 ? "" : "s"} ready to review — keep them fresh!`
                  : "All caught up — nothing due today. 🌙"}
              </div>
            </div>
            {dueCount > 0 && (
              <span className="ml-auto shrink-0 rounded-full bg-amber px-2.5 py-1 font-head text-xs font-bold text-black">
                {dueCount}
              </span>
            )}
          </Link>
        )}
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
        <Link
          href="/app/lab"
          className="group flex items-center gap-3 rounded-card border border-line bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-line-strong"
        >
          <span className="text-3xl">🏛️</span>
          <div className="min-w-0">
            <div className="font-head font-semibold">My Lab</div>
            <div className="text-xs text-ink-secondary">Your trophy room — everything you&apos;ve mastered lives here.</div>
          </div>
          <span className="ml-auto shrink-0 rounded-full border border-line bg-surface-2 px-2.5 py-1 text-xs text-ink-secondary">
            {trophyCount} / {trophyTotal}
          </span>
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

      {!dbReady && (
        <p className="mt-8 rounded-card border border-amber/30 bg-amber/10 p-4 text-xs text-ink-secondary">
          ⚠️ Practice works, but progress isn&apos;t being saved yet — the database is not set up.
        </p>
      )}
    </main>
  );
}
