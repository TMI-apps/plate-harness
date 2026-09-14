---
name: plan
description: >-
  Creates DEVELOPMENT_PLAN.md with repo-rule compliance researched first (file placement,
  architecture, patterns). Runs plan-grill as a rail beside Refine/Investigate/Create
  (mandatory fork checklist; anti-dup via DECISIONS.md). Use for new features, M/L work,
  or /plan. Not XS/S quick changes (quick-piv), product-only requirements (feature), or
  changelog updates (finish).
---

# plan

Create a development plan for a feature or job. Research how best to implement it, check repo rules, and produce `DEVELOPMENT_PLAN.md` in `documentation/jobs/temp_job_<name>/`.

**Critical:** Conflict and compliance is researched first; steps in each phase must reflect that (file placements, architecture, patterns). The plan documents *how* to implement according to repo rules. **`plan-grill` is a rail beside every corridor phase** (Refine / Investigate / Create) — run its **mandatory fork checklist** before locking product/scope/architecture-boundary choices. Do not invent one approach and call it done.

**Do NOT update the changelog.** Changelog updates are done in the finish command, not during planning.

**Templates:** [`references/implementation-plan-template.md`](references/implementation-plan-template.md), [`references/complexity-rubric.md`](references/complexity-rubric.md).

**Related:** For session context, use `.agents/skills/prime/SKILL.md`. For product forks during this skill, `.agents/skills/plan-grill/SKILL.md`. For architecture/quality gate before merging, use `.agents/skills/validate/SKILL.md` (auto-selects gate depth). For small scoped work without a full plan file, use `.agents/skills/quick-piv/SKILL.md`. To execute this plan phase by phase, use `.agents/skills/implement/SKILL.md`. For repo-rule plan/impl review, use `.agents/skills/validate/SKILL.md`. For multi-lens plan critique (including industry precedent), use `.agents/skills/review-dev-plan/SKILL.md`. For industry precedent on plans/proposals, use `.agents/skills/pattern-review/SKILL.md`. For package/pattern reuse vs custom code, use `.agents/skills/dont-reinvent-the-wheel/SKILL.md`. For commits and changelog, use `.agents/skills/finish/SKILL.md`.

---

## Flow

### 0. Branch gate

- [ ] **Plan file:** `DEVELOPMENT_PLAN.md` may be created on any branch per `.cursor/rules/git-workflow/RULE.mdc` § Exceptions (Safe to Edit on Any Branch).
- [ ] **Implementation:** App-code work follows `.cursor/rules/git-workflow/RULE.mdc` § Mode-aware branch gate (read `src/config/git-workflow.json` first). Route to `implement` from a branch the gate allows (`feature/*` / `fix/*` in Model A; `develop` in Model B).

### 1. Input

- User describes what they want (e.g. add a capability, migrate X to Y).
- Optional: job name, reference to spec or ticket.
- Optional: prior [`standards-align`](../standards-align/SKILL.md) report (gap table + Should/How decisions) when planning an Align-hard / Reframe path.
- Optional: `feature` Phase 4 approved summary when planning after the feature skill.

### 2. Refine (if needed)

**If the request is vague or unclear, do NOT write a plan yet.** Split who asks what:

| Kind of ambiguity | Owner |
|-------------------|--------|
| **Product / scope / edge / architecture-boundary** | [`.agents/skills/plan-grill/SKILL.md`](../plan-grill/SKILL.md) **rail** — mandatory fork checklist; anti-dup via `DECISIONS.md`. Skip for XS/`quick-piv`. |
| **Gate 2 — engineering acceptance** (concrete examples, API shapes, schemas, RLS needs, interactive states) | Stay in § Refine (table below). Do **not** use `plan-grill` for these alone. |

- If product ambiguity remains and `DOC_APP_VISION.md` answers **who** / **why**: read it first; if still **`DRAFT`**, pause for fill or deferral before locking scope.
- **Before leaving Refine:** run plan-grill fork checklist on every open scope/non-goal/success topic; loop is ask → write `DECISIONS.md` → **continue Refine** until clear. Then finish gate-2 questions.
- Only proceed to investigation once product scope is clear **and** gate-2 acceptance is concrete enough to investigate.

#### Optional: Requirements depth (complex or unfamiliar features)

For features involving external APIs, database changes, auth, or novel logic, gather typed requirements before investigating:

