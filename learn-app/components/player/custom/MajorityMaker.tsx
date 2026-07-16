"use client";

import { useState } from "react";
import { usePlayer } from "../PlayerContext";
import { useFeedbackSounds } from "../useBeep";

// Form a government from real election results. Uses the UP 2017 Vidhan Sabha
// data from the textbook: a party needs MORE THAN HALF of 403 seats (i.e. 202)
// to win. The student discovers that the majority party forms the government
// and its leader becomes Chief Minister.

const TOTAL_SEATS = 403;
const MAJORITY = Math.floor(TOTAL_SEATS / 2) + 1; // 202

const PARTIES: { name: string; short: string; seats: number; color: string }[] = [
  { name: "Bharatiya Janta Party", short: "BJP", seats: 312, color: "#ef9f27" },
  { name: "Samajwadi Party", short: "SP", seats: 47, color: "#d85a30" },
  { name: "Bahujan Samaj Party", short: "BSP", seats: 19, color: "#6c63ff" },
  { name: "Others", short: "OTH", seats: 17, color: "#8a8f98" },
  { name: "Indian National Congress", short: "INC", seats: 7, color: "#1db88a" },
  { name: "RLD", short: "RLD", seats: 1, color: "#d4537e" },
];

export function MajorityMaker(props: Record<string, unknown> = {}) {
  const { next } = usePlayer();
  // Inside the Statehouse hub, onComplete marks the room cleared instead of
  // advancing the whole chapter.
  const finish = (props.onComplete as (() => void) | undefined) ?? next;
  const sounds = useFeedbackSounds();
  const [picked, setPicked] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);

  const pick = (short: string) => {
    if (solved) return;
    setPicked(short);
    const party = PARTIES.find((p) => p.short === short)!;
    if (party.seats >= MAJORITY) {
      sounds.correct();
      setSolved(true);
    } else {
      sounds.wrong();
    }
  };

  const maxSeats = Math.max(...PARTIES.map((p) => p.seats));

  return (
    <>
      <div className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
        🗳️ Form the Government
      </div>
      <h2 className="mb-2.5 text-2xl sm:text-3xl">Who wins Uttar Pradesh?</h2>
      <p className="mb-4 max-w-lg text-sm text-ink-secondary">
        UP has <b className="text-ink">403</b> seats (constituencies). To form the government, a party needs{" "}
        <b className="text-ink">more than half</b> — that&apos;s the majority line at{" "}
        <b style={{ color: "var(--accent)" }}>{MAJORITY}</b>. Here are the real 2017 results. Tap the party that
        forms the government!
      </p>

      <div className="flex w-full max-w-md flex-col gap-2">
        {PARTIES.map((p) => {
          const isPicked = picked === p.short;
          const wins = p.seats >= MAJORITY;
          return (
            <button
              key={p.short}
              disabled={solved}
              onClick={() => pick(p.short)}
              className={`rounded-btn border px-3 py-2 text-left transition-all ${
                isPicked
                  ? wins
                    ? "border-teal/60 bg-teal/10"
                    : "border-coral bg-coral/15"
                  : "border-line bg-surface hover:border-line-strong"
              }`}
            >
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium">
                  {p.short} <span className="text-ink-muted">· {p.name}</span>
                </span>
                <span className="font-head font-bold">{p.seats}</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
                <div className="h-full rounded-full" style={{ width: `${(p.seats / maxSeats) * 100}%`, background: p.color }} />
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-ink-muted">🚩 Majority line = {MAJORITY} of {TOTAL_SEATS} seats</p>

      {picked && !solved && (
        <p className="mt-3 max-w-md text-sm text-coral">
          {PARTIES.find((p) => p.short === picked)!.seats} seats isn&apos;t more than half. Which party crossed{" "}
          {MAJORITY}?
        </p>
      )}

      {solved && (
        <div className="mt-4 max-w-md rounded-card border border-teal/40 bg-teal/10 p-4 text-sm">
          <p className="mb-2 text-ink-secondary">
            🎉 The <b className="text-ink">BJP</b> won 312 seats — well over the majority of {MAJORITY} — so it forms
            the government! Its elected leader becomes the <b className="text-ink">Chief Minister</b>, and the
            Governor invites them to form the Council of Ministers.
          </p>
          <p className="mb-3 text-xs text-ink-muted">
            Each of the 403 seats is won by one MLA using the <b className="text-ink">simple majority</b> system —
            whoever gets the most votes in a constituency wins it.
          </p>
          <div className="text-center">
            <button onClick={finish} className="rounded-btn px-6 py-3 font-head font-semibold text-white" style={{ background: "var(--accent)" }}>
              Continue ↓
            </button>
          </div>
        </div>
      )}
    </>
  );
}
