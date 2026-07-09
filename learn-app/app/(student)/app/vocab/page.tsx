import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { listChapters, getChapterVocab } from "@/content";
import { SIGHT_LEVELS } from "@/content/sight-words";
import { VocabHub } from "@/components/vocab/VocabHub";

export default async function VocabPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const chapterDecks = listChapters()
    .map((c) => ({
      slug: c.slug,
      title: c.title,
      emoji: c.emoji,
      color: c.color,
      wordCount: getChapterVocab(c.slug).length,
    }))
    .filter((d) => d.wordCount > 0);

  const sightLevels = SIGHT_LEVELS.map((l) => ({
    id: l.id,
    name: l.name,
    emoji: l.emoji,
    wordCount: l.words.length,
  }));

  return <VocabHub chapterDecks={chapterDecks} sightLevels={sightLevels} />;
}
