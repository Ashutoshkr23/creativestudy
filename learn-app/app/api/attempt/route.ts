import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { recordAttempt, updateProgress } from "@/lib/queries";
import { isDbConfigured } from "@/lib/supabase";
import { getChapter } from "@/content";
import { SIGHT_WORDS_SLUG } from "@/content/sight-words";

export async function POST(request: Request) {
  const session = await getSession();
  if (session?.role !== "student" || !session.studentId) {
    return NextResponse.json({ error: "Student login required." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const chapterSlug = String(body.chapterSlug ?? "");
  const questionId = String(body.questionId ?? "");
  const isCorrect = Boolean(body.isCorrect);
  const chosen = body.chosen != null ? String(body.chosen) : null;
  const kind = body.kind === "quiz" ? "quiz" : "book-question";
  const lastScene = Number.isFinite(body.lastScene) ? Number(body.lastScene) : undefined;
  const quizScore = Number.isFinite(body.quizScore) ? Number(body.quizScore) : undefined;
  const completed = Boolean(body.completed);

  // Sight-word practice tracks against a pseudo-chapter so XP/streaks accrue.
  if ((!getChapter(chapterSlug) && chapterSlug !== SIGHT_WORDS_SLUG) || !questionId) {
    return NextResponse.json({ error: "Unknown chapter or question." }, { status: 400 });
  }

  if (!isDbConfigured()) {
    // Practice still works without the database — answers just aren't saved yet.
    return NextResponse.json({ saved: false, reason: "db-not-configured" });
  }

  await recordAttempt({ studentId: session.studentId, chapterSlug, questionId, isCorrect, chosen });
  await updateProgress({
    studentId: session.studentId,
    chapterSlug,
    isCorrect,
    kind,
    lastScene,
    quizScore,
    completed,
  });
  return NextResponse.json({ saved: true });
}
