import { getSupabase, isSupabaseConfigured } from "@/shared/services/supabaseService";
import * as authService from "@/features/auth/services/authService";
import { mapProviderUserToAppUser } from "@/shared/utils/userUtils";
import { isOAuthRedirectInProgress } from "@/shared/utils/oauthUtils";
import type { User } from "@/features/auth/types/auth.types";
import type { SupabaseUser } from "@/shared/services/supabaseService";

/**
 * Initialize authentication session
 */
const handleSessionResult = async (
  session: { user: SupabaseUser } | null
): Promise<User | null> => {
  if (session?.user) {
    return mapProviderUserToAppUser(session.user);
  }

  const oauthRedirectInProgress = isOAuthRedirectInProgress();
  if (!oauthRedirectInProgress) {
    await authService.signInAnonymously();
  }

  return null;
};

export const initializeSession = async (): Promise<{
  user: User | null;
  error: string | null;
}> => {
  if (!isSupabaseConfigured()) {
    return { user: null, error: null };
  }

  try {
    const supabase = getSupabase();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = await handleSessionResult(session);
    return { user, error: null };
  } catch (err) {
    return {
      user: null,
      error: err instanceof Error ? err.message : "Failed to initialize authentication",
    };
  }
};

/**
 * Handle auth state change event
 */
export const handleAuthStateChange = async (
  session: { user: SupabaseUser } | null
): Promise<{ user: User | null; error: string | null }> => {
  if (session?.user) {
    const currentUser = mapProviderUserToAppUser(session.user);
    return { user: currentUser, error: null };
  }

  // User signed out - create anonymous session
  try {
    await authService.signInAnonymously();
  } catch {
    // Ignore anonymous sign-in errors
  }

  return { user: null, error: null };
};
