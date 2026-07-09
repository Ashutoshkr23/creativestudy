import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-4xl px-5 py-6">
      <header className="mb-8 flex flex-wrap items-center gap-4">
        <h1 className="font-head text-2xl font-bold">
          learn<span className="text-primary">.</span>{" "}
          <span className="text-sm font-normal text-ink-secondary">teacher</span>
        </h1>
        <nav className="flex gap-1 text-sm">
          <Link
            href="/teacher"
            className="rounded-btn px-3.5 py-2 text-ink-secondary transition-colors hover:bg-surface hover:text-ink"
          >
            📊 Dashboard
          </Link>
          <Link
            href="/teacher/students"
            className="rounded-btn px-3.5 py-2 text-ink-secondary transition-colors hover:bg-surface hover:text-ink"
          >
            🎒 Students
          </Link>
        </nav>
        <div className="ml-auto">
          <LogoutButton />
        </div>
      </header>
      {children}
    </div>
  );
}
