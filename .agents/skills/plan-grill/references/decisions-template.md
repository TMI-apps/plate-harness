# DECISIONS.md template

Path: `documentation/jobs/temp_job_<name>/DECISIONS.md`

Create this file only when the first product decision is logged (asked tie **or** clear-winner log). Do **not** create an empty stub.

```markdown
# Decisions — <job name>

Job: `temp_job_<name>`
Updated: <ISO date>

## Closed

| id | topic | status | choice | source | notes |
|----|-------|--------|--------|--------|-------|
| D1 | <short topic> | closed | <picked option / clear-winner label> | grill-me \| plan-grill \| plan-grill-auto | <one line> |

## Open

| id | topic | status | options briefly | blocked phase |
|----|-------|--------|-----------------|---------------|
| D2 | <short topic> | open | A / B / … | Refine \| Investigate \| Create |

## Log

- <ISO datetime> — D1 closed via <grill-me|plan-grill|plan-grill-auto> (<asked|clear-winner|agent-pick>)
```

### Field rules

- **id** — stable `D1`, `D2`, … never reuse.
- **status** — `open` | `closed`.
- **source** — which skill wrote the row (`grill-me` | `plan-grill` | `plan-grill-auto` | `feature`). `plan-grill-auto` rows are Closed (`agent-pick` or `clear-winner`); no Open row waiting on the user.
- **Anti-dup** — before asking, scan **Closed** + **Open**; skip any topic already decided or currently open awaiting answer.
- **Clear winner** — append to **Closed** with note `clear-winner`; do not ask.
- **Tie** — add **Open** row, ask once (grill question style), then move to **Closed**.
