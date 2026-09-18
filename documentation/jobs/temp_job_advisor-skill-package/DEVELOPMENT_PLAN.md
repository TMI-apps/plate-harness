# Development plan: advisor skill package for Claude Desktop

## Summary

- **Goal:** Produce a self-contained Claude Desktop skill package under `.agents/advisor-package/` that gives education advisors a **self-learning** working harness: `router` dispatches, `learn` improves the skills themselves, `align-harness` keeps the library coherent as it grows, and a reduced set of work skills carries a staged corridor over a single **deliverable**. No repo, git, or tooling assumptions.
- **Why:** Colleagues work in Claude Desktop across Word/Google Docs, Slides/PowerPoint, Excel/Sheets and an in-house app. Their AI work is ad-hoc. The durable value is not a fixed set of workflows but a library that improves itself as they use it (D26).
- **Complexity:** M — coordinated markdown artifacts across a self-learning spine plus four work skills, one protected-file change, and a coherence gate; no schema, auth, or app-code impact.
- **Plan review:** Done 2026-09-14 — six-lens critique run; findings folded in (see § Review response).
- **Scope / constraints:** Product/scope locks live in the sibling [`DECISIONS.md`](DECISIONS.md) (D1–D31).

### Verified platform constraints

Checked against Anthropic docs and one user test on 2026-09-14. Earlier drafts of this plan asserted three of these wrongly; corrected here.

| Fact | Consequence for the package |
|---|---|
| A skill is a folder whose `SKILL.md` carries YAML frontmatter (`name`, `description`); optional `references/`, `assets/`, `scripts/`. Zip root = the single skill folder. | One folder per skill (D23). `name` lowercase-kebab, matching the folder. |
| **`description` is capped at 200 characters** on this surface. | The "long pushy description" tactic from `create-skill` does **not** port. Descriptions must be short, concrete, advisor-phrased. |
| **Skills require code execution / file creation to be enabled.** | Without it the whole package is silently unavailable — belongs in the install steps, not a footnote. |
| **A skill can instruct the agent to invoke another skill by name, and the agent complies** (user-verified, D25). | `router` is a working spine. Handoffs stay name-based; never file paths. |
| Only `name` + `description` are always in context; body loads on trigger; `references/` on demand. | Fewer, better-differentiated skills beat many overlapping ones (D28). |
| No always-apply rules mechanism; Project instructions + Project knowledge are the standing-context equivalents. | House rules ship as a paste-in Project-instructions block (D6, D13). |
| The skill container is ephemeral, but **Projects, project knowledge, memory and Cowork do persist**. | Corrected from "nothing persists". Plan and decisions ship as **artifacts** (D30); persistence is offered, not demanded (D11). |
| Installed skills are read-only to the agent. | `learn` updates what it can and otherwise emits a **replacement** skill for the human to re-upload (D29). |
| **Org is on Claude Team** (D31). An Owner can provision skills org-wide, optionally bundled as a plugin scoped to a group. Members can still toggle a skill off. | `QUICK_START` / README **lead with Owner provision**. Self-upload is a one-line fallback (new hire, skill disabled, or Owner delay). |
| Built-in `docx`/`pptx`/`xlsx`/`pdf` skills own document mechanics; custom skills also surface in the Office add-ins. | Package governs process only (D19). |

### Shipped skill set

**Self-learning core** — the reason the package exists (D26):

| Skill | Role | Source |
|---|---|---|
| `router` | Decide the next step and invoke the right skill | `router` |
| `learn` | Turn a correction or failure into a durable change to the skills themselves; update in place, else emit a replacement (D29) | `learn` |
| `align-harness` | Audit the growing library for overlap, drift, contradictions and dead handoffs | `align-harness` (+ its lens references) |
| `create-skill` | Author or refine one skill when a new capability is needed | `create-skill` |

**Work skills** — reduced from eight to four by folding (D28):

