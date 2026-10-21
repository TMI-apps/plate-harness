import type { AuthError } from "@/shared/services/supabaseService";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import { GENERIC_AUTH_ERROR_MESSAGE } from "@/features/auth/types/authMessages";

const INVALID_CREDENTIALS_MESSAGES = [
  "invalid login credentials",
  "invalid credentials",
  "invalid email or password",
];

const EMAIL_NOT_CONFIRMED_MESSAGES = ["email not confirmed", "email_not_confirmed"];

const ALREADY_REGISTERED_MESSAGES = [
  "user already registered",
  "already been registered",
  "already registered",
];

const WEAK_PASSWORD_MESSAGES = ["weak password", "password should be at least"];

const RATE_LIMIT_MESSAGES = ["rate limit", "too many requests", "over_request_rate_limit"];

const NETWORK_MESSAGES = ["failed to fetch", "network", "networkerror", "connection", "timeout"];

const containsAny = (message: string, fragments: string[]): boolean =>
  fragments.some((fragment) => message.includes(fragment));

const getErrorCode = (error: unknown): string | undefined => {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as AuthError).code;
    return typeof code === "string" ? code.toLowerCase() : undefined;
  }
  return undefined;
};

/**
 * Maps Supabase and client auth errors to safe English user-facing strings.
 */
export const mapAuthError = (error: unknown): string => {
  const message = getErrorMessage(error).toLowerCase();
  const code = getErrorCode(error);

  if (code === "invalid_credentials" || containsAny(message, INVALID_CREDENTIALS_MESSAGES)) {
    return "Invalid email or password.";
  }

  if (code === "email_not_confirmed" || containsAny(message, EMAIL_NOT_CONFIRMED_MESSAGES)) {
    return "Please confirm your email address before signing in.";
  }

  if (code === "user_already_registered" || containsAny(message, ALREADY_REGISTERED_MESSAGES)) {
    return "An account with this email already exists. Sign in with Google or reset your password.";
  }

  if (code === "weak_password" || containsAny(message, WEAK_PASSWORD_MESSAGES)) {
    return "Password is too weak. Use at least 6 characters.";
  }

  if (code === "over_request_rate_limit" || containsAny(message, RATE_LIMIT_MESSAGES)) {
    return "Too many attempts. Please wait a few minutes and try again.";
  }

  if (containsAny(message, NETWORK_MESSAGES)) {
    return "Network error. Please check your connection and try again.";
  }

  if (message.includes("supabase") && message.includes("configured")) {
    return "Authentication requires Supabase to be configured.";
  }

  const originalMessage = getErrorMessage(error);
  if (originalMessage) {
    return originalMessage;
  }

  return GENERIC_AUTH_ERROR_MESSAGE;
};
