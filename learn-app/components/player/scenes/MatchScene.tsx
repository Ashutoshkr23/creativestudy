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
  // Right-side slots are tracked by pair index, not by their text — several
  // pairs can legitimately share the same right-side label (e.g. two salts
  // both "Neutral salt"), and matching/keying by text would let solving one
  // silently disable the other's only valid slot.
  const rightOrder = useMemo(
    () => shuffle(scene.pairs.map((_, i) => i), scene.id),
    [scene.pairs, scene.id]
  );
  const [selectedLeftIdx, setSelectedLeftIdx] = useState<number | null>(null);
  const [solvedPairs, setSolvedPairs] = useState<Set<number>>(new Set());
  const [usedRightSlots, setUsedRightSlots] = useState<Set<number>>(new Set());
  const [wrongFlashIdx, setWrongFlashIdx] = useState<number | null>(null);

  const done = solvedPairs.size === scene.pairs.length;

  const pickRight = (rightPairIdx: number) => {
    if (selectedLeftIdx === null || done) return;
    if (scene.pairs[selectedLeftIdx].right === scene.pairs[rightPairIdx].right) {
      sounds.correct();
      setSolvedPairs((s) => new Set(s).add(selectedLeftIdx));
      setUsedRightSlots((s) => new Set(s).add(rightPairIdx));
    } else {
      sounds.wrong();
      setWrongFlashIdx(rightPairIdx);
      setTimeout(() => setWrongFlashIdx(null), 400);
    }
    setSelectedLeftIdx(null);
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
          {scene.pairs.map((pair, idx) => {
            const isSolved = solvedPairs.has(idx);
            return (
              <button
                key={idx}
                disabled={isSolved}
                onClick={() => {
                  sounds.tap();
                  setSelectedLeftIdx(idx);
                }}
                className={`${itemClass} ${
                  isSolved
                    ? "border-teal/60 bg-teal/15 text-teal"
                    : selectedLeftIdx === idx
                      ? "bg-surface-2"
                      : "border-line bg-surface hover:border-line-strong"
                }`}
                style={selectedLeftIdx === idx ? { borderColor: "var(--accent)" } : undefined}
              >
                {pair.left}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-2.5">
          {rightOrder.map((pairIdx) => {
            const isUsed = usedRightSlots.has(pairIdx);
            return (
              <button
                key={pairIdx}
                disabled={isUsed}
                onClick={() => pickRight(pairIdx)}
                className={`${itemClass} ${
                  isUsed
                    ? "border-teal/60 bg-teal/15 text-teal"
                    : wrongFlashIdx === pairIdx
                      ? "border-coral bg-coral/15"
                      : "border-line bg-surface hover:border-line-strong"
                }`}
              >
                {scene.pairs[pairIdx].right}
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
