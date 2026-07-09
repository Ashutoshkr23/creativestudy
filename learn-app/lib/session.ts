import { cookies } from "next/headers";

// HMAC-signed session cookie. Uses Web Crypto so the same verify code runs in
// route handlers (Node) and in proxy.ts (Edge).

export const SESSION_COOKIE = "learn_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 90; // 90 days — school year friendly

export type Session = {
  role: "student" | "teacher";
  studentId?: string;
  username: string;
  displayName: string;
  exp: number; // unix seconds
};

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret) return secret;
  // Dev fallback so the app runs before .env.local exists. Not safe for production.
  return "learn-dev-secret-not-for-production";
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(text: string): Uint8Array {
  const padded = text.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmac(message: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return new Uint8Array(signature);
}

export async function signSession(data: Omit<Session, "exp">): Promise<string> {
  const session: Session = { ...data, exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS };
  const payload = base64UrlEncode(new TextEncoder().encode(JSON.stringify(session)));
  const signature = base64UrlEncode(await hmac(payload));
  return `${payload}.${signature}`;
}

export async function verifySessionToken(token: string): Promise<Session | null> {
  const dot = token.lastIndexOf(".");
  if (dot < 0) return null;
  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const expected = base64UrlEncode(await hmac(payload));
  if (signature.length !== expected.length) return null;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) mismatch |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
  if (mismatch !== 0) return null;
  try {
    const session = JSON.parse(new TextDecoder().decode(base64UrlDecode(payload))) as Session;
    if (session.exp < Math.floor(Date.now() / 1000)) return null;
    return session;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function setSessionCookie(data: Omit<Session, "exp">): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, await signSession(data), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
