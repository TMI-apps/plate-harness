# Authentication Implementation Reference for chat.tmi.one

This document answers questions about the authentication implementation in this codebase.

**Scope in plate-harness:** reference only. The snippets below are from the chat.tmi.one app; its `src/` paths are not in this repo. `entreefederatie.ts` is kept next to this file; the other full-file copies (AuthContext, ProfileMenu, routes, supabase, errorHandling) were removed and remain in git history (plate-harness v0.40.0).

**Dashboard setup (Google + Supabase):** Step-by-step Google Cloud and Supabase provider configuration is **not** duplicated here. Use **[`documentation/DOC_SUPABASE_GOOGLE_OAUTH.md`](../DOC_SUPABASE_GOOGLE_OAUTH.md)** as the SSOT; this file focuses on **code** behavior.

---

## 1. SAML/SSO Configuration

**Question:** What is the SAML provider ID or domain used when calling signInWithSSO for the Entreefederatie sign-in?

### Answer

The SAML domain used is **`kennisnet.org`** (same for both staging and production environments).

The domain is returned by the `getEntreefederatieDomain()` function from `src/config/entreefederatie.ts`.

### Code Snippet (from `src/shared/context/AuthContext.tsx`)

```typescript
const signInWithEntreefederatie = async (): Promise<void> => {
  if (signInInFlightRef.current) {
    console.warn(
      '[AuthContext] signInWithEntreefederatie ignored - already in flight',
    );
    return;
  }
  signInInFlightRef.current = true;
  try {
    setLoading(true);

    // Sign in with Entreefederatie via Supabase SAML SSO
    // This uses the SAML provider we configured in Supabase
    // Use current origin to ensure redirect goes to correct environment
    // Note: Supabase may ignore redirectTo if Site URL is set, but we try anyway
    const redirectUrl = `${window.location.origin}/chat`;

    const {data, error: ssoError} = await supabase.auth.signInWithSSO({
      domain: getEntreefederatieDomain(),  // Returns 'kennisnet.org'
      options: {
        redirectTo: redirectUrl,
        // Try to force redirect to current origin
        queryParams: {
          redirect_to: redirectUrl,
        },
      },
    });

    if (ssoError) {
      console.error('[AuthContext] SAML SSO error:', ssoError);
      throw ssoError;
    }

    if (data?.url) {
      // Redirect to Entreefederatie SAML endpoint
      window.location.href = data.url;
    } else {
      throw new Error('No redirect URL returned from SAML SSO');
    }

    // User will be redirected back after authentication
    // Supabase will handle user creation/update automatically
  } catch (err) {
    console.error('[AuthContext] signInWithEntreefederatie error:', err);
    setError(
      err instanceof Error
        ? err.message
        : 'Failed to sign in with Entreefederatie',
    );
    throw err;
  } finally {
    setLoading(false);
    signInInFlightRef.current = false;
  }
};
```

### Entreefederatie Configuration File

**See full file:** `src/config/entreefederatie.ts`

Key exports:
- `getEntreefederatieDomain()` - Returns `'kennisnet.org'`
- `USE_PRODUCTION_ENTREEFEDERATIE` - Boolean for environment detection
- `getEntreefederatieMetadataUrl()` - Returns the IdP metadata URL (staging vs production)

**Metadata URLs:**
- Staging: `https://engine.entree-s.kennisnet.nl/authentication/idp/metadata`
- Production: `https://engine.entree.kennisnet.nl/authentication/idp/metadata`

---

## 2. Google OAuth Implementation

**Dashboard (Supabase + Google Cloud):** [`documentation/DOC_SUPABASE_GOOGLE_OAUTH.md`](../DOC_SUPABASE_GOOGLE_OAUTH.md) — SSOT for provider setup. This section covers **application code** only.

**Question:** Show me the code where Google OAuth sign-in is triggered.

### Code Snippet (from `src/shared/context/AuthContext.tsx`)

