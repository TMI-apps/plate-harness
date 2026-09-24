---
name: plan-grill
description: >-
  Continuous grill rail during plan: same ask style as grill-me, anti-dup via
  DECISIONS.md, ask only on true ties (clear winners logged after naming
  alternatives). IF during plan Refine OR Investigate OR Create the agent is about
  to lock a product/scope/architecture-boundary choice AND has not yet run the
  fork checklist for that topic AND the topic is absent from DECISIONS.md THEN
  run this skill before writing the choice into the plan. IF ≥2 Pareto-fair
  options remain THEN ask one grill question; IF only one viable option after
  enumerating alternatives THEN log clear-winner (no Q). Not for XS/quick-piv.
  Not for industry-precedent forks (pattern-review). Not for package/pattern
  reuse vs custom (dont-reinvent-the-wheel). Not for gate-2 acceptance
  examples alone. IF a new capability could be a one-off instance OR a
  rewirable system THEN run the generality fork before locking the plan.
  plan must run the rail at every phase — not only Create.
  One grill question per turn, always — never batch two forks in one ask.
disable-model-invocation: false
---

# plan-grill

**Rail beside the plan corridor** — not a one-shot side quest off Create. While `plan` runs Refine → Investigate → Create, this skill is the continuous grill process: best next question (or clear-winner log) before locking a fork. Same question style as `grill-me`. Never re-ask a closed decision.

`grill-me` stays an **optional warm start** before the corridor when the idea is fuzzy. Once planning has started, **this** skill owns product/scope forks.

## What this skill owns (SSOT)

| Owns | Does not own |
|------|----------------|
| Plan-time fork detection + tie asks + clear-winner logs | Pre-plan / gate-1 stress-test → `grill-me` |
| Anti-dup via `DECISIONS.md` | Industry/precedent A/B/C → `pattern-review`; package/pattern reuse → `dont-reinvent-the-wheel` |
| Mandatory fork checklist before locking a choice | Gate-2 acceptance/API examples alone → `plan` § Refine |
| Shared ledger format (with `grill-me` / `feature` / `plan-grill-auto`) | Writing `DEVELOPMENT_PLAN.md` body → `plan` |
| Tie asks + Present wait (default) | User forbids questions → [`plan-grill-auto`](../plan-grill-auto/SKILL.md) (same checklist; agent picks) |

**Skip gate:** XS / `quick-piv` — do not run.

### Two decision stores (do not conflate)

| Store | Path | Holds |
|-------|------|--------|
| **Product / scope ledger** | `documentation/jobs/temp_job_<name>/DECISIONS.md` | Perimeter, non-goals, ride-vs-new, generality, design/architecture-boundary ties |
| **Impl decisions** | `DEVELOPMENT_PLAN.md` § **Decisions made** | Choices made **while implementing** — `implement` fills |

## When a grill question is needed (explicit triggers)

A **fork** exists when **any** of these is true for a topic **not** already in `DECISIONS.md` (Closed or Open):

| Cue | Examples |
|-----|----------|
| **Scope meaning** | What counts as v1; in vs out; success criteria that change UX |
| **Non-goals** | Capability a reasonable person might assume is included |
| **Neighbor absorption** | Ride existing loop vs new path; which feature owns the data |
| **User-visible behavior** | Which outcome, error, or empty state the user sees |
| **Architecture boundary** | Feature split, layer ownership, sync vs async user-visible contract — when the choice changes product feel, coupling, or what neighbors are touched |
| **Generality** | Instance vs feature module vs rewirable port — how reusable vs specific this capability is (see § Generality) |
| **About to write it down** | Phase/step text would pick A over B as if decided |

**Not a plan-grill fork** (do not ask here):

| Cue | Owner |
|-----|--------|
| Concrete API example, schema field list, RLS policy text | `plan` § Refine gate-2 |
| Industry “is this standard?” A/B/C | `pattern-review` |
| Package/pattern reuse vs custom (library search) | `dont-reinvent-the-wheel` |
| Helper extract / Rule of Three | `optimize2` — not this cue |
| Stack/feature replaceability scores after a folder exists | `modularity-review` |
| Pure code mechanism with **no** product/scope/boundary effect (local refactor shape) | Agent decides — still prefer a one-line note in plan Notes if non-obvious. **Names** are not a product fork: follow `code-style/RULE.mdc` § Category, not instance (do not bake the ticket into the identifier) |

### Generality (instance vs rewirable)

**SSOT for this fork.** Run the mandatory checklist on this topic before phases/steps assume a platform or a one-off. Do not silently over-build or under-build.

**Three levels** (later options stronger / more modular):

| Level | Meaning | When |
|-------|---------|------|
| **Instance** | One UI/path for the known job (a buy button on this page; this SKU) | Default when only one consumer is known now |
| **Feature** | One bounded domain with a public API (checkout start/confirm/fail); thin UIs call it | The work is a domain even with one screen |
| **Rewirable** | Ports for “what is bought / how paid / what success means” so other products plug in | ≥2 product kinds are **in scope now**, or the owner picks future expansion *and* names the second consumer |

**Default:** specific enough to ship the known job. Modular only where a second real consumer already exists or is a Closed row.

