"use client";

import type { Scene } from "@/content/types";
import { ConceptSceneView } from "./ConceptScene";
import { MatchSceneView } from "./MatchScene";
import { SortSceneView } from "./SortScene";
import { BookQuestionSceneView } from "./BookQuestionScene";
import { QuizSceneView } from "./QuizScene";
import { VocabSceneView } from "./VocabScene";
import { customComponents } from "../custom";

export function SceneView({ scene, active }: { scene: Scene; active: boolean }) {
  switch (scene.type) {
    case "concept":
      return <ConceptSceneView scene={scene} />;
    case "match":
      return <MatchSceneView scene={scene} />;
    case "sort":
      return <SortSceneView scene={scene} />;
    case "book-question":
      return <BookQuestionSceneView scene={scene} />;
    case "quiz":
      return <QuizSceneView scene={scene} active={active} />;
    case "vocab":
      return <VocabSceneView scene={scene} />;
    case "custom": {
      const Custom = customComponents[scene.component];
      if (!Custom) {
        return (
          <p className="text-ink-secondary">
            Missing custom component: <code>{scene.component}</code>
          </p>
        );
      }
      return <Custom {...(scene.props ?? {})} />;
    }
  }
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mb-2.5 text-xs font-semibold uppercase tracking-widest"
      style={{ color: "var(--accent)" }}
    >
      {children}
    </div>
  );
}

export function SceneTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-2.5 max-w-xl text-2xl sm:text-3xl">{children}</h2>;
}

export function Explain({ children }: { children: React.ReactNode }) {
  return <p className="mb-5 max-w-lg text-sm text-ink-secondary">{children}</p>;
}