```typescript
const signInWithGoogle = async (): Promise<void> => {
  if (signInInFlightRef.current) {
    console.warn(
      '[AuthContext] signInWithGoogle ignored - already in flight',
    );
    return;
  }
  signInInFlightRef.current = true;
  try {
    setLoading(true);

    // Sign in with Google
    // Note: Ensure Supabase Redirect URLs include wildcards (e.g., https://domain.com/**)
    // IMPORTANT: Clean URL hash before OAuth to prevent double-hash issue
    // Using window.location.href can cause ##hash problems when OAuth tokens are appended
    const redirectUrl = `${window.location.origin}${window.location.pathname}${window.location.search}`;

    const {error: signInError} = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (signInError) throw signInError;

    // Auth state change handler will update user
  } catch (err) {
    console.error('[AuthContext] signInWithGoogle error:', err);
    setError(
      err instanceof Error ? err.message : 'Failed to sign in with Google',
    );
    throw err;
  } finally {
    setLoading(false);
    signInInFlightRef.current = false;
  }
};
```

### Key Points

- Uses `supabase.auth.signInWithOAuth()` with `provider: 'google'`
- No custom scopes or queryParams specified (uses Supabase defaults)
- `redirectTo` is constructed from current origin + pathname + search (excludes hash)
- Uses a `signInInFlightRef` guard to prevent duplicate sign-in attempts

---

## 3. Auth State Management

**Question:** How does the app listen for and handle authentication state changes?

### Answer

The app uses Supabase's `onAuthStateChange` listener inside the `AuthProvider` component.

### Code Snippet (from `src/shared/context/AuthContext.tsx`)

```typescript
// Listen for auth changes
const {
  data: {subscription},
} = supabase.auth.onAuthStateChange(async (event, session) => {
  // Invalidate cache on any auth state change
  invalidateSessionCache();

  // Skip INITIAL_SESSION if we already have a user (prevents duplicate processing)
  if (event === 'INITIAL_SESSION' && user) {
    return;
  }

  const previousUser = previousUserRef.current;

  if (session?.user) {
    const currentUser = supabaseUserToFirebaseUser(session.user);

    // Only treat non-anonymous users as logged in (matches Firebase behavior)
    if (!currentUser.isAnonymous) {
      // Skip if same user (prevents duplicate processing)
      if (
        previousUser?.uid === currentUser.uid &&
        event === 'INITIAL_SESSION'
      ) {
        return;
      }

      previousUserRef.current = currentUser;
      // Clear stored anonymous ID when authenticated user signs in
      clearStoredAnonymousUserId();

      // Clean up OAuth/SAML redirect parameters from URL
      // This prevents stale code parameters from causing issues on refresh
      if (isOAuthRedirectInProgress()) {
        const cleanUrl = `${window.location.origin}${window.location.pathname}`;
        window.history.replaceState({}, document.title, cleanUrl);
      }

      setUser(currentUser);
      setLoading(false);
    } else {
      // Anonymous user - treat as not logged in (set user to null)
      // Anonymous session exists for backend operations, but UI shows "Sign in"
      storeAnonymousUserId(currentUser.uid);
      anonymousUserIdRef.current = currentUser.uid;
      setUser(null);
      setLoading(false);
    }
  } else {
    // User signed out - check if we should create a new anonymous user
    const storedAnonymousId = getStoredAnonymousUserId();

    if (!storedAnonymousId) {
      previousUserRef.current = null;
      setUser(null);
      setLoading(true);
      await signInAnonymously();
    } else {
      previousUserRef.current = null;
      setUser(null);
      setLoading(false);
    }
  }
});

return () => {
  clearTimeout(loadingTimeout);
  subscription.unsubscribe();
  window.removeEventListener('storage', handleStorageChange);
};
```

### Key Points

- Uses `supabase.auth.onAuthStateChange()` 
- Transforms Supabase user to a Firebase-compatible `User` interface via `supabaseUserToFirebaseUser()`
- Anonymous users are treated as "not logged in" for UI purposes (`user` is set to `null`)
- Cleans up OAuth/SAML redirect parameters from URL after successful auth
- Session cache is invalidated on any auth state change

**Full context:** See `src/shared/context/AuthContext.tsx` (the entire file is needed for full context)

---

## 4. Sign-In UI Components

**Question:** Show me the component(s) that render the sign-in buttons.

### Answer

The sign-in UI is rendered by **`ProfileMenu`** component.

