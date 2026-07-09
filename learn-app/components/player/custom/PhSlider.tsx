"use client";

import { useState } from "react";
import { usePlayer } from "../PlayerContext";

// Drag across the pH scale and watch the universal-indicator colour sweep,
// with a real substance pinned at every value.

export const PH_COLORS: Record<number, string> = {
  1: "#c62828",
  2: "#d84315",
  3: "#e64a19",
  4: "#f57c00",
  5: "#ffa000",
  6: "#fbc02d",
  7: "#43a047",
  8: "#26a69a",
  9: "#00897b",
  10: "#0288d1",
  11: "#1565c0",
  12: "#283593",
  13: "#4527a0",
  14: "#38006b",
};

const EXAMPLES: Record<number, string> = {
  1: "Stomach acid (HCl) 🫃",
  2: "Lemon juice 🍋",
  3: "Vinegar (acetic acid) 🫙",
  4: "Tomato 🍅",
  5: "Black coffee ☕",
  6: "Milk 🥛",
  7: "Pure water 💧",
  8: "Baking soda 🧁",
  9: "Toothpaste 🪥",
  10: "Soap water 🧼",
  11: "Ammonia solution 🧴",
  12: "Lime water 🏠",
  13: "Bleach 🧺",
  14: "Caustic soda (NaOH) ⚠️",
};

export function PhSlider() {
  const { next } = usePlayer();
  const [ph, setPh] = useState(7);
  const [visited, setVisited] = useState<Set<"acid" | "neutral" | "base">>(new Set(["neutral"]));

  const zone = ph < 7 ? "acid" : ph > 7 ? "base" : "neutral";
  const zoneLabel =
    zone === "acid"
      ? ph <= 3
        ? "STRONGLY ACIDIC"
        : "acidic"
      : zone === "base"
        ? ph >= 12
          ? "STRONGLY BASIC"
          : "basic"
        : "NEUTRAL";
  const allVisited = visited.size === 3;

  const onChange = (value: number) => {
    setPh(value);
    const z = value < 7 ? "acid" : value > 7 ? "base" : "neutral";
    setVisited((s) => (s.has(z) ? s : new Set(s).add(z)));
  };

  return (
    <>
      <div className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
        📏 New Tool Unlocked
      </div>
      <h2 className="mb-2.5 text-2xl sm:text-3xl">The pH scale</h2>
      <p className="mb-5 max-w-lg text-sm text-ink-secondary">
        A <b className="text-ink">universal indicator</b> doesn&apos;t just say acid-or-base — it shows{" "}
        <b className="text-ink">how strong</b>, on a scale of 1 to 14. Drag the slider and explore.
      </p>

      <div
        className="flex h-28 w-28 flex-col items-center justify-center rounded-full border-4 transition-colors duration-300"
        style={{ background: PH_COLORS[ph], borderColor: "rgba(255,255,255,0.15)" }}
      >
        <span className="font-head text-4xl font-bold text-white drop-shadow">{ph}</span>
        <span className="text-[10px] font-bold uppercase tracking-wide text-white/90">{zoneLabel}</span>
      </div>

      <p className="mt-3 min-h-6 text-sm font-medium">{EXAMPLES[ph]}</p>

      <div className="mt-2 w-full max-w-md px-2">
        <div
          className="mb-2 h-3 rounded-full"
          style={{
            background: `linear-gradient(to right, ${[1, 3, 5, 7, 9, 11, 14].map((v) => PH_COLORS[v]).join(",")})`,
          }}
        />
        <input
          type="range"
          min={1}
          max={14}
          step={1}
          value={ph}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label="pH value"
          className="w-full accent-white"
        />
        <div className="flex justify-between text-[10px] text-ink-muted">
          <span>1 · acid 🍋</span>
          <span>7 · neutral 💧</span>
          <span>14 · base 🧼</span>
        </div>
      </div>

      {allVisited ? (
        <div className="mt-5 flex flex-col items-center gap-3">
          <p className="max-w-md text-sm text-teal">
            ✓ Below 7 = acidic · exactly 7 = neutral · above 7 = basic. The further from 7, the stronger it is!
          </p>
          <button
            onClick={next}
            className="rounded-btn px-6 py-3 font-head font-semibold text-white"
            style={{ background: "var(--accent)" }}
          >
            Continue ↓
          </button>
        </div>
      ) : (
        <p className="mt-5 text-xs text-ink-muted">Visit the acid side, neutral, and the base side to continue…</p>
      )}
    </>
  );
}
