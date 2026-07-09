import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/session";
import { verifyPin, isRateLimited, recordLoginFailure, clearLoginFailures } from "@/lib/auth";
import { getStudentByUsername } from "@/lib/queries";
import { isDbConfigured, DB_NOT_CONFIGURED_MESSAGE } from "@/lib/supabase";

export async function POST(request: Request) {
  let body: { role?: string; username?: string; pin?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (body.role === "teacher") {
    const envUser = process.env.TEACHER_USERNAME;
    const envPass = process.env.TEACHER_PASSWORD;
    if (!envUser || !envPass) {
      return NextResponse.json(
        { error: "Teacher login is not configured yet. Set TEACHER_USERNAME and TEACHER_PASSWORD in .env.local." },
        { status: 503 }
      );
    }
    if (isRateLimited("__teacher__")) {
      return NextResponse.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
    }
    if (body.username !== envUser || body.password !== envPass) {
      recordLoginFailure("__teacher__");
      return NextResponse.json({ error: "Wrong username or password." }, { status: 401 });
    }
    clearLoginFailures("__teacher__");
    await setSessionCookie({ role: "teacher", username: envUser, displayName: "Teacher" });
    return NextResponse.json({ ok: true, redirect: "/teacher" });
  }

  // Student login
  const username = (body.username ?? "").trim().toLowerCase();
  const pin = (body.pin ?? "").trim();
  if (!username || !pin) {
    return NextResponse.json({ error: "Enter your username and PIN." }, { status: 400 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json({ error: DB_NOT_CONFIGURED_MESSAGE }, { status: 503 });
  }
  if (isRateLimited(username)) {
    return NextResponse.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
  }

  const student = await getStudentByUsername(username);
  if (!student || !(await verifyPin(pin, student.pin_hash))) {
    recordLoginFailure(username);
    return NextResponse.json({ error: "Wrong username or PIN. Ask your teacher if you forgot." }, { status: 401 });
  }

  clearLoginFailures(username);
  await setSessionCookie({
    role: "student",
    studentId: student.id,
    username: student.username,
    displayName: student.display_name,
  });
  return NextResponse.json({ ok: true, redirect: "/app" });
}
