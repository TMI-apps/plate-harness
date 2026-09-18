# Coherence log — advisor package

Job: `temp_job_advisor-skill-package`. Phase 7 of `DEVELOPMENT_PLAN.md`, run 2026-09-14 against the
12 shipped skills. Method: the `align-harness` lenses applied to the package by hand, sequentially.

## Mechanical checks

| Check | Result |
|-------|--------|
| Skill count | 12 |
| `name` matches folder | 12/12 |
| `description` ≤200 characters | 12/12 (range 173–197) |
| Banner line present | 12/12 |
| `## Never do` section present | 12/12 |
| Body under 500 lines | 12/12 (61–98) |
| Every skill has a `router` row | 12/12 |
| Handoffs pointing at a skill that doesn't exist | 0 |
| Repo leakage (paths, git, branches, tooling, plan filenames) | 0 (only the prohibition line inside `edit-protocol.md`) |
| `pnpm validate:structure` | green |

## Lens findings

| # | Lens | Severity | Finding | Resolution |
|---|------|----------|---------|-----------|
| 1 | Overlap | blocking | `challenge` and `standards-align` both act on existing work with no tiebreak; `router` had none | Tiebreak added — steps vs shape, and run `standards-align` first when both apply |
| 2 | Overlap | blocking | `root-cause` and `review` both start from "something is wrong" | Tiebreak added — one draft vs a recurring problem |
| 3 | Overlap | advisory | `check-what-exists` and `refine` compete when starting new work | Tiebreak added — shape first unless the person already knows what they want |
| 4 | Single owner | ok | Skill editing lives only in `align-harness` / `edit-protocol.md`; `learn` and `create-skill` reference it by name rather than restating it (D32) | — |
| 5 | Contradiction | advisory | `align-harness` handed off to `plan`, whose vocabulary is deliverable-shaped | Qualified — invoke `plan` treating the library as the deliverable |
| 6 | Contradiction | ok | Handover language consistent: `deliver` and `review` both refuse to declare work finished; Project instructions say the same once | — |
| 7 | Handoffs | ok | All 12 names resolve; no reference to a folded or dropped source skill | — |
| 8 | Triggers | ok | No two descriptions compete for the same phrasing after the three tiebreaks | — |
| 9 | Foreign content | ok | No code, repository, branch, validator or subagent assumptions survive translation | — |
| 10 | Weight | ok | Longest body 98 lines; only `align-harness` needed a `references/` file | — |

## Nothing-lost accounting

Against `TRANSLATION_MAP.md`: 6 ports and 15 folds. Each fold's substance placed as follows.

