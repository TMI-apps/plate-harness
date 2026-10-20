import { NavigateFunction } from "react-router-dom";
import { isSupabaseConfigured } from "@/shared/services/supabaseService";
import { shouldExchangeCode } from "@/shared/utils/pkceExchangeGuard";
import * as authService from "./authService";
import { getAndClearRedirectPath } from "@/shared/utils/redirectUtils";
import { mapAuthError } from "./authErrorMessages";

import { OAUTH_CALLBACK_ERROR_MESSAGE } from "@/features/auth/types/authMessages";

export const checkSupabaseConfigured = (navigate: NavigateFunction): boolean => {
  if (!isSupabaseConfigured()) {
    void navigate("/", { replace: true });
    return false;
  }
  return true;
};

export const getOAuthErrorMessage = (searchParams: URLSearchParams): string => {
  const description = searchParams.get("error_description");
  if (description) {
    return "Sign-in was cancelled or failed. Please try again.";
  }
  return OAUTH_CALLBACK_ERROR_MESSAGE;
};

export const handleCodeExchange = async (
  code: string,
  navigate: NavigateFunction
): Promise<string | null> => {
  if (!shouldExchangeCode(code)) {
    const redirectPath = getAndClearRedirectPath();
    void navigate(redirectPath || "/", { replace: true });
    return null;
  }

  try {
    const { error: exchangeError } = await authService.exchangeCodeForSession(code);

    if (exchangeError) {
      void navigate("/", { replace: true });
      return mapAuthError(exchangeError);
    }

    const redirectPath = getAndClearRedirectPath();
    void navigate(redirectPath || "/", { replace: true });
    return null;
  } catch {
    void navigate("/", { replace: true });
    return OAUTH_CALLBACK_ERROR_MESSAGE;
  }
};

export const getRedirectPath = (): string => {
  const redirectPath = getAndClearRedirectPath();
  return redirectPath || "/";
};
