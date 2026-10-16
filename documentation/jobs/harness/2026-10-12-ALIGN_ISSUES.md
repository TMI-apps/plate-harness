# Align harness — 2026-10-12

**Mode:** `--full` (harness_scan + lenses 1–8 synthesis)  
**Scan:** `harness_scan.cjs` @ 2026-10-12T05:02:39Z  
**Gate:** No harness edits until user approves rows below.

## Scan facts (Step 0)

| Metric | Value |
|--------|--------|
| Always-on rules | 2,067 lines / **97,553 bytes** |
| Advisory budget | 32,768 bytes (**over budget**, D12 advisory only) |
| Skill folders | **38** `SKILL.md` files |
| Reachable from entry roots | 130 |
| Orphan skill candidates | 0 |
| Frontmatter issues | 0 |

## Phase 0 ledger note

`documentation/jobs/harness/REGISTRY.md` census dated **2026-09-23**, **37** skills. Live tree has **38** (includes `name-the-mechanism`). Registry row for `review-dev-plan` still says **six-lens**; skill body is **seven-lens**.

## Issue table

| # | tier | domain | where | issue | why | resolution | SSOT owner |
|---|------|--------|-------|-------|-----|------------|------------|
| 1 | advisory | rules / loadability | `.cursor/rules/**` alwaysApply | ~97 KB always-on payload vs 32 KB advisory budget | Cursor injects all always-on rules every turn; architecture alone is ~36 KB | Long-term: split architecture into on-demand child rules or trim duplication; short-term: accept over-budget as advisory (D12) | `architecture/RULE.mdc` + workflow hub |
| 2 | advisory | rules / SSOT | `.cursor/rules/INDEX.md` § Code Style | Bullet still says "Naming conventions (category, not first instance/SKU/page)" without naming the skill | Implies old code-style body; policy moved to `name-the-mechanism` | One-line pointer: naming/copy counts → `.agents/skills/name-the-mechanism/SKILL.md`; syntax stays in code-style | `INDEX.md` + `code-style/RULE.mdc` |
| 3 | advisory | harness registry | `documentation/jobs/harness/REGISTRY.md` | Missing `name-the-mechanism` row; skill count 37 vs 38 | Phase 0 ledger stale after naming skill landed | Add row (read-only policy skill); bump census date/count; fix `review-dev-plan` → seven-lens | `REGISTRY.md` |
| 4 | advisory | routing spine | `documentation/DOC_AGENT_WORKFLOW_LAYERS.md` | No section for `name-the-mechanism` (layer-consistency documented, naming skill not) | Pre-implementation gate lives only in router + AGENTS defaults | Add § Naming / copy counts mirroring layer-consistency pattern (procedure → skill path) | `DOC_AGENT_WORKFLOW_LAYERS.md` |
| 5 | advisory | routing spine | `.agents/skills/router/references/skill-relationship-flow.md` | Diagram omits `name-the-mechanism` and `layer-consistency-check` | Router prose updated; diagram SSOT stale | Update mermaid per `align-harness` diagram need-check | `skill-relationship-flow.md` |
| 6 | advisory | skills / SSOT | `.agents/skills/validate/SKILL.md` | Subsection title still "Category naming (code-style subagent)" | Wording predates skill SSOT | Rename to "Name-the-mechanism (code-style subagent)"; keep pointer to skill not § Category | `validate/SKILL.md` |
| 7 | advisory | skills / duplication | `layer-consistency-check` + `architecture` + router | Many lines repeat "read name-the-mechanism" (intentional pointers) | Acceptable if one-line; watch for re-growth of F1–F6 body in rules | No change unless pointers expand into duplicate policy text | `name-the-mechanism/SKILL.md` |
| 8 | advisory | scan / refs | `harness_scan` `missingRefs` | 30+ broken path refs (file-placement examples, handoffs, `database.types.ts`, etc.) | Illustrative paths + legacy handoffs, not runtime harness | Triage: fix handoffs or mark reference-only; soften file-placement examples to generic placeholders | per-file owners |
| 9 | advisory | jobs (foreign) | `documentation/jobs/temp_job_category-name-guidance/` | Still cites `code-style` § Category, not instance as SSOT | Historical plan from superseded policy | Leave as history or add one-line superseded note at top | user |
| 10 | advisory | agent-behavior | `agent-behavior` § mechanism-rename exception | References updates in rules/skills/** and AGENTS.md; `finish`/`implement` mention exception | Consistent; ensure `bundle-ship`/`push` inherit via finish pointer | Optional one-line in `bundle-ship` → finish protected-file exception | `agent-behavior/RULE.mdc` |

**Blocking:** none identified (router lists skill, code-style points to skill, no contradictory commit/push naming policy).

## Diagram need-check

**Verdict:** `skill-relationship-flow.md` should be updated (row 5).

## No-information-loss (pre-execute)

Not run — no approved harness edits yet.

## Recommended approval batch (low risk)

Rows **2, 3, 4, 5, 6** in one harness maintenance pass. Row **1** needs explicit product decision before structural rule split.
