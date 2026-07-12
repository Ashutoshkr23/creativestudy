"use client";

import { useState } from "react";
import { usePlayer } from "../PlayerContext";
import { useFeedbackSounds } from "../useBeep";

// Slide a temperature and watch all three scales move together, then prove the
// conversion by typing — reinforcing C = 5/9(F−32) and F = C×9/5 + 32 with
// real numbers instead of multiple choice.

const MARKERS: { c: number; label: string }[] = [
  { c: 0, label: "❄️ Ice melts / water freezes" },
  { c: 37, label: "🌡️ Human body" },
  { c: 100, label: "♨️ Water boils" },
];

function toF(c: number) {
  return Math.round((c * 9) / 5 + 32);
}
function toK(c: number) {
  return Math.round(c + 273);
}

export function TempConverter() {
  const { next } = usePlayer();
  const sounds = useFeedbackSounds();
  const [c, setC] = useState(37);
  const [phase, setPhase] = useState<"explore" | "quiz" | "done">("explore");
  const [entry, setEntry] = useState("");
  const [wrong, setWrong] = useState(false);

  // Quiz: convert 48°C to °F (from the book's worked example).
  const quizC = 48;
  const quizAnswer = toF(quizC); // 118

  const marker = MARKERS.find((m) => m.c === c);
  const fillPct = Math.max(0, Math.min(100, ((c + 20) / 140) * 100));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(entry) === quizAnswer) {
      sounds.correct();
      setPhase("done");
    } else {
      sounds.wrong();
      setWrong(true);
    }
  };

  return (
    <>
      <div className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
        🌡️ The Triple Thermometer
      </div>
      <h2 className="mb-2.5 text-2xl sm:text-3xl">
        {phase === "explore" ? "One temperature, three scales" : "Prove the conversion"}
      </h2>
      <p className="mb-4 max-w-lg text-sm text-ink-secondary">
        {phase === "explore"
          ? "Drag the temperature. Celsius, Fahrenheit and Kelvin all move together — watch the famous fixed points light up."
          : "Use the formula F = (C × 9/5) + 32. No options — you do the maths! ✍️"}
      </p>

      {phase !== "done" && phase === "explore" && (
        <>
          <div className="flex items-end gap-5">
            <div className="flex h-40 w-8 items-end overflow-hidden rounded-full border-2 border-white/20 bg-surface-2">
              <div
                className="w-full rounded-full transition-all duration-200"
                style={{ height: `${fillPct}%`, background: "linear-gradient(to top,#5b7cfa,#ef9f27,#d85a30)" }}
              />
            </div>
            <div className="flex flex-col gap-2 text-left">
              <div className="font-head text-2xl font-bold" style={{ color: "#1db88a" }}>
                {c}°C
              </div>
              <div className="font-head text-2xl font-bold" style={{ color: "#d85a30" }}>
                {toF(c)}°F
              </div>
              <div className="font-head text-2xl font-bold" style={{ color: "#5b7cfa" }}>
                {toK(c)} K
              </div>
            </div>
          </div>
          <p className="mt-2 min-h-6 text-sm font-medium">{marker ? marker.label : " "}</p>
          <input
            type="range"
            min={-20}
            max={120}
            step={1}
            value={c}
            onChange={(e) => setC(Number(e.target.value))}
            aria-label="Temperature in Celsius"
            className="mt-2 w-full max-w-sm accent-white"
          />
          <button
            onClick={() => {
              sounds.tap();
              setPhase("quiz");
            }}
            className="mt-4 rounded-btn px-6 py-3 font-head font-semibold text-white"
            style={{ background: "var(--accent)" }}
          >
            I&apos;m ready to convert →
          </button>
        </>
      )}

      {phase === "quiz" && (
        <form onSubmit={submit} className="flex flex-col items-center gap-2">
          <p className="font-head text-base font-semibold">Convert {quizC}°C to °F:</p>
          <p className="text-xs text-ink-muted">F = ({quizC} × 9/5) + 32</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              value={entry}
              onChange={(e) => {
                setEntry(e.target.value);
                setWrong(false);
              }}
              placeholder="?"
              aria-label="Temperature in Fahrenheit"
              className="w-28 rounded-btn border border-line bg-surface px-3 py-2.5 text-center font-head text-xl font-bold outline-none focus:border-line-strong"
            />
            <span className="font-head text-lg">°F</span>
            <button type="submit" className="rounded-btn px-5 py-2.5 font-head font-semibold text-white" style={{ background: "var(--accent)" }}>
              Check ✓
            </button>
          </div>
          {wrong && (
            <p className="text-sm text-coral">
              Not quite — 48 × 9/5 = 86.4, then + 32. Round to the nearest whole number.
            </p>
          )}
        </form>
      )}

      {phase === "done" && (
        <div className="max-w-md rounded-card border border-teal/40 bg-teal/10 p-4 text-sm">
          <p className="mb-2 text-ink-secondary">
            ✓ 48°C = 118°F! Remember the fixed points: water freezes at{" "}
            <b className="text-ink">0°C = 32°F = 273 K</b> and boils at{" "}
            <b className="text-ink">100°C = 212°F = 373 K</b>. To go back: C = 5/9 × (F − 32).
          </p>
          <div className="text-center">
            <button onClick={next} className="rounded-btn px-6 py-3 font-head font-semibold text-white" style={{ background: "var(--accent)" }}>
              Continue ↓
            </button>
          </div>
        </div>
      )}
    </>
  );
}
