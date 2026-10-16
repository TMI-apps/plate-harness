import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { User } from "@/features/auth/types/auth.types";

/**
 * Checks if a Supabase user is anonymous using the official is_anonymous property.
 * This is the recommended way to detect anonymous users according to Supabase documentation.
 *
 * @param supabaseUser - The Supabase user object (can be null)
 * @returns true if the user is anonymous, false otherwise
 */
export const isAnonymousUser = (supabaseUser: SupabaseUser | null): boolean => {
  if (!supabaseUser) return false;
  return supabaseUser.is_anonymous === true;
};

/**
 * Maps the auth provider user to the application's User interface.
 * Anonymous users are filtered out and return null (treated as not logged in).
 *
 * @param providerUser - The Supabase user object (can be null)
 * @returns User object if authenticated, null if anonymous or no user
 */
export const mapProviderUserToAppUser = (providerUser: SupabaseUser | null): User | null => {
  if (!providerUser) return null;

  if (isAnonymousUser(providerUser)) {
    return null;
  }

  return {
    id: providerUser.id,
    email: providerUser.email || "",
    created_at: providerUser.created_at,
  };
};
