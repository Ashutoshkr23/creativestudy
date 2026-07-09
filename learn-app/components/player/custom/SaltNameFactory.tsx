"use client";

import { useState } from "react";
import { usePlayer } from "../PlayerContext";
import { useFeedbackSounds } from "../useBeep";

// Pick a base and an acid, pull the lever, and the factory stamps out the
// salt's name — the naming rule becomes a toy.

const BASES = [
  { id: "naoh", name: "Sodium hydroxide (NaOH)", part: "Sodium" },
  { id: "koh", name: "Potassium hydroxide (KOH)", part: "Potassium" },
  { id: "nh4oh", name: "Ammonium hydroxide (NH₄OH)", part: "Ammonium" },
];

const ACIDS = [
  { id: "hcl", name: "Hydrochloric acid (HCl)", part: "chloride" },
  { id: "h2so4", name: "Sulphuric acid (H₂SO₄)", part: "sulphate" },
  { id: "hno3", name: "Nitric acid (HNO₃)", part: "nitrate" },
  { id: "h2co3", name: "Carbonic acid (H₂CO₃)", part: "carbonate" },
];

const FUN_FACTS: Record<string, string> = {
  "Sodium chloride": "That's common salt — it's on your dinner table! 🧂",
  "Sodium carbonate": "That's washing soda — used to soften laundry water! 🧺",
  "Potassium nitrate": "Also called saltpetre — used in fertilisers and fireworks! 🎆",
  "Ammonium chloride": "Used inside dry-cell batteries! 🔋",
  "Sodium sulphate": "Used in making detergents! 🧴",
};

export function SaltNameFactory() {
  const { next } = usePlayer();
  const sounds = useFeedbackSounds();
  const [baseId, setBaseId] = useState(BASES[0].id);
  const [acidId, setAcidId] = useState(ACIDS[0].id);
  const [made, setMade] = useState<Set<string>>(new Set());
  const [lastSalt, setLastSalt] = useState<string | null>(null);

  const mix = () => {
    const base = BASES.find((b) => b.id === baseId)!;
    const acid = ACIDS.find((a) => a.id === acidId)!;
    const salt = `${base.part} ${acid.part}`;
    sounds.correct();
    setLastSalt(salt);
    setMade((s) => new Set(s).add(salt));
  };

  const selectClass =
    "w-full rounded-btn border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-line-strong";

  return (
    <>
      <div className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
        🏭 The Salt Name Factory
      </div>
      <h2 className="mb-2.5 text-2xl sm:text-3xl">Every salt has two parents</h2>
      <p className="mb-5 max-w-lg text-sm text-ink-secondary">
        A salt&apos;s name comes from its parents: the <b className="text-ink">first word from the base</b>,
        the <b className="text-ink">second from the acid</b>. Pick any pair and hit MIX — make at least 3
        different salts.
      </p>

      <div className="grid w-full max-w-md gap-2 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-left text-xs text-ink-secondary">
          🧼 Base
          <select value={baseId} onChange={(e) => setBaseId(e.target.value)} className={selectClass}>
            {BASES.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-left text-xs text-ink-secondary">
          🧪 Acid
          <select value={acidId} onChange={(e) => setAcidId(e.target.value)} className={selectClass}>
            {ACIDS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        onClick={mix}
        className="mt-4 rounded-btn px-8 py-3 font-head text-base font-bold text-white transition-transform active:scale-95"
        style={{ background: "var(--accent)" }}
      >
        ⚙️ MIX!
      </button>

      {lastSalt && (
        <div key={lastSalt + made.size} className="mt-4 max-w-md rounded-card border border-line bg-surface-2 p-4">
          <p className="text-xs text-ink-secondary">
            {BASES.find((b) => b.id === baseId)!.part} (from the base) + {ACIDS.find((a) => a.id === acidId)!.part}{" "}
            (from the acid) =
          </p>
          <p className="font-head text-xl font-bold" style={{ color: "var(--accent)" }}>
            🧂 {lastSalt}
          </p>
          {FUN_FACTS[lastSalt] && <p className="mt-1 text-sm text-ink-secondary">{FUN_FACTS[lastSalt]}</p>}
        </div>
      )}

      <p className="mt-3 text-xs text-ink-muted">Salts made: {made.size} / 3</p>

      {made.size >= 3 && (
        <button
          onClick={next}
          className="mt-3 rounded-btn px-6 py-3 font-head font-semibold text-white"
          style={{ background: "var(--accent)" }}
        >
          Continue ↓
        </button>
      )}
    </>
  );
}
