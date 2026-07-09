import bcrypt from "bcryptjs";

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}

export async function verifyPin(pin: string, pinHash: string): Promise<boolean> {
  return bcrypt.compare(pin, pinHash);
}

// In-memory login rate limit: 5 failures per username per 15 minutes.
// Fine for a single-school deployment; resets on server restart.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const failures = new Map<string, { count: number; windowStart: number }>();

export function isRateLimited(username: string): boolean {
  const entry = failures.get(username);
  if (!entry) return false;
  if (Date.now() - entry.windowStart > WINDOW_MS) {
    failures.delete(username);
    return false;
  }
  return entry.count >= MAX_FAILURES;
}

export function recordLoginFailure(username: string): void {
  const entry = failures.get(username);
  if (!entry || Date.now() - entry.windowStart > WINDOW_MS) {
    failures.set(username, { count: 1, windowStart: Date.now() });
  } else {
    entry.count += 1;
  }
}

export function clearLoginFailures(username: string): void {
  failures.delete(username);
}

export function suggestUsername(displayName: string, taken: Set<string>): string {
  const base = displayName.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 12) || "student";
  if (!taken.has(base)) return base;
  for (let i = 2; i < 100; i++) {
    const candidate = `${base}${i}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${base}${Date.now() % 1000}`;
}
