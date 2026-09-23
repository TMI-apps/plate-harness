---
name: plan-grill-auto
description: >-
  Auto-resolves plan-grill product/scope forks without asking the user.
  Enumerates alternatives, picks, and logs every choice in DECISIONS.md.
  Narrates progress as an LLM briefing. Use during the plan corridor when
  the user says answer yourself, don't give any to me, I won't check only
  test, or /plan-grill-auto (bare "don't ask me" counts only in that
  corridor). Replaces plan-grill asks during the plan corridor,
  then continues to implement so the user can test. Not for XS/quick-piv.
  Not for industry-precedent forks (pattern-review). Not for package/pattern
  reuse vs custom (dont-reinvent-the-wheel).
disable-model-invocation: false
---

# plan-grill-auto

**Same rail as `plan-grill`, agent is the answerer.** Fork checklist stays mandatory. User never sees a choice. User tests the shipped result.

Origin: Merantau3 `.agents/skills/plan-grill-auto` (ingested 2026-09-22). Checklist SSOT stays `plan-grill`.

## User contract (verbatim)

use grill-plan, but then reason through the choices yourself. Don't give any to me. Answer then all yourself and keep a list of your decisions. You can explain explain progress like you would to an llm. I won't check, only test the result

## What this skill owns (SSOT)

| Owns | Does not own |
|------|----------------|
| Auto-resolve of plan-corridor product/scope/architecture-boundary forks | Fork checklist / cues / ledger path → [`plan-grill`](../plan-grill/SKILL.md) |
| LLM-briefing progress (no user questions) | Question style template → [`grill-me`](../grill-me/SKILL.md) § Question style (used internally, never shown as a Q) |
| Closing every fork into `DECISIONS.md` (`source: plan-grill-auto`) | Writing `DEVELOPMENT_PLAN.md` body → `plan` |
| Suppressing Present-wait / "shall I implement?" once active | Industry/precedent A/B/C procedure → `pattern-review` (agent still picks) |
| | Package/pattern reuse vs custom → `dont-reinvent-the-wheel` |
| | User test of the result → user |

**Skip gate:** XS / `quick-piv` — do not run this rail. If the user invoked auto on XS work, run `quick-piv` with **no questions** (same communication rules).

**Do not enter `feature`.** That skill's 🔴 stops require the user. Auto mode uses the `plan` corridor.

## Triggers

Activate when **any** of these is true **and** the job is a plan corridor (or a new bounded build that will enter `plan`), then persist for that job's product/scope forks:

- `/plan-grill-auto`
- "answer yourself" / "reason through the choices yourself"
- "Don't give any to me" / "don't ask me" (only while choosing product/scope/architecture-boundary — not a global mute)
- "I won't check, only test"

**Does not activate** (these still ask):

- Bug / regression intake → `debug`
- Protected-file consent → `agent-behavior` § Protected Files
- `finish` commit gate and `push` confirm
- User invoked `/feature` (🔴 stops). Auto stays off until they say an auto phrase again.

**Off only:** user says "ask me" / "grill me" / "stop auto-grill", or the thread becomes a `debug` incident. Then revert to `plan-grill` asks.

IF already inside `plan` THEN swap the rail (do not restart Refine). IF a new bounded job AND auto just invoked THEN read `plan` and run the corridor with this rail. Do **not** enter `feature`.

## Communication

Talk like briefing another LLM. Dense. Named forks, options, pick, why. No pedagogy. No "which would you prefer?"

**Forbidden while active** (product/scope/architecture-boundary forks only):

- `AskQuestion` / any question tool for those forks
- Multiple-choice offered to the user for those forks
- Waiting at `plan` § Present
- Asking whether to implement
- Leaving `DECISIONS.md` **Open** rows for the user
- Claiming success — user tests; agent stops at a testable result

**Still ask** (not a product fork): protected-file edits, `debug` intake, `finish` / `push` confirms.

**Progress shape (every fork):**

```text
Fork: <topic>
- [Wins: <axis>] <A> — pays: <cost>
- [Wins: <axis>] <B> — pays: <cost>
Pick: <choice>. <one-line why, repo- or vision-grounded>
Logged D<n> closed source=plan-grill-auto (<agent-pick|clear-winner>)
```

Enumerate internally using `grill-me` § Boundary-question template (evidence + cost sketch + `[Wins:]`). Do **not** paste that template as a question.

## Flow

