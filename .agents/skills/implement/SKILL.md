---
name: implement
description: >-
  Executes DEVELOPMENT_PLAN.md phase by phase with gates, progress updates, and repo-rule
  compliance. Use when the user asks to implement a plan or continue a job. Not planning (plan),
  changelog (finish), or read-only audits (validate).
---

# implement

Execute a development plan phase by phase. Use `DEVELOPMENT_PLAN.md` as the guide, run gates, and update the same document with progress, decisions, and notes.

**Critical:** Follow the plan. Follow repo rules during implementation. No shortcuts.

**Do NOT update the changelog.** Changelog updates are done in the finish command, not during implementation.

**Related:** Create or refresh plans with `.agents/skills/plan/SKILL.md`. For small tasks in one pass, `.agents/skills/quick-piv/SKILL.md`. Before starting (when plan says so), run `.agents/skills/review-dev-plan/SKILL.md`. After phases, use `.agents/skills/validate/SKILL.md` for a rules-and-tooling review before finish. Industry precedent: `.agents/skills/pattern-review/SKILL.md`. Package/pattern reuse: `.agents/skills/dont-reinvent-the-wheel/SKILL.md`. For session context, `.agents/skills/prime/SKILL.md`. For commits and changelog, `.agents/skills/finish/SKILL.md`.

---

## Input

- User states what to implement (e.g. “implement the my-project redesign plan”).
- **Context-based:** Infer which plan from job name, open file, or recent discussion.
- If ambiguous which `temp_job_<name>/` folder applies, **stop** and ask.

**Plan location:** `documentation/jobs/temp_job_<name>/DEVELOPMENT_PLAN.md`

---

## Flow

### 0. Branch gate

- [ ] Per `.cursor/rules/git-workflow/RULE.mdc` § Branch Strategy — verify branch before code edits; stop if on protected branches per that section.
- [ ] **CRITICAL:** If the plan touches protected files (`.husky/**`, `tsconfig*.json`, `.cursor/rules/**`, `.agents/skills/**`, etc.), **stop** and get explicit user approval before editing them. Full manifest: `.cursor/rules/agent-behavior/RULE.mdc` § Protected Files. Record consent in **Decisions made** when granted.

### 1. Load plan

- [ ] Read `DEVELOPMENT_PLAN.md` for the resolved job folder.
- [ ] If `DECISIONS.md` exists beside the plan: skim it. If any row is **open**, **soft-warn** in chat (list topics) — may proceed; do not hard-block. Prefer resolving with the user or `plan-grill` when the open topic still matters.
- [ ] If the plan’s **Summary** or acceptance criteria imply user-facing product change, skim `documentation/DOC_APP_VISION.md` for consistency; if **`DRAFT`**, flag to the user before heavy implementation.
- [ ] Verify mandatory sections exist: Summary, Phase overview, Conflict & compliance, Notes during development, Decisions made.
- [ ] If Summary **Complexity** is **M** or **L**, or the plan changes user-visible behavior/contracts: verify **Pattern & precedent** is filled (or explicitly skipped with reason).
- [ ] If the first pending phase would write nontrivial **custom** code for a generic subsystem (auth, parsers, queues, protocol clients, …) and Conflict & compliance has **no** reuse rec (and no “skipped — bespoke” line), run [`.agents/skills/dont-reinvent-the-wheel/SKILL.md`](../dont-reinvent-the-wheel/SKILL.md) once, record the rec in the plan, then continue. Skip when the plan already recorded a rec or skip reason.
- [ ] If **Plan review** is `Required: pending`, **stop** and route to `.agents/skills/review-dev-plan/SKILL.md` (or record waiver in **Decisions made**).
- [ ] If **Pattern & precedent** is `Non-standard — waiver recommended` without an explicit waiver in **Decisions made**, **stop** and ask the owner.
- [ ] Find the first phase in the overview that is not done (e.g. status `Pending`, empty, or not marked ✅).
- [ ] After a phase **creates** a `src/features/` folder or adds a UI/data vendor: run [`.agents/skills/modularity-review/SKILL.md`](../modularity-review/SKILL.md) before marking that phase done (do not unwrap unless the job asked).

### 2. Per phase: execute

For each phase **in order** (one phase at a time unless the plan explicitly allows parallel work):

1. **Read** the phase: Goal, Steps, Gate.
2. **Execute** the steps; match file layers, aliases, and patterns in `.cursor/rules/architecture/RULE.mdc` and `ARCHITECTURE.md`. **New identifiers** (function, hook, component, type, file, feature folder): follow `.cursor/rules/code-style/RULE.mdc` § Category, not instance — name the capability, not the first caller/SKU/page.
3. **Run** the gate (see below). It must pass before continuing.
4. **Update** `DEVELOPMENT_PLAN.md`:
   - **Phase overview:** set this phase’s status to `Done` or `✅` (use the wording/style already used in the table).
   - **Notes during development:** add entries when something notable happened.
   - **Decisions made:** add rows when a choice was made (see below).

### 3. Gate

