# Development plan: Signal backlog (backlog-management + error capture + feedback)

## Summary

- **Goal:** Agents keep `src/config/app-tasks.json` honest and ordered against landed work and two runtime signal streams: automatically captured errors (`error_logs`) and user-submitted feedback (`app_feedback`). Both streams write to Supabase whenever it is connected; agents read and close them via Supabase MCP.
- **Why:** MILA proved the loop (capture → link to task → fix → `review` → admin confirms). The harness has the task board but no signal capture, and the router's backlog intake is first-to-do only.
- **Complexity:** L — new DB schema + RLS, cross-cutting error rule, two UI features + admin area, skill/rule changes, two repos.
- **Plan review:** Required: pending
- **Plan validate:** Required: pending
- **Scope / constraints:** Same work in `bronze-plate-harness` (shadcn) and `plate-harness` (MUI); non-UI files byte-identical. Everything no-ops when `isSupabaseConfigured()` is false. MILA repo is read-only reference. Product forks: sibling `DECISIONS.md` (D1–D12).
- **Out of scope:** `bugs` tables and skill (D4, D9); pre-login/anon capture (D10); MILA chat-feedback dialog, AI-db catalog, `ai-db-*` skills, Airtable; CI SQL guard scripts (HANDOFF step 6 — follow-up task); applying migrations to any remote project without the owner's go.

## Phase overview

| Phase | Goal | Gate | Status |
|-------|------|------|--------|
| 1 | Task `links[]` schema | tasks tests + tooling gate | Pending |
| 2 | Supabase migrations (errors + feedback) | SQL review + local/staging apply on owner go | Pending |
| 3 | Client error capture + mandatory-logging rule | unit tests; boundary/global handlers wired | Pending |
| 4 | Edge helper | file present, typed, documented | Pending |
| 5 | Feedback: submit + submitter ack loop | tests; manual check | Pending |
| 6 | Admin area: guard, feedback inbox, error triage | tests; manual check | Pending |
| 7 | Skills, rules, docs | align-harness clean on touched files | Pending |
| 8 | Port to `plate-harness` (MUI UI) | tooling gate in plate | Pending |
| 9 | End-to-end verification (HANDOFF §7) | owner runs checks against a project | Pending |

## Conflict & compliance

- **Applicable rules:** `architecture` (layers: utils → types only; services → utils/types/config), `file-placement` + `projectStructure.config.cjs`, `code-style` (complexity ≤10/15/100; error handling), `security` (RLS `(select auth.uid())`, no anon writes, DEFINER grants), `database` (`supabase/migrations/YYYYMMDDHHMMSS_*.sql`, idempotent, RLS in same migration; bronze § Staging first), `testing`, `workflow`, `agent-behavior` (protected files), `cloud-functions` (Edge helper), `platform` (env catalog), `git-workflow` (Model C).
- **Protected files touched (owner request covers them; listed for review):** `.agents/skills/{backlog-management (new), router, finish, debug, start}/**`, `.cursor/rules/{code-style,workflow,platform,database}/RULE.mdc`, `AGENTS.md` catalog only if a rule description changes. **No change** to `projectStructure.config.cjs`, ESLint, or cruiser config — all paths below are already whitelisted.
- **File placements (all whitelisted today):**
  - `supabase/migrations/*.sql`, `supabase/functions/_shared/errorTriage.ts` (root `supabase/` allowed).
  - `src/shared/services/errorLoggingService.ts` (logAppError, logError, registerGlobalErrorHandler, detectEnvironment). **Not** `shared/utils/errorHandling.ts` as in MILA: utils may not import services in this harness.
  - `src/shared/utils/errorUtils.ts` — extend existing `getErrorMessage` with the PostgREST shape from MILA `extractErrorMessage.ts` (one helper, no second copy).
  - `src/shared/hooks/useIsAdmin.ts`; `src/routes/guards/RequireAdmin.tsx`.
  - `src/features/feedback/` (submit modal, ack notifications, service, types, README).
  - `src/features/admin/feedback/`, `src/features/admin/error-logs/` (nested features; pattern exists as `admin/billing` in config).
  - `src/pages/admin/AdminFeedbackPage.tsx`, `src/pages/admin/AdminErrorsPage.tsx`.
  - `documentation/DOC_ERROR_LOGGING_CONTRACT.md` — **permanent doc: needs owner OK at Present.**