| Feature type | Key info to confirm |
|---|---|
| **API integration** | Docs/URL, auth method, request/response format (real example), rate limits |
| **Database change** | Relevant schemas, related data patterns, RLS needs |
| **UI component** | Design ref or description, placement, responsive needs, interactive states |
| **Business logic** | Concrete input → output examples, edge cases |
| **Auth/authorization** | Affected roles, per-role visibility/actions, existing auth patterns |

**Completeness gate:** Can you describe the exact expected behavior with concrete examples? If not, keep asking.

### 3. Investigate

- [ ] Search the codebase for existing functionality to reuse (features under `src/features/`, shared under `src/shared/`, `src/components/common/`).
- [ ] **Reuse vs custom:** If the remaining work is a generic subsystem (auth, webhooks, parsers, queues, protocol clients, complex widgets, …) and current deps do not obviously cover it, run [`.agents/skills/dont-reinvent-the-wheel/SKILL.md`](../dont-reinvent-the-wheel/SKILL.md) **before** locking a from-scratch approach. Record the compact rec in Conflict & compliance. Skip when the work is bespoke/business-specific.
- [ ] **Replaceability:** If this work adds a `src/features/` module or a new UI/data vendor, schedule [`.agents/skills/modularity-review/SKILL.md`](../modularity-review/SKILL.md) after implement (or run now if the folder already exists). After a package is added, ask whether a `stack-port-*` cruiser rule is needed.
- [ ] Identify relevant rules from `.cursor/rules/` (start at `.cursor/rules/INDEX.md`).
- [ ] Align narrative with **`documentation/DOC_APP_VISION.md`** when the plan changes user-facing behavior (problem, persona, app role); if **`DRAFT`**, pause for fill or explicit deferral.
- [ ] For server-cached data, check `documentation/DOC_TANSTACK_QUERY.md` and existing `api/keys.ts` patterns in features.
- [ ] Determine scope and boundaries (in-scope vs out-of-scope).
- [ ] **plan-grill rail:** Before locking ride-vs-new, neighbor absorption, greenfield, or architecture-boundary choices — run [`.agents/skills/plan-grill/SKILL.md`](../plan-grill/SKILL.md) **mandatory fork checklist** (enumerate ≥2 options or justify sole option; ask on ties; log clear-winners; anti-dup). Loop: ask → `DECISIONS.md` → **continue Investigate**. Industry/precedent → `pattern-review`. Package/pattern reuse vs custom → `dont-reinvent-the-wheel` (already run above when Step 1 applies).
- [ ] **Feature decomposition self-check (mandatory):** Enumerate distinct domain concepts this work introduces. If more than one cohesive bounded context applies, or projected file count exceeds `featureBudgets.config.cjs` defaults, plan multiple features under `src/features/` before writing steps. Do not wait for the user to request architecture. See `.cursor/rules/architecture/RULE.mdc` § Feature granularity.

#### Optional: Foundation validation (high-risk features)

If the feature depends on an unproven assumption (new API, untested algorithm, novel integration):

1. **Identify** the riskiest assumption — what could invalidate the entire approach?
2. **Test** with a minimal POC (smallest possible proof: one API call, one query, one algorithm run).
3. **Gate:** Foundation works → proceed to plan. Foundation fails → report to user, investigate alternatives before planning.

Do **not** invest in full planning until the foundation is proven.

### 4. Create plan

- [ ] Run conflict and compliance analysis first (see below).
- [ ] **plan-grill rail:** Before writing opinionated product/scope picks into phases/steps — run fork checklist for any topic not in `DECISIONS.md`. Loop: ask → ledger → **continue Create**.
- [ ] **M/L ledger gate:** If Complexity will be **M** or **L**, ensure `DECISIONS.md` lists every product/scope lock (or a single `no product forks — <reason>` row) before Present.
- [ ] Define phases in logical order (workable chunks).
- [ ] Write steps per phase aligned with compliance (concrete paths, layers, patterns).
- [ ] Add a gate for each phase.
- [ ] Write `DEVELOPMENT_PLAN.md` to `documentation/jobs/temp_job_<name>/` using [`references/implementation-plan-template.md`](references/implementation-plan-template.md). If `DECISIONS.md` already exists in that folder (from `grill-me` / `plan-grill`), keep it; do not overwrite.
- [ ] Set **Complexity** (`XS` | `S` | `M` | `L`) in Summary per [`references/complexity-rubric.md`](references/complexity-rubric.md).

### 5. Pattern & precedent

**Proactively** run [`.agents/skills/pattern-review/SKILL.md`](../pattern-review/SKILL.md) (`plan-section` mode) when Complexity is **M** or **L**, or the plan introduces new user-visible behavior/contracts (see [rubric](../pattern-review/references/rubric.md) — agent chooses relevant aspects).

