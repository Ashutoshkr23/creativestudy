// A chapter is an ordered list of scenes. Tracked scenes (book-question, quiz)
// carry stable question ids so attempts stay analysable across content edits.

export type FlipCard = { icon?: string; front: string; back: string };

export type ConceptScene = {
  type: "concept";
  id: string;
  eyebrow?: string;
  title: string;
  body: string;
  cards?: FlipCard[];
};

export type MatchScene = {
  type: "match";
  id: string;
  eyebrow?: string;
  title: string;
  prompt: string;
  pairs: { left: string; right: string }[];
};

export type SortScene = {
  type: "sort";
  id: string;
  eyebrow?: string;
  title: string;
  prompt: string;
  buckets: [string, string];
  items: { label: string; bucket: 0 | 1 }[];
};

export type QuestionOption = { id: string; label: string };

export type BookQuestionScene = {
  type: "book-question";
  id: string;
  questionId: string; // stable id — never reuse for a different question
  eyebrow?: string;
  prompt: string;
  image?: string; // URL of a cropped textbook photo (Supabase Storage later)
  options: QuestionOption[];
  correct: string; // option id
  explain?: string;
};

export type QuizQuestion = {
  questionId: string;
  prompt: string;
  options: QuestionOption[];
  correct: string;
  explain?: string;
};

export type QuizScene = {
  type: "quiz";
  id: string;
  eyebrow?: string;
  title: string;
  questions: QuizQuestion[];
};

export type VocabScene = {
  type: "vocab";
  id: string;
  eyebrow?: string;
  title: string;
  words: { word: string; meaning: string }[];
};

export type CustomScene = {
  type: "custom";
  id: string;
  component: string; // key in components/player/custom registry
  props?: Record<string, unknown>;
};

export type Scene =
  | ConceptScene
  | MatchScene
  | SortScene
  | BookQuestionScene
  | QuizScene
  | VocabScene
  | CustomScene;

/**
 * Simple parametric figures for exercise questions, rendered by
 * components/practice/QuestionFigure. "crossing" = two lines meeting at O with
 * labels in the four sectors (a=right, b=top, c=left, d=bottom). "transversal"
 * = two lines cut by a transversal, labels keyed by the book's angle numbering
 * (top crossing 1-4, bottom crossing 5-8).
 */
export type FigureSpec =
  | { kind: "crossing"; labels: Partial<Record<"a" | "b" | "c" | "d", string>> }
  | { kind: "transversal"; labels: Partial<Record<"1" | "2" | "3" | "4" | "5" | "6" | "7" | "8", string>>; parallel?: boolean };

/** A tracked exercise question — part of the chapter's practice bank, not a scene. */
export type ExerciseQuestion = {
  questionId: string; // stable id — never reuse for a different question
  prompt: string;
  options: QuestionOption[];
  correct: string;
  explain?: string;
  figure?: FigureSpec;
};

export type Chapter = {
  slug: string;
  title: string;
  subject: string;
  emoji: string;
  color: string; // accent, one of the theme palette hexes
  description: string;
  /** Trophy earned in My Lab when the chapter is completed. */
  trophy?: { emoji: string; name: string; caption: string };
  scenes: Scene[];
  /** Full textbook exercises — served through the Practice Arena, review and dashboards. */
  exercises?: ExerciseQuestion[];
};
