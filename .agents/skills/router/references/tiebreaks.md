# Router tiebreaks (pairwise disambiguation)

On-demand companion to [`../SKILL.md`](../SKILL.md). Read when two or more skills seem to apply. Choose by **primary outcome** (what must be true when done). If two outcomes are required, run skills **in order** (e.g. plan → implement → validate → finish). Use the router's **Decision model** first: neither `plan` nor `feature` should start until gates 1–2 pass (unless you are intentionally only running **`plan` § Refine** or **`grill-me`**).

### `plan` vs `feature`

- **`plan`:** Engineering execution plan (`DEVELOPMENT_PLAN.md`, phases, gates, repo compliance). Use when gates 1–2 are **Clear / Bounded** and the gap is **structured implementation**, not discovery of what to build.
- **`feature`:** Deep product/requirements process with **mandatory user decision stops** and journey mapping. Use when gate 3 calls for **high decision density** (roles, journeys, approvals) even though gates 1–2 may be partly filled as you go — still clarify unknowns early within that skill, especially app-usage ambiguity and intentional standards diversions.
- **Auto vs `feature`:** IF `plan-grill-auto` triggers are active and the user did **not** invoke `/feature`, route to the `plan` corridor with the auto rail — not `feature`. `/feature` or “ask me” turns auto off and `feature` 🔴 stops apply.

### `plan` vs `quick-piv`

- **`quick-piv`:** Single pass; chat-sized plan OK; small scope.
- **`plan`:** Multi-phase, migrations, breaking changes, or anything needing a durable plan file others can follow.

### `validate` (auto-selects depth)

- **`validate`** auto-selects depth from context: **plan-review** (plan only), **impl-full** (rules + tooling + plan-compliance after implementing against a plan), or a lighter **gate** (pre-merge/post-refactor structural confidence on a diff with no governing plan). No user mode input needed. See `.agents/skills/validate/SKILL.md` § Mode auto-selection.

### `validate` gate vs `consolidate` § Semantic placement

- **`validate` (gate mode):** Routine pre-merge gate on current scope (rule subagents + scripts).
- **`consolidate` § Semantic placement mode:** After linters pass — **semantic** placement, duplication, cross-feature boundaries, refactoring impact.

### `consolidate` vs `optimize2`

- **`consolidate`:** Redundancy **audit of a Target** (folder / feature / layer / glob; whole `src/` only if asked). **Sweep `src/`** for copies; **focus** report/execute on Target ∪ 1-hop callers/callees. Prioritize with `references/warrant-rubric.md`. Default: report then stop.
- **`optimize2`:** **Hotspot** optimization at four levels for chosen code; Rule of Three for extractions. Use for **hot paths** or known-complex modules.

### `consolidate` — Redundancy audit vs Semantic placement mode

- **Redundancy audit (default):** “What repeats **around this Target**?” Sweep `src/`; focus Target ∪ 1-hop. Unify abstractly (may stay duplicated by decision). Report then stop unless execute was requested.
- **Semantic placement mode:** “Is code in the **wrong** layer/feature?” → move/refactor for boundaries (after tooling is green).

### `challenge` vs `optimize2`

- **`challenge`:** Question whether the **feature or workflow** should exist or be simpler (remove/merge steps).
- **`optimize2`:** Improve existing code **without** necessarily changing product scope.

### `debug` vs `hypothesis`

- **`debug`:** Default for runtime incidents — event chains, user-supplied evidence, iterative narrowing (`.agents/skills/debug/SKILL.md`).
- **`hypothesis`:** Pre-registered root-cause experiment when naive fixes already failed or the user invokes hypothesis mode (`.agents/skills/hypothesis/SKILL.md`).
- **Tiebreak:** User asks for hypothesis / repeated failed fixes → `hypothesis`; otherwise → `debug`. Cross-link both skills; do not run both as equal primaries in one pass.

### `debug` vs `learn`

