# Decisions — task-plan-registry

Job: `temp_job_task-plan-registry`
Updated: 2026-09-23

## Closed

| id | topic | status | choice | source | notes |
|----|-------|--------|--------|--------|-------|
| D1 | Task ↔ plan relationship | closed | Every task has exactly one plan (1:1), created at pick-up; quick-piv writes a small plan | plan-grill | Rejected: optional plan field (two task kinds); task-as-epic with N plans (nested schema). Onboarding tasks get their plan when picked up. |
| D2 | Task status source of truth | closed | Plan phase table authoritative; task keeps coarse `to-do` / `in-progress` / `done`, written by plan / implement / finish at boundaries | plan-grill | Rejected: board derives status by parsing plan (parser + fixed vocab); two independent manual statuses (drift). Accepts coarse progress and sync lag. |

## Open

| id | topic | status | options briefly | blocked phase |
|----|-------|--------|-----------------|---------------|
## Log

- 2026-09-23T10:35 — D1 closed via plan-grill (asked)
- 2026-09-23T23:19 — D2 closed via plan-grill (asked, answered in chat after AskQuestion failure)
