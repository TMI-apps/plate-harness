---
name: review-dev-plan
description: >-
  Runs seven parallel Task subagents to critique a development plan (feedback only).
  One fixed lens checks category-vs-instance naming.
  IF DEVELOPMENT_PLAN.md exists AND Summary says Plan review: Required: pending (M/L)
  THEN use this skill. Not for repo-rule compliance (validate plan-review mode).
  Grades against the plan's Review contract; findings outside it are advisory.
  No code edits; plan edits only for accepted findings, logged as Amendments.
disable-model-invocation: false
---

# Review Dev Plan (`/review-dev-plan`)

## Config

```text
SUBAGENT_MODEL=composer-2.5
```

Every **Task** subagent: `model` = slug above (must be valid for your Cursor build; edit the value only).

> **Feedback first** — do not change code or rules. Edit the plan only per § After (accepted items + Amendments). Reply with a **short synthesis** in chat.

## Which plan?

Resolve in order:

1. Path in the user message.
2. Focused plan file in the editor.
3. Infer `documentation/jobs/**/DEVELOPMENT_PLAN.md` (state assumption).
4. Legacy `IMPLEMENTATION_PLAN.md` or `plan.md` under `documentation/jobs/` (state assumption).
5. If still ambiguous, **one** question; **no** subagents until the plan is known or pasted.

## Run: seven parallel Task agents (one turn)

Self-contained prompts each; they do not see this chat. Each: **orient** (e.g. `ARCHITECTURE.md`, `documentation/DOC_INDEX.md`, `documentation/DOC_APP_VISION.md`, relevant `.cursor/rules/`, paths/READMEs the plan touches) → **read the plan** (path or pasted text) → **structured feedback** (gaps, risks, sequencing, validation, boundaries, checklist quality).

The **Industry precedent** agent must read [`.agents/skills/pattern-review/references/rubric.md`](../pattern-review/references/rubric.md) and [`alert-template.md`](../pattern-review/references/alert-template.md) (same as [`pattern-review`](../pattern-review/SKILL.md)).

**Perspectives (7):**

| # | Role |
| --- | --- |
| 2 | **You pick** — distinct lenses (e.g. delivery, tests, security/ops, UX/API); **not** rebel, scale/mod, industry precedent, or naming generality. |
| 1 | **Naming generality (fixed)** — see § Naming generality below. Not optional. |
| 1 | **Rebel (fixed)** — when a **clean-slate / different approach** is better; say so plainly + high-level alternative. No incremental polish only. |
| 1 | **Scalability / modularity (fixed)** — scale (load, cost, ops, data growth, failure modes, ceilings) **and** evolution (coupling, layers, ports, swappable deps, extension points, lock-in, future-you debt). |
| 1 | **Industry precedent (fixed)** — compare the plan to common product/engineering practice using [`.agents/skills/pattern-review/references/rubric.md`](../pattern-review/references/rubric.md): pick relevant aspects for *this* plan, name precedents, flag material divergence and missing § Pattern & precedent content. |

### Naming generality (fixed lens)

The prompt must tell this agent to read `.cursor/rules/code-style/RULE.mdc` § Category, not instance, then scan the plan for names that are more specific than the job.

Flag a **must-fix** when a new function, hook, component, type, file, feature folder, glob, or "put new code here" line encodes the first caller, SKU, page, vendor, ticket, or host, and a category name would still fit a second instance. One caller is not a reason to pass. A placement table that names one concrete file as the home is the same finding.

Do not flag: test titles (`should … when …`); an example explicitly marked as the wrong name; a path labeled as one shipped instance rather than the template. Do not invent a replacement product name.

Return must-fix vs nice-to-have. If nothing is too specific, say so in one line.

Short `description` per Task (e.g. “— rebel”, “— scale/mod”, “— industry precedent”, “— naming generality”).

### Grade against the contract

Every prompt includes the plan's **Review contract** and sibling `DECISIONS.md`. Each finding carries a **basis**:

| Basis | Meaning | Can be must-fix? |
|-------|---------|------------------|
| `contract` | Cites a contract line (pinned rule, required lens, tooling gate) the plan fails | Yes |
| `advisory` | Outside the contract — rebel alternative, scale concern, extra lens, rule newer than the pin | No — nice-to-have until the user promotes it |

Already decided means not a finding: a choice Closed in `DECISIONS.md`, a diversion confirmed in Conflict & compliance, or a Pattern & precedent waiver is not re-flagged. The naming lens is `contract` when `code-style` is a pinned rule.

Legacy plan with no Review contract: treat Conflict & compliance § Applicable rules plus the template's required lenses as the contract, and say so in the synthesis.

## After

Synthesize: agreements, **must-fix (contract)** vs **advisory**, items **≥2 agents** flagged. Include every **naming generality** finding in that synthesis even when only that agent raised it. Fold in user constraints (scope, timebox, risks) if given. Ask the user which advisory items to promote.

**Done means amended.** Before **Plan review** becomes `Done <date>`, each accepted must-fix and promoted advisory item is either:

- applied to the affected plan section (steps, gate, contract), with one **Amendments** row (`source: review-dev-plan`), or
- waived with one **Amendments** row stating the waiver.

Edits stay limited to what the accepted items name. Do not rewrite unrelated sections. Not-promoted advisory items are listed in **Notes during development** so they stay visible without binding the implementer.

IF `plan-grill-auto` is active: do not ask. The agent applies every `contract` must-fix itself, logs the Amendments rows, does not promote advisory items, records `agent-accept <date> — plan-grill-auto` in **Decisions made**, then sets **Plan review** to `Done <date>`.

**Next:** **`.agents/skills/validate/SKILL.md`** (plan-review) when **Plan validate** is `Required: pending`; else **`.agents/skills/implement/SKILL.md`** when **Plan review** is `Done` and gates pass — or back to **`plan`** if the plan must change materially.

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
