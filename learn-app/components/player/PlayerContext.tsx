"use client";

import { createContext, useContext } from "react";

export type AttemptPayload = {
  questionId: string;
  isCorrect: boolean;
  chosen?: string;
  kind: "book-question" | "quiz";
  quizScore?: number;
  completed?: boolean;
};

export type PlayerApi = {
  chapterSlug: string;
  accent: string;
  next: () => void;
  /** Fire-and-forget: saves the answer if the student is logged in and the DB is set up. */
  report: (attempt: AttemptPayload) => void;
};

export const PlayerContext = createContext<PlayerApi | null>(null);

export function usePlayer(): PlayerApi {
  const api = useContext(PlayerContext);
  if (!api) throw new Error("usePlayer must be used inside <ChapterPlayer>");
  return api;
}
