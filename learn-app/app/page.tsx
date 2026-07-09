import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function LandingPage() {
  const session = await getSession();
  if (session?.role === "teacher") redirect("/teacher");
  if (session?.role === "student") redirect("/app");

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="font-head text-6xl font-bold">
        learn<span className="text-primary">.</span>
      </h1>
      <p className="max-w-md text-ink-secondary">
        Interactive chapters, mini-games and practice — with progress your teacher can actually see.
      </p>
      <Link
        href="/login"
        className="rounded-btn bg-primary px-8 py-3.5 font-head font-semibold text-white transition-transform hover:-translate-y-0.5"
      >
        Log in to start →
      </Link>
    </main>
  );
}
