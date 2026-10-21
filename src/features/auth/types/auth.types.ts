export interface User {
  id: string;
  email: string;
  created_at?: string;
}

export type UserRole = "anonymous" | "free" | "premium" | "admin" | "super-admin";

export interface UserProfile {
  id: string;
  email?: string | null;
  display_name?: string | null;
  photo_url?: string | null;
  email_verified?: boolean | null;
  disabled?: boolean | null;
  role?: UserRole | null;
  provider_ids?: string[] | null;
  creation_time?: string | null;
  last_sign_in_time?: string | null;
  updated_at?: string | null;
  remaining_credits?: number | null;
  credit_period?: string | null;
  auth_provider?: string | null;
  ef_nl_edu_person_home_organization?: string | null;
  ef_nl_edu_person_home_organization_id?: string | null;
  total_messages?: number | null;
  total_tokens?: number | null;
  total_cost?: number | null;
  settings?: Record<string, unknown> | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  // Add any additional signup fields here
}

/** Partial profile data for updates (excludes id) */
export type UserProfileUpdate = Partial<Omit<UserProfile, "id">>;

/** Auth context and useAuth return shape */
export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  signUp: (credentials: SignUpCredentials) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  updatePassword: (password: string) => Promise<boolean>;
  clearAuthError: () => void;
  setAuthError: (message: string | null) => void;
}
