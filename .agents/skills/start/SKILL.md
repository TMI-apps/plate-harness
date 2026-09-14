---
name: start
description: >-
  Human onboarding: README Quick Start, dev task backlog (/tasks), gates, verification.
  Requires filling documentation/DOC_APP_VISION.md (problem, persona, app role) before fork/clone
  unless user defers. Use for first-time setup and /start-style requests.
---

# start

Guide a new user through first-time setup of this harness by following the README flow end-to-end, working through the dev task backlog, validating each step, and only moving forward when each gate passes.

## Core behavior

- Be careful, explicit, and beginner-friendly.
- Follow the Quick Start flow from `README.md` in order.
- Use the **dev task backlog** (`src/config/app-tasks.json`, UI at `/tasks` via DevTasksFab in local dev) as the onboarding checklist.
- Validate every step before proceeding.
- Never claim setup is complete without user confirmation and successful verification checks.
- If a step requires a web interface or account action the assistant cannot do itself (GitHub, Supabase dashboard, browser auth prompts, settings pages, etc.), clearly hand it to the user with exact click-by-click instructions and then wait for confirmation.

## Template repo vs fork (read first)

**Working on this plate-harness template** (improving the harness itself — not building an app from a fork):

- **Skip Supabase (task #1)** and **Cloudflare hosting (task #2)**. No project, no Workers Builds link, no `.env` required for most template work. The app runs locally without auth configured.
- **Skip Airtable (task #4)** unless you are testing that integration.
- **App vision (task #3):** may stay **`DRAFT`** while exploring or contributing to the template; do not block template PRs on it unless the change is product-facing.
- **Still do:** prerequisites, branch workflow (SSOT: `src/config/git-workflow.json` + `.cursor/rules/git-workflow/RULE.mdc` § Mode-aware branch gate), `pnpm dev`, and the verification checklist (§ Mandatory verification checklist).

**Working on a fork** (someone cloned this to build their own app): full backlog applies — Supabase, hosting, vision **`ACTIVE`**, etc.

When the user says they are on the **template** (or context is clearly harness maintenance), default to the skip list above. Only walk Supabase/Cloudflare gates when they are onboarding a fork or explicitly ask to wire up services.

## Dev task backlog (onboarding SSOT)

Fresh clones ship five pre-seeded tasks in priority order:

1. Configure Supabase
2. Put your app online (Cloudflare hosting)
3. Define app vision (`documentation/DOC_APP_VISION.md`)
4. Configure Airtable (optional)
5. Configure Theme

**Agent task sync (this skill + router + finish):**

- At session start: read `src/config/app-tasks.json`; set relevant task `in-progress` when picking up onboarding work.
- After completing a step: archive completed tasks (move to `app-tasks-archive.json`) or update descriptions (e.g. note Airtable skipped).
- Checks: Supabase env vars present; hosting configured per README; vision doc `ACTIVE`; optional Airtable/theme as applicable.
- **Conflict:** `/tasks` UI disk-wins — reconcile with user edits; do not fight pending UI state.

Configuration is via `.env`, README, and docs — there is no in-app setup wizard.

## Flow (README-aligned)

### 1) Prerequisites gate

Run these commands first and inspect output:

```bash
node -v
pnpm -v
git --version
```

Required versions:

- Node.js 20+
- pnpm 9.15.4+
- Git

If versions are missing/too low:

- Stop and do not continue setup
- Provide install or upgrade instructions for the user's OS
- Re-run the version-check commands until all pass

Only continue when all three checks pass.

### 2) App vision & goals gate (mandatory before fork/clone and setup)

**Template repo:** skip this gate unless the user is preparing a fork or the work changes user-facing product behavior. Record in chat that vision can stay **`DRAFT`** for template-only work.

**Fork / app onboarding:** This fork's **product SSOT** is `documentation/DOC_APP_VISION.md` (problem statement, user persona, app's role).

- Read that file **now**.
- If the vision line still shows **`DRAFT`** (per the status callout at the top), **stop forward progress** on onboarding until task #3 (Define app vision) is addressed: walk the user through filling each section in their own words. Use the placeholders only as prompts; they must be **replaced** with real prose, then set the status token to **`ACTIVE`** on that same line.
- **Do not** continue to **Fork + clone** (next gate) until either:
  - the vision status is **`ACTIVE`**, or
  - the user **explicitly** instructs you to defer (e.g. exploring the repo only) — in that case, record in chat that feature/plan work should run this vision gate or fill `DOC_APP_VISION.md` before product decisions.

Optional: open `documentation/DOC_APP_VISION.md` in the editor for the user when the environment supports it.

### 3) Line endings gate (mandatory on Windows too)

Guide user to set LF line endings:

- VS Code/Cursor setting `files.eol` -> `\n`
- Git: `git config core.autocrlf false`

Verify by asking user to confirm they changed both.

### 4) Fork + clone gate

Guide user through README Option B:

1. Fork on GitHub
2. Clone their fork
3. `pnpm install`

If assistant cannot perform the fork UI step, instruct user exactly what to click in GitHub and wait for confirmation before continuing.

### 5) Branch workflow gate

**Template repo (harness maintenance):** stay **`model-a`**. Do **not** offer Model B. Create `feature/<name>` from `develop` as usual for template PRs.

**Fork:** create `develop` from `main` once (`git push origin main:develop`). Then ask:

> Feature branches (Model A, default) or direct `develop` (Model B)?

Write `src/config/git-workflow.json` accordingly (`"mode": "model-a"` | `"model-b"`). Behavior SSOT: `.cursor/rules/git-workflow/RULE.mdc`.

**Model A:**

```bash
git switch develop && git pull origin develop
git switch -c feature/<name>
```

Configure GitHub rulesets: `develop` = PR + `test` + non-ff + deletion; `main` = deletion + non-ff only. See § Branch Protection and § Promote to production.

**Model B:**

```bash
git switch develop && git pull origin develop
```

Do **not** create `feature/*` for daily work. Configure GitHub rulesets: `develop` = `test` + non-ff + deletion (**no** `pull_request`); `main` = deletion + non-ff only.

**Ruleset confirmation gate (Model B — required):** Before leaving this gate, confirm the live `develop` ruleset matches Model B (user confirmation or `gh api repos/OWNER/REPO/rules/branches/develop` / rulesets API): `pull_request` **absent**; `required_status_checks` (`test`) present; `non_fast_forward` + `deletion` present. Do not proceed on click-path instructions alone.

**First-promotion bootstrap (Model B):** After the promote workflow file exists on `develop`, seed it onto `main` once with a local ff push (`git fetch origin && git checkout main && git merge --ff-only origin/develop && git push origin main`), then use **Promote to production** thereafter. See `.cursor/rules/git-workflow/RULE.mdc` § Promote to production.

If steps are web-UI only, provide exact click-path and wait for user confirmation.

### 6) Dev server gate

Run:

```bash
pnpm dev
```

Confirm app is reachable at the shown localhost URL. In dev, open `/tasks` via the floating action button to see the onboarding checklist.

### 7) Configuration tasks gate (work through backlog)

**Template repo:** skip tasks #1 (Supabase), #2 (Cloudflare), and #4 (Airtable) unless explicitly testing those paths. Archive or leave them `to-do`; do not treat missing `.env` as a failure.

**Fork onboarding:** walk through backlog tasks in order (skip or archive optional items the user declines):

**Supabase (task #1):**

- If assistant cannot perform dashboard actions, instruct user exactly:
  - Open Supabase project
  - Go to Project Settings -> API
  - Copy Project URL + Publishable Key
- Guide user to create `.env` in project root with `VITE_SUPABASE_*` vars (see README).
- Remind user to restart dev server after `.env` changes.
- For **Sign in with Google**, use **`documentation/DOC_SUPABASE_GOOGLE_OAUTH.md` as the SSOT**.

**Hosting (task #2 — Put your app online):** Follow the **Agent one-shot brief** in `documentation/DOC_CLOUDFLARE_WORKERS.md`; the task description in `src/config/app-tasks.json` is the plain-language summary. Fork must add `account_id`/custom domain; template intentionally omits them.

**App vision (task #3):** Collaborate on `DOC_APP_VISION.md`; set status to **`ACTIVE`**.

**Airtable (task #4, optional):** Add `VITE_AIRTABLE_*` to `.env` or archive/skip with note.

**Theme (task #5):** Customize `src/shared/theme/` or skip if defaults suffice.

Update `app-tasks.json` as each step completes.

### 8) Route verification gate

Verify routes from README:

- `/`
- `/tasks` (dev only, via FAB)
- `/login` (when Supabase configured)

If a route fails, troubleshoot before continuing.

### 9) Physical device testing (optional)

If the user needs mobile layout or mobile OAuth on local dev, link **`documentation/DOC_MOBILE_LOCAL_DEV.md`** (SSOT). Do not duplicate adb or redirect steps here.

## Mandatory verification checklist ("test for everything")

Run and verify all relevant checks:

```bash
pnpm lint
pnpm format:check
pnpm type-check
pnpm validate:structure
pnpm test:classify
pnpm test:run
pnpm build
```

Optional during development: `pnpm test:staged` after `git add` to preview pre-commit test selection.

**How to write tests:** `documentation/DOC_TESTING.md` (runners, colocation, naming, `tests/test-utils`).

If any check fails:

- Stop and fix in smallest safe steps
- Re-run failed check(s)
- Re-run full checklist before final confirmation

## Communication rules during start

- Use short steps and numbered instructions.
- After each gate, explicitly ask user for confirmation.
- For any manual web-interface action, provide:
  - where to go
  - what to click
  - what value to copy/paste
  - what outcome to expect
- Do not skip gates even if user is experienced, unless user explicitly asks to skip **or** context is **template repo** work (see § Template repo vs fork).

## Completion criteria

Only consider onboarding complete when:

**Template repo:** verification checklist passes and user confirms they are ready — Supabase/Cloudflare/vision **`ACTIVE`** not required.

**Fork / app onboarding:**

1. **`documentation/DOC_APP_VISION.md`** is **`ACTIVE`** (or user explicitly deferred with reason recorded)
2. User confirms configuration tasks they wanted are done (backlog archived or updated)
3. Route checks pass
4. Verification checklist passes
5. User confirms they are ready to proceed

---

## Boundaries

| Not `start` | Use instead |
|-------------|-------------|
| Agent session technical context | `prime` |
| Feature/plan work | `plan` / `feature` |

**App vision procedure SSOT:** § App vision in this skill; content SSOT: `documentation/DOC_APP_VISION.md`.
**Onboarding checklist SSOT:** `src/config/app-tasks.json` + `src/features/tasks/README.md`.

**Next:** Onboarding complete → **`prime`** for agent context; feature work → **`plan`** or **`feature`** per router gates.
