"use client";

import { useState } from "react";
import { usePlayer } from "../PlayerContext";
import { useFeedbackSounds } from "../useBeep";
import { MajorityMaker } from "./MajorityMaker";
import { BillToAct } from "./BillToAct";

// "The Statehouse" — an explorable building hub. The student tours five rooms
// of the state's power building in any order; each room teaches its concepts
// and tests them. Correct decisions raise an Approval meter; clearing all five
// ends the term with an election result, then advances to the boss quiz.
//
// Every teaching beat comes BEFORE its question (no orphan questions), and
// tracked quiz beats reuse ids that exist in the chapter's exercises[] bank so
// they resolve on the teacher dashboard and feed Today's Review.

type Card = { icon: string; front: string; back: string };
type Option = { id: string; label: string };

type Beat =
  | { kind: "teach"; title: string; body: string; cards?: Card[] }
  | { kind: "quiz"; questionId: string; prompt: string; options: Option[]; correct: string; explain?: string }
  | { kind: "decision"; emoji: string; situation: string; question: string; choices: { label: string; correct: boolean; outcome: string }[]; explain: string }
  | { kind: "sim"; component: "majority" | "bill"; label: string };

type Room = { id: string; emoji: string; title: string; tagline: string; color: string; beats: Beat[] };

const ROOMS: Room[] = [
  {
    id: "assembly",
    emoji: "🗳️",
    title: "The Assembly Hall",
    tagline: "Where the people's representatives meet",
    color: "#1db88a",
    beats: [
      {
        kind: "teach",
        title: "A country run at two levels",
        body: "India is a federal union of 28 states and 8 union territories. Being federal means government works at TWO levels — the Centre for the whole nation and each state for its own people — and the Constitution divides powers between them. Both levels have the same three organs.",
        cards: [
          { icon: "⚙️", front: "Executive", back: "Runs the government (Governor, Chief Minister, ministers, civil servants)." },
          { icon: "🏛️", front: "Legislature", back: "Makes the laws (Vidhan Sabha and Vidhan Parishad)." },
          { icon: "⚖️", front: "Judiciary", back: "Interprets laws and settles disputes (the courts)." },
          { icon: "📜", front: "State List", back: "Subjects on which ONLY the state government can make laws — like police and public health." },
        ],
      },
      {
        kind: "teach",
        title: "One house or two?",
        body: "Every state has a Legislative Assembly (Vidhan Sabha). Some states ALSO have an upper house, the Legislative Council (Vidhan Parishad) — just as the nation has the Lok Sabha and Rajya Sabha.",
        cards: [
          { icon: "🏛️", front: "Bicameral (2 houses)", back: "Only 6 states: Andhra Pradesh, Bihar, Jammu & Kashmir, Karnataka, Maharashtra, Uttar Pradesh." },
          { icon: "🏠", front: "Unicameral (1 house)", back: "Only the Assembly. MOST states are unicameral." },
        ],
      },
      {
        kind: "quiz",
        questionId: "sg-ex-13",
        prompt: "Which pair of states has a bicameral legislature (BOTH houses)?",
        options: [
          { id: "a", label: "Kerala and Gujarat" },
          { id: "b", label: "Uttar Pradesh and Bihar" },
          { id: "c", label: "Goa and Sikkim" },
          { id: "d", label: "Rajasthan and Punjab" },
        ],
        correct: "b",
        explain: "UP, Bihar, Maharashtra, Karnataka, Andhra Pradesh and J&K are bicameral; most others are unicameral.",
      },
      {
        kind: "teach",
        title: "The Vidhan Sabha — the powerful lower house",
        body: "The Legislative Assembly is the lower house. Its members — MLAs — are directly elected by the people (in proportion to the state's population). Its term is 5 years, but it can be dissolved earlier. Each state is carved into voting areas called constituencies; Uttar Pradesh has 403!",
        cards: [
          { icon: "🔢", front: "How many members?", back: "At most 500, at least 60. Special cases: Goa & Mizoram 40, Sikkim just 32." },
          { icon: "🗳️", front: "How elected?", back: "One MLA per constituency, by the simple-majority system — most votes wins." },
        ],
      },
      {
        kind: "quiz",
        questionId: "sg-ex-14",
        prompt: "The term of the Vidhan Sabha is…",
        options: [
          { id: "a", label: "4 years" },
          { id: "b", label: "5 years" },
          { id: "c", label: "6 years" },
          { id: "d", label: "Permanent" },
        ],
        correct: "b",
        explain: "5 years — though it can be dissolved earlier. (The Vidhan Parishad, in contrast, is permanent.)",
      },
      { kind: "sim", component: "majority", label: "🗳️ Hold the election!" },
      {
        kind: "teach",
        title: "The Vidhan Parishad — the permanent upper house",
        body: "The Legislative Council exists only in bicameral states. Its members are MLCs. Its special trick: it's a PERMANENT house that can never be fully dissolved — one-third of members retire every two years, each serving a 6-year term.",
        cards: [
          { icon: "🔢", front: "Size", back: "At least 40 members, and no more than one-third of the Assembly's size." },
          { icon: "🗳️", front: "Chosen by", back: "Elected by the Vidhan Sabha, local bodies, teachers and graduates — plus some nominated by the Governor from art, literature, science and social service." },
        ],
      },
      {
        kind: "quiz",
        questionId: "sg-ex-16",
        prompt: "One-third of the members of the Vidhan Parishad retire every…",
        options: [
          { id: "a", label: "Year" },
          { id: "b", label: "Two years" },
          { id: "c", label: "Five years" },
          { id: "d", label: "Six years" },
        ],
        correct: "b",
        explain: "1/3 retire every 2 years; each member's term is 6 years.",
      },
      {
        kind: "teach",
        title: "Who can stand, and who keeps order",
        body: "To be a member you must be an Indian citizen, of sound mind, not a convicted criminal, and hold no office of profit. Minimum age: 25 for the Vidhan Sabha, 30 for the Vidhan Parishad. Each house has presiding officers who keep order and vote only to break a tie.",
        cards: [
          { icon: "🎤", front: "Vidhan Sabha", back: "Run by the Speaker and Deputy Speaker." },
          { icon: "🪑", front: "Vidhan Parishad", back: "Run by the Chairman and Deputy Chairman." },
        ],
      },
      {
        kind: "quiz",
        questionId: "sg-ex-10",
        prompt: "The presiding officer of the Vidhan Sabha is the…",
        options: [
          { id: "a", label: "Chairman" },
          { id: "b", label: "Speaker" },
          { id: "c", label: "Governor" },
          { id: "d", label: "Chief Minister" },
        ],
        correct: "b",
        explain: "The Speaker presides over the Vidhan Sabha; the Chairman presides over the Vidhan Parishad.",
      },
    ],
  },
  {
    id: "law",
    emoji: "📜",
    title: "The Law Chamber",
    tagline: "Where a bill becomes a law",
    color: "#ef9f27",
    beats: [
      {
        kind: "teach",
        title: "How a law is born",
        body: "The whole process of making and passing laws is called LEGISLATION, and the people who do it — MLAs, MLCs and MPs — are legislators. Laws for the whole nation are made in Parliament; laws for one state are made in that state's legislature. A brand-new law starts life as a BILL (a draft). Let's pilot one!",
      },
      { kind: "sim", component: "bill", label: "📜 Pilot a bill into law" },
      {
        kind: "quiz",
        questionId: "sg-ex-2",
        prompt: "The process of making and passing laws is called…",
        options: [
          { id: "a", label: "Legislation" },
          { id: "b", label: "Billing" },
          { id: "c", label: "Writing" },
          { id: "d", label: "None of these" },
        ],
        correct: "a",
      },
      {
        kind: "teach",
        title: "A special rule for Money Bills",
        body: "A Money Bill — about taxes and spending — is special. It can be introduced ONLY in the Legislative Assembly (never the Council), and even then it needs the Governor's prior approval. The Governor also causes the state's annual budget to be presented in the Vidhan Sabha.",
      },
      {
        kind: "quiz",
        questionId: "sg-ex-15",
        prompt: "A Money Bill can be introduced only in the…",
        options: [
          { id: "a", label: "Vidhan Parishad" },
          { id: "b", label: "Vidhan Sabha" },
          { id: "c", label: "Governor's office" },
          { id: "d", label: "Supreme Court" },
        ],
        correct: "b",
        explain: "Money bills start only in the Vidhan Sabha — and need the Governor's prior approval.",
      },
    ],
  },
  {
    id: "governor",
    emoji: "🪑",
    title: "The Governor's Office",
    tagline: "The big chair — now it's yours",
    color: "#6c63ff",
    beats: [
      {
        kind: "teach",
        title: "Meet the Governor",
        body: "The Governor is the nominal (constitutional) head of the state — like the President is for the nation. Appointed by the President of India for 5 years, and removable by the President on the Prime Minister's advice. In normal times the Governor acts on the ministers' advice — but if the state's government breaks down and the President takes over (President's Rule), the Governor becomes the REAL ruler.",
        cards: [
          { icon: "🇮🇳", front: "Must be…", back: "A citizen of India, at least 35 years old." },
          { icon: "🚫", front: "Must NOT…", back: "Hold an office of profit, or stay an MP/MLA (must resign that seat)." },
          { icon: "🖊️", front: "Appointed by", back: "The President of India — not elected by the people." },
        ],
      },
      {
        kind: "quiz",
        questionId: "sg-ex-5",
        prompt: "By whom is the Governor appointed?",
        options: [
          { id: "a", label: "The MLAs" },
          { id: "b", label: "The President of India" },
          { id: "c", label: "The people, by voting" },
          { id: "d", label: "The Chief Minister" },
        ],
        correct: "b",
      },
      {
        kind: "teach",
        title: "The Governor's three powers",
        body: "As Governor you hold three kinds of power. Tap to learn each — you'll use them in a moment.",
        cards: [
          { icon: "⚙️", front: "Executive", back: "Administration runs in your name. You appoint the CM (majority leader), other ministers on the CM's advice, the Advocate-General, and the PSC chairman & members." },
          { icon: "🏛️", front: "Legislative", back: "You summon, adjourn and prorogue the House, address its opening session, sign bills into Acts, can dissolve the Assembly early, and issue ordinances." },
          { icon: "⚖️", front: "Judicial", back: "You can pardon, reprieve or commute punishments — even change a death sentence to life imprisonment." },
        ],
      },
      {
        kind: "decision",
        emoji: "🗳️",
        situation: "The election is over and one party has won a clear majority in the Vidhan Sabha. As Governor, you must appoint a Chief Minister.",
        question: "Whom do you invite to be Chief Minister?",
        choices: [
          { label: "The leader of the majority party", correct: true, outcome: "Perfect — exactly the rule." },
          { label: "Your own friend", outcome: "No — the Governor can't just pick a friend. That would be unconstitutional.", correct: false },
          { label: "The leader of the losing party", outcome: "They don't have the numbers to run the government or pass laws.", correct: false },
        ],
        explain: "The Governor always appoints the leader of the majority party in the Vidhan Sabha as Chief Minister.",
      },
      {
        kind: "decision",
        emoji: "⚡",
        situation: "A sudden crisis needs a new law immediately — but the legislature is in recess, so no bill can be passed right now.",
        question: "Which power do you use?",
        choices: [
          { label: "Issue an ordinance", correct: true, outcome: "Smart! A temporary law with the force of an Act." },
          { label: "Sign a bill that doesn't exist yet", outcome: "There's no passed bill to sign — the House hasn't met.", correct: false },
          { label: "Wait months for the next session", outcome: "The crisis can't wait that long.", correct: false },
        ],
        explain: "During a recess the Governor can issue an ordinance — but it must be ratified within six weeks of the legislature's next session, or it lapses.",
      },
      {
        kind: "quiz",
        questionId: "sg-ex-11",
        prompt: "A temporary law issued by the Governor when the legislature is not in session is called a/an…",
        options: [
          { id: "a", label: "Bill" },
          { id: "b", label: "Act" },
          { id: "c", label: "Ordinance" },
          { id: "d", label: "Amendment" },
        ],
        correct: "c",
      },
      {
        kind: "decision",
        emoji: "🕊️",
        situation: "A prisoner sentenced to death has sent you an appeal for mercy. This is one of your judicial powers.",
        question: "What can you, as Governor, do here?",
        choices: [
          { label: "Commute the death penalty to life imprisonment", correct: true, outcome: "Yes — a real judicial power of the Governor." },
          { label: "Order a fresh election", outcome: "Elections have nothing to do with a mercy petition.", correct: false },
          { label: "Pass a new tax law", outcome: "That's a legislative matter, not a mercy decision.", correct: false },
        ],
        explain: "The Governor's judicial powers include pardoning, reprieving and commuting punishments — even changing a death sentence to life imprisonment.",
      },
      {
        kind: "teach",
        title: "When can the Governor dissolve the Assembly?",
        body: "The Governor may dissolve the Vidhan Sabha before its 5 years are up — but only in three proper cases: (a) on the Chief Minister's advice, (b) when there's a breakdown of constitutional machinery, or (c) as directed by the President. Never on a whim!",
      },
      {
        kind: "teach",
        title: "🤯 You don't know!",
        body: "History corner:",
        cards: [
          { icon: "🌸", front: "First woman Governor of UP", back: "Sarojini Naidu — the famous poet." },
          { icon: "🏅", front: "A President who governed", back: "Pratibha Patil was Governor of Rajasthan from 2004 to 2007." },
        ],
      },
      {
        kind: "quiz",
        questionId: "sg-ex-4",
        prompt: "Who acts as the constitutional head of the state?",
        options: [
          { id: "a", label: "Chief minister" },
          { id: "b", label: "Governor" },
          { id: "c", label: "Prime minister" },
          { id: "d", label: "Advocate" },
        ],
        correct: "b",
      },
    ],
  },
  {
    id: "cm",
    emoji: "💼",
    title: "The CM's Chamber",
    tagline: "Where the real power sits",
    color: "#d85a30",
    beats: [
      {
        kind: "teach",
        title: "The Chief Minister — the real ruler",
        body: "The Chief Minister — leader of the majority party — is the REAL head of the state and the vital link between the Governor and the legislature. The CM stays in power only while enjoying the majority's support, so if the CM resigns, the WHOLE Council of Ministers falls too! The CM and ministers are answerable to the state legislature.",
        cards: [
          { icon: "🧭", front: "Direct", back: "Directs the ministry and decides its policies." },
          { icon: "📂", front: "Allocate", back: "Gives out, reshuffles or takes back portfolios (departments) from ministers." },
          { icon: "🤝", front: "Coordinate", back: "Coordinates all the ministers so government runs smoothly." },
          { icon: "👀", front: "Supervise", back: "Supervises the entire administration of the state." },
        ],
      },
      {
        kind: "teach",
        title: "The Council of Ministers",
        body: "Government runs through many departments, and each minister is placed in charge of one — their 'portfolio'. The ministers run their departments according to the policies of the council, and the Council of Ministers introduces the necessary bills in the Assembly and gets them approved.",
      },
      {
        kind: "quiz",
        questionId: "sg-ex-17",
        prompt: "The Chief Minister is the leader of the…",
        options: [
          { id: "a", label: "Opposition party" },
          { id: "b", label: "Majority party in the Vidhan Sabha" },
          { id: "c", label: "Civil service" },
          { id: "d", label: "Judiciary" },
        ],
        correct: "b",
      },
      {
        kind: "decision",
        emoji: "🪑",
        situation: "As Chief Minister, you decide to resign after losing your party's majority.",
        question: "What happens to your Council of Ministers?",
        choices: [
          { label: "The whole ministry resigns with me", correct: true, outcome: "Correct — the CM's resignation brings down the entire ministry." },
          { label: "Only I leave; the ministers stay", outcome: "No — the ministry cannot continue without the CM.", correct: false },
          { label: "The Governor also has to resign", outcome: "The Governor stays; only the elected government changes.", correct: false },
        ],
        explain: "Because the CM leads the whole Council of Ministers, the CM's resignation means the resignation of the entire ministry.",
      },
    ],
  },
  {
    id: "secretariat",
    emoji: "👔",
    title: "The Secretariat",
    tagline: "Where decisions become action",
    color: "#d4537e",
    beats: [
      {
        kind: "teach",
        title: "Civil Services — who does the work",
        body: "Ministers DECIDE; the civil service DOES. Officers like the IAS (Indian Administrative Service) and IPS (Indian Police Service) run the administration, and the state Public Service Commission (PSC) selects officials too. Follow the chain of command:",
        cards: [
          { icon: "👔", front: "Chief Secretary", back: "Heads the entire civil service of the state; secretaries and directors work under them." },
          { icon: "🗺️", front: "Divisions", back: "The state is split into divisions, each looked after by a Divisional Commissioner." },
          { icon: "📍", front: "Districts", back: "Divisions split into districts, each run by a District Magistrate." },
        ],
      },
      {
        kind: "quiz",
        questionId: "sg-ex-7",
        prompt: "Who heads the civil service in a state?",
        options: [
          { id: "a", label: "The Governor" },
          { id: "b", label: "The Chief Secretary" },
          { id: "c", label: "The Advocate-General" },
          { id: "d", label: "The District Magistrate" },
        ],
        correct: "b",
      },
      {
        kind: "quiz",
        questionId: "sg-ex-8",
        prompt: "The state is divided into administrative units called…",
        options: [
          { id: "a", label: "Constituencies" },
          { id: "b", label: "Divisions" },
          { id: "c", label: "Houses" },
          { id: "d", label: "Councils" },
        ],
        correct: "b",
      },
      {
        kind: "teach",
        title: "The Advocate-General",
        body: "Every state has an Advocate-General who advises the state executive on legal matters. Appointed by the Governor, they hold office 'during the pleasure of the Governor'. Only someone qualified to be a High Court judge is eligible. The Advocate-General may take part in the proceedings of the State Legislature — but cannot vote.",
      },
      {
        kind: "quiz",
        questionId: "sg-ex-1",
        prompt: "The ___-General is appointed by the Governor.",
        options: [
          { id: "a", label: "High" },
          { id: "b", label: "Chief" },
          { id: "c", label: "Advocate" },
          { id: "d", label: "Prime Minister" },
        ],
        correct: "c",
        explain: "The Advocate-General is the state's legal adviser, appointed by the Governor.",
      },
    ],
  },
];