**See full file:** `src/components/chat/TopBar/ProfileMenu.tsx`

### Key Excerpt (Sign-in buttons for logged-out users)

```typescript
: [
    <MenuItem key="sign-in-google" onClick={handleSignIn}>
      <Box sx={{mr: 1, display: 'flex', alignItems: 'center'}}>
        <LoginIcon fontSize="small" />
      </Box>
      Sign In with Google
    </MenuItem>,
    // Entreefederatie sign-in option enabled
    ...(onSignInEntreefederatie && entreefederatieEnabled
      ? [
          <MenuItem
            key="sign-in-entreefederatie"
            onClick={handleSignInEntreefederatie}
          >
            <Box sx={{mr: 1, display: 'flex', alignItems: 'center'}}>
              <LoginIcon fontSize="small" />
            </Box>
            Login met schoolaccount
          </MenuItem>,
        ]
      : []),
    // ... version display
  ]}
```

### Component Props Interface

```typescript
interface ProfileMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  user: User | null;
  onSignIn: () => void;
  onSignInEntreefederatie?: () => void;
  onSignOut: () => void;
  onNavigateToSettings?: () => void;
  isDevelopmentMode?: boolean;
  canEnableDevelopmentMode?: boolean;
  onToggleDevMode?: () => void;
}
```

### UI Pattern

- Uses MUI `Menu` component anchored to profile button
- Sign-in options shown when user is not logged in
- Uses MUI `MenuItem` with `LoginIcon` for both options
- Entreefederatie option shows as "Login met schoolaccount" (Dutch)
- `entreefederatieEnabled` flag controls visibility (currently `true`)

---

## 5. Post-Login Redirect Handling

**Question:** After a successful OAuth/SSO sign-in, where does the user get redirected?

### Answer

There is a **`SAMLCallback`** component at the root route (`/`) that handles auth redirects.

**See full file:** `src/routes/index.tsx`

### SAMLCallback Component

```typescript
const SAMLCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleSAMLCallback = async () => {
      // Check for SAML error or code in URL params
      const error = searchParams.get('error');
      const errorCode = searchParams.get('error_code');
      const errorDescription = searchParams.get('error_description');
      const code = searchParams.get('code');

      // If we have SAML-related params, handle them
      if (error || code) {
        if (error) {
          console.error('[SAMLCallback] SAML error:', {
            error,
            errorCode,
            errorDescription,
          });
          // Redirect to chat with error (user will see error message)
          navigate('/chat', {replace: true});
          return;
        }

        if (code) {
          console.log('[SAMLCallback] Processing SAML auth code...');
          try {
            // Exchange code for session
            const {error: exchangeError, data: sessionData} =
              await supabase.auth.exchangeCodeForSession(code);

            if (exchangeError) {
              console.error('[SAMLCallback] Code exchange error:', exchangeError);
              navigate('/chat', {replace: true});
              return;
            }

            // Check for duplicate Entreefederatie users and fix email mismatches
            if (sessionData?.user) {
              // ... duplicate user handling logic
            }

            // Success - redirect to chat
            console.log('[SAMLCallback] SAML authentication successful');
            navigate('/chat', {replace: true});
            return;
          } catch (err) {
            console.error('[SAMLCallback] Exception during code exchange:', err);
            navigate('/chat', {replace: true});
            return;
          }
        }
      }

      // No SAML params - normal root route behavior
      navigate('/chat', {replace: true});
    };

    void handleSAMLCallback();
  }, [searchParams, navigate]);

  // Show loading while processing callback
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
    }}>
      Authenticating...
    </div>
  );
};
```

### Route Configuration

```typescript
<Route path="/" element={<SAMLCallback />} />
<Route path="/chat" element={<ChatContainer />} />
```

### Key Points

- Root route (`/`) handles the callback via `SAMLCallback` component
- Exchanges authorization code for session using `supabase.auth.exchangeCodeForSession(code)`
- Redirects to `/chat` after successful authentication
- Shows "Authenticating..." during processing
- Handles Entreefederatie-specific duplicate user detection

### URL Cleanup in AuthContext

The `onAuthStateChange` listener also cleans up OAuth/SAML parameters:

