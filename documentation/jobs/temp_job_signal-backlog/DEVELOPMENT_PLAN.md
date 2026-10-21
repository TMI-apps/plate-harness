# Development plan: Signal backlog (backlog-management + error capture + feedback)

## Summary

- **Goal:** Agents keep `src/config/app-tasks.json` honest and ordered against landed work and two runtime signal streams: automatically captured errors (`error_logs`) and user-submitted feedback (`app_feedback`). Both streams write to Supabase whenever it is connected; agents read and close them via Supabase MCP.
- **Why:** MILA proved the loop (capture → link to task → fix → `review` → admin confirms). The harness has the task board but no signal capture, and the router's backlog intake is first-to-do only.
- **Complexity:** L — new DB schema + RLS, cross-cutting error rule, two UI features + admin area, skill/rule changes, two repos.
- **Plan review:** Done 2026-10-21 (see Amendments)
- **Plan validate:** Required: pending
- **Scope / constraints:** Same capability in `bronze-plate-harness` (shadcn, git **Model C**) and `plate-harness` (MUI, git **Model B**). Shared non-UI files are identical and diff-checked (Phase 9); skill/rule text is written mode-neutral and hand-applied per repo. Everything no-ops when `isSupabaseConfigured()` is false. MILA repo is read-only reference. Product forks: sibling `DECISIONS.md` (D1–D17).
- **Out of scope:** `bugs` tables and skill (D4, D9); pre-login/anon capture (D10); source maps (D13 — documented gap); MILA chat-feedback dialog, AI-db catalog, `ai-db-*` skills, Airtable; CI SQL guard scripts (follow-up task); applying migrations to any remote project without the owner's go.

## Phase overview

| Phase | Goal | Gate | Status |
|-------|------|------|--------|
| 1 | Task `links[]` schema | domain tests + tooling gate | Pending |
| 2 | Supabase migrations (errors + feedback) | local reset ×2, role tests, types generated | Pending |
| 3 | Client error capture + mandatory-logging rule | unit tests; boundary/global handlers wired | Pending |
| 4 | Edge helper | file present; `deno check` or logged skip | Pending |
| 5 | Shared realtime hook + feedback submit/ack loop | tests; manual check | Pending |
| 6 | Admin area: guard, feedback inbox, error triage | tests; manual check | Pending |
| 7 | Skills, rules, docs, intake report | align-harness clean; MILA-wording grep clean | Pending |
| 8 | Verify on bronze (HANDOFF §7 + role checks) | owner-run checks pass | Pending |
| 9 | Port to `plate-harness` | tooling gate in plate; shared-file diff clean | Pending |

## Conflict & compliance

