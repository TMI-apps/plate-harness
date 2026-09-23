---
name: grill-me
description: >-
  Optional warm-start interview until scope edges and interaction boundaries are
  aligned. Grounds every edge question in what already exists in the repo. Logs
  closed decisions to DECISIONS.md (shared with plan-grill). IF gate 1 fails
  (vision/tradeoffs) OR the user wants a stress-test OR says "grill me" THEN use
  this skill before or beside planning. IF gate 2 fails (acceptance/APIs) THEN
  `plan` § Refine only. IF already inside the plan corridor THEN product/scope
  forks use `plan-grill` (rail + fork checklist), not a second full grill-me.
  One question per turn, always — answer first, re-ground, then ask the next.
disable-model-invocation: false
---

# Grill me

Interview the user until there is shared understanding of the feature's **scope edges** and **interaction boundaries**, resolving the decision tree branch by branch — with each boundary informed by **what the codebase already does**, when relevant neighbors exist.

Agree on **where the feature stops**, **what it will NOT do or touch**, and **how it meets the functionality around it**. Stay at the perimeter: interior design comes only where an edge choice already constrains it.

**This is a scope stress-test grounded in the repo** — use codebase facts to sharpen boundary questions; keep product edge questions (perimeter, non-goals) central so loop narration supports alignment rather than replacing it.

## What this skill owns (SSOT)

`grill-me` owns the **optional warm start** before the plan corridor: reaching alignment on scope edges and logging them to the shared decisions ledger. It hands requirements prose to **`feature`** and execution planning to **`plan`**. User stories, journeys, and `DEVELOPMENT_PLAN.md` are not this skill's artifacts.

**Ledger:** `documentation/jobs/temp_job_<name>/DECISIONS.md` — format SSOT [`../plan-grill/references/decisions-template.md`](../plan-grill/references/decisions-template.md). **First writer** (`grill-me`, `plan-grill`, or `feature`) creates the job folder + file on the first product decision. Log each closed answer (and clear-winner rows **after enumerating alternatives**) so `plan-grill` never re-asks.

**Skip gate:** trivial/XS change with no real edges → route to `quick-piv` instead of grilling.

**Plan corridor:** once `plan` has started, new product/scope/architecture-boundary forks use the **`plan-grill` rail** (mandatory fork checklist beside Refine / Investigate / Create) — not another full `grill-me` session. Prefer closing more questions here so the corridor asks less. Router SSOT: `.agents/skills/router/SKILL.md` § Plan corridor flow.

## Codebase grounding (mandatory, scoped)

Ground edge questions in repo context so ride-vs-new and boundary choices are concrete. Search **only for neighbors implied by the agreed perimeter** (steps 1–3 below) — scope the search to named neighbors once perimeter is agreed.

| Stage | Action |
|---|---|
| **Steps 1–3** (problem, perimeter, non-goals) | Ask product questions; read `documentation/DOC_APP_VISION.md` when helpful. Defer codebase search until step 4. |
| **Step 4** (neighbor map) | For each neighbor from the agreed perimeter, search narrowly (its feature area + direct dependencies, ~3–5 files) and trace its flow end-to-end (UI → hook/service → API/edge → DB/storage) in one plain-language sentence. |
| **Per edge answer / when stuck** | Re-check the answer still fits the traced loop; step back (problem, route, evidence, alternative) if unclear, then resume. |

**Verify before you state.** Name loops and behaviors only after reading enough to be confident; when unsure, say `Uncertain — only read X so far` or `Not found in repo` and explore more or ask the user to confirm.

For each neighbor, surface a **hook map** in plain language (user-visible names — save file/symbol detail for `plan`) before the boundary question:

1. **Name** — what the user knows it as (auth, notifications, import…).
2. **Loop** — trigger → path → outcome, or `Not found` / `Uncertain`.
3. **Hook point** — where this rides, if it rides — mark **provisional** until that neighbor's edge decisions are agreed; use `TBD` when no loop exists.
4. **Fork cost** — one line on what a new path would duplicate, or `N/A`.

