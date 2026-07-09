"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
      }}
      className="rounded-btn border border-line bg-surface px-3.5 py-2 text-xs text-ink-secondary transition-colors hover:border-line-strong hover:text-ink"
    >
      Log out
    </button>
  );
}
