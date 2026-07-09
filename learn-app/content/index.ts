import type { Chapter } from "./types";
import { demoChapter } from "./chapters/demo";

const chapters: Chapter[] = [demoChapter];

export function getChapter(slug: string): Chapter | undefined {
  return chapters.find((c) => c.slug === slug);
}

export function listChapters(): Chapter[] {
  return chapters;
}

/** Human-readable prompt for a tracked question id — for the teacher dashboard. */
export function getQuestionLabel(chapterSlug: string, questionId: string): string {
  const chapter = getChapter(chapterSlug);
  if (!chapter) return questionId;
  for (const scene of chapter.scenes) {
    if (scene.type === "book-question" && scene.questionId === questionId) return scene.prompt;
    if (scene.type === "quiz") {
      const q = scene.questions.find((q) => q.questionId === questionId);
      if (q) return q.prompt;
    }
  }
  return questionId;
}
