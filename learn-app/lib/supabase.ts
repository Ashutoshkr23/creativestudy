import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Server-only Supabase client using the service_role key. Never import from
// client components — all database access goes through route handlers.

let client: SupabaseClient | null | undefined;

export function isDbConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getDb(): SupabaseClient | null {
  if (client !== undefined) return client;
  if (!isDbConfigured()) {
    client = null;
    return null;
  }
  client = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  return client;
}

export const DB_NOT_CONFIGURED_MESSAGE =
  "The database is not set up yet. Ask your teacher to finish the Supabase setup (see learn-app/README.md).";
