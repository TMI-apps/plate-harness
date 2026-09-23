---
name: review-dev-plan
description: >-
  Runs six parallel Task subagents to critique a development plan (feedback only).
  IF DEVELOPMENT_PLAN.md exists AND Summary says Plan review: Required: pending (M/L)
  THEN use this skill. Not for repo-rule compliance (validate plan-review mode).
  No code or plan edits unless the user asks afterward.
disable-model-invocation: false
---

# Review Dev Plan (`/review-dev-plan`)

## Config

```text
SUBAGENT_MODEL=composer-2.5
```

Every **Task** subagent: `model` = slug above (must be valid for your Cursor build; edit the value only).

> **Feedback only** — do not change code, rules, or the plan unless the user asks afterward. Reply with a **short synthesis** in chat.

## Which plan?

Resolve in order:

1. Path in the user message.
2. Focused plan file in the editor.
3. Infer `documentation/jobs/**/DEVELOPMENT_PLAN.md` (state assumption).
4. Legacy `IMPLEMENTATION_PLAN.md` or `plan.md` under `documentation/jobs/` (state assumption).
5. If still ambiguous, **one** question; **no** subagents until the plan is known or pasted.

## Run: six parallel Task agents (one turn)

Self-contained prompts each; they do not see this chat. Each: **orient** (e.g. `ARCHITECTURE.md`, `documentation/DOC_INDEX.md`, `documentation/DOC_APP_VISION.md`, relevant `.cursor/rules/`, paths/READMEs the plan touches) → **read the plan** (path or pasted text) → **structured feedback** (gaps, risks, sequencing, validation, boundaries, checklist quality).

The **Industry precedent** agent must read [`.agents/skills/pattern-review/references/rubric.md`](../pattern-review/references/rubric.md) and [`alert-template.md`](../pattern-review/references/alert-template.md) (same as [`pattern-review`](../pattern-review/SKILL.md)).

**Perspectives (6):**

| # | Role |
| --- | --- |
| 2 | **You pick** — distinct lenses (e.g. delivery, tests, security/ops, UX/API); **not** rebel, scale/mod, or industry precedent. |
| 1 | **Rebel (fixed)** — when a **clean-slate / different approach** is better; say so plainly + high-level alternative. No incremental polish only. |
| 1 | **Scalability / modularity (fixed)** — scale (load, cost, ops, data growth, failure modes, ceilings) **and** evolution (coupling, layers, ports, swappable deps, extension points, lock-in, future-you debt). |
| 1 | **Industry precedent (fixed)** — compare the plan to common product/engineering practice using [`.agents/skills/pattern-review/references/rubric.md`](../pattern-review/references/rubric.md): pick relevant aspects for *this* plan, name precedents, flag material divergence and missing § Pattern & precedent content. |

Short `description` per Task (e.g. “— rebel”, “— scale/mod”, “— industry precedent”).

## After

Synthesize: agreements, **must-fix vs nice-to-have**, items **≥2 agents** flagged. Do not rewrite the plan unless asked. Fold in user constraints (scope, timebox, risks) if given.

**Allowed plan edits without full rewrite:** Update only the **Plan review** row in Summary and rows in **Decisions made** when the user accepts the critique (or record waiver in **Decisions made**). Do not edit phase steps, Pattern & precedent body, or other sections unless the user explicitly asks.

Update the plan’s **Plan review** row to `Done <date>` when the user accepts the critique (or record waiver in **Decisions made**). IF `plan-grill-auto` is active: do not ask — record `agent-accept <date> — plan-grill-auto` in **Decisions made** and set **Plan review** to `Done <date>`.

**Next:** **`.agents/skills/implement/SKILL.md`** when **Plan review** is `Done` and gates pass — or back to **`plan`** if the plan must change materially.

## Boundaries

| Skill | Role |
|-------|------|
| **`review-dev-plan`** | Qualitative multi-lens plan critique (includes industry precedent) |
| **`validate`** | Parallel **repo rule** subagents (`.cursor/rules/`) — JSON findings |

For Complexity **M/L** OR plans that touch security/DB/workflow rules, run **`review-dev-plan` AND `validate` (plan-review)**. IF only qualitative critique is requested THEN `review-dev-plan` alone.

## Related

- [`validate`](../validate/SKILL.md) — rule-shaped plan-review vs impl-review
- [`pattern-review`](../pattern-review/SKILL.md) — industry precedent procedure and rubric SSOT
- [`plan`](../plan/SKILL.md) — creates `DEVELOPMENT_PLAN.md`
- [`feature`](../feature/SKILL.md) — product/requirements process
- [`implement`](../implement/SKILL.md) — executes the plan
