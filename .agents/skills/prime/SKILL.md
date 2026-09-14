---
name: prime
description: >-
  Loads project context at session start (structure, governance, active jobs, enforced boundaries).
  IF new chat OR the user asks what to do next without naming a skill THEN use this skill.
  Not a substitute for grill-me / plan § Refine (gates 1–2). Not human onboarding (start)
  or pre-merge gates (validate).
---

# prime

Load project context at the start of a new session. Build an understanding of this harness’s structure, governance, and active state before tackling tasks.

**When to use:** New chat, ambiguous task, or before larger refactors.  
**Related:** For architecture/quality gate, use `.agents/skills/validate/SKILL.md` (auto-selects gate depth). For planning features, use `.agents/skills/plan/SKILL.md`. For onboarding a human, use `.agents/skills/start/SKILL.md`.

## Objective

Align with project rules and architecture so work does not violate enforced boundaries (ESLint boundaries, dependency-cruiser, structure whitelist).

---

## Process

### 1. Codebase mapping and structure

- **Tracked files:** Run `git ls-files` (large repos: in PowerShell use `git ls-files | Select-Object -First 150` instead of `head`).
- **Architecture overview:** Read `ARCHITECTURE.md` (folder layout, TanStack Query, layers, path aliases).
- **Doc index:** Read `documentation/DOC_INDEX.md` (SSOT map, quick links).
- **Testing guide:** Skim `documentation/DOC_TESTING.md` when the task adds or changes tests (runners, colocation, `tests/test-utils`).
- **App vision (product SSOT):** Read `documentation/DOC_APP_VISION.md`. If the vision status line is still **`DRAFT`**, state in **Actionable insights** that feature/plan ambiguity should be resolved by filling that file (or running `.agents/skills/start/SKILL.md` § App vision) before major product decisions.
- **Features (discover, do not assume):** List `src/features/` — this harness ships with **`auth`** and **`setup`** only; forks may add more. Do not use a fixed feature list from another repo.
- **Entry points:** Read `index.html`, `src/main.tsx`, `src/App.tsx` (provider order: `QueryProvider` → `AuthProvider` → `BrowserRouter`).

### 2. Governance and rules

- **Rule index:** Read `.cursor/rules/INDEX.md`.
- **Architecture SSOT:** Read `.cursor/rules/architecture/RULE.mdc` (layers, path aliases `@/*`, import direction, structure whitelist).
- **File placement:** Read `.cursor/rules/file-placement/RULE.mdc` — validation uses **`projectStructure.config.cjs`** (not `.js`).

### 3. Dependencies and boundaries

- **Tech stack and scripts:** Read `package.json`.
- **Module boundaries:** Read `.dependency-cruiser.cjs` (forbidden upward imports, hooks/services/utils rules, warnings on direct service use from components).

### 4. Active project state

- **Recent activity:** `git log -n 10` (full commit messages: subject and body; do not use `--oneline`)
- **Working tree:** `git status -sb`. Read `src/config/git-workflow.json`, then apply `.cursor/rules/git-workflow/RULE.mdc` § Mode-aware branch gate (read config **before** treating the current branch as allowed/forbidden).
- **Optional plans:** Scan `documentation/jobs/` for active work (e.g. `documentation/jobs/temp_job_*/`) when relevant.

---

## Output report

Deliver a concise, scannable summary:

### Project overview

- Application type (Vite + React + MUI + Supabase starter).
- Primary libraries (from `package.json`).
- Current version (`package.json` → `version`).

### Architecture

- **Features:** Names under `src/features/` only (verified, not assumed).
- **Layering:** Pages → components → hooks → services → shared; see `ARCHITECTURE.md` and architecture rule.
- **Import boundaries:** Short list of the most relevant `forbidden` rules from `.dependency-cruiser.cjs`.

### Current state

- Branch and cleanliness of working tree.
- Recent commit themes.
- Active plans (`documentation/jobs/` if relevant).

### Actionable insights

- Mismatches vs rules, missing optional docs, or tech debt called out in repo docs.
- Active plans with unresolved app-usage ambiguity or undocumented standards/best-practice diversions, when visible from `documentation/jobs/`.

---

## Boilerplate-specific notes

- **Downstream forks:** After cloning for a real product, update the “features” section of this report whenever `src/features/` changes; keep `prime` generic.
- **Validation:** References in this file are checked by `pnpm validate:docs` (cursor doc references). Prefer paths that exist in this repository.

---

## Boundaries

| Not `prime` | Use instead |
|-------------|-------------|
| Human first-time setup | `start` |
| Product vision Q&A | `grill-me` |
| Product forks during planning | `plan-grill` |
| Write `DEVELOPMENT_PLAN.md` | `plan` |
| Commit / push | `finish` / `push` |

**Next:** **`plan`**, **`plan` § Refine**, or **`grill-me`** per router gates — not **`implement`** alone.
