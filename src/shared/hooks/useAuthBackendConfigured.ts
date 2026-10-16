import { isSupabaseConfigured } from "@/shared/services/supabaseService";

/**
 * Whether the configured auth backend (Supabase in this fork) is ready for sign-in.
 * Wraps the service call so UI layers do not import services directly.
 */
export const useAuthBackendConfigured = () => {
  return {
    isConfigured: isSupabaseConfigured(),
  };
};
