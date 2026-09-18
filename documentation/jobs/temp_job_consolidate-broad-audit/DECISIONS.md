# Decisions — consolidate broad-target audit

Job: `temp_job_consolidate-broad-audit`
Updated: 2026-09-18

## Closed

| id | topic | status | choice | source | notes |
|----|-------|--------|--------|--------|-------|
| D1 | Audit contract | closed | Required Target + audit-then-stop + lesmateriaal warrant rubric | plan-grill | asked — user picked `target_warrant`; landed in skill + router |
| D2 | Generality | closed | Instance — this repo’s `consolidate` skill | plan-grill | clear-winner — one consumer (harness); no second product kind in scope |
| D3 | Non-goals this pass | closed | No discovery-budget cap; no lesmateriaal deepening lens | plan-grill | clear-winner — those were option D / extra semantic-placement; user stopped at C |
| D4 | Audit artifact | closed | Chat Phase 5 report only; no job markdown unless user asks | plan-grill | clear-winner — existing Present Findings template; matches file-placement lean docs |
| D5 | Hits outside Target | closed | Broad sweep; report focused on Target + related code; do not treat whole `src/` as the Target | plan-grill | asked — user Other: “sweep broadly but keep the focus at the target and related code” |
| D6 | What counts as related | closed | Import neighborhood — Target files plus callers/callees | plan-grill | asked — `import_neighborhood` |
| D7 | Execute blast radius | closed | Phase 6 migrates Target + neighborhood files that contain the same pattern | plan-grill | asked — `pattern_in_neighborhood` |
| D8 | Neighborhood depth | closed | One hop — direct callers and callees only | plan-grill | clear-winner — transitive closure ≈ whole `src/`, fights D5 |
| D9 | Scoring universe | closed | Warrant Frequency/gates count all same-pattern hits from the broad sweep; report/execute still Target + 1-hop pattern files; leftover hits listed out-of-focus | plan-grill | clear-winner — D5 sweep exists so Rule of Three is not blind |

## Open

_(none)_

## Log

- 2026-09-18 — D1 closed via plan-grill (asked, prior turn `target_warrant`)
- 2026-09-18 — D2–D4 closed via plan-grill (clear-winner)
- 2026-09-18 — D5 opened via plan-grill (asked)
- 2026-09-18 — D5 re-ask — user retracted `strict`
- 2026-09-18 — D5 closed via plan-grill (asked) — broad sweep, focus Target + related
- 2026-09-18 — D6 opened via plan-grill (asked)
- 2026-09-18 — D6 closed via plan-grill (asked) — import neighborhood
- 2026-09-18 — D7 opened via plan-grill (asked)
- 2026-09-18 — D7 closed via plan-grill (asked) — migrate pattern files in neighborhood
- 2026-09-18 — D8–D9 closed via plan-grill (clear-winner)
