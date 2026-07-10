"use client";

import { useState } from "react";
import { usePlayer } from "../PlayerContext";
import { useFeedbackSounds } from "../useBeep";

// Spin a ray around the vertex and feel what 35°, 90° and 270° actually look
// like. Targets walk the student through every angle type from the book.

const TARGETS: { label: string; hint: string; check: (d: number) => boolean }[] = [
  { label: "Make an ACUTE angle", hint: "more than 0°, less than 90°", check: (d) => d > 0 && d < 90 },
  { label: "Make a perfect RIGHT angle", hint: "exactly 90°", check: (d) => d === 90 },
  { label: "Make an OBTUSE angle", hint: "between 90° and 180°", check: (d) => d > 90 && d < 180 },
  { label: "Make a STRAIGHT angle", hint: "exactly 180° — a straight line!", check: (d) => d === 180 },
  { label: "Make a REFLEX angle", hint: "more than 180°, less than 360°", check: (d) => d > 180 && d < 360 },
];

function typeName(d: number): string {
  if (d === 0) return "zero angle";
  if (d < 90) return "acute angle";
  if (d === 90) return "right angle";
  if (d < 180) return "obtuse angle";
  if (d === 180) return "straight angle";
  if (d < 360) return "reflex angle";
  return "complete angle";
}

export function AngleTuner() {
  const { next } = usePlayer();
  const sounds = useFeedbackSounds();
  const [deg, setDeg] = useState(30);
  const [targetIdx, setTargetIdx] = useState(0);
  const [done, setDone] = useState(false);

  const target = TARGETS[targetIdx];
  const hit = target?.check(deg) ?? false;

  const cx = 110;
  const cy = 88;
  const rad = (deg * Math.PI) / 180;
  const rayX = cx + 62 * Math.cos(rad);
  const rayY = cy - 62 * Math.sin(rad);
  const arcR = 24;
  const arcX = cx + arcR * Math.cos(rad);
  const arcY = cy - arcR * Math.sin(rad);

  const lockIn = () => {
    sounds.correct();
    if (targetIdx === TARGETS.length - 1) setDone(true);
    else setTargetIdx((i) => i + 1);
  };

  return (
    <>
      <div className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
        🎛️ The Angle Tuner
      </div>
      <h2 className="mb-2.5 text-2xl sm:text-3xl">An angle is a rotation</h2>
      <p className="mb-4 max-w-lg text-sm text-ink-secondary">
        One full spin = <b className="text-ink">360°</b>. Drag the slider to rotate ray OB and hit every target!
      </p>

      <svg viewBox="0 0 220 130" className="w-full max-w-sm rounded-card border border-line bg-surface">
        {deg > 0 && (
          <path
            d={`M ${cx + arcR} ${cy} A ${arcR} ${arcR} 0 ${deg > 180 ? 1 : 0} 0 ${arcX} ${arcY}`}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="5"
            opacity="0.85"
          />
        )}
        <line x1={cx} y1={cy} x2={cx + 62} y2={cy} stroke="rgba(255,255,255,0.75)" strokeWidth="3" strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={rayX} y2={rayY} stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="4" fill="#fff" />
        <text x={cx + 68} y={cy + 4} fill="rgba(255,255,255,0.6)" fontSize="10">A</text>
        <text x={rayX + (rayX > cx ? 4 : -12)} y={rayY + (rayY > cy ? 10 : -4)} fill="var(--accent)" fontSize="10">B</text>
        <text x="12" y="20" fill="#fff" fontSize="15" fontWeight="bold">{deg}°</text>
        <text x="12" y="34" fill="rgba(255,255,255,0.55)" fontSize="9">{typeName(deg)}</text>
      </svg>

      <input
        type="range"
        min={0}
        max={360}
        step={1}
        value={deg}
        onChange={(e) => setDeg(Number(e.target.value))}
        aria-label="Angle in degrees"
        className="mt-3 w-full max-w-sm accent-white"
      />

      {!done ? (
        <div className="mt-4 flex flex-col items-center gap-2">
          <p className="font-head text-sm font-semibold">
            🎯 Target {targetIdx + 1}/{TARGETS.length}: {target.label}
          </p>
          <p className="text-xs text-ink-muted">({target.hint})</p>
          <button
            onClick={lockIn}
            disabled={!hit}
            className="rounded-btn px-6 py-3 font-head font-semibold text-white transition-all disabled:opacity-35"
            style={{ background: "var(--accent)" }}
          >
            {hit ? "Lock it in ✓" : "Keep tuning…"}
          </button>
        </div>
      ) : (
        <div className="mt-4 max-w-md rounded-card border border-teal/40 bg-teal/10 p-4 text-sm">
          <p className="mb-2 text-ink-secondary">
            🏅 All five! Acute &lt; 90° &lt; obtuse &lt; 180° &lt; reflex — and 1° is even split into 60 minutes,
            each minute into 60 seconds, for super-precise measuring.
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