Fill **Pattern & precedent** in the plan. If non-standard, **stop** for owner pick (A/B/C or waiver) before implementation.

Industry / product precedent → **pattern-review**. Package/pattern reuse → **dont-reinvent-the-wheel** (Investigate, before this step). Repo rules → **Conflict & compliance** and later **validate**.

### 6. Plan review gate

Set **Plan review** in Summary per [dev-cycle matrix](../router/references/dev-cycle-matrix.md) § Plan depth and gates — do not duplicate the M/L table here.

### 7. Present and iterate

- Present the plan to the user.
- Incorporate feedback and update the plan as needed.

**Chat footer (short):**

```markdown
Plan: documentation/jobs/temp_job_<name>/DEVELOPMENT_PLAN.md
Complexity: <XS|S|M|L> — <one line>
Next: <review-dev-plan | implement | blocked> — <one-line gate>
```

---

## Output location

**Path:** `documentation/jobs/temp_job_<name>/DEVELOPMENT_PLAN.md`

**Naming:** Follow `.cursor/rules/file-placement/RULE.mdc`: folder `temp_job_<descriptive-name>/` (kebab-case, descriptive). Allowed by `projectStructure.config.cjs` under `documentation/jobs/` (nested `*.md` files).

**Note:** Older jobs in this repo may use other filenames (e.g. `IMPLEMENTATION_PLAN.md`); new plans from this command should standardize on **`DEVELOPMENT_PLAN.md`**.

---

## Plan document structure

### Mandatory sections (always include)

| Section | Purpose | Content |
|---------|---------|---------|
| **Summary** | Why and what, in brief | Goal, why, **Complexity**, **Plan review** status, scope, constraints |
| **Phase overview** | Table of all phases | Phase #, goal, gate, status |
| **Conflict & compliance** | Avoid technical debt, meet repo rules | See checklist below |
| **Pattern & precedent** | Industry / product patterns vs this design | See template; required for M/L; agent-chosen aspects |
| **Notes during development** | For implementation | Leave empty in the plan; fill during implementation |
| **Decisions made** | Impl-time choices only | Leave empty in the plan; fill during **`implement`**. Product/scope forks live in sibling **`DECISIONS.md`** (`grill-me` / `plan-grill` / `feature`) — do not duplicate them here. |

### Per phase (repeat for each phase)

Phases must be in logical order and split into workable chunks. **Each phase must have a gate.**

| Subsection | Required? | Content |
|------------|-----------|---------|
| **Goal** | Yes | What we achieve in this phase |
| **Steps** | Yes | Concrete steps aligned with conflict & compliance |
| **Gate** | Yes | How we validate this phase is complete |

### Optional sections (include when relevant)

- **Source/context** – Where the request came from (feedback, ticket, etc.).
- **User stories** – For user-facing features.
- **Existing functionality** – What we reuse.
- **Scope / out-of-scope** – Explicit boundaries.

---

## Rules reference (research before writing steps)

See [`.cursor/rules/INDEX.md`](../../../.cursor/rules/INDEX.md) and [`references/rules-registry.md`](references/rules-registry.md) — do not duplicate the full table here.

**Boilerplate docs:** `ARCHITECTURE.md`, `documentation/DOC_INDEX.md`, and for query-based data `documentation/DOC_TANSTACK_QUERY.md`.

**Import boundaries:** `.dependency-cruiser.cjs` (and `pnpm arch:check`) for layer rules beyond ESLint.

---

## Conflict & compliance checklist

**Purpose:** Ensure the plan complies with project rules and does not introduce unnecessary technical debt.

During planning, work through (using the rules reference above):

