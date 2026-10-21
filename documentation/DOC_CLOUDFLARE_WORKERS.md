# Cloudflare Workers deployment

Deploy this Vite + React SPA to **Cloudflare Workers** with static assets, using **Workers Builds** for CI/CD. GitHub is the **quality gate only** — it never deploys. This replaces the older Cloudflare **Pages** flow.

**Official migration reference:** [Migrate from Pages to Workers](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)

## Responsibility split (one deploy path)

| System | Responsibility |
|--------|----------------|
| **GitHub (this repo)** | Source + `wrangler.jsonc`. `ci.yml` runs type-check / lint / tests / build on every PR + push to `main` and `develop`. Rulesets depend on git-workflow mode (`src/config/git-workflow.json`) — see ruleset table below. **No deploy workflow. No `CLOUDFLARE_API_TOKEN` secret.** Production per `.cursor/rules/git-workflow/RULE.mdc` § Mode behavior table → **production** (C: merging the PR; A/B: Promote workflow fast-forwards `main` to `develop`). |
| **Cloudflare Workers Builds** | Builds and deploys on push. `main` → production; every other branch → its own preview (Model C relies on these per-PR previews; A/B also use `develop` as the stable staging preview). Account, build command, and `VITE_*`/`CLOUDFLARE_ACCOUNT_ID` env live in the dashboard connection. |
| **Supabase** | Two projects: **production** (`main` build) and **staging** (every non-production branch build/preview). Previews never read or write production data; Edge Functions deploy to staging first. Auth URLs for each project include its deployed origin(s). See § Staging backend. |

Push → Cloudflare builds & deploys. GitHub blocks bad merges. There is no GitHub → Cloudflare deploy step.

## Agent one-shot brief (fork setup)

For coding agents completing the **"Put your app online (Cloudflare hosting)"** task from `src/config/app-tasks.json`. Run it after the user's Supabase env vars exist. Use `.agents/skills/quick-piv/SKILL.md` for the change, or `plan` + `implement` if rulesets/dashboard need research. Branch model: read `src/config/git-workflow.json`; apply `.cursor/rules/git-workflow/RULE.mdc` § Mode-aware branch gate. The **user** confirms success — do not claim done without their test.

**Target:** GitHub = CI gate only (`ci.yml` on every PR + push to `main` and `develop`; rulesets per mode table below; **no** deploy workflow; **no** `CLOUDFLARE_API_TOKEN` secret). Cloudflare Workers Builds = sole deploy path (`main` → production; per-branch previews — required for Model C, optional in A; `develop` → stable staging preview in A/B). Same Supabase project for preview and production.

**Discover first (ask the user when unknown):**

- Unique Worker `name` (lowercase, hyphens) for `wrangler.jsonc`.
- Cloudflare **org** `account_id` (not a personal account) — dashboard, or `pnpm exec wrangler whoami`.
- Production custom domain (optional) with DNS on Cloudflare.
- Any old Cloudflare **Pages** project to retire once the Worker serves the domain.
- All build-time `VITE_*` keys (from `.env`): at minimum `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`.
- On the fork, the CI check is job name `test`. Find its `integration_id` with `gh api repos/OWNER/REPO/rulesets` (classic branch protection returns 404 — use the rulesets API).

**Implement (fork commits):**

1. `wrangler.jsonc` — set `name`; `compatibility_date` today; `workers_dev: true`; `preview_urls: true`; `assets.directory: "./dist"`; `assets.not_found_handling: "single-page-application"`; add `account_id`; add `routes: [{ "pattern": "<domain>", "custom_domain": true }]` only when using a custom domain. Do **not** set `pages_build_output_dir`. Remove a `public/_redirects` SPA rule if present (conflicts with `not_found_handling` → `Infinite loop detected`).
2. GitHub — delete any `deploy-cloudflare-*.yml`; keep `ci.yml` with `main` + `develop` triggers. Configure rulesets per `.cursor/rules/git-workflow/RULE.mdc` § Mode behavior table (rows **`main` ruleset** / **`develop` ruleset**); summary:

| Branch / rule | Model A (`model-a`) | Model B (`model-b`) | Model C (`model-c`, default) |
|---------------|---------------------|---------------------|------------------------------|
| `develop` `pull_request` | Required | **Absent** (direct push) | — (no `develop`) |
| `develop` `required_status_checks` (`test`) | Yes | Yes | — |
| `develop` `non_fast_forward` + `deletion` | Yes | Yes | — |
| `main` | **`deletion` + `non_fast_forward` only** | Same | `pull_request` (squash) + required `test` and `pr-title` + `non_fast_forward` + `deletion`; no bypass |

   Model A: squash merge for `feature/*` PRs. Model B: **staging may deploy on push before CI `test` is green** — production still promote-gated. On `main`: promote workflow's `GITHUB_TOKEN` can ff with no PAT/bypass.
3. `package.json` already has `deploy` and `preview:worker` scripts and `wrangler` as a devDependency — no change needed.