| Skill | Folds | Rationale |
|---|---|---|
| `refine` | `prime` + `interview` (was `grill-me`) | Restating the deliverable and interrogating its edges is one conversation, not two skills |
| `plan` | `plan` + `plan-grill` | A separate fork-rail is harness plumbing this audience does not need |
| `deliver` | `implement` + `finish` | Execute phases against gates, clean up, hand back for review |
| `review` | `review` + `validate` | Both answer "is this fit to send?" — three critique lenses flagged the duplication |

**Triage candidates** (Phase 5, outline-first): `challenge`, `standards-align` (with `pattern-review` folded), reuse-check (from `dont-reinvent-the-wheel` + `consolidate`), root-cause (from `debug`). Ship only what survives the substance test (D16).

**Non-skill artifacts:** `PROJECT_INSTRUCTIONS.md` (house rules), `QUICK_START.md` (advisor-facing, four ordered steps), `README.md` (maintainer), `MANIFEST.md` (release identity).

## Review response

Six-lens critique on the previous revision. Disposition of every material finding:

| Finding | Source lens | Disposition |
|---|---|---|
| Corridor of ten skills is too heavy; skills are isolated pamphlets | rebel, adoption | **Partly accepted** — reduced to 8 (D28). Rejected the "isolated" premise: D25 disproves it. |
| `validate`/`finish`/`review` collapse into one user moment | rebel, adoption, sequencing | **Accepted** — folded into `review` and `deliver`. |
| Advisor-facing onboarding missing; only a maintainer README | adoption, scale | **Accepted** — `QUICK_START.md` is now a Phase 6 deliverable with install steps including code execution. |
| No release identity; colleagues drift onto mismatched versions | scale | **Accepted** — `MANIFEST.md` + "re-upload the whole set" rule. |
| `TRANSLATION_MAP.md` must be a living sync contract with provenance | scale | **Accepted** — per-skill source + last-synced note; re-run coherence on every future sync. |
| Naming diverges from precedent for a non-technical audience | industry precedent, adoption | **Partly accepted** — merged skills take activity names (`refine`, `deliver`); core keeps harness names because advisors will now genuinely maintain the harness (D26/D27 make that vocabulary load-bearing rather than decorative). |
| Pattern & precedent verdict overstated | industry precedent | **Accepted** — verdict downgraded to *Acceptable product-specific* with named waivers. |
| Team/Enterprise central provisioning ignored; 200-char cap; code-execution prerequisite; persistence overstated | platform | **Accepted** — all four corrected in § Verified platform constraints. |
| Weak/self-certifying gates; Phase 4 too large; Phase 6 draft-first invites sunk cost; description tuning happens after the coherence scan | sequencing | **Accepted** — routing fixtures, per-skill gates, outline-before-draft with your ship approval, and a final re-scan after description edits. |
| "No tests" overstated — cheap objective checks exist | sequencing | **Accepted** — see § Objective checks. |
| Default persistence habit missing | adoption | **Accepted** — artifacts by default (D30), with an explicit save offer at the end of `refine`/`plan`. |
| Shrink to 2–3 skills and pilot | rebel | **Rejected** — D26/D27 require the self-learning core; a two-skill package cannot maintain itself. |

## Phase overview

| Phase | Goal | Gate | Status |
|-------|------|------|--------|
| 1 | Approved whitelist entry + package scaffold | `pnpm validate:structure` green; agent-discovery collision checked | Pending |
| 2 | Translation contract + living sync map | Every source skill has one disposition from a fixed enum; you sign off | Pending |
| 3 | Self-learning core: `router`, `learn`, `align-harness`, `create-skill` | Per-skill objective checks pass; routing fixtures route 3/3; `learn` handles the read-only case | Pending |
| 4 | Work skills: `refine`, `plan`, `deliver`, `review` | Per-skill objective checks; one worked advisory example each; artifact vocabulary throughout | Pending |
| 5 | Triage candidates (outline → your ship decision → draft) | Every candidate shipped with substance or dropped with a written reason | Pending |
| 6 | Install artifacts: quick start, house rules, README, manifest | Team Owner-provision path complete; self-upload documented as fallback; descriptions ≤200 chars and mutually distinct | Pending |
| 7 | Coherence pass + no-loss check (run `align-harness` on itself) | Zero unjustified leakage hits; all handoffs resolve; every mapped disposition traceable | Pending |

