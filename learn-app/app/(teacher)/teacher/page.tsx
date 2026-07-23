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
  const dbReady = isDbConfigured();

  // Most-improved: single positive callout (self-comparison, never a leaderboard).
  let improvedName: string | null = null;
  let improvedStats: { pct: number; delta: number } | null = null;
  if (dbReady) {
    const since = new Date(Date.now() - 15 * 86_400_000).toISOString();
    const attempts = await getRecentAttemptsAllStudents(since);
    const winner = mostImproved(attempts, todayString());
    if (winner) {
      const { rows } = await getChapterDashboard(chapters[0].slug);
      const student = rows.find((r) => r.student.id === winner.student_id)?.student;
      if (student) {
        improvedName = student.display_name;
        improvedStats = { pct: winner.pct, delta: winner.delta };
      }
    }
  }

  const selectedChapter = chapterParam ? getChapter(chapterParam) : undefined;

  // ————————————————————— SUBJECT-GROUPED CHAPTER LIST (landing) —————————————————————
  if (!selectedChapter) {
    // Group by subject; keep the demo chapter last.
    const bySubject = new Map<string, typeof chapters>();
    for (const c of chapters) {
      const key = c.subject === "Demo" ? "Tutorial" : c.subject;
      if (!bySubject.has(key)) bySubject.set(key, []);
      bySubject.get(key)!.push(c);
    }
    const subjects = [...bySubject.keys()].sort((a, b) =>
      a === "Tutorial" ? 1 : b === "Tutorial" ? -1 : a.localeCompare(b)
    );

    return (
      <main>
        {improvedName && improvedStats && (
          <p className="mb-6 rounded-card border border-teal/40 bg-teal/10 px-4 py-3 text-sm text-teal">
            🌟 Most improved this week: <b>{improvedName}</b>
            {` — ${improvedStats.pct}% correct, up ${improvedStats.delta} points on last week.`}
          </p>
        )}

        <h2 className="mb-1 font-head text-lg">Your chapters</h2>
        <p className="mb-6 text-sm text-ink-secondary">
          Pick a chapter to see who&apos;s practised it and the questions your class misses most.
        </p>

        {!dbReady && (
          <div className="mb-6 rounded-card border border-amber/30 bg-amber/10 p-5 text-sm text-ink-secondary">
            ⚠️ The database is not set up yet. Follow the Supabase steps in{" "}
            <code className="text-ink">learn-app/README.md</code> and fill in{" "}
            <code className="text-ink">.env.local</code> to start seeing student progress.
          </div>
        )}

        <div className="flex flex-col gap-6">
          {subjects.map((subject) => (
            <section key={subject}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-ink-secondary">
                {subject}
              </h3>
              <div className="flex flex-col gap-2.5">
                {bySubject.get(subject)!.map((c) => (
                  <div
                    key={c.slug}
                    className="flex items-center gap-3 rounded-card border border-line bg-surface p-4"
                  >
                    <Link href={`/teacher?chapter=${c.slug}`} className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="text-2xl">{c.emoji}</span>
                      <div className="min-w-0">
                        <div className="font-head font-semibold">{c.title}</div>
                        <div className="truncate text-xs text-ink-secondary">{c.description}</div>
                      </div>
                    </Link>
                    <Link
                      href={`/app/chapter/${c.slug}`}
                      target="_blank"
                      className="shrink-0 rounded-btn border border-line bg-surface-2 px-3 py-1.5 text-xs text-ink-secondary transition-colors hover:border-line-strong hover:text-ink"
                    >
                      ▶ Teach
                    </Link>
                    <Link
                      href={`/teacher?chapter=${c.slug}`}
                      className="shrink-0 text-ink-muted"
                      aria-label={`Open ${c.title} stats`}
                    >
                      →
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    );
  }

  // ————————————————————— PER-CHAPTER STATS (drill-in) —————————————————————
  const { rows, mostMissed } = dbReady
    ? await getChapterDashboard(selectedChapter.slug)
    : { rows: [], mostMissed: [] };

  return (
    <main>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link
          href="/teacher"
          className="rounded-btn border border-line bg-surface px-3.5 py-1.5 text-sm text-ink-secondary transition-colors hover:border-line-strong hover:text-ink"
        >
          ← All chapters
        </Link>
        <h2 className="font-head text-lg">
          {selectedChapter.emoji} {selectedChapter.title}
        </h2>
        <Link
          href={`/app/chapter/${selectedChapter.slug}`}
          target="_blank"
          className="ml-auto rounded-btn border border-line bg-surface px-4 py-1.5 text-sm text-ink-secondary transition-colors hover:border-line-strong hover:text-ink"
        >
          ▶ Teach this chapter
        </Link>
      </div>

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
                      {getQuestionLabel(selectedChapter.slug, q.question_id)}
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
