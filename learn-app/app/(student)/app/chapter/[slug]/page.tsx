import { notFound } from "next/navigation";
import { getChapter } from "@/content";
import { ChapterPlayer } from "@/components/player/ChapterPlayer";

export default async function ChapterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const chapter = getChapter(slug);
  if (!chapter) notFound();
  return <ChapterPlayer chapter={chapter} />;
}