## Conflict & compliance

**Applicable rules**

| Rule | Bearing |
|---|---|
| `file-placement/RULE.mdc` | `documentation/jobs/<folder>/` allows one nesting level, `.md`/`.yaml` only → cannot hold the package (D21). Job docs stay here. Never move files programmatically. |
| `agent-behavior/RULE.mdc` § Protected Files | `projectStructure.config.cjs` is protected → Phase 1 **stops** for explicit approval. `.agents/skills/**` and `.cursor/rules/**` stay untouched (D10). |
| `architecture/RULE.mdc` | No `src/` impact; no new feature folder. |
| `code-style/RULE.mdc` | Markdown; LF endings; each concept defined once and referenced by name elsewhere. |
| `testing/RULE.mdc` | No Vitest — markdown deliverable with no runnable logic. This is **not** the same as no verification: see § Objective checks. |
| `workflow/RULE.mdc` + `finish` | Changelog/version untouched here; the eventual commit classifies as `docs` → no bump. |
| git-workflow (Model B) | Branch `develop`; other agents are active in this checkout, so re-read sources before Phases 3, 4 and 7. |

**File placements**

| Path | Status |
|---|---|
| `.agents/advisor-package/{README,QUICK_START,PROJECT_INSTRUCTIONS,MANIFEST}.md` | Needs approved config change |
| `.agents/advisor-package/skills/<name>/SKILL.md` (+ `references/*.md`, `assets/*`) | Needs approved config change |
| `documentation/jobs/temp_job_advisor-skill-package/TRANSLATION_MAP.md` | Confirmed |
| `documentation/jobs/temp_job_advisor-skill-package/ROUTING_FIXTURES.md` | Confirmed |
| `documentation/jobs/temp_job_advisor-skill-package/COHERENCE_LOG.md` | Confirmed |

Proposed whitelist block mirrors the existing `.agents/skills` entry (`SKILL.md`, `README.md`, `references/*.md`, `assets/*`) plus root `*.md`. No `.zip` entry (D24).

**Reuse / packages:** `dont-reinvent-the-wheel` skipped — bespoke authoring, no dependency choice. Reused rather than re-derived: the 36 source skills, `align-harness/references/*` for Phase 7 lenses, and `create-skill`'s progressive-disclosure guidance (its eval/CLI machinery does **not** port).

### Objective checks

Runnable in this repo while building; none ship inside the package (D5 forbids scripts in shipped skills, not verification here).

| Check | Where it runs |
|---|---|
| `pnpm validate:structure` | Phase 1, and after any new path |
| Frontmatter present; `name` === folder name; lowercase-kebab | Phases 3–4 per skill |
| `description` ≤ 200 characters; no two descriptions near-duplicate | Phases 3–4, re-checked Phase 6 |
| Body ≤ 500 lines excluding frontmatter | Phases 3–4 per skill |
| Banned-term grep: `git`, `commit`, `branch`, `pnpm`, `npm`, `src/`, `.cursor`, `RULE.mdc`, `migration`, `RLS`, `lint`, `type-check`, `repo`, `codebase`, `TypeScript`, `component`, `subagent`, `DEVELOPMENT_PLAN.md`, `eslint`, `Vitest`, `Supabase` | End of Phases 3, 4, 5; again in Phase 7 after description edits |
| Every handoff skill name resolves to a folder in `skills/` | Phases 3, 4, 7 |
| Every `references/*.md` linked from its own `SKILL.md`; no `../` or outside-folder paths | Phases 4, 7 |
| `TRANSLATION_MAP.md` covers all 36 sources, no duplicates, disposition from the enum | Phase 2 |

**Risks / attention points**