- **Applicable rules:** `architecture` (layers: utils → types only; services → utils/types/config; route guards use `useAuth`; cross-feature internals ban), `file-placement` + `projectStructure.config.cjs`, `code-style` (complexity ≤10/15/100; error handling), `security` (RLS `(select auth.uid())`, least privilege, no tokens/PII in logs, DEFINER grants), `database` (`supabase/migrations/YYYYMMDDHHMMSS_*.sql`, idempotent, RLS in same migration, new-table checklist incl. type generation; bronze § Staging first), `testing` (critical paths covered), `workflow`, `agent-behavior` (protected files), `cloud-functions`, `platform` (env catalog), `git-workflow` (bronze Model C, plate Model B).
- **Protected files touched (owner request covers them):** `.agents/skills/{backlog-management (new), router, finish, debug, start, bundle-ship}/**`, `.cursor/rules/{code-style,workflow,platform,database}/RULE.mdc`, `AGENTS.md` catalog only if a rule description changes. **No change** to `projectStructure.config.cjs`, ESLint, or cruiser config.
- **File placements (whitelisted; verified by review):**
  - `supabase/migrations/*.sql`, `supabase/functions/_shared/errorLogging.ts`.
  - `src/shared/services/errorLoggingService.ts` — `logAppError`, `logError`, `registerGlobalErrorHandler`; internal `ErrorSink` interface + Supabase sink (D15). Not `shared/utils/errorHandling.ts` as in MILA: utils may not import services.
  - `src/shared/utils/appEnvironment.ts` — `detectEnvironment()` (own module; used by logging and feedback).
  - `src/shared/utils/errorUtils.ts` — extend existing `getErrorMessage` with the PostgREST shape (one helper).
  - `src/shared/utils/authRole.ts` — pure `isAdminRole(user)` reading `app_metadata.role`.
  - `src/shared/hooks/useTableSubscription.ts` — the one realtime mechanism (subscribe, refetch on visibility, optional poll fallback). Three consumers in this job → extracted, not copied.
  - `src/shared/types/feedback.types.ts` — feedback row/status types shared by `features/feedback` and `features/admin/feedback` (avoids cross-feature internals).
  - `src/components/common/StatusAlert/` — fixed top alert extracted from `TasksFeedback` (consumers: tasks, feedback dialog, admin feedback, admin errors = 4 → extract). Bronze only; plate already uses MUI `Snackbar`.
  - `src/routes/guards/RequireAdmin.tsx` (new `src/routes/` dir, whitelisted). Routes stay in `App.tsx`, lazy like existing pages.
  - `src/features/feedback/`, `src/features/admin/feedback/`, `src/features/admin/error-logs/` (nested-feature hook tests named `*.test.ts` per config).
  - `src/pages/admin/AdminFeedbackPage.tsx`, `src/pages/admin/AdminErrorsPage.tsx`.
  - `documentation/DOC_ERROR_LOGGING_CONTRACT.md` — approved by owner 2026-10-21.
- **Feature budgets:** each new feature under 25 files / 10 per layer (test files count).
- **Reuse / packages:** `dont-reinvent-the-wheel` — APM vendors (Sentry/PostHog) compared in review; owner kept the DB-backed store (D1) with a swappable internal sink (D15). Rate limiting is a 10-line trigger, not a subsystem. No new UI dependencies.
- **Risks / open questions:**
  - Minified stacks: grouping ignores frames (D13); stacks stored for humans, documented as unreadable in prod.
  - JWT `app_metadata.role` changes take effect after token refresh / re-login (documented).
  - `is_admin_user` may pre-exist in a fork: migration keeps it but raises a `WARNING` naming it; Phase 8 prints `pg_get_functiondef`.
  - Realtime DELETE events (cleanup job) are not RLS-filtered — carry ids only; acceptable, documented.
  - Supabase MCP connector in this session needs owner authorization before Phase 8.
- **Standards diversions:** DB-backed error log instead of an APM vendor (D1, accepted); no pre-login capture (D10, accepted); no source maps (D13, accepted).

## Review contract

- **Rules pinned:** `rules@c3d2220` (bronze) — architecture, file-placement, code-style, security, database, testing, workflow, agent-behavior, cloud-functions, platform, git-workflow. Plate pinned at its own `git log -1 --format=%h -- .cursor/rules` during Phase 9.
- **Required lenses:** Pattern & precedent (L), Reuse / packages, Feature decomposition, Name the mechanism.
- **Tooling gate:** `validate` § Tooling pass — lint, type-check, test, `validate:structure`, `validate:feature-docs:strict`, `validate:feature-size`, `arch:check`.
- **Locked decisions:** `DECISIONS.md` D1–D17 + Decisions made below + Amendments.

### Amendments