```typescript
if (isOAuthRedirectInProgress()) {
  const cleanUrl = `${window.location.origin}${window.location.pathname}`;
  window.history.replaceState({}, document.title, cleanUrl);
}
```

---

## 6. Error Handling

**Question:** How are authentication errors displayed to the user?

### Answer

Auth errors are handled in multiple ways:

### 1. Error State in AuthContext

```typescript
const [error, setError] = useState<string | null>(null);

// In signInWithGoogle:
} catch (err) {
  console.error('[AuthContext] signInWithGoogle error:', err);
  setError(
    err instanceof Error ? err.message : 'Failed to sign in with Google',
  );
  throw err;
}

// In signInWithEntreefederatie:
} catch (err) {
  console.error('[AuthContext] signInWithEntreefederatie error:', err);
  setError(
    err instanceof Error
      ? err.message
      : 'Failed to sign in with Entreefederatie',
  );
  throw err;
}
```

The `error` state is exposed via the AuthContext and can be consumed by components.

### 2. Console Logging

All auth errors are logged to console with `[AuthContext]` prefix for debugging.

### 3. SAMLCallback Error Handling

```typescript
if (error) {
  console.error('[SAMLCallback] SAML error:', {
    error,
    errorCode,
    errorDescription,
  });
  // Redirect to chat with error (user will see error message)
  navigate('/chat', {replace: true});
  return;
}
```

### 4. Generic Error Handling Utility

**See:** `src/shared/utils/errorHandling.ts`

```typescript
export const getErrorType = (error: unknown): ErrorType => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Auth errors
    if (
      message.includes('auth') ||
      message.includes('unauthorized') ||
      message.includes('permission denied') ||
      message.includes('forbidden')
    ) {
      return ErrorType.AUTH;
    }
    // ... other error types
  }
  return ErrorType.UNKNOWN;
};

// User-friendly messages
case ErrorType.AUTH:
  userMessage = 'Authentication error. Please sign in again.';
  break;
```

### 5. ErrorBoundary Component

**See:** `src/components/common/ErrorBoundary.tsx`

Wraps routes and displays a fallback UI for uncaught errors.

---

## 7. Session/Token Configuration

**Question:** How is the Supabase client initialized?

### Full Supabase Client Configuration

**File:** `src/config/supabase.ts`

```typescript
import {createClient, SupabaseClient} from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage =
    'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY';
  console.error('[SupabaseConfig]', errorMessage, {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
  });
  throw new Error(errorMessage);
}

// Validate URL format
if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
  console.warn('[SupabaseConfig] Supabase URL should start with https://', {
    url: supabaseUrl.substring(0, 50),
  });
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // Use PKCE flow for better security and CORS compatibility
      flowType: 'pkce',
    },
    // Add global error handling for network issues
    global: {
      headers: {
        'x-client-info': 'chatgpt-clone-customcode',
      },
    },
    // Add realtime configuration with better error handling
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  },
);

// Log connection status in development
if (import.meta.env.DEV) {
  console.log('[SupabaseConfig] Supabase client initialized', {
    url: supabaseUrl.substring(0, 30) + '...',
    hasKey: !!supabaseAnonKey,
  });
}
```

### Auth Options Summary

| Option | Value | Purpose |
|--------|-------|---------|
| `persistSession` | `true` | Persists session to localStorage |
| `autoRefreshToken` | `true` | Automatically refreshes JWT before expiry |
| `detectSessionInUrl` | `true` | Detects OAuth/SAML tokens in URL hash/params |
| `flowType` | `'pkce'` | Uses PKCE flow for better security |

---

## Files to Share

For complete context, the other app's assistant may need:

1. **`src/shared/context/AuthContext.tsx`** - Full auth context with all sign-in methods
2. **`src/config/supabase.ts`** - Supabase client configuration
3. **`src/config/entreefederatie.ts`** - Entreefederatie SAML configuration
4. **`src/routes/index.tsx`** - Routes including SAMLCallback
5. **`src/components/chat/TopBar/ProfileMenu.tsx`** - Sign-in UI component
6. **`src/shared/utils/errorHandling.ts`** - Error handling utilities

