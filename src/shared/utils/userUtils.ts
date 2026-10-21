import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { User } from "@/features/auth/types/auth.types";

/**
 * Maps the auth provider user to the application's User interface.
 * Anonymous users are filtered out and return null (treated as not logged in).
 *
 * @param providerUser - The Supabase user object (can be null)
 * @returns User object if authenticated, null if anonymous or no user
 */
export const mapProviderUserToAppUser = (providerUser: SupabaseUser | null): User | null => {
  // Supabase's official is_anonymous flag
  if (!providerUser || providerUser.is_anonymous === true) return null;

  return {
    id: providerUser.id,
    email: providerUser.email || "",
    created_at: providerUser.created_at,
  };
};