Use exploration to make boundary questions **evidence-based**. Keep mechanism choices with the agent; ask the user about scope, behavior, and edges. File-level paths, migrations, and API contracts belong in `plan` § Investigate — grill still learns what exists so alignment isn't abstract.

Run `prime` once at step 4 if the repo is unfamiliar, then trace each neighbor — a single prime pass supplements, not replaces, per-neighbor grounding.

## Interrogation priority (edges before interior)

Resolve in this order; a branch may open another. Treat integration hooks as **edge work** in step 4 — surface where new work attaches while mapping neighbors, before interior questions.

1. **Problem + success** — one sentence each.
2. **Perimeter (in scope)** — smallest set of capabilities that counts as this feature.
3. **Non-goals (out of scope)** — will NOT do / NOT touch (see below).
4. **Neighbor + hook map** — per neighbor: name, traced loop (or not found), provisional hook point, then **ride vs new**.
5. **Generality** — instance vs feature vs rewirable. SSOT [`.agents/skills/plan-grill/SKILL.md`](../plan-grill/SKILL.md) § Generality. If the topic is not in `DECISIONS.md`, treat it as an edge: one known consumer → log clear-winner (do not ask); ask only on a real tie (two consumers, or owner wants a platform “just in case”).
6. **Edge decisions** — one question per boundary: handoff, ownership, atomicity, precedence vs observed behavior.
7. **Interior** — only where an edge choice already constrains it.

### Ride vs new (default-greenfield check)

For each neighbor, trace the existing loop (or confirm absence), then ask whether this feature **rides** it (same flow/data path, extended) or forks a **parallel/new** one.

**Burden of proof is on greenfield** — state a repo-grounded reason the existing path can't absorb the work (divergent concept, incompatible constraints, unacceptable coupling) before proposing a fork. When no loop exists, greenfield is justified — confirm the user wants a new path and capture what it must not duplicate later.

This is a **scope/boundary** question for the user (riding vs forking changes consistency, divergence risk, coupling). Keep file/mechanism choices with the agent; look at the repo first so the question is concrete.

## Non-goals are first-class

Name what the feature will **NOT** do and **NOT** touch — often the highest-value grill output. Push on two lists, grounding **will NOT touch** in verified behavior when you have it:

- **Will NOT do** — capabilities a reasonable person might assume are included but are deferred or excluded.
- **Will NOT touch** — existing functionality/behavior that stays unchanged.

Mark each **deferred** ("not now") vs **excluded** ("not ever"). Pair as "In: X. Out: Y." When there genuinely are none, say so and move on.

## Roles

The user owns behavior, product feel, direction, priorities, tradeoffs; the agent translates that into code and ties the conversation to what already exists.

Ask about product direction, scope, and boundaries — ride-vs-new is such a boundary (see above). Reserve file/function/layer/mechanism choices for the agent unless they change product direction or scope.

Share findings plainly ("the app already does X via Y") or uncertainty ("no notifications pipeline found") so boundary questions are informed.

## Question style

### Turn contract (mandatory — no exceptions)

- **One question per turn.** One `AskQuestion` call, one entry in its `questions` array. Never queue a second question, preview upcoming questions, or merge two boundary questions into one form "for efficiency" — even when both are already known.
- **Stop and think before the next ask.** After the user answers: update `DECISIONS.md`, re-check the answer against the hook map / perimeter / non-goals, and only then decide the next single question. An earlier answer can change which question is next, or make one unnecessary — decide that in this thinking step, not by asking anyway.
- A turn may include grounding prose (evidence, cost sketch) **plus the one question** — never plus a second question.

Use a question tool call when available; prefer multiple-choice when branches are clear.

**Offer Pareto-optimal options only** — each choice wins on a **distinct** axis. When one choice dominates every axis with acceptable costs on the rest, state it, **enumerate the alternatives you rejected**, **log as clear-winner** in `DECISIONS.md`, and move on — do not invent fake tradeoffs and do not skip enumeration.

**Axes (pick one winner per option):** performance, code consistency, least code, reusability, UX, separation/ease-of-cutting.

### Boundary-question template (required)

Structure every multiple-choice boundary question in this order:

