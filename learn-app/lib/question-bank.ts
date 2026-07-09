import type { Chapter, QuestionOption } from "@/content/types";
import { getChapter, listChapters } from "@/content";

// Every chapter's objective-question pool for the Practice Arena: the authored
// book-questions and quiz questions, plus MCQs derived from match pairs, sort
// items and vocab words. Generated ids are stable (scene id + item index) so
// attempts on them stay analysable, but distractors are seeded-deterministic.

export type PracticeQuestion = {
  questionId: string;
  chapterSlug: string;
  prompt: string;
  options: QuestionOption[];
  correct: string; // option id
  explain?: string;
};

// Same seeded PRNG approach as MatchScene — deterministic everywhere.
function seededShuffle<T>(items: T[], seedText: string): T[] {
  let seed = 2166136261;
  for (let i = 0; i < seedText.length; i++) {
    seed = Math.imul(seed ^ seedText.charCodeAt(i), 16777619);
  }
  const random = () => {
    seed = Math.imul(seed ^ (seed >>> 15), seed | 1);
    seed ^= seed + Math.imul(seed ^ (seed >>> 7), seed | 61);
    return ((seed ^ (seed >>> 14)) >>> 0) / 4294967296;
  };
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildOptions(correctLabel: string, distractorPool: string[], seed: string): { options: QuestionOption[]; correct: string } {
  const distractors = seededShuffle(
    [...new Set(distractorPool)].filter((d) => d !== correctLabel),
    seed
  ).slice(0, 3);
  const labels = seededShuffle([correctLabel, ...distractors], `${seed}|order`);
  const options = labels.map((label, i) => ({ id: String.fromCharCode(97 + i), label }));
  return { options, correct: options.find((o) => o.label === correctLabel)!.id };
}

export function getQuestionBank(chapterSlug: string): PracticeQuestion[] {
  const chapter = getChapter(chapterSlug);
  if (!chapter) return [];
  const bank: PracticeQuestion[] = [];

  for (const scene of chapter.scenes) {
    switch (scene.type) {
      case "book-question":
        bank.push({
          questionId: scene.questionId,
          chapterSlug,
          prompt: scene.prompt,
          options: scene.options,
          correct: scene.correct,
          explain: scene.explain,
        });
        break;
      case "quiz":
        for (const q of scene.questions) {
          bank.push({
            questionId: q.questionId,
            chapterSlug,
            prompt: q.prompt,
            options: q.options,
            correct: q.correct,
            explain: q.explain,
          });
        }
        break;
      case "match":
        scene.pairs.forEach((pair, i) => {
          const id = `gen-match:${scene.id}:${i}`;
          const { options, correct } = buildOptions(pair.right, scene.pairs.map((p) => p.right), id);
          if (options.length < 2) return;
          bank.push({
            questionId: id,
            chapterSlug,
            prompt: `"${pair.left}" goes with…`,
            options,
            correct,
          });
        });
        break;
      case "sort":
        scene.items.forEach((item, i) => {
          const id = `gen-sort:${scene.id}:${i}`;
          const options = scene.buckets.map((b, j) => ({ id: String.fromCharCode(97 + j), label: b }));
          bank.push({
            questionId: id,
            chapterSlug,
            prompt: `"${item.label}" belongs to which group?`,
            options,
            correct: options[item.bucket].id,
          });
        });
        break;
      case "vocab":
        scene.words.forEach((w, i) => {
          const id = `gen-vocab:${scene.id}:${i}`;
          const { options, correct } = buildOptions(w.meaning, scene.words.map((x) => x.meaning), id);
          if (options.length < 2) return;
          bank.push({
            questionId: id,
            chapterSlug,
            prompt: `What does "${w.word}" mean?`,
            options,
            correct,
          });
        });
        break;
    }
  }
  return bank;
}

export function getBankSizes(): { slug: string; size: number }[] {
  return listChapters().map((c: Chapter) => ({ slug: c.slug, size: getQuestionBank(c.slug).length }));
}

/** Human-readable prompt for any tracked question id — authored or generated. */
export function getQuestionLabel(chapterSlug: string, questionId: string): string {
  return getQuestionBank(chapterSlug).find((q) => q.questionId === questionId)?.prompt ?? questionId;
}

/** Resolve stored (chapterSlug, questionId) pairs back to full questions. */
export function resolveQuestions(refs: { chapter_slug: string; question_id: string }[]): PracticeQuestion[] {
  const bankBySlug = new Map<string, PracticeQuestion[]>();
  const out: PracticeQuestion[] = [];
  for (const ref of refs) {
    if (!bankBySlug.has(ref.chapter_slug)) bankBySlug.set(ref.chapter_slug, getQuestionBank(ref.chapter_slug));
    const q = bankBySlug.get(ref.chapter_slug)!.find((q) => q.questionId === ref.question_id);
    if (q) out.push(q);
  }
  return out;
}