**Dashboard hand-off (agent usually cannot do via API — Workers Builds needs a user API token, not wrangler OAuth):** give the user exact click-path → Cloudflare → **Workers & Pages → Create → Workers → Connect to Git** → Production branch `main`; Build command `pnpm install && pnpm run build`; Deploy command `npx wrangler deploy`; **Root directory EMPTY** (a stale value causes `root directory not found`); Build variables `CLOUDFLARE_ACCOUNT_ID`, plus every `VITE_*` the app needs; **do NOT set `NODE_VERSION`** — `.node-version` is the Node SSOT and a dashboard `NODE_VERSION` overrides it (stale `NODE_VERSION=20` breaks wrangler 4; `preinstall` fails fast with a fix hint); enable **non-production branch builds** for `develop` (stable staging) and optional per-`feature/*` previews.

**Auth:** add the production URL + a wildcard preview pattern (e.g. `https://*.<your-subdomain>.workers.dev/**`) to Supabase **Authentication → URL configuration** (Site URL + Redirect URLs), so per-branch preview URLs keep working without per-branch edits. For Google, add matching JavaScript origins and callback paths per [DOC_SUPABASE_GOOGLE_OAUTH.md](./DOC_SUPABASE_GOOGLE_OAUTH.md) (include the app's `/auth/callback` route).

**Retire old Pages:** after the Worker serves the domain, disable auto-deploy on the old Pages project, then delete it.

**Gotchas:** `account_id` is required in `wrangler.jsonc` when multiple CF accounts are visible; the live site must load `/assets/*.js` in view-source (not `/src/main.tsx`); `pnpm deploy` is an emergency local path only.

**Gates:** `pnpm lint`, `pnpm type-check`, `pnpm build`, `pnpm validate:structure` pass; a PR with a failing lint stays blocked until CI is green; Workers Builds shows green on latest `main` and on the PR's preview build; login works on production and on the branch preview.

## What is configured in this repo

| Concern | How |
|--------|-----|
| Worker config | Root `wrangler.jsonc` — **assets-only SPA** (no `main`, no `ASSETS` binding) |
| Build output | Plain `vite build` → `dist/` (`assets.directory: "./dist"`) |
| SPA routing (React Router) | `assets.not_found_handling: "single-page-application"` |
| Preview URLs | `preview_urls: true`, `workers_dev: true` |
| Node version | `.node-version` = `22` (wrangler 4 requires Node 22+) |
| Emergency local deploy | `pnpm deploy` (`pnpm build && wrangler deploy`) |
| Local Workers preview | `pnpm preview:worker` (`pnpm build && wrangler dev`) |

### Fork-safe by design

This is a **template**, so account- and domain-specific values are **not committed**:

- **No `account_id`** in `wrangler.jsonc` — set `CLOUDFLARE_ACCOUNT_ID` instead (Workers Builds env var, and locally if your token sees multiple accounts). Avoids the `More than one account available` error without pinning a forked repo to someone else's account.
- **No `routes` / custom domain** — add one in your fork only (see Custom domain below).
- **`name`** is a placeholder — rename it per fork.

## Quick start

### 1. Rename the Worker

Edit `name` in [`wrangler.jsonc`](../wrangler.jsonc) to a unique name in your Cloudflare account (lowercase, hyphens).

### 2. Connect Workers Builds (dashboard — primary deploy path)

In the Cloudflare dashboard → **Workers & Pages → Create → Workers → Connect to Git**:

| Setting | Value |
|---------|-------|
| Repository | your repo |
| Production branch | `main` |
| Build command | `pnpm install && pnpm run build` |
| Deploy command | `npx wrangler deploy` |
| **Root directory** | **EMPTY (repo root)** — a stale root directory causes `Failed: root directory not found` |
| Build variables | `CLOUDFLARE_ACCOUNT_ID=<your account id>`, plus build-time `VITE_*` (e.g. `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`). **Never `NODE_VERSION`** — it overrides `.node-version`; delete it if present |

Then enable **non-production branch builds**: Model C — **all branches** (each PR's preview is its staging; worktree branch names vary, so do not filter by prefix); Model A/B — `develop` (stable staging URL), optionally per-`feature/*` previews. Check the Workers Builds plan's build minutes and concurrency: every pushed branch costs a build.

> `VITE_*` variables are embedded at **build time**. Workers Builds does **not** share runtime and build env vars — set every `VITE_*` your app needs in the build variables, or production will load an app with missing config.

### Staging backend (separate Supabase project)

Previews must not share the production Supabase project (free plan has no Supabase Branching, so use a second permanent project; the free tier allows two active projects).

1. **Create** a second Supabase project (e.g. `<app>-staging`). Copy its URL and publishable key.
2. **Build variables:** in Workers Builds, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to the **production** values for the production branch (`main`) and to the **staging** values for non-production branches. If the dashboard exposes only one set, switch on the branch name in the build command instead.
3. **Schema parity:** build both projects only from `supabase/migrations/` — never by clicking in the dashboard — so staging cannot drift from production.
4. **Order of operations for a PR:** apply its migrations and deploy its Edge Functions to **staging** while the PR is open, test on the preview URL, merge, then apply the same migrations / deploy the same functions to **production**. Write migrations backwards-compatible (add before you remove) because the free plan has no point-in-time recovery.
5. **Data:** staging holds fake or seed data only. Do not copy production rows into it.
6. **Auth:** add the preview wildcard to the **staging** project's redirect URLs (and use staging Google OAuth origins/client); production keeps only its own origin.

**Free-plan caveats:** inactive free projects pause after about a week (restore staging in the dashboard before testing a preview). All open PRs share the one staging database, so PRs with conflicting migrations collide; serialize them.

### 3. Supabase auth URLs

Add the deployed origins to Supabase **Authentication → URL configuration** (Site URL + Redirect URLs), e.g.:

- `https://<your-worker>.<subdomain>.workers.dev/**` (production)
- a wildcard preview pattern for branch builds, e.g. `https://*.<your-subdomain>.workers.dev/**` — add this to the **staging** project only (§ Staging backend); keep production to its own origin(s)

For Google OAuth, also add those origins to Google Cloud **Authorized JavaScript origins** and the callback path. Full checklist: [DOC_SUPABASE_GOOGLE_OAUTH.md](./DOC_SUPABASE_GOOGLE_OAUTH.md).

### 4. Verify

After a push, confirm in the dashboard that Workers Builds shows a green build, then open the live URL. **View source** and confirm it loads built assets (`/assets/*.js`), not `/src/main.tsx` — the latter is the Pages-style dev/MIME-type symptom indicating the build/serve config is wrong.

## Rollback

Every merge to `main` deploys production under Model C (and every promote under A/B), so keep a quick way back:

- **Dashboard:** Workers & Pages → your Worker → **Deployments** → pick the last good version → **Rollback**.
- **CLI:** `pnpm exec wrangler rollback` (optionally with a version ID from `pnpm exec wrangler deployments list`).
- Then fix forward with a normal PR (C) or `develop` landing (A/B). A rollback does not change git history.

## Custom domain (per fork, optional)

If your domain's nameservers are on Cloudflare, add a route to your fork's `wrangler.jsonc`:

```jsonc
"routes": [{ "pattern": "app.example.com", "custom_domain": true }]
```

The domain attaches on the next deploy. Keep this **out of the template** so forks don't try to bind a domain they don't own.

## Emergency local deploy

The dashboard connection is the normal path. For a one-off manual deploy:

```bash
pnpm exec wrangler login          # one-time
$env:CLOUDFLARE_ACCOUNT_ID="<id>" # PowerShell, if multiple accounts are visible
pnpm deploy                       # pnpm build && wrangler deploy
```

## Migrating an existing Pages project

| Pages | Workers (this repo) |
|-------|---------------------|
| `pages_build_output_dir` | `assets.directory: "./dist"` in `wrangler.jsonc` |
| Implicit SPA fallback | `not_found_handling: "single-page-application"` |
| `public/_redirects` SPA rule | **Remove it** — conflicts with `not_found_handling` and fails the build with `Infinite loop detected` |
| `wrangler pages deploy` / built-in CI | Workers Builds (push-to-deploy) |
| `wrangler pages dev` | `pnpm dev` (Vite) or `pnpm preview:worker` |
| `pages.dev` | `workers.dev` (`workers_dev: true`) |
| Pages Functions (`functions/`) | Add `worker/index.ts` + `main` in `wrangler.jsonc` — see [Vite plugin tutorial](https://developers.cloudflare.com/workers/vite-plugin/tutorial/) |

After validating production on Workers, delete the old Pages project (dashboard or `wrangler pages project delete`).

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Failed: root directory not found` (Workers Builds) | Set Root directory to **empty** (repo root) |
| `More than one account available` (local deploy) | Set `CLOUDFLARE_ACCOUNT_ID` env var |
| `Infinite loop detected` (build) | Remove `public/_redirects` SPA rule; rely on `not_found_handling` |
| Live page shows `/src/main.tsx` not `/assets/*.js` | Build didn't run / assets dir wrong — check Build command and `assets.directory` |
| Routes 404 in production | Confirm `not_found_handling: "single-page-application"` |
| Empty app / missing config in production | `VITE_*` not set as Workers Builds **build** variables |

**Agents:** after changing Wrangler/Cloudflare setup, keep `.wrangler/` in the tracked `.gitignore` (the structure validator skips git-ignored paths — `.cursor/rules/file-placement/RULE.mdc` § Tooling artifacts), and whitelist new root files in `projectStructure.config.cjs`.

## Related docs

- [Workers + React framework guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/react/)
- [Static assets routing](https://developers.cloudflare.com/workers/static-assets/routing/)
- [Migrate from Pages to Workers](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)
