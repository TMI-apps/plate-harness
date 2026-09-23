---
name: quick-piv
description: >-
  Orchestrates compressed Plan → Implement → Validate for small XS/S scoped changes in one
  session without a full DEVELOPMENT_PLAN.md. Use for focused fixes and tweaks. Not M/L work,
  migrations, or when plan review or pattern-review gates are required (use full plan cycle).
---

# quick-piv

Lightweight Plan → Implement → Validate in one workflow. **Primary outcome:** land a **small (XS/S)** scoped change in one session. This skill **orchestrates** compressed steps — full procedures live in sibling skills (`plan`, `implement`, `validate`, `finish`).

**Critical:** Still follow repo rules. No changelog updates (`.agents/skills/finish/SKILL.md` handles that).

**Related:** Full formal cycle: `.agents/skills/plan/SKILL.md` → `.agents/skills/implement/SKILL.md` → `.agents/skills/validate/SKILL.md`. Session context: `.agents/skills/prime/SKILL.md`. Architecture/quality gate: `.agents/skills/validate/SKILL.md` (auto-selects gate depth).

---

## When to use

- Small, focused changes (e.g. fix a bug, small UI tweak, refactor one component).
- User wants to move fast without separate plan / implement / validate invocations.
- Task is scoped enough that a full `DEVELOPMENT_PLAN.md` is unnecessary.

**When NOT to use:** Large features, multi-phase work, database migrations, breaking changes, **Complexity M/L**, pending **Plan review**, or missing **Pattern & precedent** when required → use full `plan` → `implement` → `validate` instead.

## Branch gate

- [ ] Before any code edit: read `src/config/git-workflow.json`. Apply `.cursor/rules/git-workflow/RULE.mdc` § Mode-aware branch gate.

## Hard stops (M/L and gates)

Deleting a path, engine, or module is **never** `quick-piv`, even when it looks small — route to **`.agents/skills/purge-skill/SKILL.md`** so the reference map and residue sweep happen. Only a single unreferenced file stays a direct edit.

Before implementing, if **Branch A** loads a plan with **Complexity M** or **L**, or **Plan review: Required: pending**, or incomplete **Pattern & precedent** when required — **stop** and route to **`.agents/skills/implement/SKILL.md`** (after `review-dev-plan` / `pattern-review` per [dev-cycle matrix](../router/references/dev-cycle-matrix.md)). Do **not** continue in `quick-piv`.

---

## Context detection (first step)

Determine whether an **active plan** exists:

- **Open / recent files:** Is a file under `documentation/jobs/temp_job_*/DEVELOPMENT_PLAN.md` open or recently viewed?
- **User message:** Job name, “the plan”, or explicit path to a job folder?
- **Recent context:** Was the thread about executing a specific `DEVELOPMENT_PLAN.md`?

If unclear, **ask** which branch applies.

### Branch A: Active plan exists

→ Load that `DEVELOPMENT_PLAN.md`. Apply **Hard stops** above. If allowed (XS/S, gates clear): **Quick plan** = extend where appropriate. Then **implement** extension, then **quick validate** (inline tooling — not full **`validate`** skill unless user asks).

### Branch B: No active plan

→ **Vital:** Output the quick plan **in chat first** (user must see it). Only then **implement**, then **quick validate**. No `DEVELOPMENT_PLAN.md` required.

---

## Quick plan (always)

**Branch A:** Extension to existing plan — add a phase, append steps, or scope the extension in chat; update the plan doc when the doc is the source of truth.

**Branch B:** **Vital — plan appears in chat before any code changes.** Format:

```markdown
**Quick plan**

- **Goal:** [1 sentence — align with `documentation/DOC_APP_VISION.md` when the change touches product meaning; if vision is `DRAFT`, pause for fill or explicit deferral]
- **Steps:** [3–5 bullet points, rules-compliant]
- **Gate:** [How we verify it works]
```

**Process:**

