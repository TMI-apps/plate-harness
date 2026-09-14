# Agent workflow layers (plate-harness)

How **skills**, **rules**, **documentation**, and **scripts/hooks** fit together. Use this when adding or changing agent guidance so layers stay aligned.

## Layers

| Layer | Location | Purpose |
|-------|----------|---------|
| **Skill** | `.agents/skills/<slug>/SKILL.md` | Full procedure the agent runs (SSOT for *how*) |
| **Rule** | `.cursor/rules/<category>/RULE.mdc` | Always-on principles; **link** to skills/docs, avoid copying long checklists |
| **Human doc** | `documentation/DOC_*.md` | Product/process narrative for people and agents |
| **Enforcement** | `.husky/*`, `scripts/*`, `.github/workflows/*` | Machine checks; shared helpers in `scripts/*.cjs` |

**Catalog:** `.agents/skills/router/SKILL.md` § Skill index. **Routing:** `.agents/skills/router/SKILL.md` + `router/references/dev-cycle-matrix.md`.

**Commands:** This repo uses **skills only** (no `.cursor/commands/` hub). Invoke via slash commands that read `.agents/skills/<name>/SKILL.md` or attach the skill in chat.

## Pattern / industry-standard review (single entry point)

Compares **implementation proposals and plans** to **industry standards and common best practice** before coding. The agent **chooses relevant review aspects** per change (see rubric). Agents apply **proactively** per `pattern-review` skill and `architecture/RULE.mdc` § Pattern risk.

No separate `documentation/DOC_*` procedure for this workflow — invocable steps live in **skills** (link from docs and rules only).

| Audience | Start here |
|----------|------------|
| **Agents** | `.agents/skills/pattern-review/SKILL.md` |
| **Humans** | Same skill + `references/` below; router § Situation → skill |

| Content | Path |
|---------|------|
| Procedure (when / how / modes) | `.agents/skills/pattern-review/SKILL.md` |
| Review lens, dimension pool, verdicts | `.agents/skills/pattern-review/references/rubric.md` |
| Pattern risk alert block | `.agents/skills/pattern-review/references/alert-template.md` |
| Always-on reminder | `.cursor/rules/architecture/RULE.mdc` § Pattern risk |
| Plan section template | `.agents/skills/plan/references/implementation-plan-template.md` § Pattern & precedent |

**Callers:** `plan`, `router`, `feature`, `review-dev-plan` (industry lens), `standards-align` (Phase 3 rubric only). Do not duplicate the rubric elsewhere — link these paths.

**Not the same as:** `.agents/skills/validate/SKILL.md` (repo rule compliance); `.agents/skills/standards-align/SKILL.md` (should-we / how-to align an **existing** scope — reuses this rubric); `.agents/skills/dont-reinvent-the-wheel/SKILL.md` (package/pattern *reuse* vs custom code).

## Don't reinvent the wheel (package / pattern reuse)

Before writing custom code for a **generic** subsystem, check whether a well-maintained package or a verified public pattern is worth reusing. Agents apply **proactively** per `dont-reinvent-the-wheel` skill and `architecture/RULE.mdc` § Don't reinvent the wheel. Stops at a recommendation (no install, no adapted code).

No separate `documentation/DOC_*` procedure — invocable steps live in the skill.

| Audience | Start here |
|----------|------------|
| **Agents** | `.agents/skills/dont-reinvent-the-wheel/SKILL.md` |
| **Humans** | Same skill; router § `dont-reinvent-the-wheel` vs `pattern-review` vs `api-integrate` |

| Content | Path |
|---------|------|
| Procedure (existing coverage → search → shortlist → license → rec) | `.agents/skills/dont-reinvent-the-wheel/SKILL.md` |
| Always-on reminder | `.cursor/rules/architecture/RULE.mdc` § Don't reinvent the wheel |
| Plan persistence | `.agents/skills/plan/references/implementation-plan-template.md` § Conflict & compliance |

**Callers:** `plan` § Investigate, `feature` § 3.1a, `implement` / `quick-piv` catch, `router`. Order: this skill → `api-integrate` (if still researching a vendor) → `pattern-review` on the chosen approach.

**Not the same as:** `.agents/skills/pattern-review/SKILL.md` (industry *design* fit); `.agents/skills/api-integrate/SKILL.md` (vendor contract / MCP / wire shape).

## Standards align loop (should + how)

Answers **whether** an existing product / feature / component should move closer to industry practice, and **how** (trim / streamline / reframe), then hands off to `challenge`, `consolidate`, `plan`, or `quick-piv`. **On-demand** (user or router) — not the proactive plan gate (`pattern-review`).

No separate `documentation/DOC_*` procedure — invocable steps live in the skill.