1. **Evidence** — one line on what the repo shows (or `Uncertain`). Explore first when the codebase can answer part of the question.
2. **Cost sketch** — when exploration allows, a compact table comparing branches on **Perf | Code | UX** (add **Scope-cut** when relevant). Mark agent estimates; `plan` verifies exact numbers.
3. **Choices** — 2–4 options, each one line:
   - **`[Wins: <axis>] <label>`** — gain; **pay** (explicit cost on other axes).
4. **Omnipresent** — always append both escape hatches below.

**Example option line:** `[Wins: performance] Shader-only fake glow — no extra passes; pays with less convincing scatter.`

Every multiple-choice question includes two omnipresent options:

- **"Explain the UX impact first"** — research the flow, explain what each branch means for users, re-ask.
- **"Dig deeper in the codebase"** — widen exploration, update the hook map, re-ask.

### Anti-patterns (do not ship questions like these)

- Options grouped **only by feature area** (e.g. "glints / Fresnel / foam") with no `[Wins: …]` axis or pay line.
- Two options claiming the **same winning axis** without different pay lines.
- **Bundling** integration approach and content scope in one question when each branch has different Perf/Code/UX — split (usually integration perimeter first, then what is in the bright-pass / handoff).

Mechanism detail (`functionA` vs `functionB`, library vs hand-roll) belongs in `plan` **unless** the integration choice changes product scope, perf budget, or what neighbors are touched — then grill it using the template above (evidence + cost sketch + axis labels).

Ask at the level the user can answer — behavior, scope, edges:

- Perimeter: "Is v1 just browsing cached data, or working fully offline and syncing later?"
- Grounded edge: *Evidence: save flow shows a toast today.* Cost sketch + `[Wins: UX]` / `[Wins: least code]` / … options with pay lines.
- Grounded ride-vs-new: *Evidence: shared notifications pipeline exists (prefs + history).* Ride vs fork with axis labels, not file names alone.

## Recommendation timing

During grilling, share hook-map findings and what each branch means for users. Save the consolidated **recommended direction** for the closing summary — mid-grill evidence informs; it doesn't prescribe.

## Ending the grill

Close with a **chat summary** plus an up-to-date **`DECISIONS.md`** (all closed topics logged):

- **Vision & constraints** — concise.
- **In scope** — the agreed perimeter.
- **Non-goals** — "will NOT do" / "will NOT touch", each *deferred* or *excluded*.
- **Neighbor/boundary map** — per neighbor: verified loop (or greenfield), **agreed** hook point (promoted from provisional), ride vs new, resolved edges.
- **Open tradeoffs** — product-framed.
- **Recommended direction** — including which loops to extend; file-level detail for `plan` § Investigate.
- **Ledger path** — `documentation/jobs/temp_job_<name>/DECISIONS.md` when any decision was logged.

**Next:** re-run `.agents/skills/router/SKILL.md` gates 1–2 → `plan` § Refine or `feature`. During `plan`, `plan-grill` continues the gate for *new* forks only (`plan-grill-auto` when the user forbids questions). Proceed to `implement` only after a `DEVELOPMENT_PLAN.md` exists.

---

## Handoffs

| `grill-me` owns | Hand off to |
|---|---|
| Scope-edge alignment + `DECISIONS.md` rows | `feature` (Phase 2) to document requirements |
| Resolved scope ready for execution planning | `plan` § Refine → Investigate (`plan-grill` for new forks) |
| Gate 2 acceptance / API shape detail | `plan` § Refine (grill informs; plan records) |
| Plan-time product/scope forks (rail + checklist) | `plan-grill` (via `plan` corridor); `plan-grill-auto` when the user forbids questions |
| Migrations, RLS policies, exact API contracts | `plan` § Investigate |
| Trivial/XS work with no real edges | `quick-piv` |
| Landed implementation | `implement` / `finish` |

**SSOT note:** `grill-me`, `plan-grill`, `plan-grill-auto`, and `feature` share `DECISIONS.md`; `feature`/`plan` record requirements and execution. Chat summary remains; ledger prevents duplicate asks.