1. **Skill auto-discovery collision.** Repo agents may treat `.agents/advisor-package/skills/*/SKILL.md` as project skills. Mitigation: nest under `skills/`, banner line in every body, verify empirically in Phase 1.
2. **Trigger reliability under a 200-character cap.** Short descriptions plus Claude's tendency to under-trigger is the main adoption risk. Mitigation: Phase 6 writes 2 should-trigger and 2 near-miss phrasings per skill and tunes against them.
3. **Self-learning loop needs a human step.** `learn` cannot install its own output. Mitigation: `learn` states plainly which skill changed and what to re-upload; `MANIFEST.md` tracks the set.
4. **Divergence between colleagues.** Once `learn` starts editing local copies, two advisors' libraries differ. Mitigation: `MANIFEST.md` plus a maintainer note in `learn` — significant lessons come back to you for reissue.
5. **Concurrent agents in this checkout.** Re-read source skills before Phases 3, 4, 7 rather than trusting earlier reads.

**Open questions**

- Whether `create-skill` stays separate or folds into `align-harness` (3 core skills instead of 4). Decide at Phase 2 with the map in front of us.

**Standards diversions:** Keeping harness names for the core four is deliberate (see § Review response). Dropping the rules layer, scripts, version control and subagent fan-out is platform-forced (D4–D8).

## Pattern & precedent

| Field | Value |
|-------|--------|
| **Capability** | Porting a staged agent harness into a self-maintaining Claude Desktop skill library for non-technical users |
| **Precedents** | Anthropic's pre-built skills (one folder per capability, description-triggered); Anthropic authoring guidance (progressive disclosure, activity-style names); the Agent Skills open spec; OpenAI's documented use of SKILL.md playbooks for multi-step knowledge work; enterprise prompt/GPT libraries (versioned, owned, reviewed) |
| **Aspects reviewed** | Granularity; trigger mechanism; naming for a non-technical audience; distribution and versioning; persistence expectations; portability of executable content; whether self-maintaining skill libraries are an established pattern |
| **Findings** | *Granularity:* aligns — one folder per capability, now reduced to 8. *Triggering:* aligns, constrained by the 200-char cap. *Naming:* **diverges** for the core four (harness vocabulary), accepted because advisors now maintain the harness themselves; merged work skills use activity names. *Distribution:* **aligns** with Claude Team Owner provision as the default install (D31); `MANIFEST.md` is still the release identity for org reissue after `learn`. Self-upload is fallback only. No marketplace semver. *Persistence:* aligns — artifacts plus optional Project/Drive. *Scripts:* simplification, not full alignment; Anthropic encourages scripts for deterministic steps. *Self-maintaining library:* **unusual** — process skills for knowledge workers are documented practice, but skills that rewrite themselves are ahead of common precedent; this is the deliberate bet (D26). |
| **Verdict** | Acceptable product-specific — with waivers on naming and distribution, and an acknowledged novel bet on self-maintenance |
| **If non-standard: options** | Recorded rather than escalated: the naming and distribution divergences are waived by owner decision (D17, D2, D26). |

## Phase 1 — Approved whitelist entry + package scaffold

**Goal:** A legal home with the structure validator green.

**Steps**

1. Present the exact `projectStructure.config.cjs` diff and **stop** for explicit approval (protected file).
2. Apply the approved edit; record consent in **Decisions made**.
3. Create `.agents/advisor-package/` with `README.md` (maintainer-facing) and an empty `skills/` tree.
4. Establish the banner convention: every advisor `SKILL.md` opens with one line stating it targets Claude Desktop advisory work, not this repository.
5. Check empirically whether this repo's agents surface the advisor skills; record the outcome in **Notes during development**.

**Gate:** `pnpm validate:structure` passes; scaffold present; discovery check recorded; no other repo file modified.

## Phase 2 — Translation contract + living sync map

**Goal:** One dictionary so every later phase translates consistently, and a map that stays useful after the first port.

**Steps**