- **`debug`:** Active incident; hypotheses; runtime evidence; possibly temporary instrumentation.
- **`learn`:** Capture durable rule/skill/debug-pattern updates. **Proactive** learn waits until the struggle is resolved (not as primary beside active `debug`). **Manual** `/learn` (user invoked or skill attached) runs **in that turn**, including on a still-red CI/incident message — do not defer behind the fix. Procedure: `.agents/skills/learn/SKILL.md` § Turn contract.

### `rule-quality` vs `learn`

- **`rule-quality`:** Score (Mode A) or rewrite (Mode B) **provided rule/command text**.
- **`learn`:** Decide **where** lessons live (rules vs skills vs debug appendix) from incident context.

### `align-harness` vs `update-harness` vs `learn`

- **`align-harness`:** In-repo harness coherence (skills + rules + AGENTS + INDEX + layers).
- **`update-harness`:** External drops in `.agents/harness-inbox/` — disposition report + confirmed apply.
- **`learn`:** Session lesson from a mistake; removal-first; structural conflicts → `align-harness`.

### `align-harness` vs `rule-quality` / `consolidate`

- **`align-harness`:** **Harness-wide** audit — separation of concerns, SSOT, conflicts, handoffs — via parallel lens subagents and a no-information-loss gate. Edits harness corpus + router/layers spine.
- **`rule-quality`:** One **rule/command file's** grade or prose. **`consolidate`:** duplication in **`src/` application code**, not skills.
- **`tighten-harness`:** Context **cost** — cut, merge, relocate, or enforce instructions with a per-cut ledger; behavior must not change. Contradictions it finds → `align-harness`.

### `rule-quality` vs `review`

- **`rule-quality`:** Grade or improve **rules/commands** (rubric + quality standards).
- **`review`:** Score **React/MUI components** with component rubric.

### `grill-me` vs `plan-grill` vs `plan-grill-auto` vs `plan` § Refine

- **`grill-me`:** **Optional warm start** before the plan corridor — product/design Q&A when gate 1 fails on vision/tradeoffs, or explicit stress-test / “grill me.” Logs Closed rows to `DECISIONS.md`. Prefer closing more here so the corridor asks less. Includes optional **Zoom out first** (formerly `stepback`).
- **`plan-grill`:** **Rail beside every plan corridor phase** (Refine / Investigate / Create). Same ask style as `grill-me`; **mandatory fork checklist** before locking (enumerate ≥2 options or justify sole; ask on ties; log clear-winners; anti-dup). Loop: ask → `DECISIONS.md` → **same phase**. Not a Create-only side quest. Not for XS/`quick-piv`. Not for industry precedent (`pattern-review`).
- **`plan-grill-auto`:** Same rail and checklist as `plan-grill`, but the **agent answers every fork**. No questions, no Present wait, then `implement` so the user can test. Ledger `source: plan-grill-auto`.
- **`plan` § Refine:** Split — product/scope/architecture-boundary → **`plan-grill` rail** (or **`plan-grill-auto`** when the user forbids questions); gate-2 acceptance/API examples → stay in Refine. Full corridor after gates 1–2 (or when user already started `/plan`).

**Tiebreak:** Fuzzy idea + not yet planning + user will answer → `grill-me`. Already in `plan` / user said `/plan` → `plan-grill` for product forks. User forbids questions (`/plan-grill-auto`, “answer yourself”, “I won’t check”) during a **plan corridor** → `plan-grill-auto` (wins over `grill-me`, `plan-grill`, and `feature` unless they invoked `/feature`). Bug reports → `debug` (auto does not mute intake). Protected-file, `finish`, and `push` confirms still ask. Gate-2 examples only → Refine without `plan-grill`.

### `prime` vs `start`

- **`prime`:** Agent loads **technical** context for implementation.
- **`start`:** Human **first-time setup** walkthrough.

### `finish` vs `push` vs `bundle-ship` vs `babysit`

