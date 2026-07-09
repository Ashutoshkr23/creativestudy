import type { Chapter } from "./types";
import { demoChapter } from "./chapters/demo";
import { acidsBasesSaltsChapter } from "./chapters/acids-bases-salts";

const chapters: Chapter[] = [demoChapter, acidsBasesSaltsChapter];

export function getChapter(slug: string): Chapter | undefined {
  return chapters.find((c) => c.slug === slug);
}

export function listChapters(): Chapter[] {
  return chapters;
}
