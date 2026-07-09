// Spaced repetition on top of the existing attempt history — no extra tables.
// Every question a student answers sits in a Leitner box: consecutive correct
// answers push it to longer intervals, one wrong pulls it back to tomorrow.

export type AttemptRecord = {
  chapter_slug: string;
  question_id: string;
  is_correct: boolean;
  created_at: string;
};

export type DueRef = { chapter_slug: string; question_id: string; overdueDays: number };

/** Days until a question comes back, by box (box = consecutive-correct run, capped). */
export const BOX_INTERVALS_DAYS = [1, 3, 7, 21, 60];

/** Calendar day (YYYY-MM-DD) of a timestamp in the school's timezone. */
export function dayOf(timestamp: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date(timestamp));
}

function daysBetween(fromDay: string, toDay: string): number {
  const from = new Date(`${fromDay}T00:00:00Z`).getTime();
  const to = new Date(`${toDay}T00:00:00Z`).getTime();
  return Math.round((to - from) / 86_400_000);
}

/**
 * Questions due for review today, most-overdue first. History must be in
 * ascending created_at order (as returned by getAttemptHistory).
 */
export function computeDueRefs(history: AttemptRecord[], today: string): DueRef[] {
  const state = new Map<string, { chapter_slug: string; question_id: string; run: number; lastDay: string }>();
  for (const a of history) {
    const key = `${a.chapter_slug}|${a.question_id}`;
    const prev = state.get(key);
    state.set(key, {
      chapter_slug: a.chapter_slug,
      question_id: a.question_id,
      run: a.is_correct ? (prev?.run ?? 0) + 1 : 0,
      lastDay: dayOf(a.created_at),
    });
  }
  const due: DueRef[] = [];
  for (const s of state.values()) {
    const interval = BOX_INTERVALS_DAYS[Math.min(s.run, BOX_INTERVALS_DAYS.length - 1)];
    const elapsed = daysBetween(s.lastDay, today);
    if (elapsed >= interval) {
      due.push({ chapter_slug: s.chapter_slug, question_id: s.question_id, overdueDays: elapsed - interval });
    }
  }
  return due.sort((a, b) => b.overdueDays - a.overdueDays);
}

export type WeekStats = { count: number; correct: number; pct: number };
export type Improvement = { thisWeek: WeekStats; lastWeek: WeekStats; delta: number };

function weekStats(records: { is_correct: boolean }[]): WeekStats {
  const count = records.length;
  const correct = records.filter((r) => r.is_correct).length;
  return { count, correct, pct: count === 0 ? 0 : Math.round((correct / count) * 100) };
}

/** This week (days 0–6 back) vs last week (7–13 back), by IST calendar day. */
export function weeklyImprovement(
  history: { is_correct: boolean; created_at: string }[],
  today: string
): Improvement {
  const thisWeek: { is_correct: boolean }[] = [];
  const lastWeek: { is_correct: boolean }[] = [];
  for (const a of history) {
    const age = daysBetween(dayOf(a.created_at), today);
    if (age >= 0 && age <= 6) thisWeek.push(a);
    else if (age >= 7 && age <= 13) lastWeek.push(a);
  }
  const t = weekStats(thisWeek);
  const l = weekStats(lastWeek);
  return { thisWeek: t, lastWeek: l, delta: t.pct - l.pct };
}

/**
 * The single most-improved student this week (teacher recognition, not a
 * leaderboard): biggest accuracy gain with at least `minAttempts` in each week.
 */
export function mostImproved(
  records: { student_id: string; is_correct: boolean; created_at: string }[],
  today: string,
  minAttempts = 10
): { student_id: string; pct: number; delta: number } | null {
  const byStudent = new Map<string, { is_correct: boolean; created_at: string }[]>();
  for (const r of records) {
    if (!byStudent.has(r.student_id)) byStudent.set(r.student_id, []);
    byStudent.get(r.student_id)!.push(r);
  }
  let best: { student_id: string; pct: number; delta: number } | null = null;
  for (const [student_id, history] of byStudent) {
    const imp = weeklyImprovement(history, today);
    if (imp.thisWeek.count < minAttempts || imp.lastWeek.count < minAttempts) continue;
    if (imp.delta <= 0) continue;
    if (!best || imp.delta > best.delta) {
      best = { student_id, pct: imp.thisWeek.pct, delta: imp.delta };
    }
  }
  return best;
}
