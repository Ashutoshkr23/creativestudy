"use client";

import { useCallback, useEffect, useState } from "react";

type ClassRow = { id: string; name: string };
type StudentRow = { id: string; class_id: string; username: string; display_name: string };

export function StudentsAdmin() {
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [newClassName, setNewClassName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [classId, setClassId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [classesRes, studentsRes] = await Promise.all([
        fetch("/api/admin/classes"),
        fetch("/api/admin/students"),
      ]);
      const classesData = await classesRes.json();
      const studentsData = await studentsRes.json();
      if (!classesRes.ok) throw new Error(classesData.error);
      if (!studentsRes.ok) throw new Error(studentsData.error);
      setClasses(classesData.classes);
      setStudents(studentsData.students);
      if (classesData.classes.length > 0 && !classId) setClassId(classesData.classes[0].id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load data.");
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    load();
  }, [load]);

  const createClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newClassName }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    setNewClassName("");
    setNotice(`Class "${data.class.name}" created.`);
    load();
  };

  const addStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, username, pin, classId }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    setNotice(
      `${data.student.display_name} added — username "${data.student.username}", PIN ${pin}. Write it in their diary!`
    );
    setDisplayName("");
    setUsername("");
    setPin("");
    load();
  };

  const resetPin = async (student: StudentRow) => {
    const newPin = prompt(`New PIN for ${student.display_name} (4–6 digits):`);
    if (!newPin) return;
    setError(null);
    const res = await fetch("/api/admin/students", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: student.id, pin: newPin }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    setNotice(`PIN for ${student.display_name} is now ${newPin}.`);
  };

  const inputClass =
    "rounded-btn border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-primary";

  return (
    <main className="flex flex-col gap-8">
      {error && (
        <p role="alert" className="rounded-card border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-coral">
          {error}
        </p>
      )}
      {notice && (
        <p className="rounded-card border border-teal/40 bg-teal/10 px-4 py-3 text-sm text-teal">
          {notice}
        </p>
      )}

      <section className="rounded-card border border-line bg-surface p-5">
        <h2 className="mb-3 font-head text-lg">🏫 Classes</h2>
        <div className="mb-4 flex flex-wrap gap-2">
          {classes.length === 0 && !loading && (
            <p className="text-sm text-ink-secondary">No classes yet — create your first one below.</p>
          )}
          {classes.map((c) => (
            <span key={c.id} className="rounded-full border border-line bg-surface-2 px-4 py-1.5 text-sm">
              {c.name}
            </span>
          ))}
        </div>
        <form onSubmit={createClass} className="flex flex-wrap gap-2">
          <input
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            placeholder="e.g. Class 7B"
            required
            className={inputClass}
          />
          <button className="rounded-btn bg-primary px-5 py-2.5 font-head text-sm font-semibold text-white">
            Create class
          </button>
        </form>
      </section>

      <section className="rounded-card border border-line bg-surface p-5">
        <h2 className="mb-3 font-head text-lg">➕ Add a student</h2>
        {classes.length === 0 ? (
          <p className="text-sm text-ink-secondary">Create a class first.</p>
        ) : (
          <form onSubmit={addStudent} className="grid gap-2 sm:grid-cols-2">
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Student name"
              required
              className={inputClass}
            />
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username (blank = auto)"
              autoCapitalize="none"
              className={inputClass}
            />
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="PIN (4–6 digits)"
              inputMode="numeric"
              pattern="\d{4,6}"
              required
              className={inputClass}
            />
            <select value={classId} onChange={(e) => setClassId(e.target.value)} className={inputClass}>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button className="rounded-btn bg-primary px-5 py-2.5 font-head text-sm font-semibold text-white sm:col-span-2">
              Add student
            </button>
          </form>
        )}
      </section>

      <section className="rounded-card border border-line bg-surface p-5">
        <h2 className="mb-3 font-head text-lg">🎒 Students ({students.length})</h2>
        {students.length === 0 ? (
          <p className="text-sm text-ink-secondary">
            {loading ? "Loading…" : "No students yet."}
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-line">
            {students.map((s) => (
              <li key={s.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{s.display_name}</div>
                  <div className="text-xs text-ink-muted">
                    @{s.username} · {classes.find((c) => c.id === s.class_id)?.name ?? "—"}
                  </div>
                </div>
                <button
                  onClick={() => resetPin(s)}
                  className="rounded-btn border border-line bg-surface-2 px-3.5 py-2 text-xs text-ink-secondary transition-colors hover:border-line-strong hover:text-ink"
                >
                  Reset PIN
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
