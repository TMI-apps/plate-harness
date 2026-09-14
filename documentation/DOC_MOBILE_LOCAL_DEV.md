# Mobile local development (physical device)

> **SSOT:** This file is the **only** place this harness documents how to open **local dev on a real phone** with working auth redirects. README Quick Start, `start` skill, debug patterns, and feature READMEs **link here** — they do not duplicate adb or IdP steps.

**Cross-repo porting:** [handoffs/MOBILE_LOCAL_DEV_ADOPTION_GUIDE.md](./handoffs/MOBILE_LOCAL_DEV_ADOPTION_GUIDE.md)

---

## DevTools vs physical device

| Use Chrome DevTools device mode | Use a physical device |
|---------------------------------|----------------------|
| Width breakpoints, responsive CSS | `100vh` vs visible viewport (fixed UI clipped below fold) |
| Quick layout sanity checks | System nav / gesture bar, `safe-area` surprises |
| Desktop-only auth flows | Mobile OAuth / SAML return URLs |
| — | Virtual keyboard hiding inputs or bottom actions |

**Stop-the-line:** Do not close mobile viewport or mobile-login issues on DevTools-only or desktop-resize-only evidence when this runbook applies.

---

## Prerequisites

1. **Dependencies installed:** `pnpm install` (see [README Quick Start](../README.md#quick-start-guide)).
2. **Dev server running** on the PC:

   ```bash
   pnpm dev
   ```

3. **Default URL:** `http://localhost:5173/` — if Vite picks another port (5173 busy), use the URL printed in the terminal for all steps below. This doc uses **N = 5173** as the default; substitute your port everywhere.
4. **Supabase configured** (optional but required for auth on device): `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`; restart dev server after changes.
5. **Supabase URL configuration** (Authentication → URL Configuration):
   - **Site URL:** `http://localhost:5173` (or your current **N**)
   - **Redirect URLs:** include `http://localhost:5173/**` (and production/staging hosts when deployed)
6. **Google OAuth** (if using Sign in with Google): follow [DOC_SUPABASE_GOOGLE_OAUTH.md](./DOC_SUPABASE_GOOGLE_OAUTH.md) — **Authorized JavaScript origins** must include `http://localhost:5173` (not a LAN IP).

---

## Android + USB (recommended for local SSO)

When Supabase and Google allow **`http://localhost`** but **reject private LAN IPs** (`http://192.168.x.x`), use **adb reverse** so the phone browser sees localhost on the PC.

### One-time phone setup

1. Enable **Developer options** on the Android device.
2. Turn on **USB debugging**.
3. Install [Android Platform Tools](https://developer.android.com/tools/releases/platform-tools) on the PC.
4. Connect via USB; verify:

   ```bash
   adb devices
   ```

   The device must show **`device`**, not `unauthorized` (accept the RSA prompt on the phone if needed).

### Each dev session

1. Start dev server: `pnpm dev` (port **N**, default 5173).
2. Forward the port:

   ```bash
   adb reverse tcp:5173 tcp:5173
   ```

   Replace `5173` with **N** if Vite uses another port. Re-run after unplugging USB or rebooting the phone.

3. On the phone browser, open **`http://localhost:5173`** — **not** `http://192.168.x.x:5173`.
4. Test routes: `/`, `/tasks` (dev FAB), ProfileMenu sign-in when Supabase is configured. For Google OAuth, complete sign-in on the device.

---

## iPhone / iPad (no adb)

| Approach | When to use |
|----------|-------------|
| **Deployed preview / staging** | Auth already configured for that host; acceptable to test a build not running on your PC |
| **HTTPS tunnel** (`ngrok`, Cloudflare Tunnel, `localtunnel`, …) | Local code + OAuth: add the tunnel origin (e.g. `https://abc.ngrok-free.app`) to Supabase **Redirect URLs** and Google **Authorized JavaScript origins** |
| **Email/password only** | Layout checks on tunnel or staging without configuring SSO |

There is no first-party preview URL in this harness — use your own hosting (Firebase, Vercel, etc.) or a tunnel.

---

## LAN IP and `pnpm dev -- --host`

```bash
pnpm dev -- --host
```

Exposes the dev server on your LAN (e.g. `http://192.168.1.x:5173`). Useful for **UI-only** checks without USB.

| URL pattern | Typical result |
|-------------|----------------|
| `http://localhost:N` (via adb reverse on Android) | Email/password and Google OAuth **work** when IdP allowlists include localhost |
| `http://192.168.x.x:N` (`--host`) | Layout often OK; **Google OAuth / SAML often fail** — Supabase may redirect to Site URL instead of the LAN origin |
| `https://<tunnel-host>` | Works when tunnel origin is added to Supabase Redirect URLs and Google origins |

---

## Verification gate (humans and agents)

Before closing a mobile viewport or mobile-auth issue:

- [ ] Reproduced or verified on a **physical device** using a URL pattern from this runbook
- [ ] Not accepted on DevTools-only or desktop resize-only evidence

For layout fixes in your fork, prefer **`100dvh` / `100svh`** for full-height shells and **`visualViewport`** offsets on fixed bottom UI where applicable.

### Optional console probe (viewport height)

Run in the phone browser console on a page with a fixed bottom control:

```javascript
(() => {
  const vh = window.innerHeight;
  const cssVh = parseFloat(getComputedStyle(document.documentElement).height) || vh;
  const el = document.querySelector('button[type="submit"], form');
  const bottom = el ? el.getBoundingClientRect().bottom : null;
  const clipped = bottom != null && bottom > vh ? Math.round(bottom - vh) : 0;
  console.log({ innerHeight: vh, clippedBelowPx: clipped });
})();
```

`clippedBelowPx > 0` suggests content extends below the visible viewport.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Phone cannot reach PC at LAN IP | Firewall or wrong Wi‑Fi | Use adb reverse + `http://localhost:N` on Android; or tunnel on iOS |
| Google sign-in works on desktop, fails on phone at LAN IP | IdP rejects private IP origins | Use adb reverse + localhost (Android) or HTTPS tunnel + allowlist |
| OAuth returns to wrong URL / loop | Site URL or Redirect URLs mismatch | Supabase **Authentication → URL Configuration**; match [DOC_SUPABASE_GOOGLE_OAUTH.md](./DOC_SUPABASE_GOOGLE_OAUTH.md) origins |
| `adb devices` empty or unauthorized | USB debugging off or prompt not accepted | Enable developer mode; accept RSA fingerprint on phone |
| Port changed after restart | 5173 in use | Read terminal output; update `adb reverse tcp:N tcp:N` and bookmarks |
| Auth works on device but layout wrong | Viewport / keyboard, not redirect | DevTools width is insufficient — keep testing on device; fix layout in feature code |

---

## When to update this doc

- Default dev port or `pnpm dev` command changes
- New auth provider or IdP redirect rules
- New mobile-critical feature surfaces (add a one-line pointer in that feature's README — link here, do not copy adb steps)

## Related

- [DOC_SUPABASE_GOOGLE_OAUTH.md](./DOC_SUPABASE_GOOGLE_OAUTH.md) — Google Cloud + Supabase dashboard setup
- [src/features/auth/README.md](../src/features/auth/README.md) — auth feature; mobile OAuth testing
- [.agents/skills/debug/patterns.md](../.agents/skills/debug/patterns.md) — mobile layout / DevTools mismatch pattern
- [MOBILE_LOCAL_DEV_ADOPTION_GUIDE.md](./handoffs/MOBILE_LOCAL_DEV_ADOPTION_GUIDE.md) — port this pattern to other repos
