# Sign in with Google (Supabase)

> **SSOT:** This file is the **only** place this harness maintains step-by-step **dashboard** setup for Google OAuth with Supabase. The README Quick Start, `start` skill, and setup wizard UI **link here** instead of copying these steps.

Runtime behavior (for example `signInWithOAuth`) lives in code and feature docs; keep procedural onboarding here so wording stays in sync.

## When you need this

Turning on **Google** under Supabase **Authentication → Providers** is necessary but not sufficient. Google rejects the flow unless your **OAuth client** allows the **Supabase callback URL** and your app’s **origins**.

## Prerequisites

- A Supabase project with **URL** and **publishable key** already in `.env` (see the [README Quick Start](../README.md#step-5-complete-the-setup-wizard)).
- Access to [Google Cloud Console](https://console.cloud.google.com/) for the project that owns your OAuth client.

## 1. Supabase: callback URL and provider

1. Open your project in the Supabase dashboard.
2. Go to **Authentication → Sign In / Providers → Google** (wording may vary slightly by dashboard version).
3. Enable **Sign in with Google** when you are ready.
4. In the provider panel, find **Callback URL (for OAuth)**. It has the form:

   `https://<project-ref>.supabase.co/auth/v1/callback`

   Copy it exactly. You will paste it into Google Cloud in the next section.

5. Leave **Client ID** and **Client secret** empty until step 3 (or update them after you create or edit the Google client).

### Client ID field format

- Supabase expects **real OAuth client ID strings** (they look like `123456789-abc123def.apps.googleusercontent.com`).
- Multiple IDs are allowed as a **comma-separated** list (Web, Android, One Tap, etc., if you use them).
- **Do not** paste a project nickname, workspace label, or database name (for example `SP-database`) — those are not client IDs and will show validation errors such as “Invalid characters”.

## 2. Google Cloud: OAuth web client

1. Open **Google Cloud Console → APIs & Services → Credentials**.
2. Open an **OAuth 2.0 Client ID** with type **Web application**, or create one.
3. Under **Authorized JavaScript origins**, add origins users sign in from, for example:
   - Local: `http://localhost:5173` (or whichever host/port Vite prints when you run `pnpm dev`)
   - Production: `https://your-production-domain.com`
4. Under **Authorized redirect URIs**, add **exactly** the Supabase callback from step 1, for example:

   `https://<project-ref>.supabase.co/auth/v1/callback`

   No trailing slash changes unless Supabase shows one; match the dashboard string **exactly**.

5. Save the client.

Misconfigured redirect URIs are the most common cause of “redirect_uri_mismatch” or silent failures after Supabase redirects.

## 3. Finish in Supabase

1. Copy the **Client ID** and **Client secret** from the same Google **Web application** OAuth client.
2. Paste them into the Supabase **Google** provider fields and save.

## 4. Verify in the app

1. Restart the dev server after any `.env` change (if you touched Supabase keys).
2. Open `/login` and use **Sign in with Google**.

If anything fails, confirm the callback URL in Google matches Supabase character-for-character and that **JavaScript origins** include your current app origin.

## Further reading

- [Supabase: Login with Google](https://supabase.com/docs/guides/auth/social-login/auth-google) (platform docs; this repo’s checklist above stays in sync with the usual Web + Supabase redirect pattern).