**IF `plan-grill-auto` is active:** skip user questions in steps 1 and 4 and the DRAFT-vision pause in the Goal line. Fill from repo + `DOC_APP_VISION.md`. If vision is `DRAFT`, log `vision-deferred` in chat and continue. Precedent diversions: pick one, one line in chat, continue. Still print the quick plan in chat before code.

1. If the request is vague, or ambiguity appears during quick investigation, stop and ask 1–2 clarifying questions about the user's vision for how the app will be used. Do not choose between plausible interpretations silently.
2. Quick investigation: search codebase; skim `.cursor/rules/INDEX.md` for applicable rules; use `documentation/DOC_TANSTACK_QUERY.md` if server state / queries are involved. If the change is a generic subsystem not obviously covered by current deps, run `.agents/skills/dont-reinvent-the-wheel/SKILL.md` (skip when bespoke / tiny).
3. Sanity-check file placement against `.cursor/rules/file-placement/RULE.mdc` and `projectStructure.config.cjs`.
4. Check whether the quick plan would diverge from industry standards, framework best practices, or established repo conventions. If yes, ask whether the diversion is intentional or whether to align with best practices before implementing.
5. **Branch B:** Output the quick plan in chat (vital). **Branch A:** Optionally extend the plan document.
6. Proceed to implementation (no separate approval wait unless the user stops you).

---

## Implement

1. **Branch A:** Run the extension (new phase/steps) or the next pending phase from the loaded plan.
2. **Branch B:** Execute the quick plan already shown in chat.
3. Follow `.cursor/rules/architecture/RULE.mdc`, `.cursor/rules/file-placement/RULE.mdc`, `.cursor/rules/code-style/RULE.mdc`, and `.cursor/rules/security/RULE.mdc` when relevant.
4. Run the **gate** from the quick plan (browser MCP when UI is involved; tests or manual checks as appropriate).
5. **Branch A:** Update the plan (phase status, Notes, Decisions) as you go.
6. Before `finish`, if this pass created a `src/features/` folder or added a UI/data vendor: run [`.agents/skills/modularity-review/SKILL.md`](../modularity-review/SKILL.md).

---

## Validate (quick pass — not the `validate` skill)

After implementation, run **inline tooling** only (subset of `.agents/skills/validate/SKILL.md` § Tooling pass):

1. `pnpm validate:structure` — report failures.
2. `pnpm lint` — report failures.
3. `pnpm type-check` — report failures.
4. `pnpm arch:check` — report failures (dependency-cruiser; defined in `package.json`).
5. **Report:** Brief summary: “✅ All checks pass” or list findings with severity (blocker / warning / suggestion).
6. **If failures:** Ask: “Fix these? (all / specific / skip)” — only fix after the user chooses (same spirit as `.agents/skills/validate/SKILL.md`, compressed).

**Next:** Offer full **`.agents/skills/validate/SKILL.md`** before merge/finish when rule fan-out or plan-compliance is needed. Offer **`.agents/skills/finish/SKILL.md`** only when the user wants to commit.

---

## Rules reference (follow during implementation)

See [`.cursor/rules/INDEX.md`](../../../.cursor/rules/INDEX.md) and [`.agents/skills/plan/references/rules-registry.md`](../plan/references/rules-registry.md).

**Also when applicable:** `ARCHITECTURE.md`, `documentation/DOC_TANSTACK_QUERY.md`.

## Boundaries

| Not `quick-piv` | Use instead |
|-----------------|-------------|
| M/L plan or pending plan review | `implement` after gates |
| Unknown root cause bug | `debug` |
| Full rule subagent audit | `validate` |
| Commit / changelog | `finish` |
| Durable multi-phase plan | `plan` |
| Delete a path / engine / module | `purge-skill` |

---

## Summary flow

| Step | Branch A (has plan) | Branch B (no plan) |
|------|---------------------|---------------------|
| 1 | Load plan + extend where appropriate | **Output quick plan in chat first** (vital) |
| 2 | Implement (extension or next phase) | Implement |
| 3 | Quick validate (inline tooling) | Quick validate (inline tooling) |

**Next:** Full **`validate`** when needed → user sign-off → **`finish`** when user wants to commit.
