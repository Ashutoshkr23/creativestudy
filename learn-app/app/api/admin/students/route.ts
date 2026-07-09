import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { hashPin, suggestUsername } from "@/lib/auth";
import { listStudents, createStudent, resetStudentPin } from "@/lib/queries";
import { isDbConfigured, DB_NOT_CONFIGURED_MESSAGE } from "@/lib/supabase";

async function requireTeacher() {
  const session = await getSession();
  if (session?.role !== "teacher") {
    return NextResponse.json({ error: "Teacher login required." }, { status: 401 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json({ error: DB_NOT_CONFIGURED_MESSAGE }, { status: 503 });
  }
  return null;
}

function validPin(pin: string): boolean {
  return /^\d{4,6}$/.test(pin);
}

export async function GET() {
  const denied = await requireTeacher();
  if (denied) return denied;
  return NextResponse.json({ students: await listStudents() });
}

export async function POST(request: Request) {
  const denied = await requireTeacher();
  if (denied) return denied;
  const body = await request.json().catch(() => ({}));
  const displayName = String(body.displayName ?? "").trim();
  const classId = String(body.classId ?? "").trim();
  const pin = String(body.pin ?? "").trim();
  if (!displayName || !classId) {
    return NextResponse.json({ error: "Student name and class are required." }, { status: 400 });
  }
  if (!validPin(pin)) {
    return NextResponse.json({ error: "PIN must be 4–6 digits." }, { status: 400 });
  }

  const existing = await listStudents();
  const taken = new Set(existing.map((s) => s.username));
  const username = String(body.username ?? "").trim().toLowerCase() || suggestUsername(displayName, taken);
  if (taken.has(username)) {
    return NextResponse.json({ error: `Username "${username}" is already taken.` }, { status: 409 });
  }

  const student = await createStudent({ classId, username, displayName, pinHash: await hashPin(pin) });
  return NextResponse.json({ student });
}

export async function PATCH(request: Request) {
  const denied = await requireTeacher();
  if (denied) return denied;
  const body = await request.json().catch(() => ({}));
  const studentId = String(body.studentId ?? "").trim();
  const pin = String(body.pin ?? "").trim();
  if (!studentId) return NextResponse.json({ error: "studentId is required." }, { status: 400 });
  if (!validPin(pin)) return NextResponse.json({ error: "PIN must be 4–6 digits." }, { status: 400 });
  await resetStudentPin(studentId, await hashPin(pin));
  return NextResponse.json({ ok: true });
}