- **`finish`:** Commit-ready locally (version, changelog, staging rules); emits **Ready for you to test** handoff (§ User test).
- **`bundle-ship`:** Multi-thread same-checkout landing — one bundled `finish` commit, then `push` in one invocation.
- **`push`:** Remote sync only **after** commits exist; never commit inside push.
- **`babysit` / post-push CI:** per `.cursor/rules/git-workflow/RULE.mdc` § Mode behavior table → **CI watcher**. **Model A:** after a **`push`** that created or updated a PR to **`develop`**, babysit it — Cursor: `~/.cursor/skills-cursor/babysit/SKILL.md`; Claude Code: the desktop app's PR monitor — unless waived in **Decisions made**. **Model B:** report the commit URL and stop; no PR. **Model C:** the PR to `main` is watched by the desktop app's PR monitor / Auto-fix. Do **not** `gh run watch` or block the checkout on Actions. If the user later brings a failed check → `ci-investigator` or fix in scope and re-push.

### `canvas` vs `validate` / reporting

- **`canvas`:** Standalone **visual artifact** (tables, timelines, rich layouts) as deliverable.
- **`validate`:** Structured **text report**; default no edits.

### External API research: `api-integrate` vs stack plugin skills

- **`.agents/skills/api-integrate/SKILL.md`:** Use for an **unfamiliar/new** vendor or API — MCP-first check, then Phase 1 schema/contract → Phase 2 sample/wire-shape discipline (the same two-phase order the retired `airtable-inspect` skill used, now generalized). Worked examples: Supabase (MCP path), Airtable (no-MCP path).
- **Stack plugin skill** (`supabase`, `cloudflare`, `wrangler`, etc.): Use for **operating inside a stack you're already on** — see the Supabase/Cloudflare disambiguations below. Don't route routine stack work through `api-integrate`.
- **A fork's own vendor-specific skill** (if one exists, e.g. a fork-added `stripe-inspect`): prefer it when it's more specific than the generic `api-integrate` path — don't force every integration through one skill.
- See also `.cursor/rules/api-integration/RULE.mdc` for the globs-scoped principles this skill implements (`alwaysApply: false`).

### Supabase: `supabase` vs `supabase-postgres-best-practices` vs `api-integrate`

