---
name: align-harness
description: >-
  Harness-wide coherence audit: AGENTS.md, rules, skills, INDEX, layers doc, architecture
  overview, and subagent briefs. Runs harness_scan for deterministic facts, parallel judgment
  lenses, tiered issue table, and no-information-loss gate. Foreign content hands off to
  update-harness. Use when the harness drifts, after ingest, or for periodic health checks.
  Not external intake (update-harness), single-skill authoring (create-skill), or app code
  (consolidate/validate).
disable-model-invocation: false
---

# Align Harness (`/align-harness`)

## Config

```text
SUBAGENT_MODEL=composer-2.5
```

Every **Task** subagent uses `model` = slug above. Subagents are **self-contained** — they do not see this chat. Briefs: [`references/subagent-briefs.md`](references/subagent-briefs.md).

## Purpose

Keep the **agent harness** one coherent system: SSOT enforced, no conflicting instructions, no silent context bloat. Evolves the former `improve-skill-library` scope to the full harness (D2).

## Scope

| Set | Paths | Treatment |
|-----|-------|-----------|
| **Harness corpus** | `AGENTS.md`, `.cursor/rules/**`, `.cursor/rules/INDEX.md`, `.claude/rules/*`, `.agents/skills/**`, `ARCHITECTURE.md`, `documentation/DOC_AGENT_WORKFLOW_LAYERS.md`, subagent brief files | Audited; edited after gate |
| **Routing spine** | `router/SKILL.md`, `DOC_AGENT_WORKFLOW_LAYERS.md`, `skill-relationship-flow.md` | Audited; updated when harness routing changes |
| **Artifacts** | `documentation/jobs/harness/` (registry, ledger, scan manifest) | Persist audit outputs |
| **Reference-only** | User/plugin skills outside repo | Read for overlap; never edited |

Domain lenses: [`references/domain-*.md`](references/).

## What this is NOT

| Sibling | Use when |
|---------|----------|
| [`update-harness`](../update-harness/SKILL.md) | Dropping **external** content into `.agents/harness-inbox/` |
| [`create-skill`](../create-skill/SKILL.md) | Authoring **one** new skill |
| [`rule-quality`](../rule-quality/SKILL.md) | Grading **one** rule/command file |
| [`learn`](../learn/SKILL.md) | Capturing a **lesson** from a session |
| [`standards-align`](../standards-align/SKILL.md) | Product vs repo standards decision |
| [`consolidate`](../consolidate/SKILL.md) | `src/` application code duplication |
| [`validate`](../validate/SKILL.md) | Plan/impl **compliance** audit |

## Triggers

- "Align the harness", "audit agent instructions", "SSOT drift", "rules vs AGENTS conflict"
- After `update-harness` apply or large harness edit
- Periodic health check; before claiming harness work "done"
- `align-harness` foreign-skill alarm → hand off intake to `update-harness`

## Modes

| Mode | When | Lenses |
|------|------|--------|
| **`--full`** (default first run) | Initial audit or major migration | `harness_scan` + Phase 0 ledger + lenses 1–8 |
| **`--quick`** | Periodic check | `harness_scan` + lenses 3, 4, 6 |

## Workflow

```
HARNESS_SCAN -> PHASE 0 LEDGER -> PARALLEL LENSES -> SYNTHESIS -> GATE -> EXECUTE -> NO-LOSS -> RECONCILE
```

### Step 0 — Deterministic facts (`harness_scan`)

```bash
node .agents/skills/align-harness/scripts/harness_scan.cjs
```

Manifest SSOT: `documentation/jobs/harness/entry-points.yaml`. Record facts (always-on bytes/lines, missing refs, orphans, frontmatter). **Advisory** over budget — never hard-block (D12).

### Phase 0 — Registry + content ledger

Same as former skill-library Phase 0, persisted under `documentation/jobs/harness/`. Include harness domains beyond skills (rules catalog rows, `AGENTS.md` units).

**Diagram need-check:** `router/references/skill-relationship-flow.md` — verdict in notes.

### Phase 1 — Parallel lens subagents (read-only)

Launch in parallel per [`references/subagent-briefs.md`](references/subagent-briefs.md):

| # | Lens | Domain doc |
|---|------|------------|
| 1 | Separation / overlap | `domain-skills.md` |
| 2 | SSOT / duplication | all domains |
| 3 | Conflicts | skills + rules |
| 4 | Composition / handoffs | skills |
| 5 | Quality / trigger clarity | skills |
| 6 | Catalog drift (`AGENTS.md` ↔ YAML) | `domain-agents-md.md`, `domain-rules.md` |
| 7 | Foreign / orphan content | `foreign-content.md` |
| 8 | Loadability / context budget | `domain-rules.md`, `domain-agents-md.md` |

`--quick` skips 1, 2, 5, 7 unless user asks.

### Phase 2 — Synthesis → issue table

Merge lens + scan outputs. Format:

`# | tier | domain | where | issue | why | resolution | SSOT owner`

- **blocking** — broken spine, contradictory commit/push, missing router entry
- **advisory** — budget, cosmetic duplication, nice-to-have wording

≥2 lenses on same item → prioritize. Budget findings always **advisory**.

### Phase 3 — Decision gate

**Do not edit before approval.** User picks rows. Structural SSOT moves or many files → stop, run [`plan`](../plan/SKILL.md).

### Phase 4 — Execute (approved only)

One row at a time. **Supersede** don't silently delete. Protected paths need D18 scope or explicit OK.

### Phase 5 — No-information-loss pass

Same contract as former `improve-skill-library` — `MISSING` must be 0.

### Phase 6 — Reconcile

Router lists each harness skill once; registry updated; `skill-relationship-flow.md` if stale.

## Escalation

- Phase 7 cap (≤5 blocking rows) exceeded → `documentation/jobs/temp_job_harness-fixes/`
- Big-bang restructure of always-on rules → separate plan (D12)

## Related

- [`update-harness`](../update-harness/SKILL.md) — external intake
- [`learn`](../learn/SKILL.md) — session lessons; structural conflicts → here
- [`router`](../router/SKILL.md) — routing SSOT
- [`DOC_AGENT_WORKFLOW_LAYERS.md`](../../../documentation/DOC_AGENT_WORKFLOW_LAYERS.md)
- [`references/subagent-briefs.md`](references/subagent-briefs.md)
