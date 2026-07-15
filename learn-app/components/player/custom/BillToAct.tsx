"use client";

import { useState } from "react";
import { usePlayer } from "../PlayerContext";
import { useFeedbackSounds } from "../useBeep";

// Guide a bill through the law-making journey. At each stage the student makes
// the correct choice; the Governor stage has a decision fork (sign / send back)
// that teaches "no bill becomes an Act without the Governor's signature".

type Step = {
  id: string;
  title: string;
  scene: string;
  prompt: string;
  choices: { label: string; correct: boolean; feedback: string }[];
};

const STEPS: Step[] = [
  {
    id: "introduce",
    title: "1 · Introducing the Bill",
    scene: "📜",
    prompt: "A new law is drafted as a BILL. Where is it first introduced?",
    choices: [
      { label: "In the Legislative Assembly (or Council)", correct: true, feedback: "Correct! A bill is introduced in the House — the Vidhan Sabha or Vidhan Parishad." },
      { label: "On the Governor's desk", correct: false, feedback: "Not yet — the Governor only sees it much later. It starts in the House." },
      { label: "In the Supreme Court", correct: false, feedback: "Courts interpret laws; they don't make them. Law-making starts in the legislature." },
    ],
  },
  {
    id: "debate",
    title: "2 · Debate & Amendments",
    scene: "🗣️",
    prompt: "The bill is discussed. What can members do to it here?",
    choices: [
      { label: "Debate it and make amendments (changes)", correct: true, feedback: "Yes! Members discuss and can amend the bill before voting." },
      { label: "Sign it into law immediately", correct: false, feedback: "Too soon — it must be debated and voted on first." },
    ],
  },
  {
    id: "vote",
    title: "3 · The Vote",
    scene: "🗳️",
    prompt: "Debate is over. What happens next?",
    choices: [
      { label: "It is put to a vote — and must be passed", correct: true, feedback: "Right! If the majority votes yes, the bill is passed." },
      { label: "It automatically becomes a law", correct: false, feedback: "No law is automatic — the House must vote to pass it." },
    ],
  },
  {
    id: "governor",
    title: "4 · The Governor Decides",
    scene: "🖋️",
    prompt: "The passed bill goes to the Governor. For it to become an ACT, the Governor must…",
    choices: [
      { label: "Sign it", correct: true, feedback: "Exactly! No bill can become an Act without the Governor's signature." },
      { label: "Send it back for reconsideration", correct: false, feedback: "The Governor CAN send it back — but then it's still not an Act. To become law, it needs the signature." },
      { label: "Ignore it", correct: false, feedback: "The Governor can't simply ignore it; a decision is required. To make it law, they sign." },
    ],
  },
];

export function BillToAct() {
  const { next } = usePlayer();
  const sounds = useFeedbackSounds();
  const [stepIdx, setStepIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);
  const [done, setDone] = useState(false);

  const step = STEPS[stepIdx];

  const pick = (i: number) => {
    if (solved) return;
    setPicked(i);
    if (step.choices[i].correct) {
      sounds.correct();
      setSolved(true);
    } else {
      sounds.wrong();
    }
  };

  const advance = () => {
    if (stepIdx === STEPS.length - 1) {
      setDone(true);
      return;
    }
    setStepIdx((i) => i + 1);
    setPicked(null);
    setSolved(false);
  };

  if (done) {
    return (
      <>
        <div className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
          🏛️ From Bill to Act
        </div>
        <h2 className="mb-2.5 text-2xl sm:text-3xl">🎉 Your bill is now an ACT!</h2>
        <div className="max-w-md rounded-card border border-teal/40 bg-teal/10 p-4 text-left text-sm">
          <p className="mb-2 text-ink-secondary">You traced the whole journey of a law:</p>
          <p className="mb-2 font-head text-ink">
            📜 Bill → 🗣️ Debate → 🗳️ Vote → 🖋️ Governor signs → ✅ ACT
          </p>
          <p className="mb-3 text-ink-secondary">
            This whole process is called <b className="text-ink">legislation</b>, and the people who do it (MLAs,
            MLCs, MPs) are called <b className="text-ink">legislators</b>. Money bills, remember, can only start in
            the Legislative Assembly.
          </p>
          <div className="text-center">
            <button onClick={next} className="rounded-btn px-6 py-3 font-head font-semibold text-white" style={{ background: "var(--accent)" }}>
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
        🏛️ From Bill to Act · {stepIdx + 1}/{STEPS.length}
      </div>
      <h2 className="mb-3 text-2xl sm:text-3xl">{step.title}</h2>

      <div className="mb-4 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full border text-lg transition-colors"
              style={{
                borderColor: i < stepIdx || (i === stepIdx && solved) ? "#1db88a" : "rgba(255,255,255,0.2)",
                background: i < stepIdx || (i === stepIdx && solved) ? "rgba(29,184,138,0.15)" : "transparent",
                opacity: i <= stepIdx ? 1 : 0.4,
              }}
            >
              {s.scene}
            </div>
            {i < STEPS.length - 1 && <span className="text-ink-muted">→</span>}
          </div>
        ))}
      </div>

      <p className="mb-4 max-w-lg font-head text-base font-semibold">{step.prompt}</p>

      <div className="flex w-full max-w-sm flex-col gap-2.5">
        {step.choices.map((choice, i) => {
          let state = "border-line bg-surface hover:border-line-strong";
          if (picked === i) state = choice.correct ? "border-teal/60 bg-teal/15 text-teal" : "border-coral bg-coral/15";
          else if (solved) state = "border-line bg-surface opacity-60";
          return (
            <button
              key={i}
              disabled={solved}
              onClick={() => pick(i)}
              className={`rounded-btn border px-4 py-3 text-left text-sm transition-colors ${state}`}
            >
              {choice.label}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div className={`mt-4 max-w-md rounded-card border p-3 text-sm ${step.choices[picked].correct ? "border-teal/40 bg-teal/10 text-ink-secondary" : "border-coral/40 bg-coral/10 text-ink-secondary"}`}>
          {step.choices[picked].feedback}
        </div>
      )}

      {solved && (
        <button onClick={advance} className="mt-4 rounded-btn px-6 py-3 font-head font-semibold text-white" style={{ background: "var(--accent)" }}>
          {stepIdx === STEPS.length - 1 ? "See the result →" : "Next stage →"}
        </button>
      )}
    </>
  );
}
