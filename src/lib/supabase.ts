import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const fallbackUrl = "https://example.supabase.co";
const fallbackKey = "supabase-not-configured";

export function isSupabaseConfigured() {
  return !!(url && serviceKey);
}

// Server-side client (bypasses RLS — API routes only)
export const supabaseAdmin = createClient(
  url || fallbackUrl,
  serviceKey || anonKey || fallbackKey,
);

// Client-side client
export const supabase = createClient(url || fallbackUrl, anonKey || fallbackKey);
