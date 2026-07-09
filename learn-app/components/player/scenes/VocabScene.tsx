"use client";

import { useState } from "react";
import type { VocabScene } from "@/content/types";
import { Eyebrow, SceneTitle, Explain } from "./SceneView";

export function VocabSceneView({ scene }: { scene: VocabScene }) {
  return (
    <>
      <Eyebrow>{scene.eyebrow ?? "🔤 Word bank"}</Eyebrow>
      <SceneTitle>{scene.title}</SceneTitle>
      <Explain>Tap a word to reveal what it means.</Explain>
      <div className="flex w-full max-w-md flex-col gap-2.5">
        {scene.words.map(({ word, meaning }) => (
          <VocabCard key={word} word={word} meaning={meaning} />
        ))}
      </div>
    </>
  );
}

function VocabCard({ word, meaning }: { word: string; meaning: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen((o) => !o)}
      className={`rounded-card border px-4 py-3 text-left transition-colors ${
        open ? "bg-surface-2" : "border-line bg-surface hover:border-line-strong"
      }`}
      style={open ? { borderColor: "var(--accent)" } : undefined}
    >
      <div className="flex items-center justify-between font-head font-semibold">
        {word}
        <span className="text-xs text-ink-muted">{open ? "▲" : "▼"}</span>
      </div>
      {open && <p className="mt-2 text-sm text-ink-secondary">{meaning}</p>}
    </button>
  );
}
