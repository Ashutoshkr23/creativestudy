import { getDb } from "./supabase";
import { XP_PER_CORRECT, XP_QUIZ_QUESTION, nextStreak, todayString } from "./gamify";

export type ClassRow = { id: string; name: string; created_at: string };
export type StudentRow = {
  id: string;
  class_id: string;
  username: string;
  display_name: string;
  created_at: string;
};
export type ProgressRow = {
  student_id: string;
  chapter_slug: string;
  last_scene: number;
  completed_at: string | null;
  xp: number;
  best_quiz_score: number | null;
  current_streak: number;
  last_practised_on: string | null;
};

export async function listClasses(): Promise<ClassRow[]> {
  const db = getDb();
  if (!db) return [];
  const { data, error } = await db.from("class").select("*").order("created_at");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createClass(name: string): Promise<ClassRow> {
  const db = getDb();
  if (!db) throw new Error("Database not configured");
  const { data, error } = await db.from("class").insert({ name }).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function listStudents(): Promise<StudentRow[]> {
  const db = getDb();
  if (!db) return [];
  const { data, error } = await db
    .from("student")
    .select("id, class_id, username, display_name, created_at")
    .order("display_name");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createStudent(input: {
  classId: string;
  username: string;
  displayName: string;
  pinHash: string;
}): Promise<StudentRow> {
  const db = getDb();
  if (!db) throw new Error("Database not configured");
  const { data, error } = await db
    .from("student")
    .insert({
      class_id: input.classId,
      username: input.username,
      display_name: input.displayName,
      pin_hash: input.pinHash,
    })
    .select("id, class_id, username, display_name, created_at")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function resetStudentPin(studentId: string, pinHash: string): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Database not configured");
  const { error } = await db.from("student").update({ pin_hash: pinHash }).eq("id", studentId);
  if (error) throw new Error(error.message);
}

export async function getStudentByUsername(
  username: string
): Promise<(StudentRow & { pin_hash: string }) | null> {
  const db = getDb();
  if (!db) return null;
  const { data, error } = await db
    .from("student")
    .select("id, class_id, username, display_name, created_at, pin_hash")
    .eq("username", username)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function recordAttempt(input: {
  studentId: string;
  chapterSlug: string;
  questionId: string;
  isCorrect: boolean;
  chosen: string | null;
}): Promise<void> {
  const db = getDb();
  if (!db) return;
  const { error } = await db.from("attempt").insert({
    student_id: input.studentId,
    chapter_slug: input.chapterSlug,
    question_id: input.questionId,
    is_correct: input.isCorrect,
    chosen: input.chosen,
  });
  if (error) throw new Error(error.message);
}

export async function updateProgress(input: {
  studentId: string;
  chapterSlug: string;
  isCorrect: boolean;
  kind: "book-question" | "quiz";
  lastScene?: number;
  quizScore?: number;
  completed?: boolean;
}): Promise<void> {
  const db = getDb();
  if (!db) return;

  const { data: existing, error: readError } = await db
    .from("chapter_progress")
    .select("*")
    .eq("student_id", input.studentId)
    .eq("chapter_slug", input.chapterSlug)
    .maybeSingle();
  if (readError) throw new Error(readError.message);

  const today = todayString();
  const row = (existing ?? {
    xp: 0,
    best_quiz_score: null,
    current_streak: 0,
    last_practised_on: null,
    last_scene: 0,
    completed_at: null,
  }) as ProgressRow;

  const xpGain = input.isCorrect ? (input.kind === "quiz" ? XP_QUIZ_QUESTION : XP_PER_CORRECT) : 0;
  const update = {
    student_id: input.studentId,
    chapter_slug: input.chapterSlug,
    xp: row.xp + xpGain,
    current_streak: nextStreak(row.last_practised_on, today, row.current_streak),
    last_practised_on: today,
    last_scene: Math.max(row.last_scene, input.lastScene ?? 0),
    best_quiz_score:
      input.quizScore !== undefined
        ? Math.max(row.best_quiz_score ?? 0, input.quizScore)
        : row.best_quiz_score,
    completed_at: input.completed && !row.completed_at ? new Date().toISOString() : row.completed_at,
  };

  const { error } = await db.from("chapter_progress").upsert(update);
  if (error) throw new Error(error.message);
}

export async function getProgressForStudent(studentId: string): Promise<ProgressRow[]> {
  const db = getDb();
  if (!db) return [];
  const { data, error } = await db.from("chapter_progress").select("*").eq("student_id", studentId);
  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * Questions whose LATEST attempt by this student was wrong — their personal
 * re-practice deck. A later correct answer clears the mistake.
 */
export async function getStudentMistakes(
  studentId: string
): Promise<{ chapter_slug: string; question_id: string }[]> {
  const db = getDb();
  if (!db) return [];
  const { data, error } = await db
    .from("attempt")
    .select("chapter_slug, question_id, is_correct, created_at")
    .eq("student_id", studentId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  const latest = new Map<string, { chapter_slug: string; question_id: string; is_correct: boolean }>();
  for (const a of data ?? []) {
    latest.set(`${a.chapter_slug}|${a.question_id}`, a);
  }
  return [...latest.values()]
    .filter((a) => !a.is_correct)
    .map(({ chapter_slug, question_id }) => ({ chapter_slug, question_id }));
}

export type DashboardRow = {
  student: StudentRow;
  progress: ProgressRow | null;
};

export type MissedQuestion = { question_id: string; wrong_count: number; total_count: number };

export async function getChapterDashboard(chapterSlug: string): Promise<{
  rows: DashboardRow[];
  mostMissed: MissedQuestion[];
}> {
  const db = getDb();
  if (!db) return { rows: [], mostMissed: [] };

  const [students, progressRes, attemptsRes] = await Promise.all([
    listStudents(),
    db.from("chapter_progress").select("*").eq("chapter_slug", chapterSlug),
    db.from("attempt").select("question_id, is_correct").eq("chapter_slug", chapterSlug),
  ]);
  if (progressRes.error) throw new Error(progressRes.error.message);
  if (attemptsRes.error) throw new Error(attemptsRes.error.message);

  const progressByStudent = new Map(
    (progressRes.data ?? []).map((p: ProgressRow) => [p.student_id, p])
  );
  const rows: DashboardRow[] = students.map((student) => ({
    student,
    progress: progressByStudent.get(student.id) ?? null,
  }));

  const tally = new Map<string, { wrong: number; total: number }>();
  for (const a of attemptsRes.data ?? []) {
    const entry = tally.get(a.question_id) ?? { wrong: 0, total: 0 };
    entry.total += 1;
    if (!a.is_correct) entry.wrong += 1;
    tally.set(a.question_id, entry);
  }
  const mostMissed: MissedQuestion[] = [...tally.entries()]
    .map(([question_id, t]) => ({ question_id, wrong_count: t.wrong, total_count: t.total }))
    .filter((q) => q.wrong_count > 0)
    .sort((a, b) => b.wrong_count - a.wrong_count)
    .slice(0, 10);

  return { rows, mostMissed };
}
