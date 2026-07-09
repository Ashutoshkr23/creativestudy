import Link from "next/link";
import { listChapters, getChapter } from "@/content";
import { getQuestionLabel } from "@/lib/question-bank";
import { getChapterDashboard, getRecentAttemptsAllStudents } from "@/lib/queries";
import { isDbConfigured } from "@/lib/supabase";
import { mostImproved } from "@/lib/review";
import { todayString } from "@/lib/gamify";

export default async function TeacherDashboard({
  searchParams,
}: {
  searchParams: Promise<{ chapter?: string }>;
}) {
  const { chapter: chapterParam } = await searchParams;
  const chapters = listChapters();
  const chapter = getChapter(chapterParam ?? "") ?? chapters[0];
  const dbReady = isDbConfigured();
  const { rows, mostMissed } = dbReady
    ? await getChapterDashboard(chapter.slug)
    : { rows: [], mostMissed: [] };

  // Most-improved: single positive callout (self-comparison, never a leaderboard).
  let improvedName: string | null = null;
  let improvedStats: { pct: number; delta: number } | null = null;
  if (dbReady) {
    const since = new Date(Date.now() - 15 * 86_400_000).toISOString();
    const winner = mostImproved(await getRecentAttemptsAllStudents(since), todayString());
    if (winner) {
      const student = rows.find((r) => r.student.id === winner.student_id)?.student;
      if (student) {
        improvedName = student.display_name;
        improvedStats = { pct: winner.pct, delta: winner.delta };
      }
    }
  }

  return (
    <main>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <h2 className="mr-2 font-head text-lg">Chapter:</h2>
        {chapters.map((c) => (
          <Link
            key={c.slug}
            href={`/teacher?chapter=${c.slug}`}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              c.slug === chapter.slug
                ? "border-primary bg-primary/15 text-ink"
                : "border-line bg-surface text-ink-secondary hover:border-line-strong"
            }`}
          >
            {c.emoji} {c.title}
          </Link>
        ))}
        <Link
          href={`/app/chapter/${chapter.slug}`}
          target="_blank"
          className="ml-auto rounded-btn border border-line bg-surface px-4 py-1.5 text-sm text-ink-secondary transition-colors hover:border-line-strong hover:text-ink"
        >
          ▶ Teach this chapter
        </Link>
      </div>

      {improvedName && improvedStats && (
        <p className="mb-6 rounded-card border border-teal/40 bg-teal/10 px-4 py-3 text-sm text-teal">
          🌟 Most improved this week: <b>{improvedName}</b>
          {` — ${improvedStats.pct}% correct, up ${improvedStats.delta} points on last week.`}
        </p>
      )}

      {!dbReady ? (
        <div className="rounded-card border border-amber/30 bg-amber/10 p-6 text-sm text-ink-secondary">
          ⚠️ The database is not set up yet, so there is nothing to show. Follow the Supabase steps
          in <code className="text-ink">learn-app/README.md</code>, fill in{" "}
          <code className="text-ink">.env.local</code>, and restart the server.
        </div>
      ) : (
        <>
          <section className="mb-8 overflow-x-auto rounded-card border border-line bg-surface">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-secondary">
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Practised?</th>
                  <th className="px-4 py-3">Last practised</th>
                  <th className="px-4 py-3">Quiz best</th>
                  <th className="px-4 py-3">XP</th>
                  <th className="px-4 py-3">Streak</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-ink-secondary">
                      No students yet —{" "}
                      <Link href="/teacher/students" className="text-primary underline">
                        add your first student
                      </Link>
                      .
                    </td>
                  </tr>
                )}
                {rows.map(({ student, progress }) => (
                  <tr key={student.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-medium">{student.display_name}</div>
                      <div className="text-xs text-ink-muted">@{student.username}</div>
                    </td>
                    <td className="px-4 py-3">
                      {progress ? (
                        <span className="text-teal">✓ yes</span>
                      ) : (
                        <span className="text-coral">✗ not yet</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-secondary">
                      {progress?.last_practised_on ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {progress?.best_quiz_score != null ? `${progress.best_quiz_score}%` : "—"}
                    </td>
                    <td className="px-4 py-3">{progress?.xp ?? 0}</td>
                    <td className="px-4 py-3">
                      {progress?.current_streak ? `🔥 ${progress.current_streak}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section>
            <h3 className="mb-3 font-head text-lg">🎯 Most-missed questions</h3>
            {mostMissed.length === 0 ? (
              <p className="rounded-card border border-line bg-surface p-5 text-sm text-ink-secondary">
                No wrong answers recorded yet. Once students practise, the questions they struggle
                with most will appear here — re-teach those first.
              </p>
            ) : (
              <ol className="flex flex-col gap-2">
                {mostMissed.map((q, i) => (
                  <li
                    key={q.question_id}
                    className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 text-sm"
                  >
                    <span className="font-head text-lg font-bold text-coral">#{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      {getQuestionLabel(chapter.slug, q.question_id)}
                    </span>
                    <span className="shrink-0 text-xs text-ink-secondary">
                      {q.wrong_count} wrong / {q.total_count} tries
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </>
      )}
    </main>
  );
}