- **`supabase`:** Product workflows, Auth, RLS correctness, CLI/MCP, migrations narrative — operating inside this fork's already-configured backend.
- **`supabase-postgres-best-practices`:** **Performance** tuning, query plans, indexing, pooling — narrow DB optimization.
- **`api-integrate`:** Only if researching Supabase itself as an unfamiliar vendor (rare in this repo, since it's already configured) — see § External API research above.

### Cloudflare: `cloudflare` vs `wrangler` vs `workers-best-practices`

- **`cloudflare`:** Pick **product** (Workers vs Pages vs DO vs R2…).
- **`wrangler`:** **CLI** syntax and deploy/dev workflow.
- **`workers-best-practices`:** **Code/config review** against current Workers guidance.

### Cloudflare agents: `agents-sdk` vs `building-ai-agent-on-cloudflare`

- **`agents-sdk`:** Reference-led SDK usage (state, RPC, docs fetch).
- **`building-ai-agent-on-cloudflare`:** End-to-end **generated** agent app and deployment narrative.

### `building-mcp-server-on-cloudflare` vs `agents-sdk` (MCP sections)

- **`building-mcp-server-on-cloudflare`:** **Expose** tools as remote MCP with OAuth/deploy.
- **`agents-sdk`:** **Consume** or embed MCP patterns inside Agents SDK — use when agent wiring dominates.

### `web-perf` vs `optimize2` vs `react-perf-vite`

- **`web-perf`:** **Browser-measured** performance (CWVs, network, traces via DevTools MCP).
- **`optimize2`:** **Code-level** structure and complexity optimization (may include perf but not Lighthouse-centric); Rule of Three for extractions.
- **`react-perf-vite`:** **Pattern lookup** for stack-native React perf (lazy routes, TanStack dedup, re-render rules) — read `rules/` on demand; does not replace hotspot refactor.

**Order when multiple apply:** measure with **`web-perf`** if symptoms are CWV/Lighthouse → structural fix with **`optimize2`** → cite specific **`react-perf-vite`** rules while implementing.

### Plan review stack (ordered pipeline)

When the user asks to **review a plan** or before **implement** on Complexity **M/L**, run **in order** — do not pick multiple primaries for the same pass:

1. **`dont-reinvent-the-wheel`** during **`plan`** Investigate (and `feature` § 3.1a) when the work is a generic subsystem not obviously covered — recommendation only; skip when bespoke.
2. **`pattern-review`** (`plan-section`) during **`plan`** step 5 when M/L or new user-visible/contracts — fills **Pattern & precedent** in the plan.
3. **`review-dev-plan`** when Summary says `Plan review: Required: pending` (mandatory for M/L).
4. **`validate`** (plan-review mode) when Summary says `Plan validate: Required: pending` (mandatory for M/L) — **repo rule** compliance on the plan document, before `implement`.

**One bar:** steps 3–4 and later impl-full `validate` grade against the plan's **Review contract**. Findings outside it are advisory. Accepted fixes are written into the plan as **Amendments** before a status becomes `Done`.

Do **not** run standalone **`pattern-review`** `scan` in the same session if **`review-dev-plan`** already ran the industry-precedent lens (unless the user requests a delta review).

### `dont-reinvent-the-wheel` vs `pattern-review` vs `api-integrate`

- **`dont-reinvent-the-wheel`:** Should we **depend on a package** or **model a verified public implementation** instead of writing custom code for a generic subsystem? Live search; stops at a recommendation.
- **`pattern-review`:** Does this **design** match **external industry / product precedent** for the capability?
- **`api-integrate`:** How do we **research this vendor’s contract** (MCP → schema → sample) once we are integrating an API?

**Order when both apply:** **`dont-reinvent-the-wheel` first** (may pick an SDK and skip raw API work). If still integrating a vendor API → **`api-integrate`**. Then **`pattern-review`** on the chosen approach (M/L or new contracts).

**Tiebreak:** User asks “which library / don’t build this ourselves” → **`dont-reinvent-the-wheel`**. “Is this how products usually do it?” → **`pattern-review`**. “How does this vendor’s API work?” → **`api-integrate`**.

### `modularity-review` vs `validate` vs `review-dev-plan` vs `layer-consistency-check`

- **`modularity-review`:** Explain **replaceability** (Score A features / Score B stack) and whether a **new stack-port cruiser rule** is needed. Run `pnpm arch:check` + `pnpm modularity:report`. Do not unwrap production imports unless asked.
- **`validate`:** Pass/fail of **all** repo rules, including `stack-port-*`. Not a replaceability readout.
- **`review-dev-plan` “modularity” lens:** Critique of a **plan document**, not live `src/` scores.
- **`layer-consistency-check`:** Before writing a **workaround**. This skill **after** a module or vendor exists.

**Order:** `dont-reinvent-the-wheel` first when adding a package → install/plan → **`modularity-review`**. `layer-consistency-check` first when changing existing behavior. `validate` after implement (includes the ratchet).

### `pattern-review` vs `layer-consistency-check`

- **`pattern-review`:** Does this design match **external industry / product precedent** for the capability?
- **`layer-consistency-check`:** Does this request fit the **internal** layer beneath it (abstraction hierarchy, architecture, physics/math) — or are we about to ship a workaround?

**Order when both apply:** **`layer-consistency-check` first** (one-beat check). If the user picks a structural path that changes UX/API contracts, run **`pattern-review`** before implementing.

### `improve` vs specialized improve skills

- **`improve`:** Product-facing **facade** — plain-language target, optional vision, ≤3 findings, then invokes one child skill. Use when the user has not named a technique.
- **`standards-align` / `challenge` / `consolidate` / `validate` / `review`:** Named technique already clear → skip facade.
- **`layer-consistency-check` / `pattern-review` / `dont-reinvent-the-wheel`:** Proactive guards stay always-on; `improve` may also route a finding into `layer-consistency-check`.
- **`optimize2` / `react-perf-vite`:** Named hotspot or Vite SPA perf symptom → those skills; vague “make better/faster” without a named hotspot → **`improve`** first (may recommend optimize/perf as a finding).
- **`grill-me`:** Gate-1 vision/tradeoff ambiguity, or explicit stress-test when gates already pass → **`grill-me`**. Vague quality on an existing area → **`improve`** (vision Qs only if thin).

**Tiebreak:** Vague “make better” / `/improve` → **`improve`**. Specific “align with industry” → **`standards-align`**. Specific “simplify this flow” → **`challenge`**. Named perf hotspot → **`optimize2`** or **`react-perf-vite`**. Gate-1 unclear product intent → **`grill-me`**.

### `create-skill` vs `align-harness` vs `rule-quality`

- **`create-skill`:** One new/refined `.agents/skills/<name>/SKILL.md` (this repo).
- **`align-harness`:** Whole-corpus coherence audit.
- **`rule-quality`:** Grade/rewrite one **rule/command** file (not skill authoring).

### `standards-align` vs `pattern-review` vs `challenge`

- **`pattern-review`:** Proactive (and on-demand) **evaluate** a plan/proposal vs industry — verdict + Pattern risk A/B/C. Does **not** own the full “should we realign this existing scope + how to simplify toward standards” loop.
- **`standards-align`:** On-demand loop for an **existing** product/feature/component: **should we align?** → gap score → how A/B/C → hand off. Reuses the `pattern-review` rubric; does not replace proactive plan gates.
- **`challenge`:** Simplify **one** named feature/workflow (fewer steps/code) when the question is overbuilt — not primarily “vs market.”

**Tiebreak:** User asks should/how **align with industry** on existing scope → **`standards-align`**. Novel plan/proposal gate → **`pattern-review`**. “This flow is overbuilt” without industry framing → **`challenge`**.

### `implement` vs `quick-piv`

- **`implement`:** Active `DEVELOPMENT_PLAN.md` with multi-phase or durable execution — phase-by-phase SSOT.
- **`quick-piv`:** **XS/S** scope only; chat-sized extension or no plan file. **Never** when plan **Complexity** is **M/L** or **Plan review** is pending — use **`implement`** after gates pass.

### `debug` vs `quick-piv`

- **`debug`:** Unknown cause, need hypotheses and runtime evidence.
- **`quick-piv`:** Root cause known; small scoped fix with clear gate.

### `challenge` vs `feature`

- **`feature`:** Net-new capability with mandatory 🔴 decision stops and journey mapping.
- **`challenge`:** Simplify an **existing** named feature/workflow (flow + code).

### `start` — onboarding

- **`start`:** Human first-time setup via README + dev task backlog (`/tasks`); app vision gate.

### `prime` vs clarification skills

- **`prime`:** Optional **once** for technical repo context — not a substitute for gates 1–2.
- **Order when both needed:** `prime` (if unfamiliar) → **`grill-me`** (optional warm start) **and/or** `plan` § Refine (gate 2) → re-run gates → **`plan` corridor** with **`plan-grill` rail** (or **`plan-grill-auto`** if the user forbids questions; or `feature` / `quick-piv` per gate 3).

### `review` vs `optimize2`

- **`review`:** Qualitative **component** rubric score (170-point).
- **`optimize2`:** Structural/perf refactor of a **hotspot** at four levels.

### `quick-piv` vs `validate`

- **`quick-piv`:** Inline tooling checks only (“quick validate”) — not the **`validate`** skill fan-out.
- **`validate`:** Full rule subagents + plan-compliance when the user asks to validate or before merge/finish.

### `feature` vs `plan` / `implement` (orchestrator)

- **`feature`:** Primary outcome = product/requirements artifact + mandatory decision stops. **Not** the durable execution plan.
- **`plan`:** Produces `DEVELOPMENT_PLAN.md`. **`implement`:** Executes it. After **`feature`** Phase 4, run **`plan`** (or ensure `DEVELOPMENT_PLAN.md` exists) before **`implement`**.

### `quick-piv` (orchestrator)

- **Primary outcome:** Land a **small** scoped change in one session. Compresses plan/implement/validate steps — defers to **`validate`**, **`finish`**, and full **`plan`** for M/L, commits, and durable plans.
