import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getAttemptHistory } from "@/lib/queries";
import { computeDueRefs } from "@/lib/review";
import { todayString } from "@/lib/gamify";
import { resolveQuestions } from "@/lib/question-bank";
import { isDbConfigured } from "@/lib/supabase";
import { ReviewRunner } from "@/components/practice/ReviewRunner";

const SESSION_CAP = 10;

export default async function ReviewPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "teacher") redirect("/teacher");

  const history =
    session.studentId && isDbConfigured() ? await getAttemptHistory(session.studentId) : [];
  const dueRefs = computeDueRefs(history, todayString());
  const questions = resolveQuestions(
    dueRefs.map((r) => ({ chapter_slug: r.chapter_slug, question_id: r.question_id }))
  ).slice(0, SESSION_CAP);

  if (questions.length === 0) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col items-center justify-center px-5 py-6 text-center">
        <span className="mb-3 text-5xl">🌙</span>
        <h1 className="mb-2 font-head text-2xl font-bold">Nothing due today</h1>
        <p className="mb-6 max-w-sm text-sm text-ink-secondary">
          Every question you&apos;ve learned is still fresh in the schedule. Practise something new, or come back
          tomorrow — that&apos;s how memories become permanent.
        </p>
        <div className="flex gap-3">
          <Link
            href="/app/practice"
            className="rounded-btn bg-primary px-6 py-3 font-head font-semibold text-white"
          >
            🎯 Practise instead
          </Link>
          <Link
            href="/app"
            className="rounded-btn border border-line bg-surface px-6 py-3 font-head font-semibold"
          >
            Home →
          </Link>
        </div>
      </main>
    );
  }

  return <ReviewRunner questions={questions} />;
}
