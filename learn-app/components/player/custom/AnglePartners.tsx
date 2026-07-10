"use client";

import { useState } from "react";
import { usePlayer } from "../PlayerContext";
import { useFeedbackSounds } from "../useBeep";

// Type the missing partner angle: complements complete a right angle (90°),
// supplements complete a straight line (180°). The app's first typed-number
// maths — no options to guess from!

type Round = { kind: "complement" | "supplement"; given: number };

const ROUNDS: Round[] = [
  { kind: "complement", given: 35 },
  { kind: "supplement", given: 120 },
  { kind: "complement", given: 62 },
  { kind: "supplement", given: 45 },
  { kind: "complement", given: 45 },
  { kind: "supplement", given: 163 },
];

export function AnglePartners() {
  const { next } = usePlayer();
  const sounds = useFeedbackSounds();
  const [idx, setIdx] = useState(0);
  const [entry, setEntry] = useState("");
  const [state, setState] = useState<"typing" | "correct" | "wrong">("typing");
  const [done, setDone] = useState(false);

  const round = ROUNDS[idx];
  const total = round.kind === "complement" ? 90 : 180;
  const answer = total - round.given;

  const cx = 100;
  const cy = 95;
  const r = 62;
  const endRad = (total * Math.PI) / 180;
  const givenRad = (round.given * Math.PI) / 180;
  const showAnswer = state === "correct";

  const check = (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "correct") return;
    if (Number(entry) === answer) {
      sounds.correct();
      setState("correct");
    } else {
      sounds.wrong();
      setState("wrong");
    }
  };

  const nextRound = () => {
    if (idx === ROUNDS.length - 1) {
      setDone(true);
      return;
    }
    setIdx((i) => i + 1);
    setEntry("");
    setState("typing");
  };

  if (done) {
    return (
      <>
        <div className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
          🤝 Angle Partners
        </div>
        <h2 className="mb-2.5 text-2xl sm:text-3xl">Partners found!</h2>
        <div className="max-w-md rounded-card border border-teal/40 bg-teal/10 p-4 text-sm">
          <p className="mb-2 text-ink-secondary">
            <b className="text-ink">Complementary</b> angles complete a right angle: they add to{" "}
            <b className="text-ink">90°</b>. <b className="text-ink">Supplementary</b> angles complete a straight
            line: they add to <b className="text-ink">180°</b>. And remember — partners don&apos;t have to be adjacent
            (next to each other) to count!
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
      </>
    );
  }

  return (
    <>
      <div className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
        🤝 Angle Partners · {idx + 1}/{ROUNDS.length}
      </div>
      <h2 className="mb-2.5 text-2xl sm:text-3xl">
        {round.kind === "complement" ? "Complete the right angle (90°)" : "Complete the straight line (180°)"}
      </h2>
      <p className="mb-4 max-w-lg text-sm text-ink-secondary">
        One angle is <b className="text-ink">{round.given}°</b>. Type its{" "}
        {round.kind === "complement" ? "complement" : "supplement"} — no options, you do the maths! ✍️
      </p>

      <svg viewBox="0 0 200 110" className="w-full max-w-xs rounded-card border border-line bg-surface">
        <path
          d={`M ${cx + r} ${cy} A ${r} ${r} 0 0 0 ${cx + r * Math.cos(endRad)} ${cy - r * Math.sin(endRad)}`}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="16"
        />
        <path
          d={`M ${cx + r} ${cy} A ${r} ${r} 0 0 0 ${cx + r * Math.cos(givenRad)} ${cy - r * Math.sin(givenRad)}`}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="16"
        />
        {showAnswer && (
          <path
            d={`M ${cx + r * Math.cos(givenRad)} ${cy - r * Math.sin(givenRad)} A ${r} ${r} 0 0 0 ${cx + r * Math.cos(endRad)} ${cy - r * Math.sin(endRad)}`}
            fill="none"
            stroke="#1db88a"
            strokeWidth="16"
          />
        )}
        <text x={cx + 40} y={cy - 12} fill="#fff" fontSize="13" fontWeight="bold">
          {round.given}°
        </text>
        <text
          x={round.kind === "complement" ? cx - 8 : cx - 52}
          y={round.kind === "complement" ? cy - 46 : cy - 12}
          fill={showAnswer ? "#1db88a" : "rgba(255,255,255,0.5)"}
          fontSize="13"
          fontWeight="bold"
        >
          {showAnswer ? `${answer}°` : "?"}
        </text>
      </svg>

      <form onSubmit={check} className="mt-4 flex items-center gap-2">
        <input
          type="number"
          inputMode="numeric"
          value={entry}
          onChange={(e) => {
            setEntry(e.target.value);
            setState("typing");
          }}
          disabled={state === "correct"}
          placeholder="?"
          aria-label="Missing angle in degrees"
          className="w-24 rounded-btn border border-line bg-surface px-3 py-2.5 text-center font-head text-xl font-bold outline-none focus:border-line-strong"
        />
        <span className="font-head text-lg">°</span>
        {state !== "correct" && (
          <button type="submit" className="rounded-btn px-5 py-2.5 font-head font-semibold text-white" style={{ background: "var(--accent)" }}>
            Check ✓
          </button>
        )}
      </form>

      {state === "wrong" && (
        <p className="mt-3 text-sm text-coral">
          Not yet — together they must make {total}°. What is {total}° − {round.given}°?
        </p>
      )}
      {state === "correct" && (
        <div className="mt-3 flex flex-col items-center gap-2">
          <p className="font-head text-sm text-teal">
            ✓ {round.given}° + {answer}° = {total}° — perfect partners!
          </p>
          <button onClick={nextRound} className="rounded-btn px-6 py-3 font-head font-semibold text-white" style={{ background: "var(--accent)" }}>
            {idx === ROUNDS.length - 1 ? "Finish →" : "Next →"}
          </button>
        </div>
      )}
    </>
  );
}
