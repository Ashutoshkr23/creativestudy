"use client";

import { useState } from "react";
import type { ConceptScene } from "@/content/types";
import { Eyebrow, SceneTitle, Explain } from "./SceneView";

export function ConceptSceneView({ scene }: { scene: ConceptScene }) {
  return (
    <>
      {scene.eyebrow && <Eyebrow>{scene.eyebrow}</Eyebrow>}
      <SceneTitle>{scene.title}</SceneTitle>
      <Explain>{scene.body}</Explain>
      {scene.cards && (
        <div className="flex w-full flex-wrap justify-center gap-3">
          {scene.cards.map((card) => (
            <FlipCard key={card.front} icon={card.icon} front={card.front} back={card.back} />
          ))}
        </div>
      )}
    </>
  );
}

function FlipCard({ icon, front, back }: { icon?: string; front: string; back: string }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button
      onClick={() => setFlipped((f) => !f)}
      className="h-36 w-[10.5rem] [perspective:800px]"
      aria-pressed={flipped}
    >
      <div
        className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]"
        style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-card border border-line bg-surface font-head font-semibold [backface-visibility:hidden]">
          {icon && <span className="text-2xl">{icon}</span>}
          {front}
        </div>
        <div className="absolute inset-0 flex items-center justify-center rounded-card border bg-surface-2 p-3 text-xs text-ink-secondary [backface-visibility:hidden] [transform:rotateY(180deg)]" style={{ borderColor: "var(--accent)" }}>
          {back}
        </div>
      </div>
    </button>
  );
}
