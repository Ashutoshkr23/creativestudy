// Graded sight-word lists (standard Dolch lists as starter content — edit
// freely; each level is just an array of words). Sight words are practised
// for instant recognition, independent of any chapter.

export const SIGHT_WORDS_SLUG = "sight-words";

export type SightLevel = { id: string; name: string; emoji: string; words: string[] };

export const SIGHT_LEVELS: SightLevel[] = [
  {
    id: "level-1",
    name: "Level 1 · First Steps",
    emoji: "🌱",
    words: [
      "a", "and", "away", "big", "blue", "can", "come", "down", "find", "for",
      "funny", "go", "help", "here", "I", "in", "is", "it", "jump", "little",
      "look", "make", "me", "my", "not", "one", "play", "red", "run", "said",
      "see", "the", "three", "to", "two", "up", "we", "where", "yellow", "you",
    ],
  },
  {
    id: "level-2",
    name: "Level 2 · Growing Reader",
    emoji: "🌿",
    words: [
      "all", "am", "are", "at", "ate", "be", "black", "brown", "but", "came",
      "did", "do", "eat", "four", "get", "good", "have", "he", "into", "like",
      "must", "new", "no", "now", "on", "our", "out", "please", "pretty", "ran",
      "ride", "saw", "say", "she", "so", "soon", "that", "there", "they", "this",
      "too", "under", "want", "was", "well", "went", "what", "white", "who", "will",
      "with", "yes",
    ],
  },
  {
    id: "level-3",
    name: "Level 3 · Confident Reader",
    emoji: "🌳",
    words: [
      "after", "again", "an", "any", "as", "ask", "by", "could", "every", "fly",
      "from", "give", "going", "had", "has", "her", "him", "his", "how", "just",
      "know", "let", "live", "may", "of", "old", "once", "open", "over", "put",
      "round", "some", "stop", "take", "thank", "them", "then", "think", "walk",
      "were", "when",
    ],
  },
  {
    id: "level-4",
    name: "Level 4 · Word Explorer",
    emoji: "🚀",
    words: [
      "always", "around", "because", "been", "before", "best", "both", "buy",
      "call", "cold", "does", "don't", "fast", "first", "five", "found", "gave",
      "goes", "green", "its", "made", "many", "off", "or", "pull", "read",
      "right", "sing", "sit", "sleep", "tell", "their", "these", "those", "upon",
      "us", "use", "very", "wash", "which", "why", "wish", "work", "would",
      "write", "your",
    ],
  },
  {
    id: "level-5",
    name: "Level 5 · Word Master",
    emoji: "🏆",
    words: [
      "about", "better", "bring", "carry", "clean", "cut", "done", "draw",
      "drink", "eight", "fall", "far", "full", "got", "grow", "hold", "hot",
      "hurt", "if", "keep", "kind", "laugh", "light", "long", "much", "myself",
      "never", "only", "own", "pick", "seven", "shall", "show", "six", "small",
      "start", "ten", "today", "together", "try", "warm",
    ],
  },
];

export function getSightLevel(id: string): SightLevel | undefined {
  return SIGHT_LEVELS.find((l) => l.id === id);
}
