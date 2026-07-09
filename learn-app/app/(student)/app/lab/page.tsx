import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { listChapters } from "@/content";
import { getProgressForStudent } from "@/lib/queries";
import { isDbConfigured } from "@/lib/supabase";
import { BADGES, earnedBadges } from "@/lib/gamify";

// My Lab: the student's permanent trophy room. Chapter trophies unlock on
// completion; badge trophies come from the existing gamify checks.

const BADGE_HINTS: Record<string, string> = {
  "first-steps": "Earn your very first XP",
  "on-a-roll": "Practise 3 days in a row",
  "week-warrior": "Practise 7 days in a row",
  "quiz-ace": "Score 80%+ on any boss quiz",
  scholar: "Earn 500 XP in total",
};

export default async function LabPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "teacher") redirect("/teacher");

  const progress =
    session.studentId && isDbConfigured() ? await getProgressForStudent(session.studentId) : [];
  const totalXp = progress.reduce((sum, p) => sum + p.xp, 0);
  const bestStreak = progress.reduce((max, p) => Math.max(max, p.current_streak), 0);
  const bestQuiz = progress.reduce<number | null>(
    (max, p) => (p.best_quiz_score !== null ? Math.max(max ?? 0, p.best_quiz_score) : max),
    null
  );
  const earnedBadgeIds = new Set(
    earnedBadges({ xp: totalXp, currentStreak: bestStreak, bestQuizScore: bestQuiz }).map((b) => b.id)
  );
  const completedSlugs = new Set(progress.filter((p) => p.completed_at).map((p) => p.chapter_slug));

  const trophies = [
    ...listChapters()
      .filter((c) => c.trophy)
      .map((c) => ({
        key: `chapter-${c.slug}`,
        emoji: c.trophy!.emoji,
        name: c.trophy!.name,
        caption: c.trophy!.caption,
        hint: `Complete "${c.title}"`,
        earned: completedSlugs.has(c.slug),
      })),
    ...BADGES.map((b) => ({
      key: `badge-${b.id}`,
      emoji: b.emoji,
      name: b.name,
      caption: BADGE_HINTS[b.id] ?? "",
      hint: BADGE_HINTS[b.id] ?? "Keep practising!",
      earned: earnedBadgeIds.has(b.id),
    })),
  ];
  const earnedCount = trophies.filter((t) => t.earned).length;

  return (
    <main className="mx-auto min-h-dvh w-full max-w-2xl px-5 py-6">
      <header className="mb-2 flex items-center gap-3">
        <Link
          href="/app"
          aria-label="Back to home"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface transition-colors hover:border-line-strong"
        >
          ←
        </Link>
        <h1 className="font-head text-2xl font-bold">🏛️ My Lab</h1>
        <span className="ml-auto rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs text-ink-secondary">
          {earnedCount} / {trophies.length} trophies
        </span>
      </header>
      <p className="mb-6 text-sm text-ink-secondary">
        Everything you master leaves something behind on these shelves. Fill them all!
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {trophies.map((t) => (
          <div
            key={t.key}
            className={`flex flex-col items-center gap-1.5 rounded-card border p-4 text-center ${
              t.earned ? "border-amber/50 bg-amber/10" : "border-line bg-surface opacity-80"
            }`}
          >
            <span className={`text-4xl ${t.earned ? "" : "opacity-30 grayscale"}`}>
              {t.earned ? t.emoji : "🔒"}
            </span>
            <span className={`font-head text-sm font-semibold ${t.earned ? "" : "text-ink-muted"}`}>
              {t.earned ? t.name : "???"}
            </span>
            <span className="text-[11px] text-ink-secondary">{t.earned ? t.caption : t.hint}</span>
          </div>
        ))}
      </div>

      {!isDbConfigured() && (
        <p className="mt-8 rounded-card border border-amber/30 bg-amber/10 p-4 text-xs text-ink-secondary">
          ⚠️ Trophies can&apos;t be tracked until the database is set up.
        </p>
      )}
    </main>
  );
}
