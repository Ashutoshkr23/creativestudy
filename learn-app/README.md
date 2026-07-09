# learn. — tracked teaching platform

Interactive NCERT chapters where practice flows to a teacher dashboard: who practised, when,
their quiz bests, and the questions the class misses most.

## Run it

```bash
npm install
npm run dev
```

The app works without a database (chapters play, nothing is saved). To make logins and
tracking live, do the one-time Supabase setup below.

## One-time Supabase setup (~10 minutes, free)

1. Go to [supabase.com](https://supabase.com) → sign up → **New project** (any name, e.g. `learn`).
   Choose the region closest to you (Mumbai) and set a strong database password (you won't need it daily).
2. When the project is ready, open **SQL Editor** (left sidebar) → **New query** → paste the whole
   contents of [`db/schema.sql`](db/schema.sql) → **Run**. It should say "Success".
3. Open **Project Settings → API** and copy two values:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **service_role key** (under "Project API keys" — keep this secret!)
4. In this folder, copy `.env.example` to `.env.local` and fill it in:
   - `SUPABASE_URL` = the Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = the service_role key
   - `SESSION_SECRET` = any long random sentence (mash the keyboard)
   - `TEACHER_USERNAME` / `TEACHER_PASSWORD` = your own login
5. Restart the dev server. Log in as the teacher → **Students** → create a class and add students
   (each gets a username + 4–6 digit PIN — write these in their diaries).

## How it fits together

- `content/chapters/*.ts` — one file per chapter: an ordered list of scenes
  (`concept`, `match`, `sort`, `book-question`, `quiz`, `vocab`, `custom`).
- `components/player/` — `ChapterPlayer` renders any chapter; bespoke games (balance simulator
  etc.) get registered in `components/player/custom/`.
- Tracked scenes (`book-question`, `quiz`) POST to `/api/attempt` → Supabase `attempt` +
  `chapter_progress` tables → teacher dashboard aggregates.
- Auth is custom username+PIN (no student email/PII); sessions are signed httpOnly cookies;
  `proxy.ts` guards `/app/**` and `/teacher/**`.

## Deploy (later)

Vercel → import the repo → set the **Root Directory** to `learn-app/` → add the same five
environment variables → deploy.