| Situation | Classify |
|-----------|----------|
| One known use; second use is a guess | **Clear-winner → instance** (or **feature** if it is already a domain). Log deferred second use as a non-goal. Do **not** ask. |
| Two known uses, same verbs | **Clear-winner → feature** (one public API, two thin UIs) unless product kinds differ |
| Two known uses, different verbs | **Tie or clear-winner → split features**; share only what both need. Ask if which concepts belong together is Pareto-fair |
| Owner wants a platform “just in case” | **Ask** — `[Wins: least code]` instance vs `[Wins: reusability]` rewirable, with explicit pay lines |

Guessed future use stays a **deferred non-goal** in `DECISIONS.md`. Do not code the unused hook.

**Not this cue:** npm/package reuse (`dont-reinvent-the-wheel`); extracting a shared helper with <3 call sites (`optimize2`); scoring how hard a shipped feature is to swap (`modularity-review`).

### Mandatory fork checklist (before locking)

Before treating an approach as decided in the current plan phase, run this checklist **out loud in the work** (chat and/or ledger):

1. **Name the topic** in one line (what is being chosen).
2. **Enumerate ≥2 viable options** *or* state why only one option exists after a real search (repo neighbors + obvious alternatives).
3. **Classify:**
   - **Tie** (Pareto-fair, distinct `[Wins: …]` axes) → **ask** one grill question → then Closed.
   - **Clear winner** (one option dominates after enumeration) → **log** Closed as `clear-winner` — **no** ask. Do **not** skip the enumeration step.
   - **Precedent-only** → hand to `pattern-review`.
4. **Anti-dup:** if topic already Closed/Open in `DECISIONS.md` → skip.
5. **Resume same phase** — ask → write ledger → continue Refine/Investigate/Create (do not jump ahead).

**Anti-pattern:** Invent one approach, call it clear-winner, never name alternatives. That is a silent lock — forbidden.

**Scale:** For Complexity **M** or **L**, before Present: `DECISIONS.md` must exist with every product/scope lock from the plan represented as a Closed row (asked or clear-winner), **or** one Closed row stating `no product forks — <reason>`.

## Ledger — `DECISIONS.md`

**Path:** `documentation/jobs/temp_job_<name>/DECISIONS.md`

**Template:** [`references/decisions-template.md`](references/decisions-template.md)

**First writer** (`grill-me`, `plan-grill`, `plan-grill-auto`, or `feature`) creates the job folder + file on the first product decision. Derive `<name>` kebab-case; if ambiguous, ask once for the slug. `plan-grill-auto` picks the slug and logs it — no ask.

Create the file only when logging the first decision. No empty stubs.

## Continuous rail (call sites)

`plan` runs this skill’s checklist at **each** corridor phase — not only when “something feels fuzzy”:

1. **Refine** — scope, non-goals, success meaning, **generality** (instance vs feature vs rewirable).
2. **Investigate** — ride vs new, neighbor absorption, greenfield, architecture boundary, generality if still unlocked.
3. **Create** — every product/scope pick about to enter phases/steps (including assumed platforms).

Loop shape: **ask one question (if tie) → write DECISIONS.md → continue the same phase.** One fork, one question, one turn — even when the next tie is already known, resolve and log the current one first; re-check it still applies before asking the next.

## Ask vs log

| Situation | Action |
|-----------|--------|
| Tie after enumeration | One grill-style question; then Closed |
| Clear winner after enumeration | Log Closed `clear-winner`; no question |
| Already in Closed / Open | Skip (anti-dup) |
| Industry/precedent only | `pattern-review` |
| Package/pattern reuse vs custom | `dont-reinvent-the-wheel` |
| Helper extract / Rule of Three | `optimize2` |
| Pure mechanism, no product/boundary edge | Agent decides (see “Not a fork”) |

Question style: `.agents/skills/grill-me/SKILL.md` § Question style — do not fork a second format. Cost-sketch table stays in the chat message. `AskQuestion` `prompt` and option labels are plain text — no markdown table. Same **turn contract** applies: one grill question per turn, think/re-ground on `DECISIONS.md` before the next.

## Flow

1. **Enter** current `plan` phase.
2. **Scan** for fork cues (table above) before locking wording.
3. **Checklist** — topic → options → classify.
4. **Resolve job folder** — existing `temp_job_*` or first-writer create.
5. **Load ledger** — dedupe.
6. **Ask or log** — update Closed/Open/Log.
7. **Resume same phase** until no unchecked forks remain; then advance phase.

## Handoffs

| `plan-grill` owns | Hand off to |
|---|---|
| Tie during plan corridor | User answer → ledger → same phase |
| Clear-winner after enumeration | Ledger → same phase |
| Gate-1 / standalone stress-test | `grill-me` |
| Precedent / non-standard industry path | `pattern-review` |
| Package/pattern reuse vs custom | `dont-reinvent-the-wheel` |
| Helper extract / Rule of Three | `optimize2` |
| Replaceability scores after a module exists | `modularity-review` |
| XS work | `quick-piv` |

**SSOT note:** Plan-time forks live in `DECISIONS.md`; `DEVELOPMENT_PLAN.md` is how to build. `implement` soft-warns on open rows (no hard block). Relationship diagram: [`.agents/skills/router/references/skill-relationship-flow.md`](../router/references/skill-relationship-flow.md).
