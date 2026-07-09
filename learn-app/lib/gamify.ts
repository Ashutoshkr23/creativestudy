// Personal gamification only: XP, streaks, badges. No leaderboards, no timers.

export const XP_PER_CORRECT = 10;
export const XP_QUIZ_QUESTION = 15;

/**
 * Daily practice streak. Dates are "YYYY-MM-DD" strings in the student's day —
 * same day keeps the streak, consecutive days grow it, a gap resets to 1.
 */
export function nextStreak(lastPractisedOn: string | null, today: string, currentStreak: number): number {
  if (!lastPractisedOn) return 1;
  if (lastPractisedOn === today) return Math.max(currentStreak, 1);
  const last = new Date(`${lastPractisedOn}T00:00:00Z`).getTime();
  const now = new Date(`${today}T00:00:00Z`).getTime();
  const dayDiff = Math.round((now - last) / 86_400_000);
  return dayDiff === 1 ? currentStreak + 1 : 1;
}

export function todayString(): string {
  // Indian Standard Time — the school's day, not the server's.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}

export type Badge = { id: string; emoji: string; name: string; check: (stats: BadgeStats) => boolean };
export type BadgeStats = { xp: number; currentStreak: number; bestQuizScore: number | null };

export const BADGES: Badge[] = [
  { id: "first-steps", emoji: "🌱", name: "First Steps", check: (s) => s.xp > 0 },
  { id: "on-a-roll", emoji: "🔥", name: "On a Roll", check: (s) => s.currentStreak >= 3 },
  { id: "week-warrior", emoji: "🗓️", name: "Week Warrior", check: (s) => s.currentStreak >= 7 },
  { id: "quiz-ace", emoji: "🏆", name: "Quiz Ace", check: (s) => (s.bestQuizScore ?? 0) >= 80 },
  { id: "scholar", emoji: "🎓", name: "Scholar", check: (s) => s.xp >= 500 },
];

export function earnedBadges(stats: BadgeStats): Badge[] {
  return BADGES.filter((b) => b.check(stats));
}