| # | Date | Source | Change | Applied to |
|---|------|--------|--------|------------|
| 1 | 2026-10-21 | review-dev-plan (security) | Hash computed server-side; client fingerprint source dropped; `error_logs` SELECT admin-only (D17) | Phase 2, 3 |
| 2 | 2026-10-21 | review-dev-plan (security) | Payload privacy: route = pathname only, allowlisted `browser_info`, length checks client + SQL | Phase 2, 3 |
| 3 | 2026-10-21 | review-dev-plan (security, delivery) | Migration gate: reset ×2, anon/authenticated role tests, cap + ack guard tests, type generation | Phase 2 |
| 4 | 2026-10-21 | review-dev-plan (security) | Cap + bind trigger functions SECURITY DEFINER, `search_path` set, EXECUTE revoked from clients | Phase 2 |
| 5 | 2026-10-21 | review-dev-plan (industry, scale, owner D13) | Fingerprint = type + normalised message (+ stable context); version required; reopen only on newer version; client throttle | Phase 2, 3 |
| 6 | 2026-10-21 | review-dev-plan (workflow) | Model B/C-aware finish handoff and evidence; plate skills hand-applied; mode-neutral wording | Phase 7, 9 |
| 7 | 2026-10-21 | review-dev-plan (workflow) | Signals on = Supabase configured **and** MCP reachable; else tasks-only + paste-packet path | Phase 7 |
| 8 | 2026-10-21 | review-dev-plan (workflow) | finish archive moves the whole row incl. `links` | Phase 7 |
| 9 | 2026-10-21 | review-dev-plan (naming) | Extract `useTableSubscription`; extract `StatusAlert`; mark two "copy for agent" formatters; `detectEnvironment` own module; Edge helper renamed `errorLogging.ts` | Phase 3–6 |
| 10 | 2026-10-21 | review-dev-plan (delivery, scale) | Shared feedback types in `src/shared/types/`; `isAdminRole` pure util on `useAuth().user` (no session hook) | Phase 5, 6 |
| 11 | 2026-10-21 | review-dev-plan (delivery) | Admin feature READMEs; tests for guard, hooks, boundary forwarding; `VITE_APP_ID` typed | Phase 3, 5, 6 |
| 12 | 2026-10-21 | review-dev-plan (scale, delivery) | Shared-file diff gate; verify on bronze before port (D16) | Phase 8, 9 |
| 13 | 2026-10-21 | owner D14, D15 | Opt-out section; sink port; per-user error cap; feedback auto-complete after 14 days; intake report + catalogs | Phase 2, 3, 7 |
| 14 | 2026-10-21 | review-dev-plan (workflow) | Catch-up never archives or reorders onboarding tasks (owned by `start`) | Phase 7 |

## Pattern & precedent

| Field | Value |
|-------|--------|
| **Capability** | Auto-captured, deduplicated client/Edge errors + in-app feedback, triaged by admins and agents, linked to an in-repo task list. |
| **Precedents** | Sentry/Bugsnag issue grouping (fingerprint → issue; "resolved in next release"); Intercom/Canny in-app feedback with reporter notification; Linear/GitHub issue ↔ error linking. |
| **Aspects reviewed** | Grouping/dedup with minified stacks; release tagging + regression reopen; client throttle; server volume caps; PII scrubbing; reporter close-the-loop; status vocabulary; admin navigation; who may write/read. |
| **Findings** | Grouping on type + normalised message aligns with Sentry's message-based fallback. Reopen only on a newer version aligns with "resolved in next release". Client throttle + per-user server caps align with SDK rate limiting. Scrubbing: pathname-only route, allowlisted fields, message normaliser (emails, tokens, uuids, urls). Reporter ✓/✗ + auto-complete after 14 days aligns with Intercom auto-close. `review` = "resolved, awaiting confirmation"; `completed` = "reporter confirmed". Separate Feedback / Errors inboxes match Sentry's Issues vs User Feedback. Divergences accepted: DB store instead of APM (D1), no pre-login capture (D10), no source maps (D13). |
| **Verdict** | Acceptable product-specific (divergences owner-accepted) |

## Phase 1 — Task `links[]` schema

**Goal:** Tasks can carry signal links without breaking the board.

