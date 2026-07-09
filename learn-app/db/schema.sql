-- learn. v2 schema — run this in the Supabase SQL editor.
-- Chapter/question metadata lives in code (content/chapters/*), referenced by slug + stable question ids.

create extension if not exists "pgcrypto";

create table if not exists class (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists student (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references class(id) on delete cascade,
  username text not null unique,
  display_name text not null,
  pin_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists attempt (
  id bigint generated always as identity primary key,
  student_id uuid not null references student(id) on delete cascade,
  chapter_slug text not null,
  question_id text not null,
  is_correct boolean not null,
  chosen text,
  created_at timestamptz not null default now()
);

create index if not exists attempt_by_question on attempt (chapter_slug, question_id);
create index if not exists attempt_by_student on attempt (student_id, created_at desc);

create table if not exists chapter_progress (
  student_id uuid not null references student(id) on delete cascade,
  chapter_slug text not null,
  last_scene int not null default 0,
  completed_at timestamptz,
  xp int not null default 0,
  best_quiz_score int,
  current_streak int not null default 0,
  last_practised_on date,
  primary key (student_id, chapter_slug)
);

-- The app talks to the database with the service_role key from server code only,
-- so RLS stays enabled with no public policies: anon access is fully blocked.
alter table class enable row level security;
alter table student enable row level security;
alter table attempt enable row level security;
alter table chapter_progress enable row level security;
