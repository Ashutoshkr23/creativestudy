"use client";

import { useRouter } from "next/navigation";
import type { PracticeQuestion } from "@/lib/question-bank";
import { PracticeRunner } from "./PracticeRunner";

// Today's Review: the due-question deck runs through the normal practice
// runner; answers recorded via /api/attempt automatically reschedule each
// question in its Leitner box.
export function ReviewRunner({ questions }: { questions: PracticeQuestion[] }) {
  const router = useRouter();
  return (
    <PracticeRunner
      questions={questions}
      accent="#ef9f27"
      title="📅 Today's Review"
      exitLabel="Done for today →"
      onExit={() => {
        router.push("/app");
        router.refresh();
      }}
    />
  );
}
