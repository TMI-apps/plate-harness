import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// Support both publishable key (new) and anon key (legacy) for backward compatibility
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

const PLACEHOLDER_VALUES = new Set(["your-project-url", "your-anon-key", "your-publishable-key"]);

let supabase: SupabaseClient | null = null;

/**
 * Check if Supabase is configured (env vars present and not .env.example placeholders)
 */
export const isSupabaseConfigured = (): boolean =>
  Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !PLACEHOLDER_VALUES.has(supabaseUrl) &&
    !PLACEHOLDER_VALUES.has(supabaseAnonKey)
  );

/**
 * Get Supabase client, created lazily (throws if not configured)
 */
export const getSupabase = (): SupabaseClient => {
  if (!isSupabaseConfigured() || !supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase is not configured. Authentication requires Supabase environment variables."
    );
  }

  supabase ??= createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // Use PKCE flow for better security and CORS compatibility
      flowType: "pkce",
    },
  });

  return supabase;
};

// Create the client on module load so detectSessionInUrl runs before any route handles the URL
if (isSupabaseConfigured()) {
  getSupabase();
}
