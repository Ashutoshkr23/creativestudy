"use client";

import { useEffect, useState } from "react";
import { usePlayer } from "../PlayerContext";
import { useFeedbackSounds } from "../useBeep";

// The book's HOTS question as a playable puzzle: three unlabeled bottles
// (an acid, a base, distilled water) and ONLY blue litmus paper. The trick:
// a blue strip that turns red becomes a red strip you can reuse.

type Identity = "acid" | "base" | "water";
type BottleId = "A" | "B" | "C";

const BOTTLES: BottleId[] = ["A", "B", "C"];
const LABELS: { value: Identity; text: string }[] = [
  { value: "acid", text: "Acid 🧪" },
  { value: "base", text: "Base 🧼" },
  { value: "water", text: "Distilled water 💧" },
];

function shuffledIdentities(): Record<BottleId, Identity> {
  const kinds: Identity[] = ["acid", "base", "water"];
  for (let i = kinds.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [kinds[i], kinds[j]] = [kinds[j], kinds[i]];
  }
  return { A: kinds[0], B: kinds[1], C: kinds[2] };
}

export function ThreeBottlesPuzzle() {
  const { next } = usePlayer();
  const sounds = useFeedbackSounds();
  // Shuffled after mount so the server and client render identically.
  const [identities, setIdentities] = useState<Record<BottleId, Identity> | null>(null);
  const [freshStrips, setFreshStrips] = useState(3);
  const [hasRedStrip, setHasRedStrip] = useState(false);
  const [tool, setTool] = useState<"blue" | "red">("blue");
  const [observations, setObservations] = useState<Record<BottleId, string[]>>({ A: [], B: [], C: [] });
  const [labels, setLabels] = useState<Record<BottleId, "" | Identity>>({ A: "", B: "", C: "" });
  const [verdict, setVerdict] = useState<"" | "correct" | "wrong">("");

  useEffect(() => {
    setIdentities(shuffledIdentities());
  }, []);

  const reset = () => {
    setIdentities(shuffledIdentities());
    setFreshStrips(3);
    setHasRedStrip(false);
    setTool("blue");
    setObservations({ A: [], B: [], C: [] });
    setLabels({ A: "", B: "", C: "" });
    setVerdict("");
  };

  const dip = (bottle: BottleId) => {
    if (!identities || verdict === "correct") return;
    const kind = identities[bottle];
    if (tool === "blue") {
      if (freshStrips === 0) return;
      setFreshStrips((n) => n - 1);
      if (kind === "acid") {
        sounds.correct();
        setHasRedStrip(true);
        setObservations((o) => ({ ...o, [bottle]: [...o[bottle], "🟥 Blue strip turned RED!"] }));
      } else {
        sounds.tap();
        setObservations((o) => ({ ...o, [bottle]: [...o[bottle], "🟦 Blue strip stayed blue"] }));
      }
    } else {
      if (!hasRedStrip) return;
      if (kind === "base") {
        sounds.correct();
        setObservations((o) => ({ ...o, [bottle]: [...o[bottle], "🟦 Red strip turned BLUE!"] }));
      } else {
        sounds.tap();
        setObservations((o) => ({ ...o, [bottle]: [...o[bottle], "🟥 Red strip stayed red"] }));
      }
    }
  };

  const check = () => {
    if (!identities) return;
    const allSet = BOTTLES.every((b) => labels[b] !== "");
    if (!allSet) return;
    const correct = BOTTLES.every((b) => labels[b] === identities[b]);
    if (correct) {
      sounds.correct();
      setVerdict("correct");
    } else {
      sounds.wrong();
      setVerdict("wrong");
    }
  };

  const stuck = freshStrips === 0 && !hasRedStrip && verdict !== "correct";

  return (
    <>
      <div className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
        🕵️ Final Case
      </div>
      <h2 className="mb-2.5 text-2xl sm:text-3xl">The three mystery bottles</h2>
      <p className="mb-4 max-w-lg text-sm text-ink-secondary">
        One bottle holds an <b className="text-ink">acid</b>, one a <b className="text-ink">base</b>, one{" "}
        <b className="text-ink">distilled water</b> — and all you have is{" "}
        <b className="text-ink">3 strips of BLUE litmus paper</b>. Can you label all three?{" "}
        <i>Hint: a used strip might still be useful…</i>
      </p>

      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => setTool("blue")}
          disabled={freshStrips === 0}
          className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors disabled:opacity-40 ${
            tool === "blue" ? "bg-surface-2 text-ink" : "border-line bg-surface text-ink-secondary"
          }`}
          style={tool === "blue" ? { borderColor: "var(--accent)" } : undefined}
        >
          🟦 Fresh blue strip × {freshStrips}
        </button>
        <button
          onClick={() => setTool("red")}
          disabled={!hasRedStrip}
          className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors disabled:opacity-40 ${
            tool === "red" ? "bg-surface-2 text-ink" : "border-line bg-surface text-ink-secondary"
          }`}
          style={tool === "red" ? { borderColor: "var(--accent)" } : undefined}
        >
          🟥 Red strip (reusable){!hasRedStrip && " — none yet"}
        </button>
      </div>

      <div className="grid w-full max-w-lg grid-cols-3 gap-2.5">
        {BOTTLES.map((b) => (
          <div key={b} className="flex flex-col items-center gap-2 rounded-card border border-line bg-surface p-3">
            <button onClick={() => dip(b)} className="flex flex-col items-center transition-transform active:scale-95">
              <span className="text-4xl">🍾</span>
              <span className="font-head text-lg font-bold">{b}</span>
              <span className="text-[10px] text-ink-muted">tap to dip strip</span>
            </button>
            <div className="flex min-h-10 flex-col gap-0.5 text-[10px] text-ink-secondary">
              {observations[b].map((obs, i) => (
                <span key={i}>{obs}</span>
              ))}
            </div>
            <select
              value={labels[b]}
              onChange={(e) => {
                setVerdict("");
                setLabels((l) => ({ ...l, [b]: e.target.value as Identity | "" }));
              }}
              className="w-full rounded-btn border border-line bg-surface-2 px-1.5 py-1.5 text-xs outline-none"
            >
              <option value="">Label…?</option>
              {LABELS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.text}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {verdict !== "correct" && (
        <button
          onClick={check}
          disabled={!BOTTLES.every((b) => labels[b] !== "")}
          className="mt-4 rounded-btn px-6 py-3 font-head font-semibold text-white transition-opacity disabled:opacity-40"
          style={{ background: "var(--accent)" }}
        >
          Check my labels ✓
        </button>
      )}

      {verdict === "wrong" && (
        <p className="mt-3 text-sm text-coral">Not quite — the evidence disagrees. Look at your observations again!</p>
      )}

      {stuck && (
        <button onClick={reset} className="mt-3 rounded-btn border border-line bg-surface px-5 py-2.5 text-sm text-ink-secondary">
          Out of strips! Ask for a fresh set 🔁
        </button>
      )}

      {verdict === "correct" && (
        <div className="mt-4 max-w-md rounded-card border border-teal/40 bg-teal/10 p-4 text-left text-sm">
          <p className="mb-1 font-head font-semibold text-teal">Case closed, detective! 🏅</p>
          <p className="text-ink-secondary">
            The trick: the blue strip that turned <b className="text-ink">red</b> in the acid became a{" "}
            <b className="text-ink">red litmus strip</b>. Dipping it in the others, only the{" "}
            <b className="text-ink">base</b> turned it blue again — and the bottle that changed nothing
            either way was <b className="text-ink">water</b>.
          </p>
          <div className="mt-3 text-center">
            <button
              onClick={next}
              className="rounded-btn px-6 py-3 font-head font-semibold text-white"
              style={{ background: "var(--accent)" }}
            >
              On to the Boss Quiz ↓
            </button>
          </div>
        </div>
      )}
    </>
  );
}