- **Feature budgets:** each new feature stays under 25 files / 10 per layer; split admin into two features for that reason.
- **Reuse / packages:** `dont-reinvent-the-wheel` — skipped for capture (Sentry-class SaaS was implicitly rejected by D1: DB-backed, agent-readable via MCP; MILA code is the reuse). dnd-kit, Radix/MUI, supabase-js realtime already installed; **no new UI dependencies.** Toast: bronze has none — reuse the fixed-`Alert` pattern from `TasksFeedback` (second copy → mark per name-the-mechanism; extract on a third).
- **Risks / open questions:**
  - Fingerprint: MILA's boundary passes `componentStack` as context → same error splits into clusters. Use a stable context (`react_boundary`) and send `componentStack` as metadata.
  - Realtime: MILA never added tables to `supabase_realtime` in migrations; ours does it explicitly.
  - Environment signal: harness has no `__SUPABASE_TARGET__`. Use hostname `localhost`/`127.0.0.1` → `local_dev`, else optional new `VITE_APP_ENVIRONMENT` (`preview|staging|production`), else `unknown`. Check constraint: `local_dev|preview|staging|production|unknown`.
  - Retention: `cleanup_old_error_logs(90)` scheduled via `pg_cron` only when the extension exists (DO-block guard); otherwise documented.
  - Supabase MCP connector in this session currently needs auth; remote apply/verification waits for the owner.
- **Standards diversions:** none beyond MILA's (DB-backed error log instead of an APM vendor) — accepted by D1.

## Review contract

- **Rules pinned:** `rules@c3d2220` — architecture, file-placement, code-style, security, database, testing, workflow, agent-behavior, cloud-functions, platform, git-workflow.
- **Required lenses:** Pattern & precedent (L), Reuse / packages (skipped for capture — reason above), Feature decomposition, Name the mechanism.
- **Tooling gate:** `validate` § Tooling pass (contract gate list) — lint, type-check, test, `validate:structure`, `validate:feature-docs:strict`, `validate:feature-size`, `arch:check`.
- **Locked decisions:** `DECISIONS.md` D1–D12 + Decisions made below + Amendments.

### Amendments

| # | Date | Source | Change | Applied to |
|---|------|--------|--------|------------|

## Pattern & precedent

| Field | Value |
|-------|--------|
| **Capability** | Auto-captured, deduplicated client/Edge errors + in-app feedback, triaged by admins and agents, linked to an in-repo task list. |
| **Precedents** | Sentry issue grouping (fingerprint → issue, regression reopens resolved); Linear/Intercom in-app feedback with "resolved" notification to the reporter; GitHub issue ↔ PR linking. |
| **Aspects reviewed** | Grouping/dedup; regression reopen; privacy (no secrets/PII in payload); reporter close-the-loop; rate limiting; who may write. |
| **Findings** | Grouping by normalised fingerprint aligns with Sentry. Reopen-on-recur aligns. Reporter ack aligns with Intercom/Canny. 100/day cap and DEFINER-only writes are standard. No anon capture diverges from Sentry (which captures pre-login) — accepted, D10. |
| **Verdict** | Aligns with precedent |

## Phase 1 — Task `links[]` schema

**Goal:** Tasks can carry signal links without breaking the board.

**Steps**
1. `src/features/tasks/types/appTask.types.ts`: add `TaskLink` union (`{kind:"error",hash}` | `{kind:"feedback",env,id}`) and optional `links?: TaskLink[]` on `AppTask`. `env`: `"staging" | "production"` (single-project forks use `"production"`).
2. `services/appTasksDomain.ts`: allow `links` key; validate shape (reject unknown kinds/keys); `readTaskFields`, `completeActiveTaskAtIndex`, `restoreFromArchiveDisplayIndex` preserve `links`; omit when empty.
3. `hooks/useAppTasksBacklog.ts`: confirm edits/reorders carry `links` (spread already does; add/new task stays without).
4. Row UI: small read-only link count badge (optional; skip if it pushes complexity).
5. Tests in `appTasksDomain.test.ts`: valid links round-trip; unknown kind rejected; archive/restore keeps links.
6. `src/features/tasks/README.md`: document `links`, order = priority, status vocabulary (absorbs MILA `docs/agents/task-status.md` + `issue-tracker.md`).

**Gate:** Tooling gate green; `/tasks` POST with a linked task returns 200 and keeps `links`.

## Phase 2 — Supabase migrations