- **Frontend:** Run the checks described in the plan (UI present, interactions, loading/error states, responsive if specified). Use the IDE browser MCP when available: navigate → snapshot → interact; follow the lock/unlock workflow in the MCP instructions.
- **Backend / Supabase:** As specified in the plan (e.g. migration applied, RLS checks, Edge Function invocation).
- **Repo quality:** When the plan or phase implies it, run `pnpm lint`, `pnpm type-check`, and relevant tests (`pnpm test:run`, `pnpm test:staged` for preview, or scoped files). For structural changes, `pnpm validate:structure` and/or `pnpm arch:check` when adding imports across layers.
- **Staged-test infra:** When adding or renaming `scripts/*staged*`, `scripts/*validator*`, `scripts/change-classify.cjs`, or `scripts/test-staged.cjs` → verify `TEST_INFRA_EXACT` / `TEST_INFRA_PREFIXES` in `scripts/change-classify.cjs` in the **same PR**; run `pnpm test:classify`. Record waiver in **Decisions made** if intentionally deferred.
- If the gate fails: fix, re-run the gate, then continue.
- If the plan’s gate is impossible (missing env, no browser): document in Notes, **ask** the user, then proceed only after agreement.

### 4. Next phase

- Repeat until every phase in the overview is done.

---

## Rules reference (follow while coding)

See [`.cursor/rules/INDEX.md`](../../../.cursor/rules/INDEX.md) and [`.agents/skills/plan/references/rules-registry.md`](../plan/references/rules-registry.md).

**Also:** `.dependency-cruiser.cjs` / `pnpm arch:check` for layer violations; `documentation/DOC_TANSTACK_QUERY.md` when changing server state or queries.

---

## Notes during development

**When to add:**

- Technical debt from current or prior code
- Unexpected obstacles
- Gaps not covered in the plan
- Suggestions for later (refactor, cleanup)
- **Mistake signals** — user correction, revert, or repeat failure (`request → wrong action → fix`); enables `finish` § Lesson check → optional `/learn`

**Format:** Chronological or by category.

**Example:**

```markdown
- [Phase 2] Removed legacy helper; orphan import in X.ts — clean up in a follow-up
- [Phase 3] Bar animation: MUI Transitions unsuitable for layout; used CSS transition instead
```

---

## Decisions made

**When to add:**

- Choices with no clear codebase precedent
- Subjective choices (design, UX, business rules)

**Important choices:**

1. **STOP** implementation
2. **ASK** the user explicitly
3. If the issue is ambiguity, ask about the user's intended app usage or product vision so the answer determines the decision
4. If the issue is a diversion from industry standards, framework best practices, or repo conventions, ask whether that diversion is intentional or whether to align with best practices
5. **WAIT** for an answer
6. **DOCUMENT** in Decisions made

**Format:**

```markdown
| Decision | Context | Outcome | User asked? |
|----------|---------|---------|-------------|
| Bar animation: CSS not MUI | MUI Transitions unsuitable for layout | CSS transition 300ms | Yes |
| Chips: hover state | No precedent | Match existing chip pattern | No |
```

---

## Unexpected obstacles

If something is not covered by the plan:

- Add an entry under **Notes during development**
- **STOP** and ask the user: “I hit [X]. The plan does not cover this. How should we proceed?”
- If the gap is unresolved ambiguity, ask a specific app-usage or product-vision question.
- If the gap reveals an undocumented standards diversion, ask whether to keep the diversion or realign with best practices.
- Wait for an answer, then continue and record any decision

---

## Documentation

If the plan requires doc updates (e.g. `src/features/<feature>/README.md`, `ARCHITECTURE.md`), do them in the phase that introduces the behavior. Follow the plan and `.cursor/rules/file-placement/RULE.mdc`.

---

## Checklist per phase

- [ ] Phase steps executed
- [ ] Gate passed
- [ ] Phase overview status updated
- [ ] Notes updated (if applicable)
- [ ] Decisions updated (if applicable)

---

## Completion

When all phases are done:

- [ ] Plan fully executed
- [ ] All gates passed
- [ ] Notes and Decisions sections are up to date

**Tell the user:** “Implementation complete.”

**Next (mandatory handoff):**

1. Run **`.agents/skills/validate/SKILL.md`** (impl review) on this job unless the user explicitly skips validation.
2. After the user accepts validation (or waives in **Decisions made**), offer **`.agents/skills/finish/SKILL.md`** when they want to commit — do not commit without explicit request.

Do **not** use **`quick-piv`** for remaining phases when a durable `DEVELOPMENT_PLAN.md` exists.

## Boundaries

| Not `implement` | Use instead |
|-----------------|-------------|
| Small XS/S change without durable plan | `.agents/skills/quick-piv/SKILL.md` |
| Creating or rewriting the plan | `.agents/skills/plan/SKILL.md` |
| Qualitative plan critique (M/L) | `.agents/skills/review-dev-plan/SKILL.md` |
| Industry precedent on the plan | `.agents/skills/pattern-review/SKILL.md` |
| Package / pattern reuse vs custom | `.agents/skills/dont-reinvent-the-wheel/SKILL.md` |
| Version, changelog, commit | `.agents/skills/finish/SKILL.md` |
| Active debugging with unknown cause | `.agents/skills/debug/SKILL.md` |
| User asks to delete leftovers / the old engine / path after a phase | Stop implement → `.agents/skills/purge-skill/SKILL.md` |
