# `DEVELOPMENT_PLAN.md` template

Use as a menu aligned with [`.agents/skills/plan/SKILL.md`](../SKILL.md). Output path:

`documentation/jobs/temp_job_<name>/DEVELOPMENT_PLAN.md`

## Skeleton

```markdown
# Development plan: <Title>

## Summary

- **Goal:**
- **Why:**
- **Complexity:** XS | S | M | L — <one-line reason>
- **Plan review:** Not required | Required: pending | Done <YYYY-MM-DD> | Waived: <reason>
- **Scope / constraints:**

## Phase overview

| Phase | Goal | Gate | Status |
|-------|------|------|--------|
| 1 | … | … | Pending |

## Conflict & compliance

- Applicable rules:
- File placements:
- Reuse / packages: <`dont-reinvent-the-wheel` rec, or skipped — reason>
- Risks / open questions:
- Standards diversions (repo / industry):

## Pattern & precedent

Required when Complexity is **M** or **L**; recommended for **S** when the plan introduces new user-visible behavior or contracts. Use [`pattern-review`](../../pattern-review/SKILL.md) `plan-section` mode ([`references/rubric.md`](../../pattern-review/references/rubric.md) — agent picks relevant aspects).

| Field | Value |
|-------|--------|
| **Capability** | What user-facing or contractual behavior this plan delivers (one line) |
| **Precedents** | 1–3 familiar products, apps, or patterns this resembles |
| **Aspects reviewed** | Bullets: dimensions the agent actually compared (from rubric pool; add others if needed) |
| **Findings** | Short per aspect: aligns / diverges / risk |
| **Verdict** | `Aligns with precedent` / `Acceptable product-specific` / `Non-standard — waiver recommended` |
| **If non-standard: options** | A / B / C one line each |

If pattern review was skipped (XS, no new behavioral contract), one line: **Pattern review:** skipped — <reason>.

## Notes during development

(Leave empty in the initial plan.)

## Decisions made

Impl-time only (`implement` fills). Product/scope forks → sibling `DECISIONS.md` (`grill-me` / `plan-grill` / `plan-grill-auto` / `feature`).

| # | Topic | Choice | Precedent? |
|---|-------|--------|------------|
```

See [`complexity-rubric.md`](complexity-rubric.md) for Complexity levels.
