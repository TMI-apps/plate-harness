# Align-harness issue table — 2026-09-23

Mode: `--full` (scan + lenses 1–8). Phase 0 atomic content ledger deferred until an approved edit (no-loss input). Diagram: `skill-relationship-flow: needs update`.

## Applied

2026-09-23 — user picked rows **1–5**.

2026-09-23 — user asked to update everything stale. Applied **6** (diagram: `review-dev-plan`, auto `agent-accept`, dead canvas path removed), **7** (registry census: `align-harness`, `update-harness`, `dont-reinvent-the-wheel`, `modularity-review`; `improve-skill-library` marked merged), **10** (Model B reports the push URL and stops; no `gh run watch`) in router, dev-cycle matrix, and layers doc. Also refreshed first-writer and plan-template writer lists so they include `plan-grill-auto`.

Not applied: **8** (checklist prose still repeated on purpose — owners stay `plan-grill` / `router`), **9** (always-on byte budget; trimming `architecture/RULE.mdc` is a separate plan).

Diagram verdict: `skill-relationship-flow: current`.

No-loss: prior trigger phrases and ask-vs-log tables unchanged. Model B `gh run watch` instruction **DROPPED** — approved as stale vs the shared-checkout rule (report URL and stop). **MISSING: 0**.

| # | tier | domain | where | issue | why | resolution | SSOT owner |
|---|------|--------|-------|-------|-----|------------|------------|
| 1 | blocking | skills | `plan-grill-auto`, `implement`, `pattern-review`, `plan` §5 | Auto agent-picks precedent, then `implement` still stops and asks the owner | Dead-end after the corridor | `implement`: if auto active, treat ledger pick as the waiver; `pattern-review`: one-line auto override | `plan-grill-auto` |
| 2 | blocking | skills | `plan-grill-auto`, `review-dev-plan`, `implement` | Auto says agent-run review then implement; review is Done only after user accepts; implement stops on `Required: pending` | Auto never reaches code | Auto records agent-accept in plan Decisions made and sets Plan review Done | `plan-grill-auto` |
| 3 | blocking | skills | `router` Gate 3, `feature`, `plan-grill-auto` | “Don’t ask me” plus a feature-shaped job routes to `feature` (🔴 stops) and also to auto (forbids `feature`) | Two primaries | Router: auto wins → `plan` corridor, not `feature`, unless user said `/feature` or “ask me” | `router` |
| 4 | blocking | skills | `plan-grill-auto` § Triggers | Bare “don’t ask me” lasts the whole job and bans every question | Collides with `debug` intake and protected-file consent | Scope triggers to plan-corridor product/scope forks; carve out protected files, `debug`, `finish`/`push` confirms | `plan-grill-auto` |
| 5 | blocking | skills | `plan-grill-auto` → `quick-piv` | XS handoff says no questions; `quick-piv` still asks 1–2 and pauses on DRAFT vision | Auto contract dies on small work | `quick-piv`: if auto active, agent-fill, log `vision-deferred`, no AskQuestion | `plan-grill-auto` |
| 6 | advisory | skills | `skill-relationship-flow.md` | Diagram has auto only as rail `pick`; omits `review-dev-plan` between plan file and implement | Stale vs live handoff | Add M/L node and auto exit that skips Present | `skill-relationship-flow.md` |
| 7 | advisory | skills | `REGISTRY.md` | Phantom `improve-skill-library`; missing `align-harness`, `update-harness`, `dont-reinvent-the-wheel`, `modularity-review` | Catalog drift | Refresh census to match disk | `REGISTRY.md` |
| 8 | advisory | skills | `plan`, `router`, `DOC_AGENT_WORKFLOW_LAYERS` | Fork checklist and corridor prose copied in several files | Drift risk | Keep checklist in `plan-grill`; others link | `plan-grill` |
| 9 | advisory | rules | always-on `.mdc` | 97530 bytes vs 32768 budget; `architecture/RULE.mdc` alone is 36116 | Context load | Separate plan; do not trim in this pass | `architecture/RULE.mdc` |
| 10 | advisory | skills | `router` Model B CI row | Thread table says `gh run watch`; operator rule says do not block on Actions after push | Agents occupy the shared checkout | Point Model B at report-URL-and-stop | `router` |
