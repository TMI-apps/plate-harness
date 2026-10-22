# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.42.1](https://github.com/TMI-apps/plate-harness/compare/v0.42.0...v0.42.1) (2026-10-22)


### Bug Fixes

* **deploy:** point the Node-version hint at the Previews build tab too ([#63](https://github.com/TMI-apps/plate-harness/issues/63)) ([8aa54f7](https://github.com/TMI-apps/plate-harness/commit/8aa54f7b052c7916bd5fdac0e57139095dd659df))

## [0.42.0](https://github.com/TMI-apps/plate-harness/compare/v0.40.0...v0.42.0) (2026-10-21)

First release cut by release-please (Model C). It ships the work described under 0.41.0 below; 0.41.0 itself was never tagged, so the generated notes for this release listed unrelated older commits and were replaced by this entry.

## [0.41.0] - 2026-10-21

Model C cutover, harness tightening and dead-code cleanup, plus generic improvements ported from bronze-plate-harness (audit: `documentation/jobs/temp_job_plate-bronze-diff/`).

### Added

- **Node 22 guard:** `engines: >=22` and a `preinstall` check (`scripts/check-node-version.cjs`, with test) that fails fast when Node is older than `.node-version`.
- **Staging Supabase project for previews:** docs and rules (`DOC_CLOUDFLARE_WORKERS.md` § Staging backend, `cloud-functions`, `database`, `git-workflow`) describe a separate staging project; previews never touch production data, and migrations/Edge Functions go to staging first.
- **`## Preview` section in every PR** (`git-workflow` rule, all modes).
- **Automatic release bootstrap:** `release-please.yml` `bootstrap` job creates the baseline `v<version>` release under model-c.
- **React hooks lint:** `react-hooks/rules-of-hooks` (error) and `react-hooks/exhaustive-deps` (warn).

### Changed

- **Git workflow mode is now `model-c`** (`src/config/git-workflow.json`): per-task branch → squash PR → `main`; release-please owns versions.
- **Node 22** (`.node-version`, CI): wrangler 4 needs Node 22+. Docs say never to set a dashboard `NODE_VERSION`.
- **dependency-cruiser excludes anchored** (`^dist/`, `^build/`, `^coverage/`); unanchored ones hid every vendor import. Supabase types now come from `supabaseService` (the only `@supabase/*` import site); baselines regenerated.
- **`test-staged`:** falls back to the full suite when Vitest 4 exits 1 because no related tests exist (no longer blocks such commits).
- **`ProfileMenu` and `Topbar` moved to `src/layouts/`** (app shell); the `components/common` no-feature-imports lint block now targets the right path (`src/components/common/**`).
- **Lint SSOT is `eslint.config.js`:** rules, skills, husky hook and settings no longer point at `.eslintrc.json`; layer enforcement is documented as dependency-cruiser plus `no-restricted-imports`.
- Airtable is labeled an optional module (kept in plate, not imported by the app).
- Worker renamed to `plate-harness` (`wrangler.jsonc`).

### Removed

- `.eslintrc.json` (ignored by ESLint 10) and the broken `pnpm lint:arch` script.
- Unused ESLint devDependencies: `@eslint/js`, `eslint-config-prettier`, `eslint-import-resolver-typescript`, `eslint-plugin-boundaries`, `eslint-plugin-import`, `eslint-plugin-react`, `eslint-plugin-react-refresh`, `eslint-plugin-unused-imports`, `globals`, `typescript-eslint`.
- Unused hooks `useUserProfile` and `useUpdateUserProfile` (plus the orphaned `updateUserProfile` and `UserProfileUpdate`).
- `documentation/Authentication-main-app/`, `documentation/claude_outputs/`, `DOC_ARCHITECTURE_MIGRATION_INSTRUCTIONS.md` and completed job plans.
- Dead app code found with knip: `Card`, `Modal`, `themeLoader` (custom-theme localStorage API), duplicate Supabase init path and unused exports/types.
- Always-loaded rules and skills tightened (router tiebreaks moved to `router/references/tiebreaks.md`).

## [0.40.0] - 2026-10-16

### Added

- **Git workflow Model C (Claude Code defaults):** third mode `model-c` in `src/config/git-workflow.json` — per-task (worktree) branch → squash PR → `main`, merge = production, per-PR preview URLs; becomes the default for new forks. `validate-git-workflow.cjs` accepts it and gains `--print-mode` (single mode reader for CI).
- **Mode behavior table** in `.cursor/rules/git-workflow/RULE.mdc`: one SSOT row per mode-dependent behavior (branch gate, landing, commit timing, version source, CI watcher, staging, production, rulesets, fork setup); skills, rules, and docs point at its rows.
- **Release automation for Model C:** `.github/workflows/release-please.yml` (mode-gated; dispatches CI on the release branch so required checks run without a PAT) and a `pr-title` CI job enforcing conventional PR titles.
- **Claude Code hooks** in `.claude/settings.json`: SessionStart `scripts/ensure-deps-installed.cjs` installs dependencies in new worktree sessions; PreToolUse `scripts/deny-git-write-on-main.cjs` blocks agent commits/pushes to `main` in every mode.
- **`tighten-harness` skill:** cut harness context cost (prune, merge, relocate, replace prose with enforcement) without behavior change; indexed from `align-harness`, router, and `AGENTS.md`.
- Tests for the new scripts, `validate-version-sync` (release-please heading shape), and the structure validator's git-ignore handling; all wired into `test:classify`.

### Changed

- **Agent behavior aligned with Claude Code defaults (all tools):** success reporting replaces the "never claim success" phrase bans; question protocol drops "raw text first" and mandatory escape-hatch options (max 4 options); fan-out skills (`review-dev-plan`, `validate`) are offered, not auto-started; `finish` "wait and re-check" no longer sleeps in the shell.
- **Platform rule** scoped by shell: PowerShell rules apply in PowerShell (Cursor); new § Git Bash for Claude Code's Bash tool.
- **CI hygiene:** `ci.yml` gains top-level read-only permissions, per-ref concurrency, and `workflow_dispatch`.
- **Structure validator** skips untracked paths ignored by the repo's tracked `.gitignore` files (e.g. `.claude/worktrees/`); `.gitignore` adds Claude Code runtime paths.
- Docs (README, CONTRIBUTING incl. A/B→C cutover and rollback, workflow layers, Cloudflare incl. rollback, changesets) describe Model C as the default.
- Renamed and relocated shared mechanisms per name-the-mechanism: app shell layout tokens (`appViewLayout`), `useAuthBackendConfigured`, `mapProviderUserToAppUser`, account-menu hooks beside `ProfileMenu`, `DevTasksFab` under the tasks feature.

## [0.39.0] - 2026-08-11

### Added

- **Git workflow Model B (opt-in):** Direct work on `develop` without feature branches. Mode selector `src/config/git-workflow.json` (`model-a` | `model-b`); `validate:git-workflow` script + tests wired into structure validation and CI.
- **Mode-aware agent gate:** `.cursor/rules/git-workflow/RULE.md` § Mode-aware branch gate; skills (`push`, `router`, `start`, `plan`, …) and docs read config instead of hardcoding Model A.

### Changed

- **Model A remains default** for template and new forks; Model B is fork-time / onboarding opt-in with different `develop` ruleset (no PR requirement; keep `test` checks).
- **Post-push CI:** Model A babysits PR checks; Model B watches branch `test` workflow runs (`gh run watch`).
- README, contributing, Cloudflare, changesets, and workflow layers docs updated for dual-mode; mid-project mode-switch steps documented.

## [0.38.0] - 2026-06-29

### Added

- **Promote to production workflow** (`.github/workflows/promote-to-production.yml`): `workflow_dispatch` fast-forwards `main` to `develop` with ancestor checks and green `test` gate on `develop` tip.

### Changed

- **Model A branch strategy**: Restored `develop` as integration + stable Cloudflare staging; `main` is production-only, updated only via ff-only promote workflow. Forbids squash `develop`→`main` and `main`→`develop` back-merge (fixes the old divergence class).
- **CI**: `ci.yml` triggers on `main` and `develop` (push + PR).
- **Workflow rule + docs + skills**: Rewrote `workflow/RULE.md`, `DOC_CLOUDFLARE_WORKERS.md`, `DOC_CONTRIBUTING.md`, `DOC_CHANGESETS.md`, `DOC_AGENT_WORKFLOW_LAYERS.md`, `rules/INDEX.md`, `app-tasks.json`, and `start`, `feature`, `push`, `validate`, `finish`, `router` skills for develop-first flow.

### Removed

- **Trunk-only model** (0.37.0): single-branch `feature/*`→`main` daily flow reverted for fork staging URL UX.

## [0.37.0] - 2026-06-29

### Changed

- **Trunk-based pipeline**: Collapsed the two-branch (`develop` + `main`) model to a single long-lived `main` trunk. All work flows `feature/*` → `main` via squash PR; merging to `main` ships production. Removes the permanent `develop`↔`main` history divergence and the mandatory back-merge ritual (root cause of PR #31's recurring conflicts).
- **Cloudflare previews**: Preview deployments are now per-branch / per-PR (non-production branch builds) instead of a single `develop` preview. Supabase auth uses a wildcard preview redirect pattern.
- **CI**: `ci.yml` triggers on `main` only (push + PR); dropped `develop` triggers.
- **Workflow rule + docs**: Rewrote `workflow/RULE.md` branch strategy, and updated `start`, `feature`, `push`, `validate` skills, `DOC_CLOUDFLARE_WORKERS.md`, `DOC_CONTRIBUTING.md`, `DOC_CHANGESETS.md`, `DOC_AGENT_WORKFLOW_LAYERS.md`, and `rules/INDEX.md` for the single-trunk model.

## [0.36.0] - 2026-06-28

### Added

- **Feature size enforcement**: `featureBudgets.config.cjs`, `scripts/feature-size-lib.js`, `validate-feature-size` scripts (full, staged, baseline); CI, pre-commit, and pre-push hooks.
- **`hypothesis` skill**: Pre-registered hypothesis debugging — root-cause experiments with explicit proved/disproved outcomes.
- **Cross-feature import rules**: `no-cross-feature-internals` dependency-cruiser rules; architecture RULE § Feature granularity.

### Changed

- **Validate skill consolidation**: Removed `check` skill; `validate` auto-selects depth (`plan-review`, `impl-full`, `gate`). Router, plan, feature, finish, and consolidate cross-references updated.
- **`arch-check-staged.js`**: Filters to architecture-relevant staged paths; runs full-graph depcruise when config changes.

### Removed

- **`check` skill**: Merged into `validate` gate mode.

## [0.35.0] - 2026-06-28

### Added

- **`caveman` skill**: Ultra-compressed agent communication mode (~75% fewer tokens) — terse responses with full technical accuracy; persists until user says "stop caveman" or "normal mode".

## [0.34.0] - 2026-06-24

### Added

- **`react-perf-vite` skill**: Stack-native React performance playbook (20 on-demand rules) for Vite, TanStack Query, and Workers — replaces vendored Vercel corpus.
- **`documentation/DOC_REACT_PERF.md`**: Human/agent overview and skill tiebreaks.

### Removed

- **`vercel-react-best-practices`**: Purged vendored skill (~76 files, nested `AGENTS.md` ~106 KB per-turn context bloat). Patterns adapted into `react-perf-vite`; upstream attribution in skill + doc.

### Changed

- **Router**: Situation row + `web-perf` / `optimize2` / `react-perf-vite` tiebreak; skill index updated.
- **`skills-lock.json`**: Tracks local `react-perf-vite` (derived from vercel-labs/agent-skills).

## [0.33.0] - 2026-06-24

### Added

- **Agent one-shot brief (Cloudflare fork setup)**: New "Agent one-shot brief (fork setup)" section in `documentation/DOC_CLOUDFLARE_WORKERS.md` with the full discover → implement → dashboard hand-off → auth → retire → gates playbook, so a coding agent can complete a fork's Workers Builds hosting setup in one pass.

### Changed

- **`develop` branch protection**: Hardened the `develop` ruleset to match `main` — now requires a pull request (merge/squash/rebase) and the green `test` CI check, plus `non_fast_forward` and deletion protection, so no direct or force push bypasses CI.
- **Onboarding hosting task**: Rewrote the `/tasks` hosting task ("Put your app online (Cloudflare hosting)") in plain language for non-technical forkers — what to prepare and that the coding agent performs the setup — instead of an inline technical brief; full technical detail now lives in the SSOT doc. Synced the `start` skill onboarding pointers to the new task name and doc section.
- **Wrangler**: Bumped `compatibility_date` to `2026-06-23`.

## [0.32.1] - 2026-06-20

### Changed

- **MUI bundle imports**: Replaced `@mui/material` and `@mui/icons-material` barrel imports with direct path imports across the app for faster dev cold starts and smaller transform graphs.
- **Route code-splitting**: Lazy-loaded `LoginPage`, `ResetPasswordPage`, and `AuthCallbackPage` so auth UI is not in the initial bundle.
- **Auth context performance**: Memoized `useAuth` context value and stabilized `useAuthHandlers` callbacks to reduce unnecessary consumer re-renders.
- **Query devtools**: Dynamically import `@tanstack/react-query-devtools` in dev only so it stays out of production bundles.

## [0.32.0] - 2026-06-20

### Added

- **Vercel React best practices skill**: `.agents/skills/vercel-react-best-practices/` (SKILL.md, AGENTS.md, rules library) with `skills-lock.json` for agent-skills provenance.
- **Inconsistency remediation job plan**: `documentation/jobs/temp_job_inconsistency-remediation/DEVELOPMENT_PLAN.md`.
- **Shared error utilities**: `src/shared/utils/errorUtils.ts`; auth user-facing strings in `src/features/auth/types/authMessages.ts`.
- **`useEmailAuthValidation`**: Hook bridge so `EmailAuthForm` does not import auth services directly.

### Changed

- **Path aliases**: Standardized on industry `@/` → `src/*` only; removed granular `@shared`, `@features`, `@pages`, `@utils` aliases from app and root TypeScript/Vite/Vitest config.
- **Utils consolidation**: Moved `redirectUtils`, `dateFormatters`, and tests from `src/utils/` to `src/shared/utils/`; removed top-level `src/utils/`.
- **Auth types & TanStack**: Consolidated `AuthContextValue` and profile types in `auth.types.ts`; `useUpdateUserProfile` merges via `setQueryData`; `ProfileMenu` uses `useUserProfileQuery`.
- **Error handling**: Unified OAuth callback errors via auth context; shared `getErrorMessage`; updated unconfigured-Supabase copy (no setup-wizard wording).
- **Layout & styling**: Auth layout tokens (`authViewLayout.ts`, `authFormSurfaceSx`); `ResetPasswordPage` and `AuthCallbackPage` aligned with shared loading/layout patterns; `Topbar` moved to folder + `index.ts`.
- **Docs & rules**: Updated `ARCHITECTURE.md`, `README.md`, `DOC_TANSTACK_QUERY.md`, feature READMEs, cursor rules for `@/` aliases, and `finish` skill task-list staging rule.

### Removed

- **Orphan config**: `src/config/entreefederatie.ts`.
- **Deprecated auth UI**: `LoginForm.tsx` wrapper; `authHandlerUtils` from hooks (now in `services/`).

## [0.31.0] - 2026-06-19

### Added

- **Cloudflare Workers deployment**: Root `wrangler.jsonc` as a fork-safe, assets-only SPA Worker (`not_found_handling: single-page-application`, `workers_dev`, `preview_urls`); `.node-version` (20); `deploy` and `preview:worker` scripts.
- **`documentation/DOC_CLOUDFLARE_WORKERS.md`**: Workers Builds–only deploy model with the GitHub-vs-Cloudflare responsibility split, dashboard settings (Build/Deploy commands, empty Root directory, `NODE_VERSION`/`CLOUDFLARE_ACCOUNT_ID`/`VITE_*` build vars), Pages → Workers migration mapping, and troubleshooting.

### Changed

- **Deploy architecture**: GitHub is the CI/quality gate only (no deploy workflow, no `CLOUDFLARE_API_TOKEN` secret); Cloudflare Workers Builds deploys on push (`develop` → preview, `main` → production).
- **Fork-safety**: `account_id` and custom domain are intentionally not committed — disambiguate via `CLOUDFLARE_ACCOUNT_ID` and add domains per fork.
- **Docs/rules**: README deployment section, hosting task in `app-tasks.json`, and workflow rule deployment guidance updated; `.wrangler/` ignored by the structure validator.

### Removed

- **`@cloudflare/vite-plugin`**: Switched to a plain assets-only Worker so the committed `wrangler.jsonc` is the single, transparent source of deploy config.

## [0.30.0] - 2026-06-10

### Added

- **Authentication**: Full sign-in UX — Google OAuth (PKCE on `/`), email sign-in/sign-up, forgot password, `/login`, `/reset-password`, inline home sign-in, and anonymous sessions treated as logged out.
- **Auth components**: `SignInPanel`, `EmailAuthForm`, safe redirect helpers, mapped English error messages, and auth viewport layout for responsive no-scroll pages.
- **Favicon**: Theme-primary rocket SVG (`public/favicon.svg`).

### Changed

- **Branding**: Site title and topbar link set to “React app starterkit”; removed boilerplate welcome copy from home.
- **Profile menu**: Google sign-in plus link to email login; removed schoolaccount / Entreefederatie paths.
- **`/tasks`**: Back button top-left without style overrides; removed checklist subtitle copy.
- **Auth preview**: Sign-in UI visible when Supabase is not configured (actions disabled with info alert).

### Removed

- **Vite default favicon** (`public/vite.svg`).

## [0.29.0] - 2026-06-09

### Added

- **Dev task backlog UI**: Card-style task rows, empty states, autosave chip indicator, and shared `taskStatusUi` constants for status labels and select width.

### Changed

- **`/tasks` layout**: Wider page shell, bordered panel, unified toolbar (tabs + add + autosave), and improved mobile grid for status/title/delete.
- **Text autosave**: Dirty-aware background saves — local drafts while typing, debounced persist without parent re-render stomping, focus-within blur handling.
- **Status labels**: Show “To do”, “Active”, and “Done” (stored value remains `in-progress`); status column min-width sized to fit “Active” without ellipsis.

### Fixed

- **Task delete**: Remove newly added or in-edit tasks using the latest pending snapshot, not stale list state.
- **Status select**: Prevent “Act…” / “To…” truncation on narrow viewports via fixed column width.

## [0.28.1] - 2026-06-09

### Documentation

- **Database rule**: Clarify SQL-migration-only scope, layer boundaries vs TanStack Query and auth, new-table checklist, and generic migration examples; update rules index blurb.

## [0.28.0] - 2026-06-09

### Added

- **Onboarding tasks**: Seed `src/config/app-tasks.json` with five default tasks (Supabase, Hosting, App vision, Airtable optional, Theme).

### Changed

- **Onboarding**: Replace `/setup` wizard with dev task backlog — configure via `.env`, README, and agent skills; DevTasksFab is the sole entry to `/tasks`.
- **Navigation**: Remove Topbar Setup link; Home and LoginForm no longer link to setup; ProfileMenu keeps minimal unconfigured auth message.
- **Agent skills**: Rewrite `start` for task-based onboarding; extend `router` and `finish` with onboarding task sync guidance.

### Removed

- **Setup wizard**: Entire `src/features/setup/`, `SetupPage`, `setupUtils`, `app.config.json`, `vite-plugin-dev-api.ts`, `validate-app-config` (script + CI), and setup-only documentation.

## [0.27.0] - 2026-06-04

### Added

- **Dev task backlog**: In-repo active/archive JSON (`src/config/app-tasks.json`, `app-tasks-archive.json`), `/tasks` UI with Active/Archive tabs, dnd-kit reorder, and dev-only Vite middleware (`/__dev/tasks*`).
- **Dev entry**: Global floating **Tasks** FAB in development; minimal `/tasks` layout with scrollable list and top Snackbar feedback.
- **Agent skills**: Bare `/router` reads the active backlog (not `finish`); `finish` archives completed tasks before commit when applicable.

## [0.26.6] - 2026-06-04

### Documentation

- **Mobile local dev**: Add `DOC_MOBILE_LOCAL_DEV` runbook, `MOBILE_LOCAL_DEV` adoption guide, and thin links from README, `start` skill, debug patterns, auth/setup feature READMEs, and doc index.
- **`write-adoption-guide` skill**: Adopt MILA-improved procedure with `voice-and-naming` rules so adoption guides stay target-repo-safe (home-repo name once; §3 illustrative only).

## [0.26.5] - 2026-06-02

### Changed

- **`grill-me` skill**: Remove redundant AskQuestion "do not add Other" note from omnipresent-options instruction.

## [0.26.4] - 2026-06-02

### Changed

- **`grill-me` skill**: Drop redundant "Other / explain" omnipresent option (AskQuestion UI already provides it); add "Dig deeper in the codebase" for elegant-design and industry-pattern research before re-asking.

## [0.26.3] - 2026-06-01

### Documentation

- **Workflow rule**: Require immediate `main` → `develop` back-merge after each squash release (squash commit is never on `develop`); add verify command and fix-order step 4 so the next release PR does not repeat conflicts.

## [0.26.2] - 2026-06-01

### Documentation

- **Workflow rule**: Document `develop` → `main` PR conflict diagnosis (`CONFLICTING` / `DIRTY`), merge-`main`-into-`develop` fix order, squash-only release merges, and mandatory `main` back-merge into `develop` after each release PR.

## [0.26.1] - 2026-06-01

### Documentation

- **Agent skills**: Replace placeholder YAML `description` frontmatter (skill name only) with WHAT + WHEN text and sibling-skill boundaries on `plan`, `implement`, `validate`, `check`, `finish`, `push`, `feature`, `challenge`, `prime`, `quick-piv`, `review`, and `optimize2` so Cursor can route skills correctly.

## [0.26.0] - 2026-05-29

### Changed

- **Dependencies (major toolchain)**: Vite 8, MUI 9, TypeScript 6, ESLint 10, Vitest 4.1, TanStack Query 5.100, Supabase JS 2.106, React Router 7.16, and related dev tooling (see `package.json` / `pnpm-lock.yaml`).
- **MUI 9 migration**: Replaced removed `Typography` `paragraph` prop with `component="p"`; `Dialog` `PaperProps` → `slotProps.paper`.
- **TypeScript 6**: `ignoreDeprecations: "6.0"` on `tsconfig.app.json` until `baseUrl`/`paths` migration.
- **ESLint 10**: Removed deprecated root `.eslintignore` (ignores remain in `eslint.config.js` + `eslint.ignores.js`).
- **Docs**: `AGENTS.md`, `README.md`, `ARCHITECTURE.md`, debug patterns, and skill-library audit references updated for current stack (no `CLAUDE.md` references in active docs).

## [0.25.1] - 2026-05-29

### Changed

- **Agent memory**: Renamed root `CLAUDE.md` to `AGENTS.md` (cross-tool AGENTS.md standard); updated intro for Cursor, Claude Code, and other agents; `projectStructure.config.cjs` root whitelist entry updated.

## [0.25.0] - 2026-05-29

### Added

- **`improve-skill-library` skill**: Audits the skill corpus with parallel subagent lenses and a no-information-loss gate before edits.
- **`rule-quality` skill**: Merged grading (Mode A) and improvement (Mode B) for rule/command files (replaces `grade-rule` and `improve-rule`).
- **`airtable-inspect` skill**: Two-phase Airtable inspection — schema then sample (replaces `airtable-schema-structure` and `airtable-data-sample`).
- **`consolidate/references/semantic-placement.md`**: Semantic architecture repair procedure (formerly `architecture-repair2`).
- **`plan/references/rules-registry.md`**: SSOT for `.cursor/rules` files referenced by plan/implement/validate skills.
- **`documentation/DOC_CHANGESETS.md`**: Changeset release flow SSOT.
- **Skill library audit artifacts**: `documentation/jobs/skill-library/REGISTRY.md` and `AUDIT_SYNTHESIS.md`.

### Changed

- **Skill library consolidation (29 → 24 skills)**: `stepback` → `grill-me`; `complete-setup` → `start` § Teardown; router tiebreaks, handoffs, and Boundaries on pipeline skills.
- **Router**: Plan-review stack, orchestrator notes, disambiguation for overlapping skills; skill index deduped.
- **Pipeline handoffs**: `implement` → `validate` → `finish`; `validate`/`check` Next blocks; `finish` commit/push gates.
- **SSOT dedup**: Rules registry, dev-cycle matrix, pre-commit light path, Rule of Three, changesets — owners linked from former copies.
- **Agent docs**: `CLAUDE.md`, `DOC_AGENT_WORKFLOW_LAYERS.md`, `workflow/RULE.md`, `file-placement/RULE.md` (Teardown references).
- **Setup feature README**: Points to `airtable-inspect` and `start` § Teardown.

### Removed

- **Standalone skills merged away**: `stepback`, `grade-rule`, `improve-rule`, `airtable-schema-structure`, `airtable-data-sample`, `architecture-repair2`, `complete-setup`.

## [0.24.0] - 2026-05-29

### Added

- **Pre-commit light path**: `scripts/change-classify.cjs` classifies staged paths (`docs`, `migrations`, `no-src`); `.husky/pre-commit` skips `type-check`, staged structure, and arch when app TypeScript is not staged; `pnpm test:classify` in CI.
- **Docs validation**: `validate:docs` now includes `.cursor/skills` alongside `.agents/skills`.

### Changed

- **Agent workflow docs**: `DOC_AGENT_WORKFLOW_LAYERS.md`, `finish` skill (§ Faster commit), `workflow/RULE.md` pre-commit pointer.
- **Project structure**: allow `scripts/*.cjs` in `projectStructure.config.cjs`.
- **Vitest**: exclude `scripts/**` so `pnpm test:classify` node tests are not collected on `test:run` / pre-push.

## [0.23.0] - 2026-05-29

### Added

- **Pattern review (industry precedent)**: `.agents/skills/pattern-review/` with abstract rubric; wired through `plan`, `router`, `feature`, `architecture/RULE.md`, and `documentation/DOC_AGENT_WORKFLOW_LAYERS.md`.
- **`review-dev-plan` skill**: Multi-lens plan critique before implementation (including industry precedent).
- **`write-adoption-guide` skill**: Author cross-repo adoption guides under `documentation/handoffs/`.
- **Plan references**: `implementation-plan-template.md`, `complexity-rubric.md`; **Pattern & precedent** section in `DEVELOPMENT_PLAN.md`.

### Changed

- **Agent workflow**: `router` dev-cycle matrix; `plan` / `implement` / `validate` boundaries vs industry-standard review; skill `references/` allowed in `projectStructure.config.cjs`.

## [0.22.0] - 2026-05-23

### Added

- **`grill-me` skill**: `.agents/skills/grill-me/SKILL.md` — product/design Q&A until shared understanding (wired in `router`).

### Changed

- **Agent skills (cross-tool)**: Moved all project skills from `.cursor/skills/` to `.agents/skills/` (universal convention for Cursor, Claude Code, and other agents). Removed redundant `.claude/commands/` wrappers; updated `CLAUDE.md`, rules, docs, and validation scripts. **`.cursor/rules/`** remains the SSOT for always-on project rules.

## [0.21.3] - 2026-05-16

### Added

- **`documentation/DOC_SUPABASE_GOOGLE_OAUTH.md`**: SSOT checklist for Sign in with Google (Supabase callback URL, Google Cloud OAuth web client origins and redirect URIs, client ID format vs labels).

### Changed

- **Onboarding**: README Quick Start, `documentation/DOC_INDEX.md` (quick link + SSOT map), `.cursor/rules/workflow/RULE.md`, `.cursor/rules/INDEX.md`, `.agents/skills/start/SKILL.md`, `documentation/Authentication-main-app/auth-implementation-reference.md`, `src/features/auth/README.md` — link to the Google OAuth SSOT (no duplicated procedural steps). **`start` skill**: remove duplicate completion criterion line.
- **Setup wizard**: `SupabaseDescription` includes a Sign in with Google pointer to `documentation/DOC_SUPABASE_GOOGLE_OAUTH.md`; `src/features/setup/README.md` updated for the same.

## [0.21.2] - 2026-05-15

### Changed

- **Workflow rule**: Document **Decision Questioning Protocol** in `.cursor/rules/workflow/RULE.md` (ask in plain text before multiple-choice UI; research codebase-consistent options; label alignment; include omnipresent UX impact research path; order options from mild to stronger).

### Documentation

- **`documentation/jobs/research-the-skills-in-replicated-porcupine.md`**: Research note on high-meaning vocabulary across rules/skills and a priming-effectiveness rubric (top-10 terms).

## [0.21.1] - 2026-05-15

### Fixed

- Raise vitest `testTimeout` to 10000ms (and `hookTimeout` likewise) so the Husky pre-push suite does not flake on fresh Windows clones: cumulative JSDOM + MUI (`ProfileMenu`) render cost under full-file order can exceed the Vitest default 5000ms while the component and tests behave correctly.

## [0.21.0] - 2026-05-07

### Added

- **App vision & goals**: Fillable product brief `documentation/DOC_APP_VISION.md` (problem statement, user persona, app’s role; `DRAFT` → `ACTIVE` gate).

### Changed

- **Onboarding and agent workflows**: `start` requires the vision doc before fork/clone (unless user defers); `prime`, `plan`, `feature`, `quick-piv`, `implement`, `validate`, `learn`, and `router` reference the vision SSOT; `documentation/DOC_INDEX.md`, `.cursor/rules/workflow/RULE.md`, `.cursor/rules/INDEX.md`, and `CLAUDE.md` updated.

## [0.20.1] - 2026-05-07

### Changed

- **Cursor agent skills**: Removed `disable-model-invocation` from project `.agents/skills/**/SKILL.md` files so descriptions can drive agent discovery; repaired YAML frontmatter on `airtable-data-sample` and `airtable-schema-structure` skills.
- **Router skill**: After routing, the agent must **invoke** the chosen skill (read its `SKILL.md` and execute the workflow in the same turn), not only list paths. Bare `/router` with no substantive task routes to **finish**.

### Documentation

- **Changelog**: Move finish concurrency gate and TanStack playbook notes from `[Unreleased]` into `[0.20.0]` Documentation so they align with the release that introduced those rule/skill updates.

## [0.20.0] - 2026-05-05

### Documentation

- **Finish skill**: Parallel-thread concurrent-work gate — smoke signals (unstable tree, drifting status/diff, scope mismatch, version/changelog oddities, hook failures outside thread scope, non-fast-forward push, other agent on same checkout) block version bump, changelog, commit, and push until the user picks a path via structured **AskQuestion** (pause finish, bundle finish, stash lane when the other agent is paused, or wait-and-re-check with a single ~3 minute delay).
- **Architecture rule**: Plain optimistic + server-canonical response playbook for TanStack Query (canonical mutation payloads, `onMutate`/`setQueryData`, avoid happy-path `invalidateQueries` for the same keys; anti-patterns; repo pointers). `.cursor/rules/INDEX.md` and SSOT list updated.

### Changed

- **Validate and check skills: parallel rule-shaped audit**: Rewrite `.agents/skills/validate/SKILL.md` and `.agents/skills/check/SKILL.md` so every invocation fans out one read-only subagent per applicable rule in `.cursor/rules/` (called via `Task` with `subagent_type: explore`, `readonly: true`, narrow scope, and a required structured output schema — `severity`, `file:line`, `rule_section`, `ambiguity`, `question`). The parent dedupes cross-rule overlaps, surfaces failed subagents as "not audited — rerun recommended", and runs a batched ambiguity-question gate before the report. Implementation review additionally runs the tooling pass (parent-executed `pnpm validate:structure / lint / type-check / arch:check / test:run` plus optional `format:check`) and a plan-compliance subagent in parallel. `check` reuses the contract with a smaller default rule set (architecture, file-placement, code-style; security/database/testing/workflow only when scope touches them), no plan-compliance pass, and defers the schema to `validate/SKILL.md` as the single source of truth.

## [0.19.5] - 2026-05-01

### Changed

- **Agent skills refresh: router, debug patterns, and ambiguity gates**: Add `.agents/skills/router/SKILL.md` for skill selection with goal/scope gates. Rewrites `.agents/skills/debug/SKILL.md`, adds `.agents/skills/debug/patterns.md`, and whitelists optional skill-level `patterns.md` in `projectStructure.config.cjs`. Updates `.agents/skills/finish/SKILL.md`, `.cursor/rules/file-placement/RULE.md`, `.cursor/rules/workflow/RULE.md`, and `.agents/skills/learn/SKILL.md` for cross-references. Extends `.agents/skills/plan/SKILL.md`, `feature/SKILL.md`, `consolidate/SKILL.md`, `implement/SKILL.md`, `quick-piv/SKILL.md`, `validate/SKILL.md`, and `prime/SKILL.md` with ambiguity removal (app-usage or product-vision questions) and explicit user confirmation for diversions from standards or repo conventions.

## [0.19.4] - 2026-04-20

### Removed

- **CI**: Deleted `.github/workflows/sync-develop-with-main.yml`. The workflow pushed directly to `develop`, which conflicts with the repo ruleset (PR required + required `test` check) and fails with GH013. `main` → `develop` sync after a squash merge is now handled manually via a PR when needed (rare; almost always cosmetic divergence).

## [0.19.3] - 2026-04-20

### Documentation

- **CI**: Expanded header comment in `.github/workflows/sync-develop-with-main.yml` for repository rulesets (GH013): `GITHUB_TOKEN` pushes to `develop` need an appropriate bypass when rules require pull requests and status checks.

## [0.19.2] - 2026-04-19

### Documentation

- **Workflow rule**: Added PR merge troubleshooting — when `mergeable: MERGEABLE` but `mergeStateStatus: BLOCKED`, treat pending required checks as the default cause; use `gh pr view` / `gh pr checks --watch`. Documented that `main` uses GitHub **Rulesets** (not classic branch protection), so `branches/main/protection` may 404 while `rules/branches/main` shows active rules.

## [0.19.1] - 2026-04-19

### Changed

- **Git branch rename**: Long-lived integration branch `experimental` renamed to **`develop`** (Git Flow convention). Renamed on GitHub via branch rename API (protection rules transferred, open PRs retargeted). Updated rules, skills, CI (`main` + `develop` triggers), and docs (`README.md`, `documentation/DOC_CONTRIBUTING.md`).
- **GitHub Actions**: Workflow file renamed to `.github/workflows/sync-develop-with-main.yml` (`DEV_BRANCH: develop`, concurrency group `sync-develop-with-main`).
- **Bug dashboard plan**: Environment-tag value `experimental` renamed to **`develop`** in `documentation/jobs/temp_job_bug_dashboard/IMPLEMENTATION_PLAN.md` (aligned with branch name).
- **Claude Code**: `.claude/settings.local.json` allowlist updated for `git checkout develop`.

## [0.19.0] - 2026-04-16

### Added

- **Airtable agent skills**: `.agents/skills/airtable-schema-structure/SKILL.md` (Meta/schema, no row data) and `.agents/skills/airtable-data-sample/SKILL.md` (small Data API samples with `returnFieldsByFieldId=true`). Fork-friendly; optional `tbl`/`fld` SSOT lives in product code per architecture rules.
- **Airtable CLI helpers**: `scripts/load-airtable-env.js`, `scripts/airtable-meta-dump.js`, `scripts/airtable-sample-records.js` (default table from `VITE_AIRTABLE_TABLE_ID` when `--table` / `--table-name` omitted). `pnpm airtable:meta-dump` and `pnpm airtable:sample` in `package.json`.
- **Setup docs**: `src/features/setup/README.md` — “Airtable CLI / agent tools” with commands and skill paths.

## [0.18.4] - 2026-04-15

### Added

- **Consolidate skill**: `.agents/skills/consolidate/SKILL.md` — cross-codebase redundancy audit (discover, classify, prioritize; execution only after user approval). Wired as `/consolidate` in `CLAUDE.md` and `.claude/commands/consolidate.md`.

### Changed

- **Check skill**: Architecture spot-checks explicitly reference `.cursor/rules/architecture/RULE.md` for responsibility level (component vs hook vs service), scope level (feature vs shared vs common), plus Code Placement Rules, Logic Decision Flowchart, and Edge Case Placement Guide.

## [0.18.3] - 2026-04-15

### Changed

- **Setup feature structure**: Extracted Airtable wizard orchestration into `useAirtableDialogFlow`, step validation helpers, and `AirtableSetupWizardPanel`; moved configuration reset to `configurationResetService` with per-section strategy and a thin `useConfigurationReset` hook. Added unit tests for the reset pipeline and Airtable flow. Updated `src/features/setup/README.md`.

## [0.18.2] - 2026-04-14

### Documentation

- **Align ARCHITECTURE.md with enforced path aliases**: Import examples and the path-alias section use `@/` per `.cursor/rules/architecture/RULE.md`; placement table uses explicit `src/...` paths; correct/incorrect import examples updated; complexity limits match `eslint.config.js`; route registration notes point to `src/App.tsx`; legacy Vite/tsconfig shortcuts called out separately.

## [0.18.1] - 2026-04-13

### Changed

- **Claude Code local permissions allowlist**: Extended `.claude/settings.local.json` `permissions.allow` with git workspace commands, a skills-plugin read path, and Bash entries for pandoc / `scripts/office/unpack.py` against a local `.docx` (machine-specific paths; local Claude only — does not affect CI, builds, or runtime app behavior).

## [0.18.0] - 2026-04-13

### Added

- **Feature-local README enforcement (Option 1)**: Shared `scripts/feature-readme-lib.js`; full-repo checks via `scripts/validate-feature-docs.js` with `pnpm validate:feature-docs`, `pnpm validate:feature-docs:strict`, and `pnpm validate:feature-docs:json`; pre-commit still runs `pnpm validate:feature-docs:staged`. CI runs `validate:feature-docs:strict` after install. Maintainer doc `documentation/DOC_FEATURE_LOCAL_README.md` (indexed in `documentation/DOC_INDEX.md`). Rules and `.claude` validate command updated accordingly.

## [0.17.0] - 2026-04-13

### Added

- **GitHub Actions sync for experimental**: Workflow `.github/workflows/sync-experimental-with-main.yml` runs on push to `main`, merges `origin/main` into `experimental` (fast-forward when possible; otherwise a merge commit with message `chore: sync experimental with main (auto-merge)`), and pushes. Keeps the integration branch aligned with production history. Requires repository Actions workflow permissions set to read and write.

## [0.16.0] - 2026-04-11

### Changed

- **Agent workflow**: Rewrote `.agents/skills/check/SKILL.md` as an architecture and code-quality gate (tooling pass + spot-checks); moved requirement-depth and foundation-POC guidance into `.agents/skills/plan/SKILL.md`.
- **Claude commands**: Updated `.claude/commands/check.md` and `.claude/commands/review.md` to match skills (`/review` documents the 170-point component rubric).
- **Cross-references**: Updated `.agents/skills/plan/SKILL.md`, `quick-piv/SKILL.md`, and `prime/SKILL.md` for the new `check` role.
- **Project memory**: Trimmed `CLAUDE.md` and `.claude/rules/file-placement.md` / `git-workflow.md` to reduce duplication with `.cursor/rules/` (SSOT pointers only).

### Removed

- **check-simple skill**: Removed `.agents/skills/check-simple/` (overlapped plan and check).

## [0.15.0] - 2026-04-08

### Added

- **Claude command wrappers**: Added `CLAUDE.md` and `.claude/commands/*` wrappers (`check`, `finish`, `implement`, `plan`, `review`, `validate`) that delegate execution to the corresponding Cursor skills for consistent workflow behavior.
- **Claude-side workflow reminders**: Added `.claude/rules/file-placement.md` and `.claude/rules/git-workflow.md` to mirror load-bearing project constraints and protected-file handling.

### Changed

- **Feature workflow decision gate**: Updated `.agents/skills/feature/SKILL.md` to replace generic A/B/C/D option prompts with concrete codebase-derived approaches and a product-owner-friendly value-priority decision point.
- **Feature planning traceability**: Phase 4 and implementation-document requirements now explicitly carry the chosen approach's concrete scope and rationale through planning and execution.
- **Structure whitelist**: Updated `projectStructure.config.cjs` to allow `.claude/commands/*.md`, `.claude/rules/*.md`, `.claude/settings*.json`, and `CLAUDE.md`.

## [0.14.0] - 2026-04-08

### Changed

- **Cursor**: Migrated project slash commands from `.cursor/commands/*.md` to Agent Skills at `.agents/skills/<name>/SKILL.md` (same names; `disable-model-invocation: true` on command-originated skills). Doc links and rule references updated accordingly.

## [0.13.0] - 2026-03-26

### Added

- **Agent workflow (Cursor)**: Commands `prime`, `plan`, `implement`, `validate`, and `quick-piv` under `.cursor/commands/` for session context, formal PIV cycle, and lightweight PIV
- **Learn skill**: Project skill `.agents/skills/learn/SKILL.md` to persist lessons into rules/commands; `documentation/DOC_INDEX.md` quick link
- **Structure whitelist**: `.agents/skills/*/` with `SKILL.md` in `projectStructure.config.cjs`
- **Bug Dashboard Implementation Plan**: Planning documentation in `documentation/jobs/temp_job_bug_dashboard/`

### Changed

- **Doc reference validation**: `scripts/validate-cursor-doc-references.js` also scans `.cursor/skills`; strips fenced code blocks before inline backtick scan; resets regex per file; skips multiline backtick spans
- **Rules**: Architecture and code-style point complexity/refactor workflow to `.cursor/commands/optimize2.md`; file-placement temporary-doc examples use placeholders so examples are not mistaken for real paths
- **Bug Dashboard Implementation Plan**: Environment-tag scope (local dev + experimental + staging + production) and migration-deploy todo

## [0.12.1] - 2026-03-05

### Changed

- **Finish Command Debug Pattern Update**: Clarified requirements for adding debug patterns to `debug.md` when a debugging session results in a fix
  - Patterns must be captured at bug-class level (not incident-specific)
  - Format: Symptom class → Likely cause classes → Discriminator question → First diagnostic move
  - Prefer cross-feature language (race conditions, stale state, config drift, schema mismatch, effect dependency loops)
  - Added pattern quality gate: recognizable from symptoms, falsifiable check, project-agnostic benefit

## [0.12.0] - 2026-02-26

### Added

- **TanStack Query Integration**: Server state management with caching, deduplication, and stale-while-revalidate
  - Query keys: shared keys (user, config) in `src/shared/utils/queryKeys.ts`, feature keys in `features/*/api/keys.ts`
  - QueryClient with 5 min stale / 30 min gc defaults, auth-boundary (cache clear on logout)
  - `useUserProfileQuery` / `useConfigurationQuery` as primary hooks; legacy wrappers kept for backward compatibility
  - Mutations: `useUpdateUserProfile` with invalidation on success
  - Prefetching: `usePrefetch` with `prefetchSetup` on hover over Setup links
  - Lazy loading: HomePage and SetupPage with Suspense fallback (`PageLoadingState`)
  - `QueryErrorBoundary` for route-level error handling
  - Test utilities: `createTestQueryClient`, `createQueryClientWrapper` in `tests/test-utils.tsx`
  - Documentation: `documentation/DOC_TANSTACK_QUERY.md`, ARCHITECTURE.md Server State section

## [0.11.5] - 2026-02-22

### Changed

- **Hook Execution Timing**: Moved full test execution from commit-time to push-time for faster local commits
  - Removed `pnpm test:run` from `.husky/pre-commit`
  - Added `.husky/pre-push` to run `pnpm test:run` before any push
  - Keeps CI test execution on push and pull requests unchanged

## [0.11.4] - 2026-02-22

### Changed

- **Onboarding Command Coverage**: Added a dedicated `start` command to guide first-time boilerplate setup with explicit gate checks
  - Enforces prerequisite version verification for Node.js, pnpm, and Git before setup can continue
  - Adds careful handoff instructions for required web-interface actions the assistant cannot complete directly
  - Adds a full verification checklist for lint, format, type check, structure validation, tests, and build
- **Setup Cleanup Completion**: Updated complete-setup command to remove onboarding-only command files when setup wizard is removed
  - Added instruction to delete `.cursor/commands/start.md` after setup-removal completes

## [0.11.3] - 2026-02-22

### Changed

- **Branch and Release Workflow Consistency**: Standardized branch/release guidance across rules, commands, CI, and contributor docs
  - Aligned workflows to `feature/*` -> `experimental` -> `main` with explicit shared-branch freshness checks
  - Updated CI branch triggers to `main` and `experimental` only
  - Added release verification guidance for Edge Function-adjacent changes
- **Quick Start Onboarding**: Rewrote Quick Start Guide in `README.md` into a single coherent fork-and-clone onboarding path
  - Added concrete GitHub setup steps (fork, clone, branch setup, protection settings, PR flow)
  - Removed contradictory clone guidance and refreshed setup step references

## [0.11.2] - 2026-02-22

### Changed

- **Workflow Rule Alignment**: Updated workflow standards to match the protected-branch process currently used in this repository
  - Clarified that experimental is the long-lived integration branch and promotion to main happens via PR
  - Added explicit guidance to avoid direct pushes to main except emergency override
  - Added PR merge guidance for main (squash preferred) and preserved long-lived experimental branch expectations

## [0.11.1] - 2026-02-22

### Fixed

- **Structure Validation vs ESLint Cache**: Prevented CI-only structure validation failures caused by ESLint cache generation
  - Added `.eslintcache` to default ignore patterns in `project-structure-validator.js`
  - Clarified in-code rationale: CI runs lint before full structure validation, while pre-commit validates staged files only

## [0.11.0] - 2026-02-22

### Added

- **Documentation Governance Hardening**: Added automated checks to prevent stale documentation references
  - Added `scripts/validate-markdown-links.js` for relative markdown link validation
  - Added `scripts/validate-cursor-doc-references.js` for `.cursor/rules` and `.cursor/commands` reference checks
  - Added `pnpm validate:docs` script suite and integrated it into `.husky/pre-commit`
  - Added explicit minimal-doc governance language in rule and review guidance

### Changed

- **Documentation Placement and Maintenance Model**: Shifted to objective contract-doc obligations
  - Reduced vague "update documentation" requirements in workflow/feature/check/finish flows
  - Made deep docs opt-in with explicit user approval and prioritized source-adjacent comments/tests
  - Moved setup deep docs to `src/features/setup/docs/` and converted root setup docs into lightweight pointers
  - Updated migration/index references to remove stale links and align with architecture location rules

## [0.10.0] - 2026-02-22

### Added

- **Challenge Command**: Added dedicated feature simplification command for targeted reduction
  - New `.cursor/commands/challenge.md` for challenging overbuilt feature workflows
  - Dual-mode default: runs flow simplification and code simplification together on features
  - Includes mandatory progressive options (Trim, Streamline, Reframe) and decision gate before implementation
  - Adds code audit lenses (data flow, control flow, sparseness, abstraction) and anti-code-golf guardrail

## [0.9.0] - 2026-02-22

### Added

- **Feature-Local Documentation**: Colocate docs with features and enforce freshness
  - `src/features/*/README.md` and `src/features/*/docs/*.md` allowed in project structure
  - Pre-commit validation: staged feature code changes require staged feature README updates
  - New script `scripts/validate-feature-docs-staged.js` and `pnpm validate:feature-docs:staged`
  - Updated architecture, file-placement, workflow rules and feature/check/finish commands
  - Initial feature READMEs for auth and setup

## [0.8.1] - 2026-02-22

### Added

- **Boilerplate Hardening**: CI guardrails, setup tests, and documentation discoverability
  - Version/changelog consistency check (`validate:version-sync`) and app config validation (`validate:app-config`) in CI
  - Setup flow tests: setupUtils, useConnectionTest, useEnvWriter, envWriterService, configService
  - Documentation index (`DOC_INDEX.md`), contributor guide (`DOC_CONTRIBUTING.md`), setup states doc (`DOC_SETUP_STATES_AND_TRANSITIONS.md`)
  - SSOT map in workflow rule and reconciled path references across architecture docs

### Changed

- **CI Workflow**: Added version sync, app config, structure, and architecture checks to GitHub Actions
- **Documentation**: Updated DOC_APP_CONFIG_FILE, migration instructions, testing docs with SSOT pointers

### Fixed

- **Supabase Setup First-Save Completion**: Fixed setup flow requiring a second click to mark Supabase as complete
  - Updated Supabase save flow to mark section completed immediately after successful test and env write
  - Updated connection test hook to return test results directly, avoiding stale state checks in async save logic
  - Fixed React special prop misuse by renaming `SupabaseFormFields` prop from `key` to `apiKey`
  - Prevented dev test bypass credentials from being treated as a configured Supabase instance at app startup

## [0.8.0] - 2026-02-22

### Added

- **Push Command**: Added `.cursor/commands/push.md` to enforce push-only behavior after `finish`
- **Complete Setup Command**: Added `.cursor/commands/complete-setup.md` for removing setup wizard functionality
- **Setup Documentation**: Enhanced README.md with comprehensive setup instructions
  - Expanded "Configure Line Endings" section with VS Code/Cursor editor configuration and Git configuration
  - Added "Linter Setup" section with verification steps, common commands, and editor integration guidance
  - Added troubleshooting for common linting errors after cloning
  - Added "Using Cursor Agent" section with Command Allowlist configuration instructions
    - Documents required commands to add to Cursor's allowlist for Git commits
    - Explains why allowlist is needed (sandbox permission issues)
    - Prevents `env.exe: couldn't create signal pipe, Win32 error 5` errors when committing

### Changed

- **Finish Workflow Split**: Separated local completion from remote publishing
  - Updated `finish` command to be local-only (cleanup, changelog/version sync, commit)
  - Added cross-references between `finish` and `push` to enforce finish-first flow
- **Workflow Rule Updates**: Strengthened branch safety and command execution guidance
  - Expanded "never develop on main" protection language across workflow docs
  - Updated agent git execution guidance for explicit command ownership
- **Setup Completion Cleanup**: Removed in-app finish setup cleanup execution path
  - Removed finish setup script and setup finish UI/service flow
  - Removed `/api/finish-setup` endpoint from dev API plugin
  - Removed obsolete `cleanup-setup` script from `package.json`
- **Debug Pattern Refinement**: Updated Git env.exe error pattern in debug.md with confirmed root cause (Cursor sandbox restricting pipe creation) and correct debug approach

## [0.7.3] - 2026-02-12

### Fixed

- **Vitest + MUI Material v7 ES Module Compatibility**: Fixed test failures with ES Module cycle errors when testing components using MUI Material v7
  - Added `server.deps.inline` configuration to `vitest.config.ts` to pre-bundle MUI packages
  - Added `fallbackCJS: true` for ESM/CJS compatibility
  - Resolves `Cannot require() ES Module ... @mui/material/esm/index.js in a cycle` errors
  - Tests now pass consistently across different environments

## [0.7.2] - 2026-02-12

### Fixed

- **Line Endings Configuration**: Added `.gitattributes` to enforce LF line endings across all platforms
  - Prevents Git from converting LF to CRLF on Windows systems
  - Resolves 7824 prettier/prettier linting errors caused by inconsistent line endings
  - Ensures consistent line endings for all developers regardless of local Git configuration
  - Normalized all existing files to LF line endings

## [0.7.1] - 2026-02-05

### Changed

- **Prerequisites Documentation**: Enhanced prerequisites section in README.md
  - Clarified required global installations (Node.js 20.x+, pnpm 9.15.4+, Git)
  - Added installation instructions and download links for each prerequisite
  - Improved formatting for better readability

### Fixed

- **Repository Ownership**: Updated repository references after transfer to TMI-apps organization
  - Updated README.md clone URL from `TomFranse/boilerplate-vite-supabase-mui-cursor` to `TMI-apps/boilerplate-vite-supabase-mui-cursor`
  - Updated local git remote URL to point to organization repository

## [0.7.0] - 2026-02-05

### Added

- **Documentation Naming Convention**: Enforced `DOC_` prefix for permanent documentation files
  - Root-level documentation files must use `DOC_*.md` naming pattern
  - Created `documentation/temp/` folder for temporary documentation
  - Updated `projectStructure.config.cjs` to enforce DOC_ prefix requirement
  - Updated file-placement rule with comprehensive documentation placement guidelines

### Changed

- **Documentation Organization**: Renamed all permanent documentation files with DOC_ prefix
  - `APP_CODE_MODIFICATION.md` → `DOC_APP_CODE_MODIFICATION.md`
  - `APP_CONFIG_FILE.md` → `DOC_APP_CONFIG_FILE.md`
  - `ARCHITECTURE-MIGRATION-INSTRUCTIONS.md` → `DOC_ARCHITECTURE_MIGRATION_INSTRUCTIONS.md`
  - `BOILERPLATE_EXTRACTION_GUIDE.md` → `DOC_BOILERPLATE_EXTRACTION_GUIDE.md`
  - `COMPLEXITY_REDUCTION_ANALYSIS.md` → `DOC_COMPLEXITY_REDUCTION_ANALYSIS.md`
  - `CURSOR_EXIT_CODE_FIX.md` → `DOC_CURSOR_EXIT_CODE_FIX.md`
  - `TESTING_APP_CONFIG.md` → `DOC_TESTING_APP_CONFIG.md`
- Moved temporary plan file to `documentation/jobs/` folder
- Updated references in `ARCHITECTURE.md` and `CHANGELOG.md` to reflect new file names

## [2026-02-05]

### Added

- **Staged File Validation**: Added support for validating only staged files in pre-commit hook
  - Added `validate:structure:staged` npm script for validating staged file structure
  - Added `arch:check:staged` npm script for checking staged TypeScript files architecture
  - Created `scripts/validate-staged.js` wrapper script for staged structure validation
  - Created `scripts/arch-check-staged.js` wrapper script for staged architecture checks
  - Enhanced `project-structure-validator.js` with `--files` option to validate specific files
  - Pre-commit hook now validates only staged files for faster commit times

### Changed

- **Cursor Rules and Commands**: Enhanced rule quality and command structure
  - Enhanced `check.md` command with comprehensive information gathering checklists and completeness gates
  - Added `feature.md` command with systematic engineering process and mandatory decision points
  - Added `grade-rule.md` command for evaluating rule/command quality with rubric
  - Replaced `finish2.md` with `finish.md` command with improved semantic versioning and commit message standards
  - Enhanced `debug.md` command with additional error pattern recognition
  - Improved workflow rule by referencing finish command as SSOT for versioning and commit standards
  - Enhanced code-style rule with additional guidance
  - Improved file-placement rule with better clarity
  - Updated pre-commit hook with improved validation
  - Updated README with latest information
  - Added "Protected Files" section to workflow rule requiring explicit user consent before modifying configuration files

## [2026-01-17]

### Changed

- **Rule Documentation**: Improved rule quality standards and documentation
  - Enhanced `improve-rule.md` with better brevity standards and removed rigid if-then requirements
  - Fixed path references in `finish2.md` to use consistent `.cursor/rules/` format
  - Improved workflow rule brevity by removing excessive emphasis and code examples
  - Improved architecture rule brevity by removing code snippets and verbose explanations
  - Improved project-specific rule brevity by abstracting code examples
  - Connected workflow rule and finish2 command with bidirectional references

## [2026-01-12]

### Changed

- **Code Optimization**: Reduced complexity in setup components and services
  - Extracted `useWizardStep` hook for wizard step management (reduces AirtableDialog complexity from 15 to ~8)
  - Refactored `buildConfig` function in configService (reduced complexity from 25 to ~8-10)
  - Extracted helper functions: `readEnvVar`, `isPlaceholder`, `buildSupabaseConfig`, `buildAirtableConfig`, `buildThemeConfig`
  - Simplified conditionals using switch-based validation patterns
  - Improved code maintainability and testability

## [2026-01-12]

### Changed

- **Scrollbar Styling**: Simplified scrollbar appearance with transparent track and subtle thumb
  - Removed prominent background color from scrollbars
  - Scrollbar thumb uses theme's text.primary color with 30% opacity (50% on hover)
  - Transparent track for minimal visual footprint
  - Works across all browsers (Firefox and Webkit-based browsers)
  - Styling uses theme constants (`COLORS.text.primary`) for consistency

## [2026-01-12]

### Added

- **Styling Scope Standards Rule**: Added new cursor rule to prevent incorrect styling scope decisions
  - Requires assistants to ask users about styling scope before implementing changes
  - Defines three-level hierarchy: Instance → Component → Global Theme
  - Prevents applying styling changes at wrong scope (e.g., instance when global intended)
  - Includes decision tree for determining correct styling level
  - Default assumption: Global Theme (most common intent)
  - Ensures consistency with existing theme architecture (`defaultTheme.ts` as SSOT)

### Changed

- **Code Style Rule Optimization**: Streamlined `.cursor/rules/code-style/RULE.md` for better context efficiency
  - Removed redundant sections (43% reduction: 525 → 297 lines)
  - Removed extensive examples that overload context window
  - Added SSOT references instead of duplicating content
  - Formatting rules now reference Prettier config instead of duplicating
  - Architecture layer rules now reference `architecture/RULE.md` instead of duplicating
  - Complexity examples moved to referenced command file
  - TypeScript rules consolidated to reference Quick Reference

## [2026-01-12]

### Changed

- **Centralized Button Styling**: Refactored button styling to be fully centralized in theme
  - Removed all `color` props from button usages across the application
  - Button variants now automatically determine colors:
    - `variant="contained"` → uses primary color (main actions)
    - `variant="outlined"` → uses white color (secondary actions)
    - `variant="text"` → uses primary color (text buttons)
  - All button styling is now managed in `defaultTheme.ts` - components only specify variant
  - Ensures consistent button styling across the entire application

- **Outlined Button Hover Effect**: Enhanced outlined button with animated gradient slide effect
  - Outlined buttons now have a smooth gradient slide animation on hover (matching contained buttons)
  - Gradient transitions from transparent to white with sliding animation
  - Text color transitions from white to dark during hover for readability
  - Uses pseudo-element with proper z-index layering to ensure text remains visible
  - Background size optimized so gradient is only visible during transition, not in static states

### Fixed

- **Button Hover Color Issues**: Fixed inconsistent hover colors on buttons
  - Previously buttons using undefined colors (`success`, `warning`, `error`, `inherit`) caused unpredictable hover colors
  - All buttons now use centralized theme colors with consistent hover states
  - Removed dependency on undefined MUI color props

### Added

- **ESLint Hardcoded Styling Detection**: Added ESLint rules to detect hardcoded styling values in `sx` props
  - Detects hardcoded `fontSize`, `fontWeight`, `fontFamily`, `color`, `bgcolor`, `backgroundColor`, `borderColor` values
  - Detects hex colors (`#...`) and RGB/RGBA colors in `sx` props
  - Detects numeric literals for `fontSize`, `fontWeight`, `height`, `width` properties
  - Catches styling at both root and nested property levels
  - Excludes theme files from rules (they are where styling SHOULD be defined)
  - Encourages developers to use theme constants instead of hardcoded values
  - All violations reported as warnings (non-blocking)

### Fixed

- **Hardcoded Styling Values**: Replaced all hardcoded styling values with theme references
  - Replaced hardcoded `fontSize` values (`0.875rem`, `0.65rem`, `16px`) with `theme.typography.body2.fontSize` and `theme.typography.caption.fontSize`
  - Replaced hardcoded `fontWeight` values (`500`, `600`) with `theme.typography.fontWeightMedium` and `theme.typography.fontWeightBold`
  - Replaced hardcoded pixel dimensions (`20px`, `32px`, `40px`) with `theme.spacing()` calls
  - Updated all components to use direct theme access following MUI best practices
  - Removed custom helper functions in favor of direct theme references
  - Fixed TypeScript error with `navigator.clipboard` by adding proper type checking

### Changed

- **Theme Refactoring**: Refactored theme to follow MUI best practices
  - Removed custom helper functions (`getCodeFontSize`, `getCodeFontFamily`, `getSmallFontSize`, `getFontWeightSemiBold`)
  - Updated typography to use MUI's built-in variants (`body2` for code text, `caption` for small text)
  - Ensured Montserrat font family is used consistently throughout the app (including code elements)
  - Components now use direct theme access via `theme.typography.*` and `theme.spacing()` instead of helper functions
  - Follows MUI documentation patterns for theme customization
- **View Configuration Feature**: Added read-only configuration view for all setup sections
  - "View Configuration" button appears when a section is completed
  - Displays configuration details from `app.config.json` in a dialog
  - Shows non-sensitive data (Base ID, Table ID, URLs) with copy functionality
  - Masks sensitive data (API keys, tokens) with "●●●●●●●●" and status indicators
  - Includes "Reset Configuration" button to clear configuration and reset status
  - Auto-syncs configuration when dialog opens to ensure latest data
  - Implemented for Supabase, Airtable, Theme, and Hosting sections
  - Created reusable components: `ConfigurationViewDialog`, `ConfigurationItem`, `SensitiveDataDisplay`, `ResetConfirmDialog`
  - Added hooks: `useConfigurationData`, `useConfigurationReset`
  - Added API endpoints: `/api/read-config`, `/api/remove-env-vars`
- **Airtable Setup Improvements**: Enhanced Airtable configuration flow
  - Combined PAT creation instructions with token input in single step
  - Renamed "Enter credentials" to "Choose Base and Table"
  - Streamlined text and removed redundant UI elements
  - Single sequential list of steps for clarity
  - Moved "Skip Airtable Setup" button to dialog actions area
  - Fixed configuration sync to properly write env vars before marking as completed

### Fixed

- **CI Build Failure**: Fixed pnpm version mismatch causing `--frozen-lockfile` to fail
  - Added `packageManager` field to `package.json` pinning pnpm to v9.15.4
  - Updated CI workflow to read pnpm version from `package.json` instead of hardcoding
  - Root cause: lockfile v9.0 format requires pnpm v9+, but CI was using v8
- **Airtable Configuration Sync**: Fixed configuration not syncing to `app.config.json`
  - Added `useEnvWriter` hook to AirtableSection to write env vars before completion
  - Added auto-sync functionality when viewing configuration dialogs
  - Configuration now properly reflects actual environment variable state
- **Airtable Configuration View**: Removed duplicate information display
  - Removed redundant "Base ID Key" and "Table ID Key" status indicators
  - Configuration view now shows only Base ID, Table ID, and Personal Access Token
- **Code Block Colors**: Fixed white-on-white text issue in code blocks
  - Centralized code block styling in MUI theme via `MuiCssBaseline` and `MuiTypography`
  - Code blocks now use `background.default` to match main page wrapper
  - Removed manual color declarations from components (DRY principle)
  - All code block colors now configurable from single theme file

### Changed

- **Theme System**: Enhanced code block styling defaults
  - Added global defaults for `<code>` and `<pre>` elements via `MuiCssBaseline`
  - Added defaults for `component="code"` via `MuiTypography` styleOverrides
  - Code blocks automatically inherit theme colors without component-level overrides
  - Components now only specify layout/spacing, not colors

### Added

- **App Configuration File (`app.config.json`)**: Configuration state syncing
  - File stores setup section statuses, enabled features, and API references
  - Syncs when finishing setup wizard (before cleanup runs)
  - Readable by Cursor agent and team members to understand app configuration
  - Security: API keys remain in `.env`, config file only contains references
  - Added `/api/write-config` endpoint to vite-plugin-dev-api
  - Created `configService.ts` for managing configuration sync
  - Committed to version control (no secrets, useful for team context)
- **App Code Modification Feature**: Formalized dev-only code modification capability
  - Renamed `vite-plugin-env-writer.ts` → `vite-plugin-dev-api.ts` for clarity
  - Extracted `envWriterService.ts` from `useEnvWriter` hook for better separation
  - Added comprehensive documentation (`documentation/DOC_APP_CODE_MODIFICATION.md`)
  - Documented in `ARCHITECTURE.md` as a recognized feature
  - Feature enables UI to modify app source code and configuration files during development
  - Used by setup wizard for environment variable writing and code cleanup
- **Enhanced Airtable Setup**: Multi-step setup wizard with table structure validation
  - Step 0: PAT creation instructions with direct link to Airtable token creation page
  - Step 1: Credential entry (API Key, Base ID, Table ID) with helpful guidance
  - Step 2: Connection validation and table structure retrieval using Airtable Meta API
  - Step 3: Review table structure and complete setup
  - `TableStructureDisplay` component showing table name, fields, types, and options
  - `getAirtableTableStructure()` service function using Airtable Meta API
  - Enhanced `useAirtableSetup` hook with structure fetching capabilities
  - Improved cleanup script that removes `airtable` npm package when Airtable is skipped
- **Airtable Setup Utilities**: Added reset functions for testing/development
  - `resetAirtableSetup()` - Reset Airtable setup status
  - `resetAllSetupSections()` - Reset all setup sections
- **Boilerplate Extraction System**: Added enterprise-grade scalability tools from main app
  - Project structure validation system with `projectStructure.config.cjs`
  - Dependency cruiser for architecture validation (`arch:check` command)
  - Husky pre-commit hooks with lint-staged
  - ESLint architecture boundary rules (`lint:arch` command)
  - Comprehensive complexity rules (cyclomatic, cognitive, max-statements, etc.)
- **Theme Customization**: Default theme now pre-populated in theme customization dialog
  - Theme JSON input field automatically shows default theme options as starting point
  - Default theme content imported directly from `defaultTheme.ts` (single source of truth)
  - Users can see what's available and modify from there

### Changed

- **ESLint Configuration**: Increased `max-statements` threshold from 10 to 15
  - Accommodates standard async patterns with proper error handling
  - Aligns with cognitive complexity threshold (15)
  - Reduces false positives for well-structured async functions
- **Project Structure**: Reorganized files to match enterprise architecture rules
  - Moved `src/common/` → `src/components/common/`
  - Moved `src/store/contexts/` → `src/shared/context/`
  - Moved `src/features/auth/utils/` → `src/shared/utils/`
  - Renamed `test/` → `tests/` folder
  - Colocated test files (removed `__tests__` folders)
  - Updated all import paths to use correct aliases
- **HostingSection**: Refactored to use data-driven approach
  - Extracted hardcoded provider data to `HOSTING_PROVIDERS` constant array
  - Replaced repetitive JSX with `map()` function
  - Reduced `HostingDialog` from 161 lines → 72 lines (55% reduction)
  - Improved maintainability and scalability

- **SetupDialog**: Made dialog scale flexibly to fill available screen space
  - Dialog now uses responsive width/height (95% on mobile down to 80% on large screens)
  - Maximum dimensions: 1200px width, 90vh height
  - Dialog adapts to zoom levels (Ctrl +/-) and screen sizes
  - Only TextField input area scrolls, all other content stays fixed
- **SetupDialog**: Removed unnecessary style declarations
  - Removed redundant padding/margin overrides that MUI handles by default
  - Removed unnecessary Box wrapper with padding
  - Cleaner code relying on MUI's built-in spacing

### Fixed

- **ThemeSection TextField**: Fixed label styling being affected by input styles
  - Changed selector from `.MuiInputBase-root` to `.MuiInputBase-input`
  - Label now uses MUI's default styling correctly
  - Only input text area uses monospace font, not the label
- **ThemeSection**: Refactored ThemeDialog to comply with complexity rules
  - Extracted `ThemeDialogContent` component to separate UI rendering from state management
  - Reduced `ThemeDialog` function from 134 lines to 75 lines (under 100-line limit)
  - Improved code maintainability by separating concerns

### Removed

- **Migration Function**: Removed `migrateOldSetupState` from `setupUtils.ts`
  - Removed backward compatibility migration logic
  - Removed unused `detectCompletedSections` helper function
  - Removed unused imports (`isSupabaseConfigured`, `isAirtableConfigured`, `getCustomTheme`)
  - Simplified `useSetupFinish` hook (removed migration useEffect)
  - Reduced `setupUtils.ts` from 163 lines → 87 lines (47% reduction)
- **Login and Signup Pages**: Removed dedicated authentication pages
  - Removed `LoginPage` and `SignUpPage` components
  - Removed `AuthLayout` (no longer needed)
  - Removed `SignUpForm` component
  - Authentication now handled entirely through ProfileMenu in topbar
  - Updated HomePage to show message directing users to topbar for sign-in

### Changed

- **SetupPage Refactoring**: Moved logic from page to feature following architecture rules
  - Extracted `FinishSetupDialog` component to `features/setup/components/`
  - Created `useSetupFinish` hook in `features/setup/hooks/` for state management
  - Created `setupService.ts` in `features/setup/services/` for API calls
  - SetupPage reduced from 117 lines to 71 lines (under 100-line limit)
  - Page now follows thin component pattern: composes feature components/hooks
- **ESLint Configuration**: Increased `max-lines-per-function` limit from 50 to 100 lines
  - More reasonable limit for React components while still catching overly complex functions
- **TypeScript Configuration**: Added path aliases to root `tsconfig.json`
  - Ensures IDE properly resolves `@features/*` imports
  - Added `moduleResolution: "node"` for proper module resolution

### Fixed

- **TypeScript Module Resolution**: Fixed IDE errors for `@features/setup/*` imports
  - Path aliases now configured in both `tsconfig.app.json` (build) and `tsconfig.json` (IDE)
  - All module resolution errors resolved
- **React Import**: Removed unnecessary React import from ProfileMenu component
  - Removed `import React from "react"` (not needed with `jsx: "react-jsx"` transform)
  - Changed `React.FC` to regular function signature
  - Fixes TypeScript `esModuleInterop` error

### Technical

- **Architecture Compliance**: SetupPage now follows proper dependency hierarchy
  - Page → Feature Components/Hooks → Services pattern
  - Logic moved from page level to feature level
  - Reusable `FinishSetupDialog` component created
- **Code Organization**: Improved adherence to architecture rules
  - All components follow the dependency hierarchy: Components → Hooks → Services
  - Setup feature properly structured with components, hooks, services, and sections
  - Shared hooks created in `src/shared/hooks/` for cross-feature use

## [0.6.0] - 2026-01-03

### Removed

- **Todo feature**: Removed all todo-related functionality to simplify boilerplate
  - Removed `TodosPage` and all todo components
  - Removed todo feature directory (`src/features/todos/`)
  - Removed data provider pattern (types, factory, and all provider implementations)
  - Removed `ProtectedRoute` component (no longer needed)
  - Removed database setup section from setup wizard
- **Database setup**: Removed "Create Database Tables" step from setup wizard
  - Removed `DatabaseSection.tsx` component
  - Removed database section from setup state tracking

### Changed

- **Setup page**: Simplified setup wizard UI
  - Removed title "Welcome to Vite MUI Supabase Starter" (already in topbar)
  - Removed progress bar and related logic
  - Simplified description text layout
- **Navigation**: Removed "Todos" button from topbar
- **Home page**: Removed todo-related buttons and references
- **Workflow rules**: Updated PowerShell examples to prevent VS Code network errors
  - Added `Out-String` before `Select-Object` in all examples
  - Added warning about direct piping to `Select-Object`

### Fixed

- Removed unused variables (`user` in Topbar, `sectionsState` in SetupPage)
- Fixed all linting errors (only warnings remain)

### Technical

- **Boilerplate Focus**: Now focused on connecting APIs (Supabase for auth, Airtable for data) and theme setup
- **Cleanup**: Removed empty `dataProviders` directory
- **Documentation**: Updated README to remove todo references
- **Tests**: Updated test files to use `/dashboard` instead of `/todos` paths

## [0.5.8] - 2026-01-03

### Fixed

- Architectural violations: Moved ProfileMenu hooks and utilities to correct locations
  - Moved `useProfileMenuState` and `useProfileMenuHandlers` hooks from `components/ProfileMenu/` to `features/auth/hooks/`
  - Moved `profileHelpers` and `menuConfig` utilities from `components/ProfileMenu/` to `features/auth/utils/`
  - Updated all import statements to use correct paths with `@features/auth/` aliases

### Technical

- **Architecture Compliance**: Fixed violations of "The Hook Rule" and "The Service/Util Rule" from `.cursor/rules/architecture/RULE.md`
- All hooks now correctly located in `features/[feature]/hooks/` directories
- All utilities now correctly located in `features/[feature]/utils/` directories
- Components folder now only contains UI components (no business logic)
- Type-check passes, build succeeds, no linting errors

## [0.5.7] - 2026-01-03

### Changed

- Major complexity reduction refactoring across priority hotspots
- Reduced code complexity and improved maintainability through modularization
- Extracted shared components and hooks to reduce duplication

### Technical

- **ProfileMenu.tsx**: Reduced from 357 lines → 64 lines (82% reduction)
  - Extracted 7 components, 2 hooks, and utility functions
  - Complexity reduced from 42 → ~8
- **dateFormatters.ts**: Refactored `formatRelativeTime()` using lookup pattern
  - Reduced from 22 statements → 10 statements
  - Complexity reduced from 14 → ~5, Cognitive: 18 → ~8
- **SupabaseSection.tsx & AirtableSection.tsx**: Reduced from 217/211 lines → 87/81 lines
  - Created shared components: `ConnectionTestResult`, `EnvVariablesDisplay`
  - Created shared hooks: `useConnectionTest`, `useEnvWriter`
  - Extracted form fields and description components
- **useAuth.ts**: Reduced from 142 lines → 68 lines (52% reduction)
  - Extracted utilities: `oauthUtils.ts`, `useAuthSession.ts`, `useAuthStateSubscription.ts`
  - Extracted handlers: `useAuthHandlers.ts`, `authHandlerUtils.ts`
- **useUserProfile.ts**: Extracted constants and helper functions
  - Reduced statement count from 19 → 10 per function
- **AuthCallbackPage.tsx**: Extracted utilities for better organization
  - Created `authCallbackUtils.ts` and `authCallbackParams.ts`
- Added ESLint complexity rules: `complexity`, `max-depth`, `max-lines-per-function`, `max-statements`, `max-params`, `sonarjs/cognitive-complexity`
- All tests passing (53 tests)
- All TypeScript errors resolved

## [0.5.6] - 2026-01-03

### Changed

- Updated workflow rules with comprehensive PowerShell exit code handling guidance
- Added patterns and best practices to prevent Cursor crashes when running terminal commands
- Documented use of `$LASTEXITCODE` instead of `$?` for proper exit code propagation

### Technical

- Enhanced `.cursor/rules/workflow/RULE.md` with PowerShell command patterns
- Added examples for simple commands, directory changes, output filtering, and special character handling
- Documented why exit code checks prevent Cursor crashes (error output vs success state mismatch)

## [0.5.5] - 2026-01-02

### Fixed

- Fixed anonymous users being displayed as signed-in users in the UI
- Anonymous users now correctly show sign-in options instead of user profile and sign-out button
- Anonymous users are properly filtered out in all authentication code paths

### Changed

- Updated anonymous user detection to use Supabase's official `is_anonymous` property instead of custom metadata checks
- Refactored user conversion logic into shared utility functions for consistency

### Technical

- Created `src/features/auth/utils/userUtils.ts` with shared utility functions:
  - `isAnonymousUser()` - Checks Supabase's official `is_anonymous` property
  - `supabaseUserToUser()` - Converts Supabase user to app User interface, filtering anonymous users
- Updated `useAuth.ts` hook to use shared utility functions
- Updated `authService.ts` functions (`login()`, `signUp()`, `getCurrentUser()`) to filter anonymous users
- All code paths now consistently use Supabase's recommended approach for anonymous user detection
- Type-safe implementation using official Supabase `User` type from `@supabase/supabase-js`

## [0.5.4] - 2026-01-03

### Added

- Redirect after sign-in feature - users are redirected to their last visited page after authentication
- `useAuthRedirect` hook for handling post-authentication redirects
- Redirect utilities (`redirectUtils.ts`) for managing redirect paths in sessionStorage
- Path validation to prevent redirect loops (rejects `/login`, `/auth`, `/signup` paths)
- Comprehensive test coverage for redirect functionality (21 tests)

### Changed

- `ProtectedRoute` now stores intended destination before redirecting to login
- `LoginForm` and `SignUpForm` use `useAuthRedirect` hook for consistent redirect behavior
- `AuthCallbackPage` redirects to stored path after OAuth/SAML authentication
- `ProtectedRoute` loading state now uses MUI `CircularProgress` component instead of plain div

### Fixed

- Fixed test mock for `authService.test.ts` to include `isSupabaseConfigured` export
- Fixed line ending issues (CRLF to LF) in redirect-related files
- Fixed floating promise lint error in `useAuthRedirect` hook

### Technical

- Created `src/utils/redirectUtils.ts` with sessionStorage-based redirect path management
- Created `src/features/auth/hooks/useAuthRedirect.ts` hook for redirect orchestration
- Added unit tests for redirect utilities (`redirectUtils.test.ts` - 14 tests)
- Added unit tests for redirect hook (`useAuthRedirect.test.tsx` - 7 tests)
- Redirect path stored in sessionStorage persists across OAuth redirects
- Graceful error handling for private browsing mode and storage errors

## [0.5.3] - 2026-01-02

### Added

- Active menu item highlighting in Topbar navigation
- Navigation buttons now display primary color when on active route

### Changed

- Refactored theme system to be the single source of truth for all app styling
- All colors, typography, and component styling now centralized in `src/shared/theme/defaultTheme.ts`
- Removed all conflicting CSS files (`index.css`, `App.css`, `global.css`)
- Theme now handles all global styles via `MuiCssBaseline` customization
- Added `MuiLink` component styling to theme (handles link hover colors)
- Improved theme documentation with usage examples and structure explanations
- Topbar navigation buttons use conditional `color` prop for active state (leverages theme system)

### Removed

- `src/index.css` - Vite boilerplate CSS conflicting with MUI theme
- `src/App.css` - Unused Vite boilerplate CSS
- `src/assets/styles/global.css` - Styles moved to theme via `MuiCssBaseline`
- All CSS imports from `main.tsx` - styling now handled entirely by MUI theme

### Technical

- Centralized color constants in `COLORS` object for better maintainability
- Added comprehensive documentation to all theme files
- Theme files now include JSDoc comments explaining structure and usage
- `MuiCssBaseline` handles box-sizing, code fonts, and body styles
- All component styling moved to theme `components.styleOverrides`
- Components now use `sx` prop only for layout/spacing, not colors/styling

## [0.5.2] - 2026-01-02

### Added

- User profile data fetching from Supabase `users` table
- `useUserProfile` hook to fetch and manage user profile data
- Enhanced ProfileMenu with detailed user information:
  - Display name (falls back to email if not set)
  - Profile photo support via `photo_url`
  - Email verification badge
  - User role display (Free, Premium, Admin, Super Admin)
  - Remaining credits display
  - Organization name display (for Entreefederatie users)
- Loading state indicator in ProfileMenu while fetching profile data

### Changed

- ProfileMenu now displays comprehensive user information from database
- ProfileMenu uses arrays instead of Fragments for MUI Menu compatibility
- Avatar component now supports photo URLs from user profile

### Fixed

- Fixed MUI Menu Fragment warning by using arrays instead of Fragments
- Fixed import path in LoginPage for ProfileMenu component

### Technical

- Created `useUserProfile` hook in `src/features/auth/hooks/useUserProfile.ts`
- Hook automatically fetches user profile when user logs in
- Handles missing user profiles gracefully (user may not exist in users table yet)
- ProfileMenu displays user details with proper loading and error states

## [0.5.1] - 2026-01-02

### Added

- Permanent Topbar component that is always visible across all routes
- Reusable Topbar component (`src/components/Topbar.tsx`) designed for use across all apps
- Improved user-facing text in setup cards for better clarity

### Changed

- Topbar is now permanently visible (no longer conditional on Supabase configuration)
- Improved setup card descriptions to better communicate functionality:
  - "Configure Supabase" → "Connect to Supabase" with clearer description
  - "Set Up Database" → "Create Database Tables" with clearer description
- MainLayout simplified (removed duplicate AppBar, Topbar handles navigation)
- AuthLayout adjusted to account for permanent topbar

### Technical

- Created `Topbar` component with fixed positioning
- App.tsx restructured to include Topbar at root level
- Removed conditional topbar logic - now always visible
- Updated padding calculations to account for permanent topbar

## [0.5.0] - 2026-01-02

### Added

- Card-based setup dashboard replacing sequential stepper
- Reusable base Card component in `@common/Card` with MUI-standard styling
- Dynamic CSS Grid layout for cards (auto-fit based on available space)
- Per-section status tracking (not-started, in-progress, completed, skipped)
- Setup sections can be configured independently in any order
- Finish Setup feature that removes unused code based on enabled features
- Setup state migration from old localStorage flags to new structure
- MUI Dialog-based configuration for each setup section
- Progress indicator showing completion status

### Changed

- Setup page redesigned from sequential stepper to card-based dashboard
- All setup sections are now optional (removed "Optional" labels)
- Cards use playing card proportions (max-width: 400px) with increased border radius
- Cards have increased internal padding (24px) for better spacing
- Grid layout uses CSS Grid with auto-fit for dynamic column distribution
- Setup completion is now irreversible and triggers cleanup of unused code
- App routing updated to allow access anytime (setup no longer forces redirect)

### Technical

- Created `SetupSectionsState` type for per-section status tracking
- Added `getSetupSectionsState()` and `updateSetupSectionStatus()` utilities
- Added `migrateOldSetupState()` for backward compatibility
- Added `getEnabledFeatures()` for cleanup script
- Created `finish-setup.js` script for removing unused feature code
- Added `/api/finish-setup` endpoint in Vite plugin
- Base Card component with configurable elevation and hover effects
- Setup sections split into separate components (SupabaseSection, AirtableSection, etc.)
- SetupCard and SetupDialog base components for reusable patterns

## [0.4.0] - 2026-01-02

### Added

- OAuth authentication with Google
- SAML SSO authentication with Entreefederatie (school accounts)
- ProfileMenu component matching main app UX pattern
- Anonymous authentication for visitors (automatic session creation)
- Auth callback page (`/auth/callback`) for handling OAuth/SAML redirects
- Entreefederatie configuration file (`src/config/entreefederatie.ts`)
- Real-time auth state management with `onAuthStateChange` listener
- PKCE flow for enhanced security in Supabase client
- Automatic `.env` file writing from setup wizard (dev mode only)
- Support for Supabase publishable keys (backward compatible with anon keys)
- Vite plugin for dev-only API endpoints (`vite-plugin-dev-api.ts`)
- "Skip Database Setup" button in setup wizard for auth-only testing

### Changed

- Replaced email/password login form with OAuth/SAML sign-in options
- Updated `LoginPage` to use ProfileMenu pattern
- Updated `MainLayout` to integrate ProfileMenu in navigation bar
- Enhanced Supabase client configuration with proper auth options (persistSession, autoRefreshToken, detectSessionInUrl, PKCE)
- Auth state now updates in real-time via Supabase auth state listener
- Anonymous sessions are automatically created for unauthenticated visitors
- Setup wizard now automatically writes environment variables to `.env` file
- Setup wizard shows clear restart instructions after saving env variables
- Updated terminology from "anon key" to "publishable key" (with backward compatibility)
- Database setup step is now optional (can be skipped for auth-only testing)

### Technical

- Added `signInWithGoogle()` and `signInWithEntreefederatie()` methods to `authService.ts`
- Added `signInAnonymously()` method for visitor sessions
- Added `exchangeCodeForSession()` for OAuth/SAML callback handling
- Updated `useAuth.ts` hook with `onAuthStateChange` listener
- Added `@components` and `@config` path aliases
- Added Vite plugin for dev-mode `.env` file writing
- Supabase service now checks for both `VITE_SUPABASE_PUBLISHABLE_KEY` and `VITE_SUPABASE_ANON_KEY`
- Removed temporary console logs (kept only essential error logging)
- Fixed TypeScript type issues and linting errors

## [0.3.3] - 2024-12-23

### Added

- Optional authentication when Supabase is not configured
- Local storage mode with clear user messaging
- Todos page accessible without login when Supabase is not configured
- Info banners explaining local storage mode limitations
- Navigation links for todos when Supabase is not configured

### Changed

- `ProtectedRoute` now allows access without authentication when Supabase is not configured
- Home page shows "Go to Todos" button when Supabase is not configured (even without login)
- Navigation bar shows "Todos" link when Supabase is not configured (even without login)
- Enhanced todos page info message with setup wizard link
- Authentication remains required when Supabase is configured (backward compatible)

### Technical

- Modified `ProtectedRoute` to check `isSupabaseConfigured()` before requiring auth
- Updated `HomePage` and `MainLayout` to conditionally show todos links based on Supabase configuration
- Enhanced user messaging throughout the app for local storage mode

## [0.3.2] - 2025-12-22

### Changed

- Updated README with improved troubleshooting section for TypeScript compilation errors
- Clarified port information in Quick Start guide
- Removed redundant note about cloning instructions

### Fixed

- Fixed floating promise lint errors by properly handling async operations
- Fixed unused variable warnings in browserStorageProvider
- Fixed TypeScript `any` types in test files

## [0.3.1] - 2025-12-22

### Changed

- Updated README cloning instructions to clone directly into current folder for better Cursor indexing
- Fixed ESLint import restriction rules to properly allow pages importing components and feature components importing common components
- Removed console.error statements from error handlers

## [0.3.0] - 2025-01-28

### Added

- Airtable integration as alternative data backend
- Data provider abstraction layer using Strategy pattern
- Airtable configuration step in setup wizard
- Support for multiple data backends (Supabase, Airtable, Browser Storage)
- Automatic provider selection based on configuration priority
- Airtable field mapping utilities for Todo feature
- Environment variables for Airtable configuration (`VITE_AIRTABLE_API_KEY`, `VITE_AIRTABLE_BASE_ID`, `VITE_AIRTABLE_TABLE_ID`)

### Changed

- Refactored todo service to use provider pattern for better extensibility
- Data backend priority: Supabase → Airtable → Browser Storage
- Setup wizard now includes optional Airtable configuration step
- Improved code organization with provider abstraction layer

### Technical

- Added `airtable` npm package dependency
- Created `DataProvider` interface for backend abstraction
- Implemented `SupabaseProvider`, `AirtableProvider`, and `BrowserStorageProvider`
- Provider factory pattern for automatic backend selection

## [0.2.0] - 2025-01-27

### Added

- Optional Supabase configuration - users can skip database setup during initial setup
- Browser storage fallback for todos when Supabase is not configured
- Setup wizard accessible at `/setup` route anytime (until cleanup)
- Info banners in auth pages explaining Supabase requirement
- Info banner in todos page explaining browser storage

### Changed

- Supabase is now optional - app works without database configuration
- Todos feature automatically uses browser storage when Supabase is not configured
- Setup wizard allows skipping Supabase configuration step
- TypeScript types for Supabase environment variables are now optional
- README updated with optional Supabase setup instructions

### Fixed

- TypeScript compilation errors in supabaseService.ts
- Removed unused `handleSkipToTheme` function

## [0.1.0] - 2024-12-21

### Added

- Initial boilerplate setup with Vite, React, TypeScript
- Material-UI (MUI) integration with custom dark mode theme
- Supabase integration for backend services
- React Router for navigation
- Authentication feature (login, signup, logout)
- Todos feature (CRUD operations)
- Common components (Button, Input, Modal)
- Layouts (MainLayout, AuthLayout)
- Protected routes
- TypeScript path aliases for clean imports
- ESLint configuration with GTS and architecture rules
- Prettier configuration
- Vitest testing setup with example tests
- GitHub Actions CI/CD workflow
- Project documentation (README.md, ARCHITECTURE.md)
- Setup wizard for initial configuration
  - Supabase credentials configuration
  - Database schema setup instructions
  - Frontend hosting configuration guide
  - Custom theme configuration step
    - Integration with MUI Theme Creator
    - Theme validation and persistence
    - Default theme preservation
- Theme customization system
  - Custom theme loader with localStorage persistence
  - Theme validation utilities
  - Default theme fallback mechanism
