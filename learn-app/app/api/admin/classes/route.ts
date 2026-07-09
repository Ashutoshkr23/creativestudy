import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { listClasses, createClass } from "@/lib/queries";
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

export async function GET() {
  const denied = await requireTeacher();
  if (denied) return denied;
  return NextResponse.json({ classes: await listClasses() });
}

export async function POST(request: Request) {
  const denied = await requireTeacher();
  if (denied) return denied;
  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Class name is required." }, { status: 400 });
  const created = await createClass(name);
  return NextResponse.json({ class: created });
}