- [ ] Identify applicable rules (architecture, file-placement, database, security, code-style, testing, workflow, etc.).
- [ ] Validate planned file paths against `projectStructure.config.cjs` (whitelist); run `pnpm validate:structure` after structural additions if unsure.
- [ ] Check architecture compliance: feature vs `src/shared/` vs `src/components/common/`, layer boundaries, import direction (pages → hooks → services).
- [ ] **Feature decomposition self-check:** List planned feature folder(s). If a single feature spans multiple domain concepts or exceeds `featureBudgets.config.cjs` budgets, split into separate features in the plan with narrow public APIs before listing file paths.
- [ ] Identify any planned diversion from industry standards, framework best practices, or established repo conventions. If found, ask the user whether the diversion is intentional or whether the plan should align with best practices.
- [ ] Estimate complexity (cyclomatic ≤10, cognitive ≤15, functions ≤100 lines per `.cursor/rules/code-style/RULE.mdc`); plan extractions if needed (see `.agents/skills/optimize2/SKILL.md` for refactoring workflow).
- [ ] Note database impact if applicable (migrations under `supabase/migrations/`, idempotent, safe for fresh and existing DB).
- [ ] Note security impact if applicable (auth, RLS, validation, secrets in `.env` only).
- [ ] Document conflicts with existing code (pattern mismatches, breaking changes).
- [ ] Consider testing: new or changed logic should have tests per `.cursor/rules/testing/RULE.mdc`.
- [ ] Workflow: branch strategy and changelog timing per `.cursor/rules/git-workflow/RULE.mdc` and **finish** (changelog in **finish**, not while planning).
- [ ] If a feature’s behavior changes: plan updates to `src/features/<feature>/README.md` in the same work as code (see file-placement rule).

**Output inside `DEVELOPMENT_PLAN.md`:** A **Conflict & compliance** section with:

- Applicable rules (by name/path).
- Planned file placements and validation status (confirmed vs needs config change — config changes require explicit approval per architecture rule).
- Known risks / attention points.
- Reuse / packages (`dont-reinvent-the-wheel` rec, or skipped — reason).
- Open questions for the user.
- Confirmed standards diversions, including whether the user chose to keep the diversion or align with best practices.

---

## Gate examples

Each phase must have a gate.

### Frontend (this stack: Vite + React + MUI)

- Browser: expected UI present; primary flows work; loading/error states; responsive behavior where relevant.

### Backend / Supabase

| Type | Gate |
|------|------|
| **Edge Functions** | Invoke locally or deployed; verify response (see `cloud-functions/RULE.mdc`). |
| **Database** | Apply migration to a test DB; verify schema; test RLS with representative roles if applicable. |

### Repo quality

- `pnpm lint`, `pnpm type-check`, and tests relevant to the change (`pnpm test:run`, `pnpm test:staged` preview, or targeted files) pass at phase boundaries when code exists.

---

## Notes during development (mandatory empty section)

**Purpose:** Filled during implementation with technical debt, obstacles, gaps vs plan, follow-up ideas.

**Behavior:** Leave empty in the initial plan.

---

## Decisions made (mandatory empty section)

**Purpose:** Record choices; for important ones, ask the user.

**Format:**

```markdown
| Decision | Context | Outcome | User asked? |
|----------|---------|---------|-------------|
| X | ... | ... | Yes |
| Y | ... | ... | No (codebase precedent) |
```

**Behavior:** Leave empty in the initial plan.

---

## Example phase overview table

```markdown
| Phase | Goal | Gate | Status |
|-------|------|------|--------|
| 1 | ... | ... | Pending |
| 2 | ... | ... | Pending |
```

---

## Key principles

1. **Refine first:** If the request is vague, ask questions before writing the plan.
2. **Ambiguity is not allowed:** If ambiguity appears, ask about intended app usage or product vision before choosing.
3. **Standards diversions are explicit:** If a plan diverges from industry standards, best practices, or repo conventions, ask whether that is intentional before proceeding.
4. **Phases are workable:** Each phase is a logical, testable chunk.
5. **Gates are mandatory:** Every phase has a gate.
6. **Compliance first:** Conflict & compliance before detailed steps; steps must be rules-compliant.
7. **Empty sections:** Notes during development and Decisions made start empty (impl-time). Product decisions → `DECISIONS.md`, not the plan’s Decisions made table.
8. **Product forks:** `plan-grill` at Refine / Investigate / Create — never silent product locks.

---

## Boundaries

| Not `plan` | Use instead |
|------------|-------------|
| Execute phases | `implement` |
| Small XS/S one-pass change | `quick-piv` |
| Product discovery with 🔴 stops | `feature` |
| Industry precedent procedure | `pattern-review` |
| Package / pattern reuse vs custom | `dont-reinvent-the-wheel` |
| Six-lens plan critique | `review-dev-plan` |
| Repo-rule audit of plan/impl | `validate` |
| Changelog / commit | `finish` |
| Product vision Q&A (gate 1) | `grill-me` — use **§ Refine** only for gate 2 |
| Product forks *during* plan design | `plan-grill` **rail** (mandatory checklist each of Refine / Investigate / Create) |
| Industry precedent A/B/C | `pattern-review` (not `plan-grill`) |
