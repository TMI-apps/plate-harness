# Decisions — advisor skill package (Claude Desktop port)

Job: `temp_job_advisor-skill-package`
Updated: 2026-09-18

Context: port this repo's agent harness into a skill package for education advisors working in the
Claude Desktop app across Word/Google Docs, Slides/PowerPoint, Excel/Sheets, Claude, and an
in-house custom app. No repo, no git, no code.

## Closed

| id | topic | status | choice | source | notes |
|----|-------|--------|--------|--------|-------|
| D1 | Core problem | closed | Process discipline — advisors get the same staged corridor (plan → do → wrap), minus code | grill-me | Not primarily quality-lenses or onboarding |
| D2 | Distribution | closed | Out of scope for the agent — user handles getting skills to colleagues | grill-me | No installer, no IT rollout content |
| D3 | Perimeter | closed | Corridor + code skills with genuine non-code analogues; end with a harness coherence pass so nothing ships as a stub | grill-me | Greenfield harness, no remnant artifacts |
| D4 | Version control metaphor | closed | Excluded — no branch/commit/push/semver/changelog | grill-me | clear-winner (no git in Desktop) |
| D5 | Executable gates | closed | Excluded — all checks are agent-read prose, no validator scripts | grill-me | clear-winner (nothing to validate) |
| D6 | Rules layer | closed | No rules layer; always-on behavior ships as a Project-instructions block, not a skill | grill-me | Desktop has no `alwaysApply`; skills load only on trigger |
| D7 | Subagent fan-out | closed | Excluded — `validate` / `review-dev-plan` collapse to sequential single-agent passes | grill-me | No subagents in Desktop |
| D8 | Multi-agent / concurrency | closed | Excluded — no `bundle-ship`, no shared-checkout coordination | grill-me | clear-winner |
| D9 | Skill-authoring skills | ~~closed~~ superseded | ~~Deferred — stay with the maintainer~~ → **see D27** | grill-me | Reversed 2026-09-14: the package is a self-learning system, so maintenance skills ship |
| D10 | This repo's files | closed | `.agents/skills` and `.cursor/rules` stay untouched; package is a separate output | grill-me | Job docs under `documentation/jobs/` are the only repo writes |
| D11 | Artifact substrate | closed | Adaptive — agent picks a fitting format; works chat-only by default, opportunistically uses Project knowledge / Drive / attached folder | grill-me | Never demand a durable store |
| D12 | Packaging shape | closed | `router` stays the spine skill; corridor phases and important user-invocable skills are their own skills; cross-references by skill **name**, never by path | grill-me | Separately uploaded Desktop skills cannot read each other's files |
| D13 | Always-on behavior | closed | Ships as a Project-instructions text block alongside the skills | grill-me | Follows from D6 |
| D14 | Corridor phases | closed | `plan`, `implement`, `validate`, `finish` each their own skill (invocable by name) | grill-me | Also `learn` — user wants `/learn` on demand |
| D15 | Lens set (selected) | closed | `review`, `challenge` (simplify), `interview` (was `grill-me`), `learn`, check-what-exists (from `dont-reinvent-the-wheel` / `consolidate`) | grill-me | |
| D16 | `standards-align`, `pattern-review`, `debug`/root-cause | closed | Translate first, then triage: ship only what still has substance after de-coding; fold `pattern-review` into `standards-align` if thin | grill-me | Drop hollow stubs rather than ship them |
| D17 | Naming | closed | Keep repo names where they're not code jargon (`router`, `review`, `standards-align`, `challenge`, `learn`); rename jargon (`grill-me` → `interview`) | grill-me | Descriptions written in plain advisor language for triggering |
| D18 | Domain object | closed | A single **deliverable** (report, deck, training, spreadsheet) replaces "the codebase" | grill-me | Engagement-level context not modeled in v1 |
| D19 | Tool guidance | closed | Defer entirely to Claude's built-in `docx`/`pptx`/`xlsx`/`pdf` skills; package governs process only | grill-me | No house-style skill, no custom-app handling in v1 |
| D20 | Context loading | closed | Ship a `prime` analogue — reads Project knowledge / attached files and states its understanding before acting | grill-me | Own skill, not folded into router |
| D21 | Package output location | closed | `.agents/advisor-package/` inside this repo | plan-grill | Asked. Needs approved `projectStructure.config.cjs` whitelist entry (protected file). `documentation/jobs/` cannot hold it — only one nesting level, `.md`/`.yaml` only |
| D22 | Data-handling guidance (analogue of `security/RULE.mdc`) | closed | Out of scope — org handles data policy elsewhere; package must not duplicate or contradict it | plan-grill | Asked |
| D23 | One skill per folder | closed | Each skill is its own folder with its own `SKILL.md`; handoffs name the target skill and instruct the agent to invoke it | plan-grill | clear-winner — Desktop requires zip root = single skill folder. **Superseded in part by D25:** cross-skill invocation works |
| D25 | Cross-skill invocation | closed | A skill may instruct the agent to invoke another skill by name, and the agent does load and run it — user-verified 2026-09-14 | user test | Reverses the review's "isolated pamphlets" objection. `router` is a working spine, not a hope. Handoffs stay name-based (no paths) |
| D26 | Primary property | closed | The package is a **self-learning system** first. `router`, `align-harness`, and `learn` are the most important skills | user | The library is expected to grow; keeping it coherent is a shipped capability, not maintainer-only |
| D27 | Skill-authoring / maintenance skills | closed | **Ship them** — `align-harness` and `learn` go in the package, plus authoring capability for new skills | user | **Reverses D9.** D9's "advisors consume, maintainer authors" no longer holds |
| D28 | Skill count | closed | Reduce where merging loses nothing — fold overlapping corridor skills rather than porting one-for-one | user | Answers the review's "too many skills" finding without abandoning the corridor |
| D29 | How the learning loop closes | closed | `learn` walks through the relevant skills and updates them in place; where updating is impossible it produces a full **replacement** skill for the human to re-upload | user | No external canonical library required. Installed skills are read-only to the agent, so "replacement" is the escape hatch |
| D30 | Plan + decisions format | closed | **Artifacts** are the format and the word used with advisors; `.md` files are the fallback | user | Sharpens D11: adaptive still, but artifacts are the default. Skills must say "artifact", never "DEVELOPMENT_PLAN.md" |
| D32 | `create-skill` vs `align-harness` | closed | Both ship, separate. `align-harness` **owns how skills are edited** (edit protocol, supersede, removal); it refers to `create-skill` when a **new** skill must be authored | user | Closes the Phase 2 open question. Core stays 4 skills |
| D31 | Claude tenancy | closed | **Claude Team** — Owner can provision skills org-wide (optional plugin scoped to a group). Self-upload is fallback, not the default | user | Closes the Phase 2 open question. `QUICK_START` / README lead with org provision |
| D24 | Zip artifacts | closed | No `.zip` committed to this repo; folders only, user zips at distribution time | plan-grill | clear-winner — follows D2 (distribution is the user's role) and the `.md`-only whitelist |

| D33 | Sizing units | closed | Work is sized in **content volume the agent produces or reads** — words, slides, rows, source documents — never in human time ("one sitting", days, effort) | user | The agent does the writing, so the estimate has to be in its terms |
| D34 | `shape` naming | closed | Renamed **`refine`** — it folds `grill-me` (interview), `prime` (read first) and `layer-consistency-check` (verify the assumption) | user | Supersedes the D17 name; "refine" describes narrowing a fuzzy request better than "shape" |
| D35 | Who drafts small work | closed | `deliver` accepts a **confirmed brief as its plan** for Small work; `refine` / `plan` / `router` hand off to it and never draft themselves | user | Audit found the sizing rewrite had created a fast path that skipped `deliver` entirely, losing step checks, cleanup and the handover card |
| D36 | Sizing table owner | closed | **`router` gate 3** owns the full table; `refine` and `plan` restate only the numbers they act on, in identical wording | user | Separately-installed skills cannot read each other, so one owner plus minimal identical copies is the best available SSOT |
| D37 | `learn` trigger threshold | closed | Run `learn` on the **first** correction that states a rule or preference, and on any repeat — one rule across skills, Project instructions, MANIFEST and QUICK_START | user | Six files previously disagreed (first correction vs only on repeat); waiting for a repeat discards the clearest signal |
| D38 | Generality of a new request | closed | `refine` and `plan` must decide instance vs reusable-kind vs rewirable process before drafting. Default: one known use → this deliverable only. Ask only when two uses exist or the person wants a reusable process “just in case”. Guessed future uses are deferred non-goals, not extra sections | user | Mirrors repo `plan-grill` § Generality. Package folders are absent in this checkout — apply on next `refine`/`plan` write |

## Open

_None._

## Log

- 2026-09-14 — D1–D3 closed via grill-me (asked)
- 2026-09-14 — D4–D9 closed via grill-me (recommended set accepted)
- 2026-09-14 — D10–D11 closed via grill-me (asked)
- 2026-09-14 — D12–D14 closed via grill-me (asked, after reading `router` + `create-skill` and verifying Desktop skill mechanics)
- 2026-09-14 — D15–D17 closed via grill-me (asked)
- 2026-09-14 — D18–D20 closed via grill-me (asked)
- 2026-09-14 — D21 closed via plan-grill (asked, Investigate)
- 2026-09-14 — D22 closed via plan-grill (asked, Investigate)
- 2026-09-14 — D23–D24 closed via plan-grill (clear-winner, Investigate)
- 2026-09-14 — review-dev-plan run (6 lenses); platform assertions corrected against Anthropic docs
- 2026-09-14 — D25–D28 closed from user statement + user test; D9 superseded by D27
- 2026-09-14 — D29–D30 closed from user statement (learning loop shape; artifacts as plan/decision format)
- 2026-09-14 — D31 closed from user statement (Claude Team tenancy)
- 2026-09-14 — D32 closed from user statement (align-harness owns skill editing; refers to create-skill for new skills)
- 2026-09-14 — D33–D34 closed from user review (content-volume sizing; `shape` → `refine`)
- 2026-09-14 — five-lens library audit run on the shipped package (separation, SSOT, contradictions, handoffs, triggers); D35–D37 closed at the audit gate
- 2026-09-18 — D38 closed from user (generality fork in `refine`/`plan`; source SSOT is repo `plan-grill`)
