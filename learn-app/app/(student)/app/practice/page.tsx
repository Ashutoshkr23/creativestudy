import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { listChapters } from "@/content";
import { getBankSizes } from "@/lib/question-bank";
import { getStudentMistakes } from "@/lib/queries";
import { isDbConfigured } from "@/lib/supabase";
import { PracticeArena } from "@/components/practice/PracticeArena";

export default async function PracticePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const sizes = new Map(getBankSizes().map((s) => [s.slug, s.size]));
  const chapters = listChapters().map((c) => ({
    slug: c.slug,
    title: c.title,
    emoji: c.emoji,
    color: c.color,
    bankSize: sizes.get(c.slug) ?? 0,
  }));

  const mistakes =
    session.role === "student" && session.studentId && isDbConfigured()
      ? await getStudentMistakes(session.studentId)
      : [];

  return <PracticeArena chapters={chapters} mistakes={mistakes} />;
}