const APPROVAL_START = 50;
const APPROVAL_STEP = 6;

export function Statehouse() {
  const { next, report } = usePlayer();
  const sounds = useFeedbackSounds();
  const [cleared, setCleared] = useState<Set<string>>(new Set());
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [beatIdx, setBeatIdx] = useState(0);
  const [approval, setApproval] = useState(APPROVAL_START);
  const [finale, setFinale] = useState(false);

  // per-beat interaction state
  const [chosen, setChosen] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [reported, setReported] = useState(false);

  const room = ROOMS.find((r) => r.id === activeRoom) ?? null;
  const beat = room ? room.beats[beatIdx] : null;

  const bumpApproval = () => setApproval((a) => Math.min(100, a + APPROVAL_STEP));

  const enterRoom = (id: string) => {
    sounds.tap();
    setActiveRoom(id);
    setBeatIdx(0);
    resetBeat();
  };

  const resetBeat = () => {
    setChosen(null);
    setAnswered(false);
    setReported(false);
  };

  // Retry within the same quiz beat: clear the answer UI but keep `reported`
  // so only the FIRST attempt is recorded (matches the rest of the app).
  const retryBeat = () => {
    setChosen(null);
    setAnswered(false);
  };

  const nextBeat = () => {
    if (!room) return;
    if (beatIdx >= room.beats.length - 1) {
      // room complete
      const newCleared = new Set(cleared).add(room.id);
      setCleared(newCleared);
      bumpApproval();
      setActiveRoom(null);
      if (newCleared.size === ROOMS.length) setFinale(true);
      return;
    }
    setBeatIdx((i) => i + 1);
    resetBeat();
  };

  // ——— quiz beat ———
  const answerQuiz = (b: Extract<Beat, { kind: "quiz" }>, optId: string) => {
    if (answered) return;
    setChosen(optId);
    setAnswered(true);
    const correct = optId === b.correct;
    if (correct) {
      sounds.correct();
      bumpApproval();
    } else {
      sounds.wrong();
    }
    if (!reported) {
      setReported(true);
      report({ questionId: b.questionId, isCorrect: correct, chosen: optId, kind: "book-question" });
    }
  };

  // ——— decision beat ———
  const [decisionPick, setDecisionPick] = useState<number | null>(null);
  const [decisionSolved, setDecisionSolved] = useState(false);
  const pickDecision = (b: Extract<Beat, { kind: "decision" }>, i: number) => {
    if (decisionSolved) return;
    setDecisionPick(i);
    if (b.choices[i].correct) {
      sounds.correct();
      setDecisionSolved(true);
      bumpApproval();
    } else {
      sounds.wrong();
    }
  };
  const advanceDecision = () => {
    setDecisionPick(null);
    setDecisionSolved(false);
    nextBeat();
  };

  // stop the player's swipe/wheel nav from firing while inside the hub
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  // ————————————————————————————— FINALE —————————————————————————————
  if (finale) {
    const verdict =
      approval >= 85 ? "🏆 Landslide re-election!" : approval >= 65 ? "🎉 Re-elected with a solid majority!" : "🙂 You held on to power!";
    return (
      <div onTouchStart={stop} onTouchEnd={stop} onWheel={stop} className="w-full">
        <div className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
          🗳️ Election Day
        </div>
        <h2 className="mb-3 text-2xl font-bold sm:text-3xl">{verdict}</h2>
        <div className="mx-auto mb-4 h-4 w-full max-w-sm overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full transition-all" style={{ width: `${approval}%`, background: "var(--accent)" }} />
        </div>
        <p className="mb-4 font-head text-lg">Final approval: {approval}%</p>
        <p className="mx-auto mb-5 max-w-md text-sm text-ink-secondary">
          You toured the whole Statehouse — won an election, made laws, sat in the Governor&apos;s chair, ran the
          Chief Minister&apos;s office and the civil service. You now know how a state is governed from top to bottom!
        </p>
        <button onClick={next} className="rounded-btn px-6 py-3 font-head font-semibold text-white" style={{ background: "var(--accent)" }}>
          On to the Boss Quiz →
        </button>
      </div>
    );
  }

  // ————————————————————————————— MAP —————————————————————————————
  if (!room) {
    return (
      <div onTouchStart={stop} onTouchEnd={stop} onWheel={stop} className="w-full">
        <div className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
          🏛️ The Statehouse
        </div>
        <h2 className="mb-2 text-2xl font-bold sm:text-3xl">Tour the power building</h2>
        <p className="mx-auto mb-4 max-w-md text-sm text-ink-secondary">
          Enter each room to learn its secrets. Good decisions raise your{" "}
          <b className="text-ink">Approval</b> — clear all five rooms to face the voters!
        </p>

        <div className="mx-auto mb-5 w-full max-w-sm">
          <div className="mb-1 flex justify-between text-xs text-ink-secondary">
            <span>👍 Approval</span>
            <span>{approval}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${approval}%`, background: "var(--accent)" }} />
          </div>
          <p className="mt-1 text-right text-[11px] text-ink-muted">
            {cleared.size} / {ROOMS.length} rooms cleared
          </p>
        </div>

        <div className="mx-auto grid w-full max-w-md grid-cols-1 gap-2.5 sm:grid-cols-2">
          {ROOMS.map((r) => {
            const done = cleared.has(r.id);
            return (
              <button
                key={r.id}
                onClick={() => enterRoom(r.id)}
                className="flex items-center gap-3 rounded-card border p-3 text-left transition-all hover:-translate-y-0.5"
                style={{ borderColor: done ? "#1db88a" : "var(--color-line)", background: done ? "rgba(29,184,138,0.10)" : "var(--color-surface)" }}
              >
                <span className="text-3xl">{r.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-head text-sm font-semibold">
                    {r.title} {done && <span className="text-teal">✓</span>}
                  </div>
                  <div className="truncate text-[11px] text-ink-secondary">{r.tagline}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ————————————————————————————— INSIDE A ROOM —————————————————————————————
  return (
    <div onTouchStart={stop} onTouchEnd={stop} onWheel={stop} className="w-full">
      <div className="mb-3 flex items-center gap-2">
        <button
          onClick={() => setActiveRoom(null)}
          aria-label="Back to the map"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface text-sm transition-colors hover:border-line-strong"
        >
          ←
        </button>
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: room.color }}>
          {room.emoji} {room.title}
        </span>
        <span className="ml-auto text-[11px] text-ink-muted">
          {beatIdx + 1} / {room.beats.length}
        </span>
      </div>

      {beat?.kind === "teach" && (
        <>
          <h2 className="mb-2.5 text-xl font-bold sm:text-2xl">{beat.title}</h2>
          <p className="mb-4 text-sm text-ink-secondary">{beat.body}</p>
          {beat.cards && (
            <div className="mb-4 flex flex-col gap-2">
              {beat.cards.map((c) => (
                <div key={c.front} className="rounded-card border border-line bg-surface p-3 text-left">
                  <div className="mb-0.5 font-head text-sm font-semibold">
                    {c.icon} {c.front}
                  </div>
                  <div className="text-xs text-ink-secondary">{c.back}</div>
                </div>
              ))}
            </div>
          )}
          <button onClick={nextBeat} className="rounded-btn px-6 py-3 font-head font-semibold text-white" style={{ background: "var(--accent)" }}>
            Got it →
          </button>
        </>
      )}

      {beat?.kind === "quiz" && (
        <>
          <div className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
            📖 Quick check
          </div>
          <h2 className="mb-4 text-lg font-bold sm:text-xl">{beat.prompt}</h2>
          <div className="flex w-full max-w-sm flex-col gap-2.5">
            {beat.options.map((o) => {
              let state = "border-line bg-surface hover:border-line-strong";
              if (answered && o.id === beat.correct) state = "border-teal/60 bg-teal/15 text-teal";
              else if (answered && o.id === chosen) state = "border-coral bg-coral/15";
              else if (answered) state = "border-line bg-surface opacity-60";
              return (
                <button
                  key={o.id}
                  disabled={answered}
                  onClick={() => answerQuiz(beat, o.id)}
                  className={`rounded-btn border px-4 py-3 text-left text-sm transition-colors ${state}`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
          {answered && (
            <div className="mt-4 flex flex-col items-center gap-3">
              <p className={`font-head text-sm ${chosen === beat.correct ? "text-teal" : "text-coral"}`}>
                {chosen === beat.correct ? "Correct! 👍 Approval up" : "Not quite — remember this one!"}
              </p>
              {beat.explain && <p className="max-w-md text-center text-sm text-ink-secondary">{beat.explain}</p>}
              {chosen !== beat.correct && (
                <button onClick={retryBeat} className="rounded-btn border border-line bg-surface px-5 py-2.5 text-sm hover:border-line-strong">
                  Try again 🔁
                </button>
              )}
              <button onClick={nextBeat} className="rounded-btn px-6 py-3 font-head font-semibold text-white" style={{ background: "var(--accent)" }}>
                Continue →
              </button>
            </div>
          )}
        </>
      )}

      {beat?.kind === "decision" && (
        <>
          <div className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
            🤔 Your decision
          </div>
          <h2 className="mb-2.5 text-xl font-bold sm:text-2xl">
            {beat.emoji} {beat.question}
          </h2>
          <p className="mb-4 max-w-lg text-sm text-ink-secondary">{beat.situation}</p>
          <div className="flex w-full max-w-sm flex-col gap-2.5">
            {beat.choices.map((c, i) => {
              let state = "border-line bg-surface hover:border-line-strong";
              if (decisionPick === i) state = c.correct ? "border-teal/60 bg-teal/15 text-teal" : "border-coral bg-coral/15";
              else if (decisionSolved) state = "border-line bg-surface opacity-60";
              return (
                <button
                  key={i}
                  disabled={decisionSolved}
                  onClick={() => pickDecision(beat, i)}
                  className={`rounded-btn border px-4 py-3 text-left text-sm transition-colors ${state}`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
          {decisionPick !== null && (
            <div
              className={`mt-4 max-w-md rounded-card border p-3 text-sm text-ink-secondary ${
                beat.choices[decisionPick].correct ? "border-teal/40 bg-teal/10" : "border-coral/40 bg-coral/10"
              }`}
            >
              {beat.choices[decisionPick].outcome}
            </div>
          )}
          {decisionSolved && (
            <div className="mt-3 flex flex-col items-center gap-3">
              <p className="max-w-md text-center text-sm text-ink-secondary">{beat.explain}</p>
              <button onClick={advanceDecision} className="rounded-btn px-6 py-3 font-head font-semibold text-white" style={{ background: "var(--accent)" }}>
                Continue →
              </button>
            </div>
          )}
        </>
      )}

      {beat?.kind === "sim" && (
        <>
          <div className="mb-3 text-center text-xs text-ink-muted">{beat.label}</div>
          {beat.component === "majority" ? <MajorityMaker onComplete={nextBeat} /> : <BillToAct onComplete={nextBeat} />}
        </>
      )}
    </div>
  );
}