| Audience | Start here |
|----------|------------|
| **Agents** | `.agents/skills/standards-align/SKILL.md` |
| **Humans** | Same skill; router § `standards-align` vs `pattern-review` vs `challenge` |

| Content | Path |
|---------|------|
| Procedure (bound → map → precedent → gap score → should → how → handoff) | `.agents/skills/standards-align/SKILL.md` |
| Industry lens (do not duplicate) | `.agents/skills/pattern-review/references/rubric.md` |

**Callers:** `router` when user asks should/how align; after Align decision → execution skills above.

**Not the same as:** `.agents/skills/pattern-review/SKILL.md` (evaluate plan/proposal; proactive); `.agents/skills/challenge/SKILL.md` (simplify one feature without industry should-gate); `.agents/skills/improve/SKILL.md` (facade when technique unknown).

## Improve facade (product entry)

User-facing front door for “make this part better.” Resolves target in plain language, checks vision only when missing, silent multi-lens lite audit, ≤3 findings, then invokes `challenge` / `standards-align` / `consolidate` / `layer-consistency-check` / `validate` / `review`. **On-demand** (`/improve` or vague improve language).

No separate `documentation/DOC_*` procedure — invocable steps live in the skill.

| Audience | Start here |
|----------|------------|
| **Agents** | `.agents/skills/improve/SKILL.md` |
| **Humans** | Same skill; router § `improve` vs specialized skills |

| Content | Path |
|---------|------|
| Procedure (target → vision → audit → pick → handoff) | `.agents/skills/improve/SKILL.md` |
| Child procedures | Linked skills above — do not duplicate |

**Callers:** `router` on `/improve` or ambiguous improve intent.

**Not the same as:** child skills when the user already named the technique; `feature` / `debug` for new work or bugs.

## Layer consistency / workaround guard (single entry point)

