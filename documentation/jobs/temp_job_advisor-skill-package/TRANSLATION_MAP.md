# Translation map — repo harness → advisor package

Job: `temp_job_advisor-skill-package`
Sources read at harness commit **`a314fcc`**, path `.agents/skills/<name>/SKILL.md` (36 folders).
Target: `.agents/advisor-package/skills/<name>/SKILL.md` (Claude Desktop, education advisors).

Phase 2 of `DEVELOPMENT_PLAN.md`. This map is the contract every later phase translates against.

## Shipped set

| Group | Skills |
|-------|--------|
| Self-learning core (D26) | `router`, `learn`, `align-harness`, `create-skill` |
| Work corridor (D28 folds) | `refine`, `plan`, `deliver`, `review` |
| Triage — ship only if substance survives (D16) | `challenge`, `standards-align`, `check-what-exists`, `root-cause` |
| Non-skill artifacts | `README.md` (maintainer), `QUICK_START.md`, `PROJECT_INSTRUCTIONS.md` (D13), `MANIFEST.md` |

`create-skill` stays separate from `align-harness` (**D32**): `align-harness` owns *how* an existing
skill is edited, superseded, or removed, and hands off to `create-skill` when a **new** skill is needed.

## Vocabulary lock

Every ported skill uses the right-hand column. No exceptions, no parenthetical repo terms.

| Repo term | Advisor term |
|-----------|--------------|
| codebase, `src/**`, feature | the **deliverable** (report, deck, training, spreadsheet, letter) |
| `DEVELOPMENT_PLAN.md`, `DECISIONS.md` | **artifacts** — a plan artifact, a decisions artifact (D30; `.md` file only as fallback) |
| repo rules, `.cursor/rules/**` | **house rules** (Project instructions and org guidance) |
| branch, commit, push, PR, semver, changelog | *dropped* (D4) |
| validator, `pnpm …`, CI, gate script | **checks a human can make** — read-and-confirm prose (D5) |
| subagent, fan-out, parallel lenses | sequential passes in one conversation (D7) |
| layer, migration, architecture boundary | *dropped* — no code analogue |
| skill file path (`../learn/SKILL.md`) | the skill **name** plus "invoke it now" (D12, D25) |

## Authoring standard

- **Frontmatter:** `name` + `description` only. Description ≤200 characters, written in advisor
  language, states what it does *and* when to use it (that string is the trigger).
- **Body:** ≤500 lines; depth moves to `references/*.md` inside the same skill folder.
- **Banner:** first body line states the skill targets advisory work in Claude Desktop.
- **Handoffs:** name the target skill and instruct the agent to invoke it in this turn. Never a path,
  never "see the file".
- **No scripts, no executables** (D5). No repo file references. No zip committed here (D24).
- **Artifacts:** offer to save; never require a durable store (D11).

## Disposition table

Enum: `port` · `fold into <skill>` · `triage in Phase 5` · `drop — reason`.

| # | Source skill | Disposition | Shipped as |
|---|--------------|-------------|-----------|
| 1 | `align-harness` | port | `align-harness` — corpus audit + skill-edit protocol (D32) |
| 2 | `api-integrate` | drop — vendor API/contract research; no integration code in scope (D19) | — |
| 3 | `bundle-ship` | drop — multi-thread git bundling (D4, D8) | — |
| 4 | `caveman` | drop — output-compression overlay, not process discipline (D1) | — |
| 5 | `challenge` | triage in Phase 5 | candidate `challenge` — cut steps from a deliverable |
| 6 | `consolidate` | fold into `check-what-exists` | triage candidate |
| 7 | `create-skill` | port | `create-skill` — author one new skill to the standard above |
| 8 | `debug` | triage in Phase 5 | candidate `root-cause` |
| 9 | `dont-reinvent-the-wheel` | fold into `check-what-exists` | triage candidate — reuse an existing template/report first |
| 10 | `feature` | fold into `plan` | decision-stop discipline inside `plan` |
| 11 | `finish` | fold into `deliver` | wrap-up half of `deliver` |
| 12 | `grill-me` | fold into `refine` | interview half of `refine` (D17 rename) |
| 13 | `hypothesis` | fold into `root-cause` | triage candidate — pre-registered check before changing the deliverable |
| 14 | `implement` | fold into `deliver` | execution half of `deliver` |
| 15 | `improve` | fold into `router` | vague "make this better" front door |
| 16 | `layer-consistency-check` | fold into `refine` | verify the assumption behind the request before acting |
| 17 | `learn` | port | `learn` — lesson capture + update-or-replace loop (D29) |
| 18 | `modularity-review` | drop — stack/vendor replaceability; no stack here | — |
| 19 | `optimize2` | fold into `challenge` | simplify-what-exists |
| 20 | `pattern-review` | fold into `standards-align` | triage candidate (D16) |
| 21 | `plan` | port | `plan` |
| 22 | `plan-grill` | fold into `plan` | ask-before-locking rail inside `plan`, including generality (D38: instance vs reusable-kind vs rewirable) |
| 23 | `prime` | fold into `refine` | context-loading half of `refine` (D20 revised by D28) |
| 24 | `purge-skill` | fold into `align-harness` | clean removal of a superseded skill |
| 25 | `push` | drop — git (D4) | — |
| 26 | `quick-piv` | fold into `router` | fast path for small work; skips `plan` |
| 27 | `react-perf-vite` | drop — stack-specific code performance | — |
| 28 | `review` | port | `review` |
| 29 | `review-dev-plan` | fold into `review` | plan-critique mode, sequential (D7) |
| 30 | `router` | port | `router` — spine (D12, D25) |
| 31 | `rule-quality` | fold into `align-harness` | grading guidance text |
| 32 | `standards-align` | triage in Phase 5 | candidate `standards-align` |
| 33 | `start` | fold into `QUICK_START.md` | non-skill onboarding artifact |
| 34 | `update-harness` | drop — external harness intake stays with the maintainer (D2, D31 org provisioning) | — |
| 35 | `validate` | fold into `review` | compliance-against-plan mode |
| 36 | `write-adoption-guide` | drop — cross-repo adoption docs | — |

Counts: 6 ports, 15 folds, 4 triage, 11 drops.

## Concurrency snapshot

- Read at commit `a314fcc` on `develop`: `align-harness`, `learn`, `router`, `create-skill`, `plan`,
  `plan-grill`, `grill-me`, `implement`, `finish`, `review`, `validate`, `review-dev-plan`, `prime`,
  `challenge`, `standards-align`, `debug`, `dont-reinvent-the-wheel`, `consolidate`,
  `layer-consistency-check`, `quick-piv`, `improve`, `purge-skill`, `rule-quality`, `start`.
- Remaining 12 sources classified from their frontmatter descriptions (drops only).
- 2026-09-14: a previous attempt's output (`.agents/advisor-package/**` files, `TRANSLATION_MAP.md`,
  `ROUTING_FIXTURES.md`) and the `projectStructure.config.cjs` edit were removed from this checkout by
  another thread or a manual revert. Only empty folders survived. This map is a fresh rebuild.