**Steps**
1. `src/features/tasks/types/appTask.types.ts`: `TaskLink` union (`{kind:"error",hash}` | `{kind:"feedback",env,id}`), optional `links?: TaskLink[]`. `env`: `"staging" | "production"` (single-project forks use `"production"`).
2. `services/appTasksDomain.ts`: allow the `links` key; validate via a `kind → validator` map (new kinds = one entry); `readTaskFields`, `completeActiveTaskAtIndex`, `restoreFromArchiveDisplayIndex` keep `links`; omit when empty.
3. `hooks/useAppTasksBacklog.ts`: confirm edits/reorders keep `links`.
4. Tests in `appTasksDomain.test.ts`: `parseActiveTasks`/`parseArchiveTasks` round-trip links (covers the dev-plugin POST path); unknown kind rejected; complete/restore keep links.
5. `src/features/tasks/README.md`: `links`, order = priority, status vocabulary (absorbs MILA `docs/agents/task-status.md` + `issue-tracker.md`).

**Gate:** Tooling gate green.

## Phase 2 — Supabase migrations

**Goal:** Consolidated, replay-safe schema rebuilt from MILA's final state, MILA-only parts removed, review fixes applied.

**Steps**
1. `supabase/migrations/<ts>_error_logs.sql`:
   - `is_admin_user(uuid)`: create if missing (`STABLE`, reads `(select auth.jwt())->'app_metadata'->>'role' in ('admin','super-admin')`); if present, keep it and `RAISE WARNING`. EXECUTE to `authenticated`, `anon` (policy helper).
   - `error_logs`: MILA final columns minus client fingerprint input; `app_version text not null`; length checks (message ≤10000, stack ≤20000, context ≤500, route ≤500, browser_info ≤4KB); status `open|muted|review|resolved` + `resolved` sync trigger; environment check `local_dev|preview|staging|production|unknown`; indexes `(status, last_seen_at desc)`, `first_seen_at`.
   - RLS: SELECT admin-only (D17). No write policies. Revoke table DML from `anon`, `authenticated`.
   - `upsert_error_log(p_message, p_stack, p_context, p_type, p_route, p_browser_info, p_app_version, p_environment)` — DEFINER, `search_path = public`; JWT or `service_role`; hash = sha256 of `type + normalised message + context` computed **in SQL**; on conflict: `count+1`, `last_seen_at`; reopen `review|resolved` → `open` only when `p_app_version` differs from the stored version (newer release); `muted` stays muted. Per-user cap: max 200 new hashes per user per 24h (excess calls no-op). REVOKE PUBLIC/anon; GRANT `authenticated`, `service_role`.
   - `admin_update_error_log_status(uuid,text)` DEFINER, admin-gated; GRANT `authenticated`.
   - `cleanup_old_error_logs(int default 90)` DEFINER, `service_role` only; also auto-completes `app_feedback` rows `handled` > 14 days (D15). Named `cron.schedule('cleanup_signals', …)` inside a DO block guarded on `pg_cron`.
   - Add `error_logs` to `supabase_realtime` (guarded, idempotent).
2. `supabase/migrations/<ts+1>_app_feedback.sql`:
   - `set_updated_at()` trigger function (create or replace).
   - `app_feedback`: `id, created_at, updated_at, user_id, user_name, user_email, body (1–10000), status (open|review|handled|dismissed|completed), context jsonb ≤256KB, environment, submitter_resolution jsonb ≤4KB, app_id text not null default 'app' (1–64)`. Index `(user_id, created_at)`, `(status, created_at desc)`.
   - Triggers: `app_feedback_bind_submitter` and `app_feedback_cap_per_user` (100/24h, advisory lock) — both **SECURITY DEFINER**, `search_path = public`, EXECUTE revoked from PUBLIC/anon/authenticated. `app_feedback_submitter_ack_guard` (INVOKER): handled → completed|open; freezes other columns; stamps `submitter_resolution`; bypass only for admins and `current_user in ('postgres','supabase_admin')` or `auth.role() = 'service_role'`.
   - RLS: one INSERT (own, `open`), one SELECT (admin or own `handled`), one UPDATE (admin, or own handled → completed/open). Column UPDATE grant `(status)`; `submitter_resolution` written by the trigger only. No DELETE; nothing for `anon`.
   - Add to `supabase_realtime`.