Catches requests or in-progress code that conflict with a deeper layer (physics/math, abstraction hierarchy, system architecture) **before** silently shipping a workaround. Core reflex: every request to change existing behavior carries an assumption about how the system works — verify it before acting (user can't see the impl). Agents apply **proactively** per `layer-consistency-check` skill and `architecture/RULE.mdc` § Layer consistency (workaround guard).

No separate `documentation/DOC_*` procedure for this workflow — invocable steps live in **skills** (link from docs and rules only).

| Audience | Start here |
|----------|------------|
| **Agents** | `.agents/skills/layer-consistency-check/SKILL.md` |
| **Humans** | Same skill + `references/` below; router § `pattern-review` vs `layer-consistency-check` |

| Content | Path |
|---------|------|
| Procedure (when / how / severity) | `.agents/skills/layer-consistency-check/SKILL.md` |
| Request cues + seven workaround shapes | `.agents/skills/layer-consistency-check/references/workaround-shapes.md` |
| WARNING, WORKAROUND alert block | `.agents/skills/layer-consistency-check/references/alert-template.md` |
| Always-on reminder | `.cursor/rules/architecture/RULE.mdc` § Layer consistency (workaround guard) |

**Callers:** always-on during implementation; `router` (tiebreak vs `pattern-review`). Do not duplicate the shapes rubric elsewhere — link these paths.

**Not the same as:** `.agents/skills/pattern-review/SKILL.md` (external industry precedent); `.agents/skills/validate/SKILL.md` (repo rule compliance); `.agents/skills/consolidate/SKILL.md` § Semantic placement (post-hoc wrong-layer repair).

## External API / backend integration research (single entry point)

Research an external API, vendor, or backend **before** writing integration code — MCP-first when a server exists, contract before sample. Agents route through `api-integrate` skill and `api-integration` rule (globs-scoped, not `alwaysApply`).

No separate `documentation/DOC_*` procedure for this workflow — invocable steps live in **skills** (link from docs and rules only).

| Audience | Start here |
|----------|------------|
| **Agents** | `.agents/skills/api-integrate/SKILL.md` |
| **Humans** | Same skill + `references/` below; router § External API research vs stack plugin skills |

| Content | Path |
|---------|------|
| Procedure (MCP fallback tree, phases) | `.agents/skills/api-integrate/SKILL.md` |
| Worked example — Supabase (MCP path) | `.agents/skills/api-integrate/references/vendor-supabase.md` |
| Worked example — Airtable (no-MCP path) | `.agents/skills/api-integrate/references/vendor-airtable.md` |
| Globs-scoped principles | `.cursor/rules/api-integration/RULE.mdc` (`alwaysApply: false`) |

**Callers:** `plan` § Optional: Foundation validation, `router`, `api-integrate`. Do not duplicate the MCP fallback tree or worked examples elsewhere — link these paths. (`security`, `database`, and `cloud-functions` rules cross-link here via Related Rules.)

**Not the same as:** stack plugin skills (`supabase`, `cloudflare`, etc.) — those cover operating inside a stack you're already on, not researching an unfamiliar vendor.

## Cross-repo adoption guides

**Doc type:** adoption guide (`<SLUG>_ADOPTION_GUIDE.md`) — how to replicate a capability in other repos; not a session handoff.

| Item | Path |
|------|------|
| How to write a guide | `.agents/skills/write-adoption-guide/SKILL.md` |
| Output folder (config in skill) | `documentation/handoffs/` |
| Template + voice rules | `.agents/skills/write-adoption-guide/references/adoption-guide-template.md`, `references/voice-and-naming.md` |

Copy `write-adoption-guide/` to other projects and adjust the skill **Configuration** block (output folder, repo display name).

## Local git: finish → push

| Step | Skill | Hook / script |
|------|-------|----------------|
| Commit | `finish` | `.husky/pre-commit` (light path + staged tests — see below) |
| Push | `push` | `.husky/pre-push` (no local tests; CI `test` job is merge gate) |

**Pre-commit light path** (SSOT: [`scripts/change-classify.cjs`](../scripts/change-classify.cjs)):

| Staged paths | Kind | Runs | Skips |
|--------------|------|------|-------|
| Always | — | `lint-staged`, `validate:feature-docs:staged` | — |
| Docs-only (`.md`, `documentation/`, `.cursor/**`, `.agents/**`, changesets) | `docs` | `validate:docs` | tests, `type-check`, `validate:structure:staged`, `arch:check:staged` |
| SQL migrations / seed only | `migrations` | — | Same skips as docs (no `validate:docs`) |
| Tooling only (no app surface, no test-infra) | `no-src` | — | Same skips |
| App / test-infra surface | full | Staged tests, `type-check`, structure, feature-size, arch | — |

**Pre-commit test modes** (SSOT: [`scripts/test-staged.cjs`](../scripts/test-staged.cjs), classifier: `change-classify.cjs`):

| Mode | When | Runner |
|------|------|--------|
| skip (light) | docs / migrations / no app surface | none |
| related | 1–25 `src/**` source files, no triggers | `vitest run related <paths>` |
| full | triggers, `src/shared/**`, test-infra, edge functions, >25 files, `PRECOMMIT_TEST_FULL=1` | `pnpm test:classify && pnpm test:run` |
| node-scripts-only | `scripts/**` only | `pnpm test:classify` |
| dry-run | `pnpm test:staged` | log only |
| live (no commit) | `pnpm test:staged:live` | same as hook |

**Merge safety:** Related or full pre-commit green is **not** merge-safe. Only the CI `test` job on `develop` is authoritative (Model A: PR checks; Model B: branch push workflow).

**Agent commands:** `pnpm test:staged` (preview after `git add`); `PRECOMMIT_TEST_FULL=1 pnpm test:staged` (force full preview); `pnpm test:classify && pnpm test:run` (CI parity).

**Rollback:** Revert hook commit and restore pre-push `test:run` if related spawn fails in the wild.

PR / push CI runs full `pnpm test:classify`, `pnpm test:run`, and cold `pnpm type-check` in [`.github/workflows/ci.yml`](../.github/workflows/ci.yml).

See `.cursor/rules/git-workflow/RULE.mdc` § Mode-aware branch gate (`src/config/git-workflow.json`) and `.cursor/rules/agent-behavior/RULE.mdc` for protected files.

## Agent-only mode (human files features/bugs)

When the human only files feature requests or bug reports and tests in the app:

| Role | Responsibility |
|------|----------------|
| Human | Describe goal or bug; test in app; confirm pass/fail |
| Agent | Full delivery chain — no git/CI coordination required from human |

**Default agent chain:** `router` → plan/feature/debug as needed → `implement` or `quick-piv` → `validate` → `finish` → `push` → **post-push CI** (Model A: babysit PR to `develop`; Model B: watch branch `test` run) → **Ready for you to test** handoff (`finish` § User test).

**Standing protected-file consent:** Optional Cursor **user rule** listing categories agents may edit without per-task ask (e.g. `.agents/skills/**` for workflow glue). Repo `.cursor/rules/agent-behavior/RULE.mdc` § Protected Files stays strict — the user rule is external standing consent, not a repo policy change.

**Test tiers:** See [`DOC_TESTING.md`](./DOC_TESTING.md) and pre-commit tables above; merge safety is CI `test` on `develop`, not pre-commit related mode alone.

## Release and versioning

- Mode-aware changesets: `documentation/DOC_CHANGESETS.md` + conventional commits (`finish` SSOT).
- Version bump lands with each land on `develop` (Model A: feature PR; Model B: direct `finish` on `develop`). Production promotion (`main`) is a separate **Promote to production** workflow step.

## When you change something

| You change… | Also update… |
|-------------|----------------|
| `src/config/git-workflow.json` / mode docs | `git-workflow/RULE.mdc`, `start` / `push` / `router` matrix, `DOC_CONTRIBUTING`, `DOC_CLOUDFLARE_WORKERS`, this doc agent chain |
| `.husky/pre-commit` | `git-workflow/RULE.mdc`, `agent-behavior/RULE.mdc`, `finish` skill, this doc if hook scope changes |
| `.husky/pre-push` | `git-workflow/RULE.mdc`, `push` skill, this doc if hook scope changes |
| `finish` / `push` flow | Both skills, `router` matrix |
| New invocable workflow | `router/SKILL.md` (situation table + skill index); [`router/references/skill-relationship-flow.md`](../.agents/skills/router/references/skill-relationship-flow.md) when clarify/plan relationships change |
| Product decision ledger (`DECISIONS.md`) / `grill-me` ↔ `plan-grill` | `.agents/skills/plan-grill/` (template SSOT); `grill-me`, `feature`, `plan`, `implement`; router § Plan corridor flow + [`skill-relationship-flow.md`](../.agents/skills/router/references/skill-relationship-flow.md) |
| Rules registry for skills | `.agents/skills/plan/references/rules-registry.md`; callers link only |
| Pattern / industry-standard review | `.agents/skills/pattern-review/` — see § Pattern / industry-standard review above |
| Package / pattern reuse (don't reinvent) | `.agents/skills/dont-reinvent-the-wheel/` — see § Don't reinvent the wheel above |
| Standards align (should + how) | `.agents/skills/standards-align/` — see § Standards align loop above |
| Improve facade (product entry) | `.agents/skills/improve/` — see § Improve facade above |
| Feature purge / multi-asset removal | `.agents/skills/purge-skill/` — router situation + skill index |
| Project skill authoring (`/create-skill`) | `.agents/skills/create-skill/` — project SSOT; user Cursor copy reference-only |
| Layer consistency / workaround guard | `.agents/skills/layer-consistency-check/` — see § Layer consistency / workaround guard above |
| External API / backend integration research | `.agents/skills/api-integrate/` — see § External API / backend integration research above |
| New cross-repo adoption guide | `write-adoption-guide` skill; file under `documentation/handoffs/*_ADOPTION_GUIDE.md` |

## Product decision ledger (`DECISIONS.md`)

Shared anti-dup ledger for product/scope forks (not impl-time plan **Decisions made**).

### Flow (corridor + rail)

1. **Optional:** `grill-me` warm start → Closed rows in `DECISIONS.md`.
2. **`plan` corridor:** Refine → Investigate → Create.
3. **`plan-grill` rail:** beside every corridor phase — fork checklist before locking; loop ask → ledger → **same phase**.
4. **`DEVELOPMENT_PLAN.md`:** how to build (after locks are logged).

Router SSOT: `.agents/skills/router/SKILL.md` § Plan corridor flow.  
Diagram SSOT: [`.agents/skills/router/references/skill-relationship-flow.md`](../.agents/skills/router/references/skill-relationship-flow.md).  
Checklist/cues SSOT: `.agents/skills/plan-grill/SKILL.md`.

| Audience | Start here |
|----------|------------|
| **Agents** | `.agents/skills/plan-grill/SKILL.md` + [`references/decisions-template.md`](../.agents/skills/plan-grill/references/decisions-template.md) |
| **Writers** | `grill-me`, `plan-grill`, `feature` (first writer creates `documentation/jobs/temp_job_<name>/DECISIONS.md`) |
| **Readers** | `plan` (anti-dup + M/L ledger gate), `implement` (soft-warn on open rows) |

**Not the same as:** `DEVELOPMENT_PLAN.md` § Decisions made (filled during `implement`).

## Related

- Write adoption guides: `.agents/skills/write-adoption-guide/SKILL.md`
- Pattern review: `.agents/skills/pattern-review/SKILL.md`
- Don't reinvent the wheel: `.agents/skills/dont-reinvent-the-wheel/SKILL.md`
- Standards align: `.agents/skills/standards-align/SKILL.md`
- Improve facade: `.agents/skills/improve/SKILL.md`
- Purge feature: `.agents/skills/purge-skill/SKILL.md`
- Create skill (project): `.agents/skills/create-skill/SKILL.md`
- Layer consistency: `.agents/skills/layer-consistency-check/SKILL.md`
- External API integration: `.agents/skills/api-integrate/SKILL.md`
- Doc hub: `documentation/DOC_INDEX.md`
- Changesets: `documentation/DOC_CHANGESETS.md`
- App vision: `documentation/DOC_APP_VISION.md`
