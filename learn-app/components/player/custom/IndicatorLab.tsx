"use client";

import { useState } from "react";
import { usePlayer } from "../PlayerContext";
import { useFeedbackSounds } from "../useBeep";

// The heart of the chapter: test unlabeled everyday substances with real
// indicators and *discover* acids/bases before they're ever named.

type Kind = "acid" | "base" | "neutral";

const SUBSTANCES: { id: string; name: string; emoji: string; kind: Kind }[] = [
  { id: "lemon", name: "Lemon juice", emoji: "🍋", kind: "acid" },
  { id: "soap", name: "Soap water", emoji: "🧼", kind: "base" },
  { id: "salt", name: "Salt water", emoji: "🧂", kind: "neutral" },
  { id: "curd", name: "Curd", emoji: "🥣", kind: "acid" },
  { id: "lime", name: "Lime water", emoji: "🥛", kind: "base" },
  { id: "water", name: "Pure water", emoji: "💧", kind: "neutral" },
];

const INDICATORS: { id: string; name: string; emoji: string }[] = [
  { id: "blue-litmus", name: "Blue litmus", emoji: "🟦" },
  { id: "red-litmus", name: "Red litmus", emoji: "🟥" },
  { id: "turmeric", name: "Turmeric", emoji: "🟡" },
  { id: "china-rose", name: "China rose", emoji: "🌺" },
  { id: "phenolphthalein", name: "Phenolphthalein", emoji: "🧪" },
];

function testResult(indicator: string, kind: Kind): { label: string; color: string; changed: boolean } {
  const table: Record<string, Record<Kind, { label: string; color: string; changed: boolean }>> = {
    "blue-litmus": {
      acid: { label: "Turned RED!", color: "#d85a30", changed: true },
      base: { label: "Stays blue", color: "#5b7cfa", changed: false },
      neutral: { label: "Stays blue", color: "#5b7cfa", changed: false },
    },
    "red-litmus": {
      acid: { label: "Stays red", color: "#d85a30", changed: false },
      base: { label: "Turned BLUE!", color: "#5b7cfa", changed: true },
      neutral: { label: "Stays red", color: "#d85a30", changed: false },
    },
    turmeric: {
      acid: { label: "Stays yellow", color: "#ef9f27", changed: false },
      base: { label: "Reddish-brown!", color: "#a0522d", changed: true },
      neutral: { label: "Stays yellow", color: "#ef9f27", changed: false },
    },
    "china-rose": {
      acid: { label: "Magenta!", color: "#d4537e", changed: true },
      base: { label: "Green!", color: "#1db88a", changed: true },
      neutral: { label: "Stays light pink", color: "#e8a3b8", changed: false },
    },
    phenolphthalein: {
      acid: { label: "Colourless", color: "transparent", changed: false },
      base: { label: "PINK!", color: "#d4537e", changed: true },
      neutral: { label: "Colourless", color: "transparent", changed: false },
    },
  };
  return table[indicator][kind];
}

export function IndicatorLab() {
  const { next } = usePlayer();
  const sounds = useFeedbackSounds();
  const [indicator, setIndicator] = useState("blue-litmus");
  const [results, setResults] = useState<Map<string, { label: string; color: string }>>(new Map());
  const [revealed, setRevealed] = useState(false);

  const testedSubstances = new Set([...results.keys()].map((k) => k.split("|")[0]));
  const allTested = testedSubstances.size === SUBSTANCES.length;

  const runTest = (subId: string) => {
    const sub = SUBSTANCES.find((s) => s.id === subId)!;
    const r = testResult(indicator, sub.kind);
    if (r.changed) sounds.correct();
    else sounds.tap();
    setResults((m) => new Map(m).set(`${subId}|${indicator}`, { label: r.label, color: r.color }));
  };

  return (
    <>
      <div className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
        🔬 Your First Case
      </div>
      <h2 className="mb-2.5 text-2xl sm:text-3xl">The Indicator Lab</h2>
      <p className="mb-4 max-w-lg text-sm text-ink-secondary">
        Six mystery liquids. Real scientists never taste unknown chemicals — they use{" "}
        <b className="text-ink">indicators</b>. Pick an indicator, then tap each liquid to add a drop.
        Watch what changes!
      </p>

      <div className="mb-4 flex flex-wrap justify-center gap-1.5">
        {INDICATORS.map((ind) => (
          <button
            key={ind.id}
            onClick={() => {
              sounds.tap();
              setIndicator(ind.id);
            }}
            className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
              indicator === ind.id ? "bg-surface-2 text-ink" : "border-line bg-surface text-ink-secondary"
            }`}
            style={indicator === ind.id ? { borderColor: "var(--accent)" } : undefined}
          >
            {ind.emoji} {ind.name}
          </button>
        ))}
      </div>

      <div className="grid w-full max-w-md grid-cols-2 gap-2.5 sm:grid-cols-3">
        {SUBSTANCES.map((sub) => {
          const r = results.get(`${sub.id}|${indicator}`);
          return (
            <button
              key={sub.id}
              onClick={() => runTest(sub.id)}
              className="flex flex-col items-center gap-1 rounded-card border border-line bg-surface p-3 transition-colors hover:border-line-strong"
            >
              <span className="text-2xl">{sub.emoji}</span>
              <span className="text-xs font-medium">{sub.name}</span>
              <span
                className="mt-1 min-h-5 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={
                  r
                    ? r.color === "transparent"
                      ? { border: "1px dashed rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.6)" }
                      : { background: r.color, color: "#fff" }
                    : { color: "rgba(255,255,255,0.25)" }
                }
              >
                {r ? r.label : "tap to test"}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-ink-muted">
        Liquids tested: {testedSubstances.size} / {SUBSTANCES.length} · Tip: try more than one indicator!
      </p>

      {allTested && !revealed && (
        <button
          onClick={() => {
            sounds.correct();
            setRevealed(true);
          }}
          className="mt-4 rounded-btn px-6 py-3 font-head font-semibold text-white"
          style={{ background: "var(--accent)" }}
        >
          🕵️ I see a pattern…
        </button>
      )}

      {revealed && (
        <div className="mt-4 max-w-md rounded-card border border-teal/40 bg-teal/10 p-4 text-left text-sm">
          <p className="mb-2 font-head font-semibold text-teal">Detective&apos;s insight 🎉</p>
          <p className="mb-1.5 text-ink-secondary">
            🍋🥣 The <b className="text-ink">sour</b> ones (lemon, curd) turned blue litmus{" "}
            <b style={{ color: "#d85a30" }}>red</b> — those are <b className="text-ink">ACIDS</b>.
          </p>
          <p className="mb-1.5 text-ink-secondary">
            🧼🥛 The <b className="text-ink">soapy, bitter</b> ones turned red litmus{" "}
            <b style={{ color: "#5b7cfa" }}>blue</b> — those are <b className="text-ink">BASES</b>.
          </p>
          <p className="mb-3 text-ink-secondary">
            🧂💧 Salt water and pure water changed <b className="text-ink">nothing</b> — they are{" "}
            <b className="text-ink">NEUTRAL</b>.
          </p>
          <div className="text-center">
            <button
              onClick={next}
              className="rounded-btn px-6 py-3 font-head font-semibold text-white"
              style={{ background: "var(--accent)" }}
            >
              Continue ↓
            </button>
          </div>
        </div>
      )}
    </>
  );
}