1. Write `TRANSLATION_MAP.md`: every one of the 36 source skills → shipped name → disposition from a fixed enum (`port` | `fold into <skill>` | `triage in Phase 5` | `drop — reason`), plus source path and the harness commit it was read at.
2. Lock the vocabulary once: codebase → **deliverable**; plan and decisions → **artifacts** (D30, `.md` fallback); repo rules → house rules; branch/commit/push → dropped; tooling gates → checks a human can make; feature/layer/migration → dropped.
3. Decide `create-skill` separate vs folded into `align-harness`, and confirm the reuse-check skill's shipped name.
4. Write the authoring standard: frontmatter with a ≤200-character advisor-phrased description; body ≤500 lines; `references/` for depth; handoffs name the skill and instruct the agent to invoke it; no paths; no scripts.
5. Note the concurrency snapshot: which source files were read, at which commit.

**Gate:** All 36 sources mapped, dispositions from the enum, every `port`/`fold` has a target; `plan-grill` and `prime` explicitly recorded as folds; you sign off, recorded in **Decisions made**.

## Phase 3 — Self-learning core

**Goal:** The four skills that make the library improve itself (D26).

**Steps**

1. `router`: keep the gate model (is the goal clear, is scope bounded, how big is it) and the invoke-don't-just-name contract now that D25 confirms it works. Replace situation tables with advisory situations. Drop the task backlog, branch/CI rows and plugin sections. Keep only the disambiguations that actually collide (`refine` vs `plan`, `review` vs `deliver`, `learn` vs `align-harness`).
2. `learn`: removal-first lesson capture, then act — walk the relevant skills, update them in place where possible, and where the installed copy is read-only, emit a complete replacement plus a one-line "re-upload this skill" instruction (D29). State plainly what changed and why.
3. `align-harness`: corpus audit adapted from the source skill's lenses — overlap, SSOT duplication, dead handoff names, vague conditionals, foreign content, description collisions. Sequential, no subagent fan-out (D7). Output a findings list, then ask before changing anything.
4. `create-skill` (or its folded form): author one skill to the Phase 2 authoring standard, including the description-length limit and trigger phrasings.
5. Write `ROUTING_FIXTURES.md`: exact user sentences with the expected skill for each.

**Gate:** Objective checks pass per skill; a cold reader routes 3/3 fixtures correctly; `learn` demonstrably covers both the update and replacement paths; `align-harness` names its own lenses without referencing repo files.

## Phase 4 — Work skills

**Goal:** The four folded corridor skills.

**Steps**

1. `refine` (`prime` + `interview`): read what's attached, restate deliverable, audience, constraints and unknowns; then one boundary question per turn with `[Wins: …]` options; non-goals as a first-class output; **generality (D38)** — this one artefact vs this kind of artefact vs a rewirable process others plug into; one known use → log this-deliverable-only (no ask); ask only on a real tie; end by offering to save the brief artifact.
2. `plan` (`plan` + `plan-grill`): phases with gates over a deliverable; ask before locking a scope choice rather than silently picking; **re-check generality (D38)** before phases assume a reusable template or a one-off; produce the plan as an artifact (D30).
3. `deliver` (`implement` + `finish`): execute phase by phase, gate before continuing, stop and ask on anything the plan didn't cover, capture decisions, clean up scaffolding, and end with the ready-for-your-review handoff card and its forbidden closure phrases.
4. `review` (`review` + `validate`): score against the plan and against a deliverable rubric — purpose fit, audience fit, structure, evidence, clarity, actionability, plain language. Report first, then ask what to fix; never edit during the audit.
5. Add one worked advisory example per skill (a governor report, an INSET deck, a tracking spreadsheet, a parent letter).

**Gate:** Objective checks pass per skill (each individually, not as a batch); every skill uses "artifact" not file-path vocabulary; the four read as one corridor using Phase 2's dictionary.

## Phase 5 — Triage candidates

**Goal:** Decide `challenge`, `standards-align`, reuse-check and root-cause on evidence, without sunk cost.

**Steps**

1. For each candidate write a **one-page outline**: its unique trigger, at least three steps that are not already in `review`/`plan`/`deliver`, and its named output.
2. Present the outlines; **you decide** which ship.
3. Draft full bodies only for the approved set.
4. Log every drop with its reason in `TRANSLATION_MAP.md` and **Decisions made**.

