# Vague conditional phrases — detection SSOT

Used by **Lens 5** (`subagent-briefs.md`) during `align-harness`. For per-file rewrites, defer to [`rule-quality`](../../rule-quality/SKILL.md) Mode B § Conditional Structure and [`create-skill`](../../create-skill/SKILL.md) § Writing Effective Descriptions.

## Problem

Ill-defined **when / if** clauses push the decision onto the assistant. They worsen router collisions (Lens 1), weak skill discovery (frontmatter `description`), and inconsistent execution.

**Test:** Can two assistants agree this clause fired on a concrete user message? If not, flag it.

## Phrase families (scan targets)

Match case-insensitively in frontmatter `description`, `## Triggers`, routing tables, and imperative instructions.

| Family | Examples | Why vague |
|--------|----------|-----------|
| **Deferred necessity** | When needing, When requiring, If you need, When you need, As needed, If necessary, If required, Where needed | "Need" is subjective; no observable signal |
| **Activity gerund** | When working with, When doing, When handling, When facing, When dealing with, When optimizing | Domain named; trigger not bounded |
| **Judgment handoff** | When relevant, When applicable, When appropriate, As appropriate, As applicable, Follow X when relevant | Assistant must infer relevance |
| **Soft opt-in** | Consider when, Optionally when, May be used when, Proactive when (no user phrase) | Easy to skip or over-apply |
| **Weak routing** | Use when … (only a broad domain, no user phrase / artifact / lifecycle gate) | WHAT clear; WHEN fuzzy |
| **Wrong structure** | IF … THEN on always-true rules; direct imperative where behavior must branch | See `rule-quality` § Conditional Structure |

**Not vague (do not flag):** observable user signals — e.g. `Use when the user asks to commit`, `Use when the user runs /debug`, `IF staged files include migrations THEN …`, lifecycle gates cited in the router (`gates 1–2 Clear / Bounded`).

## Severity

| Severity | Where | Examples |
|----------|-------|----------|
| **must-fix** | Frontmatter `description`, `## Triggers`, router situation rows, handoff "use X when …" that picks between skills | Competing skills with no tiebreak |
| **nice-to-have** | Optional body sections (`when relevant`, `as appropriate` on non-routing bullets) | Clarity; rarely causes wrong skill pick |

## Remediation (report in findings; apply only after gate)

1. **Observable trigger:** `IF [user phrase \| artifact present \| lifecycle gate] THEN [action/skill]`.
2. **Universal rule:** drop the conditional; use a direct imperative.
3. **Routing clause:** move tiebreak to `router/references/tiebreaks.md`; skill body links to it, does not re-decide.
4. **Rewrite delegation:** single-file tighten → `rule-quality` Mode B; new skill description → `create-skill` § 5. Tune the description.

### Before / after

| Weak | Stronger |
|------|----------|
| When needing documentation from a URL, use the browser tool | IF the user provides a documentation URL AND current behavior depends on that page's content THEN fetch it with the browser MCP (not cached training data) |
| Follow security rules when relevant | Before editing auth, RLS, or secrets: read `.cursor/rules/security/RULE.mdc` |
| Use when working with PDFs | Use when the user mentions PDFs, forms, or document extraction (cite concrete terms) |

## Lens cross-links

- **Lens 1 (overlap):** vague `description` / `## Triggers` on two skills → likely **MISSING tiebreak**; cite both lenses in synthesis.
- **Lens 3 (conflicts):** judgment-handoff on sensitive actions (commit, push, protected files) → **must-fix**.