| Folded source | Where its substance went |
|---------------|--------------------------|
| `prime` | `refine` step 1 (read what's there, state assumptions, ask for what's missing) |
| `grill-me` | `refine` step 3 (one question at a time with options) + step 4 (non-goals) |
| `layer-consistency-check` | `refine` step 2 (verify the assumption behind a change request, stop for a choice) |
| `plan-grill` | `plan` step 2 (≥2 options or justify the sole one, ask on ties, log clear winners, anti-duplication) |
| `feature` | `plan` step 2 decision stops + step 5 sign-off |
| `implement` | `deliver` steps 1–5 |
| `finish` | `deliver` steps 6–7 (cleanup, handover card, forbidden closure language) |
| `validate` | `review` step 2 (walk the plan's checks, met / partly met / not met) |
| `review-dev-plan` | `review` step 3 (plan review mode) |
| `consolidate` | `check-what-exists` steps 2–3 |
| `dont-reinvent-the-wheel` | `check-what-exists` steps 1–4 (search order, judge, recommend, recommendation only) |
| `optimize2` | `challenge` step 3 lenses + remove-before-add ordering |
| `pattern-review` | `standards-align` step 3 (named precedents, honest sourcing) |
| `hypothesis` | `root-cause` step 3 (hypothesis and prediction written before the test) |
| `purge-skill` | `edit-protocol.md` § Retiring |
| `rule-quality` | `edit-protocol.md` § Quality bar |
| `improve` | `router` gate 1 (vague requests routed to `refine`) |
| `quick-piv` | `router` gate 3 (one-sitting work skips planning) |
| `start` | `QUICK_START.md` |

Unaccounted for: **0**.

## Routing fixtures

15 fixtures in `ROUTING_FIXTURES.md`, judged against the shipped `description` strings plus `router`'s
tiebreaks. All 15 route as expected; the five traps (9, 10, 12, 14, 15) were the reason findings 1–3
were raised and are covered by the tiebreaks added above. Worth re-running with a colleague's real
sentences before wider release — a self-scored fixture run is weaker evidence than a cold reader.

## Second pass — five-lens audit (2026-09-14, after the `refine` rename and volume sizing)

Method this time: five read-only lens agents in parallel (separation of concerns and overlap; single
source of truth; contradictory instructions; composition and handoffs; trigger clarity and vague
conditionals), then a synthesis and an approval gate before any edit. The first pass above was run by
hand and missed everything in the table below — three of these came from the sizing rewrite itself.

| # | Lens(es) | Severity | Finding | Fix applied |
|---|----------|----------|---------|-------------|
| 11 | separation, contradictions, handoffs | blocking | The Small path said "draft it, then `review`", bypassing `deliver` — losing step checks, cleanup, decision capture and the handover card. `refine` and `plan` also ordered drafting while declaring they never draft | D35 — `deliver` accepts a confirmed brief as its plan for Small work; `refine` / `plan` / `router` hand to it |
| 12 | triggers | blocking | `deliver`'s description had no "when to use" clause, so nothing in the trigger could match "start section two" | Description rewritten; ends "Use when the plan is agreed or to write the next section" |
| 13 | SSOT, contradictions, triggers | blocking | Six files disagreed on when `learn` runs — first correction vs only on repeat | D37 — one rule, applied in `learn`, `router`, `deliver`, `review`, Project instructions, MANIFEST, QUICK_START |
| 14 | contradictions | blocking | `review` step 4 required a "ready to send" verdict its own never-do list forbade | Verdict reframed as an assessment ("I would send this"), never-do narrowed to claiming the decision is made |
| 15 | contradictions | blocking | `learn`'s turn contract demanded steps 1–6 in one reply while step 5 required waiting for approval on deletions | Contract split — capture and propose now; applying a deletion, narrowing or multi-section rewrite waits |
| 16 | SSOT | blocking | `deliver` claimed "`learn` reads this at the end" of its working notes; `learn` had no such step | `deliver` surfaces the corrections note in the handover card; `learn` step 1 reads it if present |
| 17 | separation, SSOT | blocking | `learn` and `create-skill` restated the edit procedure and quality bar that `edit-protocol.md` owns, leaking the D32 boundary | Both now defer to `edit-protocol.md` by name and keep only what is specific to them |
| 18 | triggers | blocking | The library forbids "when appropriate" then relied on "feels overbuilt", "feels tangled", "high-stakes", "marginal", "substantial", "nearly finished", "clearly better", "real reason" | Each replaced with an observable signal; "contested audience" defined once in `router` as a named list and referenced by that phrase elsewhere |
| 19 | separation, handoffs | advisory | Four competing pairs had no tiebreak: `review`/`challenge`, `review`/`learn`, `check-what-exists`/`standards-align`, `deliver`/post-choice implementation | Four tiebreaks added to `router` |
| 20 | separation, SSOT | advisory | `standards-align` reused trim/streamline/reframe without the definitions `challenge` owns | Now names `challenge` as the definition owner |
| 21 | SSOT | advisory | `challenge` allowed "one to three questions" against the standing one-question rule | One question per turn, and only where the unknown touches a duty, sign-off or someone else's data |
| 22 | separation | advisory | `plan`, `deliver`, `review`, `learn`, `create-skill` lacked the "when to use / when not" section `create-skill`'s own template mandates | Added to all five (`router`'s situation tables serve the same purpose) |
| 23 | handoffs | advisory | `check-what-exists` and `deliver` were missing from `router`'s continuing-work table; `check-what-exists` could hand to `plan` with the brief unsettled | Both added; `check-what-exists` now routes to `refine` first when purpose or audience is open |
| 24 | SSOT | advisory | Sizing thresholds stood in three places with three different phrasings | D36 — `router` owns the table; `refine` and `plan` keep only the numbers they act on, worded identically |
| 25 | triggers | advisory | `create-skill`'s "strong description" example competed with `review`'s real trigger | Example replaced with a visit write-up, plus a warning not to mimic a shipped description |

Mechanical re-check after the fixes: 12 skills, descriptions 178–196 characters, `name` matches folder
everywhere, no backticked skill reference that does not resolve, no remaining `shape`, no time-based
sizing, `pnpm validate:structure` green.

## Open

- `root-cause` ships provisionally (see `MANIFEST.md`) — a capable assistant handles ordinary
  troubleshooting unaided; what justifies the skill is the one-change-at-a-time discipline.
- The routing fixtures were re-scored by the same agent that wrote them. Still weaker evidence than a
  colleague's cold sentences.
- No advisor has used the package yet. Nothing here is validated by use.