**Gate:** No full body written before your ship decision; every candidate either shipped with substance or dropped with a written reason.

## Phase 6 — Install artifacts

**Goal:** Installable by someone who has never heard of an agent harness.

**Steps**

1. `QUICK_START.md` (advisor-facing, ordered, D31): enable code execution and file creation; **confirm the org-provisioned skills are on** (Customize → Skills); create a Project and paste the house rules; the first sentence to type. One short fallback: if a skill is missing, ask the Owner (or self-upload from the folder they send).
2. `PROJECT_INSTRUCTIONS.md`: thin always-on layer only — you are the judge of success, ask before assuming, offer options rather than choosing silently, say when you're unsure instead of inventing, name the skill in use. Must **not** restate gates or rubrics that live in skills. Excludes data-handling policy (D22).
3. `MANIFEST.md`: the skill set with a package version and per-skill last-updated marker, plus the rule that the set is re-uploaded together after any core change.
4. `README.md` (maintainer): inventory; **Owner provision as the default** (Organization settings → Skills; optional plugin + group); self-upload as fallback; the re-sync playbook against `TRANSLATION_MAP.md`; how `learn` output comes back to you for org reissue.
5. Description tuning: 2 should-trigger and 2 near-miss phrasings per skill in advisor language, each description ≤200 characters, adjusted where neighbours collide.

**Gate:** Advisor path documents Owner-provisioned skills + code execution; maintainer README documents Team provision (and plugin/group) as default, self-upload as fallback; every description ≤200 chars and distinguishable from its nearest neighbour; house-rules block contains no duplicated skill content.

## Phase 7 — Coherence pass + no-loss check

**Goal:** A greenfield library with no remnants — and the first real exercise of the shipped `align-harness`.

**Steps**

1. Run the shipped `align-harness` against the package itself; treat its output as the first entry in `COHERENCE_LOG.md`. If it can't produce useful findings, that is a defect in the skill, not in the library.
2. Re-run the banned-term grep after Phase 6's description edits; every hit is fixed or justified in writing in `COHERENCE_LOG.md`.
3. Reference integrity: every handoff name resolves; every `references/` file is linked; no outside-folder paths.
4. SSOT: gates, the artifact convention, the review rubric and the learning loop are each defined in exactly one skill and referenced by name elsewhere.
5. No-loss check: walk `TRANSLATION_MAP.md` and confirm every `port`/`fold` disposition landed somewhere real.

**Gate:** `COHERENCE_LOG.md` shows zero unjustified hits; all handoffs resolve; every mapped disposition traceable; `align-harness` proved useful on a live library.

## Notes during development

- **2026-09-14, Phase 1 — prior output wiped.** A previous attempt's files (`.agents/advisor-package/**`
  `SKILL.md`s, `TRANSLATION_MAP.md`, `ROUTING_FIXTURES.md`) and the `projectStructure.config.cjs` edit
  were gone from the checkout; only empty folders survived. User confirmed the revert was deliberate.
  Rebuilt Phase 1–2 from scratch.
- **2026-09-14, Phase 1 step 5 — discovery check: no bleed.** At session start `SKILL.md` files existed
  under `.agents/advisor-package/skills/**`, yet this session's skill inventory listed only
  `.agents/skills/*`. Cursor does **not** surface advisor skills to repo agents, so the banner
  convention is a safety net rather than the only guard.
- **2026-09-14, Phase 1 gate.** `pnpm validate:structure` → green (`mode=model-b`).
- **2026-09-14, Phase 2 gate.** `TRANSLATION_MAP.md` written and signed off — 36 sources, 6 ports,
  15 folds, 4 triage, 11 drops. D32 applied (`create-skill` separate, `align-harness` owns editing and
  absorbs `purge-skill` + `rule-quality`).
