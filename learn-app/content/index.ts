import type { Chapter } from "./types";
import { demoChapter } from "./chapters/demo";
import { acidsBasesSaltsChapter } from "./chapters/acids-bases-salts";
import { physicalChemicalChangesChapter } from "./chapters/physical-chemical-changes";
import { parallelIntersectingLinesChapter } from "./chapters/parallel-intersecting-lines";
import { nutritionInPlantsChapter } from "./chapters/nutrition-in-plants";
import { nutritionInAnimalsChapter } from "./chapters/nutrition-in-animals";
import { temperatureAndHeatChapter } from "./chapters/temperature-and-heat";

const chapters: Chapter[] = [
  demoChapter,
  nutritionInPlantsChapter,
  nutritionInAnimalsChapter,
  temperatureAndHeatChapter,
  acidsBasesSaltsChapter,
  physicalChemicalChangesChapter,
  parallelIntersectingLinesChapter,
];

export function getChapter(slug: string): Chapter | undefined {
  return chapters.find((c) => c.slug === slug);
}

export function listChapters(): Chapter[] {
  return chapters;
}

/** All vocab words defined in a chapter's vocab scenes. */
export function getChapterVocab(slug: string): { word: string; meaning: string }[] {
  const chapter = getChapter(slug);
  if (!chapter) return [];
  return chapter.scenes.flatMap((s) => (s.type === "vocab" ? s.words : []));
}