1. **Enter** current `plan` phase (Refine / Investigate / Create).
2. **Run** [`plan-grill`](../plan-grill/SKILL.md) **mandatory fork checklist** — topic → ≥2 options or justify sole option → classify. Anti-dup via existing ledger. Never invent-one-and-stamp-winner.
3. **Resolve** — see Ask vs log below. Write `DECISIONS.md` immediately.
4. **Resume same phase** until no unchecked forks remain.
5. **Gate-2 / vision / precedent stops that would ask the user** — agent fills them (below), logs, continues.
6. After Create + `DEVELOPMENT_PLAN.md`: **do not wait**. M/L → `review-dev-plan` (agent-run). Then write plan § **Decisions made** `agent-accept <date> — plan-grill-auto` and set Summary **Plan review** to `Done <date>`. That satisfies `implement`'s pending-review stop. A Closed `plan-grill-auto` precedent row is the Pattern & precedent waiver — `implement` must not re-ask it. Then `implement`. Stop when there is a testable result on the relevant app surface. Do **not** `finish` / commit unless the user asked.

### Ask vs log (overrides `plan-grill`)

| Situation | Action |
|-----------|--------|
| Tie after enumeration | Agent picks via **Tie resolution**; log Closed `agent-pick` — **no ask** |
| Clear winner after enumeration | Log Closed `clear-winner`; no ask |
| Already Closed | Skip |
| Already Open (from earlier `grill-me` / `plan-grill`) | Resolve now; move to Closed |
| Industry/precedent only | `pattern-review`; if that skill would stop for owner A/B/C, **pick and log** (`source: plan-grill-auto`) |
| Package/pattern reuse vs custom | `dont-reinvent-the-wheel`; take the rec; log if it changes product/scope |
| Pure mechanism, no product/boundary edge | Agent decides; optional one-line in plan Notes |
| `DOC_APP_VISION.md` is `DRAFT` | Do **not** pause. Log `vision-deferred` + smallest testable perimeter; continue |
| Gate-2 acceptance/API examples | Agent writes concrete examples from repo + vision; do not ask |

### Tie resolution (apply in order; stop at first that decides)

1. Explicit constraints already in this thread (user text beats inference).
2. Filled `documentation/DOC_APP_VISION.md` (skip if `DRAFT`).
3. Ride the existing neighbor loop unless greenfield has a repo-grounded reason it cannot absorb the work (`grill-me` § Ride vs new).
4. Smallest v1 perimeter that is user-testable.
5. Remaining Pareto set: if the fork is user-visible feel → `[Wins: UX]` matching live neighbor surfaces; else `[Wins: code consistency]` then `[Wins: least code]`.
6. Still tied → first remaining option; notes must say `tie-break: first remaining`.

Axes stay those in `grill-me` § Question style: performance, code consistency, least code, reusability, UX, separation/ease-of-cutting. Each option still needs a distinct `[Wins:]` axis.

## Ledger

**Path / template:** [`plan-grill/references/decisions-template.md`](../plan-grill/references/decisions-template.md)

- **source:** `plan-grill-auto`
- **notes:** pick + losing options + why (one line is enough)
- **Log line:** `D<n> closed via plan-grill-auto (<agent-pick|clear-winner>)`
- First writer creates `documentation/jobs/temp_job_<name>/DECISIONS.md` on the first decision. Derive `<name>` kebab-case from the job; if ambiguous, pick a slug and log it — do not ask.
- No empty stubs. No Open rows waiting on the user.
- M/L before Present: every product/scope lock is Closed, **or** one Closed row `no product forks — <reason>`.

## Handoffs

| `plan-grill-auto` owns | Hand off to |
|---|---|
| Tie / clear-winner during corridor | Ledger → same `plan` phase |
| Corridor complete | `review-dev-plan` if M/L required → agent-accept in plan **Decisions made** + Plan review `Done` → `implement` (no Present wait) |
| Testable result | Stop. User tests. Then `finish` only if they ask |
| Precedent procedure | `pattern-review` (pick internally) |
| Package/pattern reuse | `dont-reinvent-the-wheel` |
| XS | `quick-piv` (still no questions) |
| User re-enables asking | `plan-grill` |

**SSOT note:** Checklist/cues live in `plan-grill`. This skill only changes **who answers** and **whether the corridor waits**. Diagram: [`.agents/skills/router/references/skill-relationship-flow.md`](../router/references/skill-relationship-flow.md).
