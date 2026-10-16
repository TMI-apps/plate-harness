---
name: tighten-harness
description: >-
  Cut the context cost of an agent harness (CLAUDE.md, AGENTS.md, rule files, skills, system
  prompts, subagent briefs) without losing any behavior it actually produces. Measures what
  loads when, tests every line for "would a capable model act differently without this?",
  then cuts, merges, relocates to on-demand files, or replaces prose with enforcement, and
  ends with a ledger that accounts for every removed instruction. Use whenever the user wants
  to tighten, slim, trim, prune, de-bloat, or token-optimize their harness, prompt rules,
  skills, or CLAUDE.md, complains that the agent's instructions are too long or repetitive, or
  asks why the context window fills up before work starts — even if they don't say "harness".
  Not harness-wide coherence/conflict audit (align-harness), grading one rule's quality
  (rule-quality), or external intake (update-harness).
---

# Tighten Harness (`/tighten-harness`)

The goal is a harness that costs fewer tokens **and** produces the same behavior. Shorter is only
better if nothing the model needed went missing — so every cut has to be justified, and the
justification is recorded, not assumed.

## 1. Map the load tiers

Not all tokens cost the same. Before reading for content, find out *when* each file enters context:

| Tier | Typically | Cost |
|------|-----------|------|
| Always loaded | `CLAUDE.md` / `AGENTS.md` and their `@` imports, always-apply rules, system prompts | Paid every turn of every session |
| Always listed | Skill and subagent `name` + `description` | Paid every session, small per item |
| On demand | Skill bodies, glob-scoped rules, `references/` files | Paid only when triggered |

Measure each file (`wc -w`; tokens ≈ words × 1.3) and report the always-loaded total first. A line
moved from tier 1 to tier 3 is usually worth more than three lines deleted from a skill body.

Watch for accidental tier-1 loading: `@` imports that inline whole rule bodies, the same file
imported twice through different paths, or always-apply rules that only matter for one folder.

## 2. Test every instruction

For each instruction, ask in order — the first "yes" decides its fate:

1. **Is it inferable?** A capable model reading the repo would do this anyway: stack facts already
   in `package.json` / `tsconfig`, standard script names, generic virtues ("write clean code",
   "be careful", "don't introduce bugs"). → **Cut.**
2. **Is it stated elsewhere?** Same rule in two places means two places to drift. → **Merge** to the
   most authoritative file; leave a one-line pointer only where a reader would otherwise look.
3. **Is it already enforced?** A linter, type, hook, CI check, or script fails when it's violated.
   → **Shrink** to the rule's name plus the command that checks it. Prose that duplicates an
   enforced check is pure cost.
4. **Could it be enforced?** Lists of allowed values, file-placement rules, naming patterns, and
   "always run X before Y" steps are often better as a schema, lint rule, or hook. → **Flag** as a
   conversion candidate; don't build it unasked.
5. **Is it procedure, not policy?** Multi-step workflows sitting in an always-loaded file. →
   **Relocate** to a skill or reference file and leave a trigger line.
6. **Is it verbose?** Several negatives that describe one outcome, ALL-CAPS imperatives, restated
   examples. → **Rewrite**: one positive statement of the outcome, plus a short *why* — a model
   that knows the reason generalizes better than one that memorized a prohibition.

Anything that survives all six is load-bearing. **Keep it as written.**

## 3. Protect what looks like bloat but isn't

These often read as odd or overly specific, which is exactly why they exist:

- **Scar tissue.** A strangely precise rule usually encodes a past failure. Before cutting one,
  check `git log -S "<phrase>"` or blame for the commit that added it. If it came from an incident,
  keep it (tightened, never removed) unless the user confirms the cause is gone.
- **Non-inferable domain logic.** Business rules, tenancy/isolation boundaries, data contracts.
- **Environment quirks.** Platform shell traps, pinned tool versions, non-standard local setup.
- **Safety and consent gates.** Protected files, approval requirements, destructive-action limits.
  Tighten wording; never weaken the gate.
- **Skill trigger phrases.** Descriptions are the triggering mechanism. Trimming a description is
  high-leverage, but dropping the phrases users actually type makes the skill silently stop firing.

## 4. Apply

- Show the plan (ledger draft, step 6) before editing protected files (SSOT:
  `.cursor/rules/agent-behavior/RULE.mdc` § Protected Files — includes `.cursor/rules/**` and
  `.agents/skills/**`) or any file outside the requested scope.
- Rule descriptions have two copies: YAML `description` in `RULE.mdc` (SSOT) and the portable
  catalog in `AGENTS.md`. Edit the YAML first, then the catalog.
- Edit in place; keep file paths stable so existing pointers don't break.
- After edits, verify nothing dangles: every path, `@` import, skill name, and anchor that was
  referenced still resolves (`rg` for the old names).
- Run `pnpm validate:docs` (markdown links + cursor doc references). If a skill was renamed,
  moved, or added, update `router/SKILL.md` § Skill index and situation tables.

## 5. Sanity-check behavior (when stakes are high)

For large cuts to always-loaded files, pick 2–3 representative tasks that exercised the removed
rules and confirm a fresh agent with the tightened harness still handles them. A cut that changes
behavior gets reverted or flagged, regardless of how many tokens it saved.

## 6. Report

Use this structure:

```markdown
## Savings
| File | Tier | Before | After | Δ tokens |
Always-loaded total: X → Y (−Z%)

## Ledger
| # | Instruction (short) | From | Action | Reason | Now lives at |
Actions: cut-inferable · merged · shrunk-enforced · relocated · rewritten
Every removed or moved instruction gets a row. If it doesn't have a row, it wasn't removed.

## Flagged for human review
- Scar-tissue rules whose origin couldn't be confirmed
- Enforcement-conversion candidates (step 2.4)
- Anything where cutting vs keeping was a judgment call
```

Keep the report about the harness, not this procedure — the user wants to see what changed and
why it's safe, not a restatement of the method.

## Boundaries

| Not `tighten-harness` | Use instead |
|-----------------------|-------------|
| Conflicts, overlap, or SSOT drift across the whole harness | [`align-harness`](../align-harness/SKILL.md) |
| Score or rewrite one rule/command file against the quality rubric | [`rule-quality`](../rule-quality/SKILL.md) |
| Intake external content from `.agents/harness-inbox/` | [`update-harness`](../update-harness/SKILL.md) |
| Turn a session mistake into a new or sharper rule | [`learn`](../learn/SKILL.md) |
| Author one new skill | [`create-skill`](../create-skill/SKILL.md) |

If tightening surfaces a contradiction between files, record it under Flagged and hand off to
`align-harness` rather than resolving it here.
