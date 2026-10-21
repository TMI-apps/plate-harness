# Decisions: signal backlog (backlog-management + error capture + feedback)

Product / scope ledger (`plan-grill`). Impl-time choices go in `DEVELOPMENT_PLAN.md` § Decisions made.

Source: MILA `.agents/skills/backlog-management/SKILL.md` + MILA `documentation/jobs/temp_job_boilerplate_export/HANDOFF.md` (export folder itself was not available; SQL is rebuilt from MILA migrations).

| # | Topic | Options considered | Choice | Source | Status |
|---|-------|--------------------|--------|--------|--------|
| D1 | How much of the skill to ingest | tasks core + dormant signals / full skill + infra lift / tasks only | **Tasks + automatic error capture + feedback capture.** Rule: every runtime error reaches the error log when Supabase is connected. Debug/bug skills fetch from those errors. Feedback: UI submit → DB → agent works it. | owner | Closed |
| D2 | Router vs skill overlap on idle `/router` | router delegates / keep both | **Router delegates** idle dispatch to `backlog-management`; router § App task backlog shrinks to a pointer. Archive may be read during catch-up only. | owner | Closed |
| D3 | `links[]` on tasks | add now / defer | **Add now** (type, domain validation, plugin passthrough, preserved on complete/restore). | owner | Closed |
| D4 | Companion skills | finish handoff only / + `bugs` skill / neither | **`finish` § Backlog review handoff**; no `bugs` skill — defects route to `debug`, which gains a signal-intake step. | owner | Closed |
| D5 | Admin check in DB | JWT `app_metadata.role` / `public.users.role` table | **JWT `app_metadata.role` in (`admin`,`super-admin`)**; `is_admin_user()` created only if missing. | owner | Closed |
| D6 | UI scope | submit + admin inbox / submit only / full MILA loop | **Full MILA loop:** submit modal, admin feedback inbox, admin error triage, submitter "handled ✓/✗" notification + ack, realtime. | owner | Closed |
| D7 | Signal status write mode | data migration / direct MCP / handoff | **Configurable, default `mcp`** (write on the signal's own project; confirm target before production; list closed ids in the commit message). `migration` and `handoff` remain options in the skill's Configure table. | owner | Closed |
| D8 | Edge helpers with no Edge Functions yet | include / skip | **Include** `supabase/functions/_shared/errorTriage.ts` + rule that Edge handlers use it. | owner | Closed |
| D9 | `bugs` / `bug_error_hashes` tables | port / drop | **Drop** — no consumer after D4; task `links[]` replaces bug grouping. | clear-winner | Closed |
| D10 | Pre-login errors (`anon`) | allow anon writes / authenticated + service_role only | **Authenticated + service_role only** (MILA contract; anon write would be an open spam sink). Pre-login failures stay console-only and are documented as an allowed gap. | clear-winner | Closed |
| D11 | Both harnesses | bronze only / both | **Both**; non-UI files identical; UI built per kit (shadcn in bronze, MUI in plate). | owner (request) | Closed |
| D12 | Existing `temp_job_bug_dashboard` plan | keep / supersede | **Superseded** by this job; delete that folder at `finish`. | clear-winner | Closed |