3. Header comment in each file: MILA source migrations + deltas.
4. `src/shared/types/database.types.ts` via `supabase gen types typescript --local`; `getSupabase()` returns `SupabaseClient<Database>`.

**Gate:** local `supabase db reset` twice (fresh + replay) clean; `security` RLS check queries clean; SQL tests as `anon` (RPC + inserts fail), as user (direct insert into `error_logs` fails; same error twice → one row `count = 2`; non-admin select returns 0 rows; 101st feedback rejected; submitter editing `body` frozen; non-handled → completed rejected), as admin (reads both); types generated. If the Supabase CLI is unavailable in the session, this gate runs in Phase 8 on the owner's chosen project.

## Phase 3 — Client error capture + rule

**Goal:** Every runtime error in app code reaches `error_logs` when Supabase is connected; silent no-op otherwise.

**Steps**
1. `src/shared/utils/errorUtils.ts`: extend `getErrorMessage` with PostgREST `{code,message,details,hint}` formatting; tests.
2. `src/shared/utils/appEnvironment.ts`: `detectEnvironment()` — `localhost`/`127.0.0.1` → `local_dev`; else `VITE_APP_ENVIRONMENT` (`preview|staging|production`); else `unknown`. Tests.
3. `src/shared/services/errorLoggingService.ts`:
   - `logAppError(error, context, type, metadata?) → Promise<void>` (callers `void` it); `logError(context, error, metadata?)` = `console.error` + `logAppError`; `registerGlobalErrorHandler()` (window `error` + `unhandledrejection`).
   - Internal `ErrorSink` interface; Supabase sink calls `upsert_error_log`.
   - Guards: not configured → return; no session → return; never throws; no recursion.
   - Throttle: one send per (type + normalised message) per 10s; max 50 sends per page session.
   - Payload: message normalised and scrubbed (emails, bearer/JWT-like tokens, uuids, urls, long hex/numbers); route = `location.pathname` only; `browser_info` = `{userAgent, language}`; truncation matching SQL limits; `app_version` from `VITE_APP_VERSION` (falls back to `package.json` version via Vite `define`).
4. `src/main.tsx`: `registerGlobalErrorHandler()` before `createRoot`.
5. `src/App.tsx`: `QueryErrorBoundary onError` → `logAppError(error, "react_boundary", "react_boundary", { componentStack })` (stable context; `componentStack` as metadata only). Extend `onError` to forward `ErrorInfo`.
6. `src/vite-env.d.ts`, `.env.example`: `VITE_APP_ENVIRONMENT`, `VITE_APP_VERSION`, `VITE_APP_ID`.
7. Existing runtime `console.error` (QueryErrorBoundary) now pairs with central logging; `redirectUtils` warnings stay console-only (documented).
8. Tests: configured/unconfigured, throttle + session cap, scrubber patterns, truncation, never throws, global handler registration, boundary forwarding.

**Gate:** Tooling gate green; grep shows no runtime `console.error` without `logError`/`logAppError`.

## Phase 4 — Edge helper

**Steps**
1. `supabase/functions/_shared/errorLogging.ts`: `logEdgeError({authHeader, …})` (forwards caller JWT; no header → no-op) and `logServiceError({…})` (service role). Same payload rules as the client. Optional secret `ERROR_LOG_ENVIRONMENT`. `jsr:@supabase/supabase-js` pinned to the `package.json` version.
2. Confirm `tsconfig`/ESLint exclude Deno files.

**Gate:** `deno check` on the file, or a logged skip when Deno is absent.

## Phase 5 — Shared realtime hook + feedback

