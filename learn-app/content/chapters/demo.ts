import type { Chapter } from "../types";

// Exercises every common scene type so the whole player + tracking flow can be
// verified before Simple Equations is ported. Safe to delete later.
export const demoChapter: Chapter = {
  slug: "demo",
  title: "How learn. works",
  subject: "Demo",
  emoji: "🧪",
  color: "#6c63ff",
  description: "A tiny tour of every kind of activity — try it before your first real chapter.",
  trophy: { emoji: "🧪", name: "First Beaker", caption: "Completed the learn. tour — every scientist starts somewhere!" },
  scenes: [
    {
      type: "concept",
      id: "welcome",
      eyebrow: "👋 Welcome",
      title: "Scenes stack like cards",
      body: "Each idea gets its own screen. Swipe up, scroll, or press the down arrow to bring in the next one. Tap the cards below to flip them.",
      cards: [
        { icon: "📚", front: "Learn", back: "Short, interactive explanations — no walls of text." },
        { icon: "🎮", front: "Play", back: "Mini-games check you really got it." },
        { icon: "⭐", front: "Earn", back: "Correct answers earn XP and grow your daily streak." },
      ],
    },
    {
      type: "match",
      id: "match-demo",
      eyebrow: "🎮 Mini-game",
      title: "Match the pairs",
      prompt: "Tap an item on the left, then its partner on the right.",
      pairs: [
        { left: "2 + 2", right: "4" },
        { left: "3 × 3", right: "9" },
        { left: "10 − 6", right: "4️⃣" },
        { left: "half of 14", right: "7" },
      ],
    },
    {
      type: "sort",
      id: "sort-demo",
      eyebrow: "🗂️ Sort it",
      title: "Odd or even?",
      prompt: "Tap each number, then the bucket it belongs to.",
      buckets: ["Odd", "Even"],
      items: [
        { label: "7", bucket: 0 },
        { label: "12", bucket: 1 },
        { label: "45", bucket: 0 },
        { label: "88", bucket: 1 },
        { label: "101", bucket: 0 },
        { label: "36", bucket: 1 },
      ],
    },
    {
      type: "book-question",
      id: "bq-1",
      questionId: "demo-bq-1",
      eyebrow: "📖 Practice",
      prompt: "A number plus 5 equals 12. What is the number?",
      options: [
        { id: "a", label: "5" },
        { id: "b", label: "7" },
        { id: "c", label: "17" },
        { id: "d", label: "12" },
      ],
      correct: "b",
      explain: "Undo the +5: 12 − 5 = 7.",
    },
    {
      type: "book-question",
      id: "bq-2",
      questionId: "demo-bq-2",
      eyebrow: "📖 Practice",
      prompt: "Double a number gives 18. The number is…",
      options: [
        { id: "a", label: "36" },
        { id: "b", label: "16" },
        { id: "c", label: "9" },
      ],
      correct: "c",
      explain: "Undo the doubling: 18 ÷ 2 = 9.",
    },
    {
      type: "vocab",
      id: "vocab-demo",
      eyebrow: "🔤 Word bank",
      title: "Words to know",
      words: [
        { word: "XP", meaning: "Experience points — you earn them for every correct answer." },
        { word: "Streak", meaning: "Days in a row you've practised. Miss a day and it resets!" },
        { word: "Boss quiz", meaning: "The final challenge at the end of a chapter." },
      ],
    },
    {
      type: "quiz",
      id: "boss-demo",
      eyebrow: "🏆 Boss Quiz",
      title: "Show what you know",
      questions: [
        {
          questionId: "demo-quiz-1",
          prompt: "What earns you XP?",
          options: [
            { id: "a", label: "Correct answers" },
            { id: "b", label: "Watching the screen" },
            { id: "c", label: "Skipping scenes" },
          ],
          correct: "a",
        },
        {
          questionId: "demo-quiz-2",
          prompt: "x + 3 = 10. What is x?",
          options: [
            { id: "a", label: "13" },
            { id: "b", label: "7" },
            { id: "c", label: "3" },
          ],
          correct: "b",
          explain: "10 − 3 = 7.",
        },
        {
          questionId: "demo-quiz-3",
          prompt: "Your streak grows when you…",
          options: [
            { id: "a", label: "practise on consecutive days" },
            { id: "b", label: "answer very fast" },
            { id: "c", label: "log in twice a day" },
          ],
          correct: "a",
          explain: "No timers here — speed never matters, showing up does.",
        },
      ],
    },
    {
      type: "concept",
      id: "done",
      eyebrow: "🎉 That's the tour",
      title: "You're ready",
      body: "Real chapters work exactly like this — learn, play, practise, then beat the boss quiz. Your teacher can see what you practised and help with what was hard.",
    },
  ],
};
