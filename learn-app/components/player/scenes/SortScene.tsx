"use client";

import { useState } from "react";
import type { SortScene } from "@/content/types";
import { Eyebrow, SceneTitle, Explain } from "./SceneView";
import { useFeedbackSounds } from "../useBeep";
import { usePlayer } from "../PlayerContext";

export function SortSceneView({ scene }: { scene: SortScene }) {
  const sounds = useFeedbackSounds();
  const { next } = usePlayer();
  const [selected, setSelected] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Map<string, 0 | 1>>(new Map());
  const [shaking, setShaking] = useState(false);

  const done = placed.size === scene.items.length;

  const pickBucket = (bucket: 0 | 1) => {
    if (!selected) return;
    const item = scene.items.find((i) => i.label === selected);
    if (!item) return;
    if (item.bucket === bucket) {
      sounds.correct();
      setPlaced((p) => new Map(p).set(item.label, bucket));
    } else {
      sounds.wrong();
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
    }
    setSelected(null);
  };

  return (
    <>
      {scene.eyebrow && <Eyebrow>{scene.eyebrow}</Eyebrow>}
      <SceneTitle>{scene.title}</SceneTitle>
      <Explain>{scene.prompt}</Explain>

      <div className="mb-5 grid w-full max-w-md grid-cols-2 gap-3">
        {scene.buckets.map((bucketName, b) => (
          <button
            key={bucketName}
            onClick={() => pickBucket(b as 0 | 1)}
            className={`min-h-28 rounded-card border-2 border-dashed p-3 transition-colors ${
              selected ? "bg-surface-2" : "border-line bg-surface"
            } ${shaking ? "animate-pulse" : ""}`}
            style={selected ? { borderColor: "var(--accent)" } : undefined}
          >
            <div className="mb-2 font-head text-sm font-semibold">{bucketName}</div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {scene.items
                .filter((i) => placed.get(i.label) === b)
                .map((i) => (
                  <span key={i.label} className="rounded-btn bg-teal/15 px-2.5 py-1 text-xs text-teal">
                    {i.label}
                  </span>
                ))}
            </div>
          </button>
        ))}
      </div>

      <div className="flex max-w-md flex-wrap justify-center gap-2.5">
        {scene.items
          .filter((i) => !placed.has(i.label))
          .map((i) => (
            <button
              key={i.label}
              onClick={() => {
                sounds.tap();
                setSelected(i.label);
              }}
              className={`rounded-btn border px-4 py-2.5 text-sm transition-colors ${
                selected === i.label ? "bg-surface-2" : "border-line bg-surface hover:border-line-strong"
              }`}
              style={selected === i.label ? { borderColor: "var(--accent)" } : undefined}
            >
              {i.label}
            </button>
          ))}
      </div>

      {done && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <p className="font-head text-teal">All sorted! 🎉</p>
          <button
            onClick={next}
            className="rounded-btn px-6 py-3 font-head font-semibold text-white"
            style={{ background: "var(--accent)" }}
          >
            Continue ↓
          </button>
        </div>
      )}
    </>
  );
}
