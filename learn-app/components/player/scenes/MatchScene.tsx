"use client";

import { useMemo, useState } from "react";
import type { MatchScene } from "@/content/types";
import { Eyebrow, SceneTitle, Explain } from "./SceneView";
import { useFeedbackSounds } from "../useBeep";
import { usePlayer } from "../PlayerContext";

// Seeded shuffle — deterministic so server and client render the same order
// (Math.random() here would cause a hydration mismatch).
function shuffle<T>(items: T[], seedText: string): T[] {
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

export function MatchSceneView({ scene }: { scene: MatchScene }) {
  const sounds = useFeedbackSounds();
  const { next } = usePlayer();
  const rightSide = useMemo(
    () => shuffle(scene.pairs.map((p) => p.right), scene.id),
    [scene.pairs, scene.id]
  );
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [solved, setSolved] = useState<Set<string>>(new Set());
  const [wrongFlash, setWrongFlash] = useState<string | null>(null);

  const done = solved.size === scene.pairs.length;

  const pickRight = (right: string) => {
    if (!selectedLeft || done) return;
    const pair = scene.pairs.find((p) => p.left === selectedLeft);
    if (pair?.right === right) {
      sounds.correct();
      setSolved((s) => new Set(s).add(selectedLeft));
    } else {
      sounds.wrong();
      setWrongFlash(right);
      setTimeout(() => setWrongFlash(null), 400);
    }
    setSelectedLeft(null);
  };

  const itemClass =
    "w-full rounded-btn border px-4 py-3 text-sm transition-colors disabled:opacity-100";

  return (
    <>
      {scene.eyebrow && <Eyebrow>{scene.eyebrow}</Eyebrow>}
      <SceneTitle>{scene.title}</SceneTitle>
      <Explain>{scene.prompt}</Explain>
      <div className="grid w-full max-w-md grid-cols-2 gap-3">
        <div className="flex flex-col gap-2.5">
          {scene.pairs.map((pair) => {
            const isSolved = solved.has(pair.left);
            return (
              <button
                key={pair.left}
                disabled={isSolved}
                onClick={() => {
                  sounds.tap();
                  setSelectedLeft(pair.left);
                }}
                className={`${itemClass} ${
                  isSolved
                    ? "border-teal/60 bg-teal/15 text-teal"
                    : selectedLeft === pair.left
                      ? "bg-surface-2"
                      : "border-line bg-surface hover:border-line-strong"
                }`}
                style={selectedLeft === pair.left ? { borderColor: "var(--accent)" } : undefined}
              >
                {pair.left}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-2.5">
          {rightSide.map((right) => {
            const isSolved = scene.pairs.some((p) => p.right === right && solved.has(p.left));
            return (
              <button
                key={right}
                disabled={isSolved}
                onClick={() => pickRight(right)}
                className={`${itemClass} ${
                  isSolved
                    ? "border-teal/60 bg-teal/15 text-teal"
                    : wrongFlash === right
                      ? "border-coral bg-coral/15"
                      : "border-line bg-surface hover:border-line-strong"
                }`}
              >
                {right}
              </button>
            );
          })}
        </div>
      </div>
      {done && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <p className="font-head text-teal">Perfect — all matched! 🎉</p>
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