- **2026-09-14, Phase 3 gate.** Core shipped: `router`, `learn`, `align-harness`
  (+ `references/edit-protocol.md`), `create-skill`. All descriptions ≤200 chars (190/194/190/184),
  bodies 84–98 lines. Grep for repo leakage (`.agents`, git, branch, pnpm, subagent, plan filenames)
  returns only the prohibition line inside `edit-protocol.md`. `ROUTING_FIXTURES.md` written with 15
  fixtures including 5 traps.
- **2026-09-14, Phase 4 gate.** Work skills shipped: `refine`, `plan`, `deliver`, `review`
  (descriptions 197/189/173/186, bodies 73–91 lines). Structure validator green after each phase.
- **2026-09-14, Phase 5.** All four triage candidates drafted (`challenge`, `standards-align`,
  `check-what-exists`, `root-cause`) per user instruction "draft all four, then recommend". Verdict:
  keep the first three; `root-cause` ships **provisionally** — it is the only one that partly fails the
  already-knows test, and only its one-change-at-a-time discipline justifies it. Recorded in `MANIFEST.md`.
- **2026-09-14, Phase 6.** Install artifacts written: `QUICK_START.md` (central Team provisioning first,
  self-upload as fallback, code-execution prerequisite noted), `PROJECT_INSTRUCTIONS.md` (the always-on
  layer), `MANIFEST.md` (inventory + what is deliberately excluded).
- **2026-09-14, Phase 7 gate.** Coherence pass logged in `COHERENCE_LOG.md`: 12/12 on every mechanical
  check, 0 dangling handoffs, 0 repo leakage, nothing-lost accounting closed at 0 unaccounted for.
  Three blocking/advisory overlap findings fixed by adding `router` tiebreaks (`challenge` vs
  `standards-align`, `root-cause` vs `review`, `check-what-exists` vs `refine`); one advisory
  contradiction fixed by qualifying the `align-harness` → `plan` handoff. 15/15 fixtures route as
  expected — self-scored, so weaker evidence than a cold reader.
- **2026-09-14, post-review pass.** User review closed D33 (size in content volume the agent produces or
  reads, never human time) and D34 (`shape` → `refine`). Applied across the 12 skills and all four
  package documents.
- **2026-09-14, five-lens library audit.** Run on the shipped package with five read-only lens agents in
  parallel, then an approval gate. Eight blocking and six advisory findings, logged as rows 11–25 in
  `COHERENCE_LOG.md`. Three of the blocking findings were caused by the volume-sizing rewrite itself —
  most seriously a fast path that drafted outside `deliver`, losing the step checks, cleanup and handover
  card. Closed by D35 (`deliver` accepts a confirmed brief as its plan), D36 (`router` owns the sizing
  table), D37 (one `learn` trigger rule across six files). The hand-run Phase 7 pass had missed all of
  them: sequential self-review is materially weaker than adversarial lenses on separate contexts.
- **2026-09-18 — D38 generality.** Repo `plan-grill` now owns instance vs feature vs rewirable.
  Advisor `refine`/`plan` must carry the same fork (deliverable language). Package files are not in
  this checkout; apply D38 on the next write of those skills.
- **Not done, deliberately.** Nothing committed (that belongs to a separate wrap-up), and no advisor has
  used the package, so none of it is validated by use.

## Decisions made

Impl-time only. Product/scope forks → sibling [`DECISIONS.md`](DECISIONS.md).

| # | Topic | Choice | Precedent? |
|---|-------|--------|------------|
| 1 | `projectStructure.config.cjs` (protected) | User explicitly approved the `.md`-only whitelist entry for `.agents/advisor-package/` (skills folders limited to `SKILL.md` + `references/*.md`) — 2026-09-14 | Same shape as the existing `.agents/skills` entry |
| 2 | `create-skill` vs `align-harness` | Both ship; `align-harness` owns the skill-edit protocol and hands off to `create-skill` for new skills — see `DECISIONS.md` D32 | — |
| 3 | Phase 2 sign-off | User signed off the 36-row translation map (6 ports, 15 folds, 4 triage, 11 drops) — 2026-09-14 | — |