**Steps**
1. `src/shared/hooks/useTableSubscription.ts` (+ tests with a mocked channel): subscribe to one table/filter, refetch callback, visibility refetch, optional poll fallback, cleanup.
2. `src/shared/types/feedback.types.ts`: statuses, row types, select lists, limits.
3. Bronze: extract `src/components/common/StatusAlert/` from `TasksFeedback`; move tasks onto it.
4. `src/features/feedback/services/feedbackService.ts`: `sendFeedback({body})` (insert with `returning: minimal`; `app_id` from `VITE_APP_ID`; `environment` from `detectEnvironment`; context `{route: pathname, appVersion}`; P0001 → "limit reached"; 42501/JWT → "sign in"), `listHandledForMe`, `ackFeedback(id, "completed" | "reopened")`.
5. Hooks: `useSendFeedback`, `useHandledFeedbackNotifications` (on `useTableSubscription`; optimistic ack).
6. Components: `FeedbackDialog` (kit `Modal` + `Textarea`), `HandledFeedbackMenu` (Topbar tray, ✓/✗ per row). English copy.
7. Wire: ProfileMenu logged-in → "Send feedback"; Topbar → tray when handled rows exist. Hidden when Supabase not configured.
8. README (Purpose/Structure/Dependencies). Tests: service (body validation, error mapping), hooks.

**Gate:** Tooling gate green; manual flow in Phase 8.

## Phase 6 — Admin area

**Steps**
1. `src/shared/utils/authRole.ts` `isAdminRole(user)` + tests; `src/routes/guards/RequireAdmin.tsx` using `useAuth().user` (not admin → redirect `/`) + test.
2. `src/features/admin/feedback/`: service (inbox `open|review`, detail, status `open|handled|dismissed`), hook on `useTableSubscription`, components (list/detail/status buttons), "Copy for agent" packet `## app_feedback` (marker: other copy in `admin/error-logs`). Show verified email; label `user_name` as self-reported. README.
3. `src/features/admin/error-logs/`: service (projected columns, ordered `last_seen_at desc`, limit 200; `admin_update_error_log_status`), hook on `useTableSubscription` (debounced refetch), components (triage table, hide muted/resolved, resolve/mute/reopen, "Copy for agent" `## error_logs` — marker to the feedback copy). README.
4. Pages + lazy routes `/admin/feedback`, `/admin/errors` in `App.tsx` under `RequireAdmin`; ProfileMenu "Admin" entries when `isAdminRole`.
5. Confirm before resolve/dismiss via kit `Modal`.
6. Tests: services, hooks (`*.test.ts`), guard.

**Gate:** Tooling gate green; manual checks in Phase 8.

## Phase 7 — Skills, rules, docs, intake

**Steps**
1. **New** `.agents/skills/backlog-management/SKILL.md`, generalized from MILA:
   - Configure table: signals on = Supabase configured **and** MCP reachable per env (else tasks-only catch-up + debug paste-packet path; never block); projects/MCP namespaces per env; `app_id`; write mode `mcp` (default) | `migration` | `handoff`, with "confirm target before production" and "list closed hashes/ids in the commit message"; evidence = default branch log + version source per git-workflow § Mode behavior table.
   - Flow: Read (projected columns, `status in (open, review)`, ordered `last_seen_at desc`, limit) → Catch up → Write statuses → Connect → Prioritize (order = priority; ask before new top) → Hand off (`debug` / `quick-piv` / `plan`).
   - Onboarding tasks (seeded by `start`) are never archived or reordered by catch-up.
   - Archive may be read during catch-up only (single SSOT for read scope).
   - Status meanings: `review` = fix landed, awaiting admin confirmation; `completed` = reporter confirmed.
