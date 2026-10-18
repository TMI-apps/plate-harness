import { createClient, SupabaseClient } from "@supabase/supabase-js";

/** Supabase types for the rest of the app (this file is the only @supabase import site). */
export type { AuthError, User as SupabaseUser } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// Support both publishable key (new) and anon key (legacy) for backward compatibility
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Dev-only: bypass real connection for testing when env vars are set. */
const TEST_BYPASS_URL = "https://test-local.supabase.co";
const TEST_BYPASS_KEY = "test-anon-key-for-local-testing";

let supabase: SupabaseClient | null = null;

/**
 * Check if Supabase is configured
 */
export const isSupabaseConfigured = (): boolean => {
  return !!(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== TEST_BYPASS_URL &&
    supabaseAnonKey !== TEST_BYPASS_KEY &&
    supabaseUrl !== "your-project-url" &&
    supabaseAnonKey !== "your-anon-key" &&
    supabaseAnonKey !== "your-publishable-key"
  );
};

/**
 * Initialize Supabase client if configured
 */
export const initSupabase = (): SupabaseClient | null => {
  if (!isSupabaseConfigured() || !supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // Use PKCE flow for better security and CORS compatibility
        flowType: "pkce",
      },
    });
  }

  return supabase;
};

/**
 * Get Supabase client (throws if not configured)
 */
export const getSupabase = (): SupabaseClient => {
  if (!isSupabaseConfigured() || !supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase is not configured. Authentication requires Supabase environment variables."
    );
  }

  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // Use PKCE flow for better security and CORS compatibility
        flowType: "pkce",
      },
    });
  }

  return supabase;
};

/**
 * Test Supabase connection
 */
export const testSupabaseConnection = async (
  url: string,
  key: string
): Promise<{ success: boolean; error?: string }> => {
  if (import.meta.env.DEV && url === TEST_BYPASS_URL && key === TEST_BYPASS_KEY) {
    return { success: true };
  }

  try {
    const testClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    });
    // Try to get the current session to test the connection
    const { error } = await testClient.auth.getSession();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to connect to Supabase",
    };
  }
};

// Initialize on module load if configured
if (isSupabaseConfigured()) {
  initSupabase();
}

// Export for backward compatibility (will be null if not configured)
// Note: This export may be null if Supabase is not configured
export { supabase };
