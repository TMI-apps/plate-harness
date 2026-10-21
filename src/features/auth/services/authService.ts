import { getSupabase, isSupabaseConfigured } from "@/shared/services/supabaseService";
import { queryClient } from "@/shared/utils/queryClient";
import { getAppOrigin, getAppUrl } from "@/shared/utils/appOrigin";
import type { User, LoginCredentials, SignUpCredentials } from "@/features/auth/types/auth.types";
import { mapProviderUserToAppUser } from "@/shared/utils/userUtils";
import { DUPLICATE_SIGNUP_MESSAGE } from "@/features/auth/types/authMessages";
import { mapAuthError } from "./authErrorMessages";

const getConfigurationError = (): Error =>
  new Error("Authentication requires Supabase to be configured.");

export const login = async (
  credentials: LoginCredentials
): Promise<{ user: User | null; error: Error | null }> => {
  if (!isSupabaseConfigured()) {
    return { user: null, error: getConfigurationError() };
  }

  try {
    const { data, error } = await getSupabase().auth.signInWithPassword({
      email: credentials.email.trim(),
      password: credentials.password,
    });

    if (error) {
      return { user: null, error: new Error(mapAuthError(error)) };
    }

    const user = mapProviderUserToAppUser(data.user);
    return { user, error: null };
  } catch (error) {
    return {
      user: null,
      error: new Error(mapAuthError(error)),
    };
  }
};

export const signUp = async (
  credentials: SignUpCredentials
): Promise<{ user: User | null; error: Error | null }> => {
  if (!isSupabaseConfigured()) {
    return { user: null, error: getConfigurationError() };
  }

  try {
    const { data, error } = await getSupabase().auth.signUp({
      email: credentials.email.trim(),
      password: credentials.password,
    });

    if (error) {
      return { user: null, error: new Error(mapAuthError(error)) };
    }

    if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
      return { user: null, error: new Error(DUPLICATE_SIGNUP_MESSAGE) };
    }

    const user = mapProviderUserToAppUser(data.user);
    return { user, error: null };
  } catch (error) {
    return {
      user: null,
      error: new Error(mapAuthError(error)),
    };
  }
};

export const logout = async (): Promise<{ error: Error | null }> => {
  if (!isSupabaseConfigured()) {
    return { error: null };
  }

  try {
    queryClient.clear();
    const { error } = await getSupabase().auth.signOut();
    if (error) {
      return { error: new Error(mapAuthError(error)) };
    }
    return { error: null };
  } catch (error) {
    return {
      error: new Error(mapAuthError(error)),
    };
  }
};

/**
 * Sign in with Google OAuth
 */
export const signInWithGoogle = async (): Promise<{ error: Error | null }> => {
  if (!isSupabaseConfigured()) {
    return { error: getConfigurationError() };
  }

  try {
    const redirectUrl = getAppOrigin();

    const { error: signInError } = await getSupabase().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (signInError) {
      return { error: new Error(mapAuthError(signInError)) };
    }

    return { error: null };
  } catch (error) {
    return {
      error: new Error(mapAuthError(error)),
    };
  }
};

export const requestPasswordReset = async (email: string): Promise<{ error: Error | null }> => {
  if (!isSupabaseConfigured()) {
    return { error: getConfigurationError() };
  }

  try {
    const { error } = await getSupabase().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: getAppUrl("/reset-password"),
    });

    if (error) {
      return { error: new Error(mapAuthError(error)) };
    }

    return { error: null };
  } catch (error) {
    return {
      error: new Error(mapAuthError(error)),
    };
  }
};

export const updatePassword = async (password: string): Promise<{ error: Error | null }> => {
  if (!isSupabaseConfigured()) {
    return { error: getConfigurationError() };
  }

  try {
    const { error } = await getSupabase().auth.updateUser({ password });

    if (error) {
      return { error: new Error(mapAuthError(error)) };
    }

    return { error: null };
  } catch (error) {
    return {
      error: new Error(mapAuthError(error)),
    };
  }
};

/**
 * Sign in anonymously (for visitors who haven't logged in)
 */
export const signInAnonymously = async (): Promise<{ error: Error | null }> => {
  if (!isSupabaseConfigured()) {
    return { error: null };
  }

  try {
    const { error } = await getSupabase().auth.signInAnonymously();
    if (error) {
      return { error: new Error(mapAuthError(error)) };
    }
    return { error: null };
  } catch (error) {
    return {
      error: new Error(mapAuthError(error)),
    };
  }
};

/**
 * Exchange authorization code for session (used in OAuth PKCE callback)
 */
export const exchangeCodeForSession = async (code: string): Promise<{ error: Error | null }> => {
  if (!isSupabaseConfigured()) {
    return { error: getConfigurationError() };
  }

  try {
    const { error } = await getSupabase().auth.exchangeCodeForSession(code);
    if (error) {
      return { error: new Error(mapAuthError(error)) };
    }
    return { error: null };
  } catch (error) {
    return {
      error: new Error(mapAuthError(error)),
    };
  }
};