**Goal:** Consolidated, replay-safe schema (rebuilt from MILA's final state; MILA-only parts removed).

**Steps**
1. `supabase/migrations/<ts>_error_logs.sql`:
   - `is_admin_user(uuid)` **only if missing** — reads `(select auth.jwt())->'app_metadata'->>'role' in ('admin','super-admin')`; EXECUTE to `authenticated`, `anon` (policy helper carve-out).
   - `error_logs` (columns per MILA final; `environment` check per Risks; no `app_id`), status `open|muted|review|resolved`, `resolved` sync trigger, indexes (drop redundant `hash` index — UNIQUE covers it).
   - RLS: one SELECT policy `is_admin_user((select auth.uid())) OR user_id = (select auth.uid())`; no write policies; revoke table DML from `anon`, `authenticated`.
   - `upsert_error_log` — **10-arg only**, DEFINER, `search_path = public`; JWT or `service_role`; sha256 dedup; `review|resolved` → `open` on recur; no `view_as` hook. REVOKE PUBLIC/anon; GRANT `authenticated`, `service_role`.
   - `admin_update_error_log_status(uuid,text)` DEFINER, admin-gated; GRANT `authenticated` only.
   - `cleanup_old_error_logs(int default 90)` DEFINER, `service_role` only; `pg_cron` schedule inside a DO block guarded on extension presence.
   - Add `error_logs` to `supabase_realtime` (guarded, idempotent).
2. `supabase/migrations/<ts+1>_app_feedback.sql`:
   - Shared `set_updated_at()` trigger function (create or replace).
   - `app_feedback`: `id, created_at, updated_at, user_id, user_name, user_email, body (1–10000), status (open|review|handled|dismissed|completed), context jsonb ≤256KB, environment, submitter_resolution jsonb ≤4KB, app_id text not null default 'app' (length 1–64)`. No `bug_id`, `message_id`, `assistant_id`.
   - Triggers: `app_feedback_bind_submitter` (identity from JWT), `app_feedback_cap_per_user` (100/24h, advisory lock), `app_feedback_submitter_ack_guard` (handled → completed|open; freezes other columns; migration-runner bypass). Trigger functions: no client EXECUTE.
   - RLS: one INSERT (own, `open`), one SELECT (admin or own `handled`), one UPDATE (admin, or own handled → completed/open). Column UPDATE grant `(status, submitter_resolution)`. No DELETE; nothing for `anon`.
   - Add to `supabase_realtime`.
3. Header comment in each file: source MILA migrations + deltas (HANDOFF list).

**Gate:** SQL reviewed against `database` + `security` RLS checklists; owner decides where to apply (local `supabase start` or staging via MCP). No remote apply without that go.

## Phase 3 — Client error capture + rule

**Goal:** Every runtime error in app code reaches `error_logs` when Supabase is connected; silent no-op otherwise.

**Steps**
1. `src/shared/utils/errorUtils.ts`: extend `getErrorMessage` with PostgREST `{code,message,details,hint}` formatting (from MILA `extractErrorMessage.ts`); tests.
2. `src/shared/services/errorLoggingService.ts`: `detectEnvironment`, fingerprint normalisers, `logAppError` (fire-and-forget), `logAppErrorWithResult`, `logError(context, error, meta)` (console.error + logAppError), `registerGlobalErrorHandler()` (window `error` + `unhandledrejection`). Guards: `isSupabaseConfigured()` false → return; no session → return (RPC would no-op anyway — skip the round trip); never throws; no recursion.
3. `src/main.tsx`: call `registerGlobalErrorHandler()` before `createRoot`.
4. `src/App.tsx`: pass `onError={(error, info) => logAppError(error, "react_boundary", "react_boundary", { componentStack })}` to `QueryErrorBoundary`; extend its `onError` signature to forward `ErrorInfo`.
5. `src/vite-env.d.ts`, `.env.example`: optional `VITE_APP_ENVIRONMENT`, `VITE_APP_VERSION` (if absent).
6. Convert existing runtime `console.error` (1: QueryErrorBoundary, DEV-gated — boundary now logs centrally) and review the 3 `console.warn` in `redirectUtils.ts` (warnings stay console-only; documented).
7. Tests: service with mocked `supabaseService` (configured/unconfigured, fingerprint stability, truncation, never throws); global handler registration.

**Gate:** Tooling gate green; grep shows no runtime `console.error` without `logError`/`logAppError`.

## Phase 4 — Edge helper

**Steps**
1. `supabase/functions/_shared/errorTriage.ts`: `logErrorTriageFromEdge` (forwards caller JWT; no header → no-op) and `logServiceErrorTriageFromEdge` (service role). Optional secret `ERROR_LOG_ENVIRONMENT`. Pin `jsr:@supabase/supabase-js` to the version matching `package.json`.
2. Confirm `tsconfig`/ESLint do not pick up Deno files (current `include` is `src`, `tests` only).

**Gate:** File present; contract doc lists it; no app lint/type impact.

## Phase 5 — Feedback: submit + submitter ack loop

**Steps**
1. `src/features/feedback/types/`: row/status types, select lists, limits.
2. `services/feedbackService.ts`: `sendFeedback({body, context})` (direct insert; `app_id` from `VITE_APP_ID` default `app`; `environment` from `detectEnvironment`; P0001 → friendly "limit reached"; 42501/JWT → "sign in"), `listHandledForMe`, `ackFeedbackCompleted`, `ackFeedbackReopened`. Context = `{route, userAgent, appVersion}` only (privacy).
3. `hooks/useSendFeedback.ts`, `hooks/useHandledFeedbackNotifications.ts` (realtime per user + visibility refetch + 60s poll fallback; optimistic ack).
4. Components: `FeedbackDialog` (kit `Modal` + `Textarea`), `HandledFeedbackMenu` (Topbar tray: list, ✓ / ✗ per row). English copy.
5. Wire: ProfileMenu logged-in branch → "Send feedback"; Topbar → tray when there are handled rows. Hidden when Supabase not configured.
6. README with Purpose/Structure/Dependencies.

**Gate:** Tooling gate; service tests (body validation, error mapping); manual: submit → row appears; admin sets `handled` → submitter sees it → ✓ sets `completed`.

## Phase 6 — Admin area

**Steps**
1. `src/shared/hooks/useIsAdmin.ts` (session `app_metadata.role`); `src/routes/guards/RequireAdmin.tsx` (not admin → redirect `/`).
2. `src/features/admin/feedback/`: service (inbox `open|review`, detail, status update `open|handled|dismissed`), hooks (list + realtime, actions), components (inbox list/detail/status buttons, "Copy for agent" packet `## app_feedback`).
3. `src/features/admin/error-logs/`: service (list projected columns, `admin_update_error_log_status`), hook (realtime), components (triage table: hide muted/resolved toggle, resolve / mute / reopen, copy JSON).
4. Pages + routes `/admin/feedback`, `/admin/errors` (lazy) under `RequireAdmin`; ProfileMenu "Admin" entries for admins.
5. Confirm before resolve/dismiss via kit `Modal` (no `window.confirm`).

**Gate:** Tooling gate; service tests; manual as admin and non-admin (non-admin redirected; RLS returns own rows only).

## Phase 7 — Skills, rules, docs

**Steps**
1. **New** `.agents/skills/backlog-management/SKILL.md` — generalized from MILA: Configure table (`signals: on|off` derived from Supabase configured; projects/MCP namespaces per env; `app_id`; **write mode `mcp` (default) | `migration` | `handoff`**; default branch for evidence), flow Read → Catch up → Write statuses → Connect → Prioritize (order = priority, ask before new top) → Hand off (`debug` / `quick-piv` / `plan`). Evidence: `git log` on default branch, `CHANGELOG.md` (release-please), archive. No changesets/public-changelog refs.
2. `router/SKILL.md`: idle bare `/router` → `backlog-management`; § App task backlog → pointer + pick-up rule; skill index row.
3. `finish/SKILL.md`: § Backlog review handoff — linked error hashes + feedback ids → `review` per write mode; never `resolved`/`handled`; keep `links` on archive.
4. `debug/SKILL.md` § Chat intake: when signals on, read matching `error_logs` cluster / `app_feedback` row via MCP (projected columns) before hypotheses; paste-packet path.
5. `start/SKILL.md`: Supabase onboarding step mentions applying the two migrations and setting an admin role.
6. Rules: `code-style` § Error Handling — mandatory central logging paragraph; `workflow` review checklist lines (error coverage, no secrets in payload, `console.error` paired); `platform` env catalog (`VITE_APP_ENVIRONMENT`, `VITE_APP_ID`, `ERROR_LOG_ENVIRONMENT`); `database` note on signal tables.
7. `documentation/DOC_ERROR_LOGGING_CONTRACT.md` (owner OK) — surfaces → helpers, dedup, identity limits (no anon), privacy, allowed `N/A`, environment & retention. `DOC_INDEX.md` row.
8. Delete `documentation/jobs/temp_job_bug_dashboard/` (D12).
9. Run `align-harness` on touched skills/rules.

**Gate:** align-harness shows no contradictions; markdown link validator green.

## Phase 8 — Port to `plate-harness`

**Steps:** Copy Phases 1–4, 7 verbatim (shared files identical; plate's older `supabaseService` exports `getSupabase`/`isSupabaseConfigured` too). Rebuild Phase 5–6 UI with MUI (Dialog, Snackbar, Menu); Topbar/ProfileMenu live under `src/components/common/` in plate. Single-project staging note in contract doc (plate previews use production).

**Gate:** Tooling gate green in plate.

## Phase 9 — Verification (owner)

HANDOFF §7 against a chosen project: sign in → `upsert_error_log` twice same fingerprint → one row `count = 2`; non-admin `select` → own rows only; direct insert into `error_logs` fails; submit feedback → admin `handled` → submitter ack `completed`. Each branch pushed per Model C; owner merges.

## Notes during development

## Decisions made

| # | Topic | Choice | Precedent? |
|---|-------|--------|------------|