2. `router/SKILL.md`: idle bare `/router` → `backlog-management`. Update every site (frontmatter description, Situation row, § Thread continuation, § App task backlog → pointer + pick-up rule; drop "do not read archive"); skill index row.
3. `finish/SKILL.md`: § App task backlog moves the whole row incl. `links` (`completeActiveTaskAtIndex` semantics). New § Backlog review handoff: linked hashes/ids → `review` per write mode, timed per mode — PR-based landing (Model A/C): `review` on staging at finish, production ids in the PR body, production moved by catch-up after merge; direct landing (Model B): per the table's production promotion row. Never `resolved`/`handled`.
4. `bundle-ship/SKILL.md`: collect `links` from every archived task.
5. `debug/SKILL.md` § Chat intake: optional "signal ref" slot (hash / feedback id) → read the row via MCP (projected columns, no `user_email`) before hypotheses; paste-packet path when MCP is off.
6. `start/SKILL.md`: Supabase step applies the two migrations and sets an admin role (`app_metadata.role`; takes effect after re-login).
7. Rules: `code-style` § Error Handling — mandatory central logging paragraph; `workflow` review checklist (error coverage, no secrets in payload, `console.error` paired); `platform` env catalog (`VITE_APP_ENVIRONMENT`, `VITE_APP_VERSION`, `VITE_APP_ID`, `ERROR_LOG_ENVIRONMENT`); `database` note on signal tables.
8. `documentation/DOC_ERROR_LOGGING_CONTRACT.md`: surfaces → helpers, grouping + reopen rule, throttle/caps, identity limits (no anon), privacy scrubbing, environment & version, retention, known gaps (minified stacks, pre-login), **Opting out** (every touch point: main.tsx, App.tsx, ProfileMenu, Topbar, routes, guards, features, migrations, rules, skills). `DOC_INDEX.md` row.
9. Intake report `documentation/jobs/harness/2026-10-21-UPDATE_REPORT.md` (origin MILA, disposition per item); `documentation/jobs/harness/REGISTRY.md` row + owns-concepts for router/finish/debug; `DOC_AGENT_WORKFLOW_LAYERS.md` if layers change.
10. Run `align-harness` on touched skills/rules; grep for MILA wording (`mila`, Lane A, `db:push-staging`, `.changeset`, `changelog-public`, `bugs`, `bug_error_hashes`, `AskQuestion`, `develop` as evidence branch, `scripts/dev-tasks`).

**Gate:** align-harness shows no contradictions; markdown link validator green; MILA-wording grep clean.

## Phase 8 — Verify on bronze (owner)

Owner picks the project (local `supabase start` or bronze staging) and authorizes the Supabase connector. Run the Phase 2 gate SQL tests there if not run locally, then HANDOFF §7: sign in → same error twice → one row `count = 2`; non-admin sees 0 error rows; direct insert into `error_logs` fails; submit feedback → admin `handled` → submitter ✓ → `completed`; non-admin realtime subscriber receives no error rows; `pg_get_functiondef('is_admin_user')` matches. Fix findings on bronze before porting.

**Gate:** All checks pass; owner confirms.

## Phase 9 — Port to `plate-harness`

**Steps:** Copy shared non-UI files (migrations, Edge helper, `errorLoggingService`, `appEnvironment`, `authRole`, `errorUtils` extension, `useTableSubscription`, `feedback.types`, task domain/types) — they import only `getSupabase`/`isSupabaseConfigured` from `supabaseService`. Rebuild Phase 5–6 UI with MUI (Dialog, Snackbar, Menu); Topbar/ProfileMenu live under `src/components/common/` in plate. Hand-apply Phase 7 skill/rule edits to plate's own versions (Model B; single Supabase project — previews use production, noted in the contract doc).

**Gate:** Tooling gate green in plate; `diff` over the shared-file list between repos is empty.

## Notes during development

Advisory, not promoted (review-dev-plan 2026-10-21): conditional mute ("until N events / T time"); notify the reporter on `dismissed` (silent by design for now); open-count badges on admin entries; CI SQL guard scripts (anon writes, DEFINER grants).
## Decisions made

| # | Topic | Choice | Precedent? |
|---|-------|--------|------------|
