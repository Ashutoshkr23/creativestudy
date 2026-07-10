"use client";

import { useState } from "react";
import { usePlayer } from "../PlayerContext";
import { useFeedbackSounds } from "../useBeep";

// Two lines crossing like scissor blades: drag one and watch all four angles
// change together. Discover that opposite angles stay equal and neighbours
// always total 180° — then prove it by typing the values.

export function ScissorsSim() {
  const { next } = usePlayer();
  const sounds = useFeedbackSounds();
  const [deg, setDeg] = useState(60);
  const [phase, setPhase] = useState<"explore" | "q1" | "q2" | "done">("explore");
  const [entry, setEntry] = useState("");
  const [wrong, setWrong] = useState(false);

  const quizDeg = 40;
  const shown = phase === "explore" ? deg : quizDeg;
  const cx = 120;
  const cy = 80;
  const rad = (shown * Math.PI) / 180;
  const L = 95;
  const bx = L * Math.cos(rad);
  const by = L * Math.sin(rad);

  const label = (angleDeg: number, r: number) => ({
    x: cx + r * Math.cos((angleDeg * Math.PI) / 180),
    y: cy - r * Math.sin((angleDeg * Math.PI) / 180),
  });
  const p1 = label(shown / 2, 42);
  const p2 = label(90 + shown / 2, 42);
  const p3 = label(180 + shown / 2, 42);
  const p4 = label(270 + shown / 2, 42);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const expected = phase === "q1" ? quizDeg : 180 - quizDeg;
    if (Number(entry) === expected) {
      sounds.correct();
      setEntry("");
      setWrong(false);
      setPhase(phase === "q1" ? "q2" : "done");
    } else {
      sounds.wrong();
      setWrong(true);
    }
  };

  return (
    <>
      <div className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
        ✂️ The Scissors Simulator
      </div>
      <h2 className="mb-2.5 text-2xl sm:text-3xl">Four angles from one crossing</h2>
      <p className="mb-4 max-w-lg text-sm text-ink-secondary">
        {phase === "explore"
          ? "Open and close the scissors. Watch all FOUR angles — what stays equal? What always adds to 180°?"
          : `The scissors are locked at ∠1 = ${quizDeg}°. Now prove you spotted the pattern!`}
      </p>

      <svg viewBox="0 0 240 160" className="w-full max-w-sm rounded-card border border-line bg-surface">
        <line x1={cx - 105} y1={cy} x2={cx + 105} y2={cy} stroke="rgba(255,255,255,0.75)" strokeWidth="3" strokeLinecap="round" />
        <line x1={cx - bx} y1={cy + by} x2={cx + bx} y2={cy - by} stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="4" fill="#fff" />
        <text x={p1.x - 8} y={p1.y + 4} fill="#fff" fontSize="11" fontWeight="bold">{`1:${shown}°`}</text>
        <text x={p2.x - 14} y={p2.y + 4} fill="rgba(255,255,255,0.75)" fontSize="11" fontWeight="bold">
          {phase === "explore" ? `2:${180 - shown}°` : "2:?"}
        </text>
        <text x={p3.x - 12} y={p3.y + 4} fill="rgba(255,255,255,0.75)" fontSize="11" fontWeight="bold">
          {phase === "explore" ? `3:${shown}°` : "3:?"}
        </text>
        <text x={p4.x - 12} y={p4.y + 4} fill="rgba(255,255,255,0.75)" fontSize="11" fontWeight="bold">
          {phase === "explore" ? `4:${180 - shown}°` : "4:?"}
        </text>
      </svg>

      {phase === "explore" && (
        <>
          <input
            type="range"
            min={15}
            max={165}
            step={1}
            value={deg}
            onChange={(e) => setDeg(Number(e.target.value))}
            aria-label="Angle 1 in degrees"
            className="mt-3 w-full max-w-sm accent-white"
          />
          <button
            onClick={() => {
              sounds.tap();
              setPhase("q1");
            }}
            className="mt-4 rounded-btn px-6 py-3 font-head font-semibold text-white"
            style={{ background: "var(--accent)" }}
          >
            I spotted the pattern →
          </button>
        </>
      )}

      {(phase === "q1" || phase === "q2") && (
        <form onSubmit={submit} className="mt-4 flex flex-col items-center gap-2">
          <p className="font-head text-sm font-semibold">
            {phase === "q1"
              ? `∠1 = ${quizDeg}°. Type ∠3 (directly opposite ∠1):`
              : `∠1 = ${quizDeg}°. Type ∠2 (next to ∠1 on the straight line):`}
          </p>
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
              aria-label="Angle in degrees"
              className="w-24 rounded-btn border border-line bg-surface px-3 py-2.5 text-center font-head text-xl font-bold outline-none focus:border-line-strong"
            />
            <span className="font-head text-lg">°</span>
            <button type="submit" className="rounded-btn px-5 py-2.5 font-head font-semibold text-white" style={{ background: "var(--accent)" }}>
              Check ✓
            </button>
          </div>
          {wrong && (
            <p className="text-sm text-coral">
              {phase === "q1"
                ? "Look again — vertically opposite angles are always EQUAL."
                : "∠1 and ∠2 form a linear pair on a straight line — they add to 180°."}
            </p>
          )}
        </form>
      )}

      {phase === "done" && (
        <div className="mt-4 max-w-md rounded-card border border-teal/40 bg-teal/10 p-4 text-sm">
          <p className="mb-2 text-ink-secondary">
            🎉 You discovered two laws of every crossing: <b className="text-ink">vertically opposite angles are
            equal</b> (∠1 = ∠3, ∠2 = ∠4) and <b className="text-ink">a linear pair adds to 180°</b>. Bonus: all four
            together always make <b className="text-ink">360°</b>!
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
