# Auth Feature

User authentication and session management via Supabase.

## Purpose

- Email/password login, sign-up, and password reset
- Google OAuth sign-in (PKCE callback on `/`)
- Anonymous sessions for unauthenticated visitors
- Session persistence and auth state subscription
- Auth redirect and callback handling
- User profile query/mutation (TanStack Query)

## Structure

| Layer | Path | Purpose |
|-------|------|---------|
| Hooks | `hooks/` | `useAuth`, `useAuthSession`, `useAuthRedirect`, `useAuthCallbackHandler`, `useUserProfileQuery`, `useUpdateUserProfile` |
| Services | `services/` | `authService`, `authCallbackService`, `authErrorMessages`, `authValidation`, `userProfileService`, `authHandlerUtils` |
| Components | `components/` | `SignInPanel`, `EmailAuthForm` |
| Types | `types/` | `User`, `UserProfile`, `AuthContextValue`, credentials types, `authMessages` (user-facing copy SSOT) |

**Cross-layout UI:** `ProfileMenu` lives in `@/components/common/ProfileMenu` (shell widget used by Topbar). Shared viewport/form layout tokens live in `@/shared/theme/appViewLayout`.

## Main API

### `useAuth()` / `useAuthContext()`

Returns:

`{ user, loading, error, login, signUp, logout, signInWithGoogle, requestPasswordReset, updatePassword, clearAuthError, setAuthError }`

- Requires Supabase configured (`isSupabaseConfigured()`). If not, `loading` becomes `false` and handlers no-op.
- Anonymous Supabase users are treated as logged out (`user === null`).
- Session is initialized on mount and kept in sync via `useAuthStateSubscription`.
- Context value and auth handlers are memoized so consumers re-render only when `user`, `loading`, `error`, or handler identity changes.

### User feedback policy

- **Form-blocking errors:** inline MUI `Alert` (sign-in panel, email form).
- **OAuth/callback errors:** `setAuthError` on auth context; shown on Home via single Alert.
- **Profile mutations:** TanStack `useUpdateUserProfile` merges server response via `setQueryData` (no happy-path invalidation).

### Routes

- `/login` – dedicated sign-in page (redirects to `/` when already authenticated)
- `/reset-password` – password recovery from email link
- `/` – inline sign-in when logged out; primary OAuth PKCE callback handler
- `/auth/callback` – legacy OAuth callback (kept for backward compatibility)

## Dependencies

- `@/shared/services/supabaseService` – `getSupabase` (lazy client, created on load when configured), `isSupabaseConfigured`
- `@/shared/utils/appOrigin` – absolute app URLs (basename-aware)
- `@/config/legal` – placeholder Privacy/Terms URLs (`PRIVACY_URL`, `TERMS_URL`)
- `@/shared/hooks/useAuthBackendConfigured` – auth backend readiness for UI
- `@/shared/utils/userUtils` – `mapProviderUserToAppUser`
- `@/shared/utils/redirectUtils` – safe post-login redirect paths
- `@/shared/utils/queryKeys` – TanStack profile query keys

## Configuration checklist

- Supabase Redirect URLs: app origin (`getAppOrigin()`), full `/reset-password` URL
- Google OAuth provider enabled in Supabase
- Env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (or `VITE_SUPABASE_ANON_KEY`)
- Update `LEGAL_ORIGIN` in `src/config/legal.ts` when product URLs are available

## Testing

Colocated `*.test.ts(x)` under this feature; shared wrappers in `tests/test-utils.tsx`. See `documentation/DOC_TESTING.md`.

## Related

- `documentation/DOC_SUPABASE_GOOGLE_OAUTH.md` – Google Cloud + Supabase dashboard setup
- `documentation/DOC_MOBILE_LOCAL_DEV.md` – local device testing for OAuth
- `documentation/DOC_TANSTACK_QUERY.md` – profile query/mutation patterns
