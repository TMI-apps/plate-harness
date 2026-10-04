# Decisions — category-name guidance

Job: `temp_job_category-name-guidance`
Updated: 2026-10-04

## Closed

| id | topic | status | choice | source | notes |
|----|-------|--------|--------|--------|-------|
| D1 | Scope: guidance vs app renames | closed | Guidance and docs only | plan-grill | clear-winner. Alternatives: (A) edit rules, skills, ARCHITECTURE.md, AGENTS.md; (B) also rename production symbols such as `useSupabaseConfig`. A wins: the bugs are instruction precedence. Renaming hooks changes imports and needs a user test this request did not include. |
| D2 | Generality: prose repair vs a new checker | closed | Targeted text and glob repair | plan-grill | clear-winner. Alternatives: (A) rewrite the loud lines; (B) add a linter that flags instance names in rules. A wins: a checker is extension machinery with no second consumer. Category naming already forbids that. |
| D3 | SQL migration home | closed | `supabase/migrations/` only in agent instructions | plan-grill | clear-winner. Alternatives: (A) file-placement names that folder only; (B) add root `migrations/` to the database-rule glob. A wins: root `migrations` in `projectStructure.config.cjs` allows `*.ts` and `README.md`, not SQL, and the folder is absent. The database rule already says it covers `supabase/migrations/` only. |
| D4 | When function rules load | closed | Globs match the homes the rule text already names | plan-grill | clear-winner. Alternatives: (A) `supabase/functions/**` and `cloud-functions/**`, drop `functions/` and `edge-functions/`; (B) `alwaysApply`; (C) keep the legacy globs and add `cloud-functions`. A wins: alwaysApply would load Supabase deploy guidance on every UI edit; keeping the old folder names is the bug. |
| D5 | Rate-limit rule scope | closed | Stay on Supabase Edge Functions; state the boundary | plan-grill | clear-winner. Alternatives: (A) keep `**/supabase/functions/**/*.ts` and say other hosts are out of scope; (B) add `cloud-functions/**` to `project-specific`. A wins: the procedure is Postgres `rate_limits` plus the service role. Loading it on other hosts would pile those hosts into `supabase/functions/_shared/rateLimit.ts`. |

## Open

| id | topic | status | options briefly | blocked phase |
|----|-------|--------|-----------------|---------------|

## Log

- 2026-10-04 — D1 closed via plan-grill (clear-winner)
- 2026-10-04 — D2 closed via plan-grill (clear-winner)
- 2026-10-04 — D3 closed via plan-grill (clear-winner)
- 2026-10-04 — D4 closed via plan-grill (clear-winner)
- 2026-10-04 — D5 closed via plan-grill (clear-winner)
