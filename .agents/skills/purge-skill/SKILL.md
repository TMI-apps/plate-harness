---
name: purge-skill
description: >-
  Fully removes a named feature, component, or module and cleans up trailing
  references (imports, routes, tests, flags, config, docs). Use when the user
  runs /purge <name> or asks to delete, remove, rip out, decommission, retire,
  sunset, or fully clean up a feature/component/module — especially when prior
  deletions left dead imports, orphaned routes, stale tests, or config debris.
  IF the target has call sites in tests, routes, config, or docs (≥2 asset
  classes) THEN use this skill instead of a single-file delete. IF the user asks
  to delete a path/engine/module, or asks "is the old path gone?" about leftovers
  after a flag-off or replacement phase, THEN use this skill (plan first). Not a
  whole-repo dead-code sweep (say so if asked); not quick-piv for a one-file
  delete with no references; not consolidate (dedup across live features).
---

# /purge — systematic feature removal

## Why this exists

The default failure mode when an agent is asked to "delete X" is to remove the file(s) that obviously *are* X and stop there. Everything that *points at* X — an import, a route registration, a feature-flag key, a CI job, a line in the README — is left behind because nothing forced a search for it. This skill exists to make that search mandatory and systematic, the way large engineering orgs do it (Meta's internal dead-code system, SCARF, works by building a full reference graph before deleting anything, then falling back to plain-text search to catch the references static analysis can't see — dynamic dispatch, string-keyed lookups, config files). This skill applies that same two-layer approach (structural analysis + textual fallback) to a single repo, at the scale of one feature removal rather than a whole company's codebase.

Four things this skill is deliberately built around, based on how it's meant to be used:

1. **It's a targeted tool.** You give it a name — a feature, component, module, endpoint — and it removes that thing and everything that only existed to support it. It is not a whole-repo dead-code sweep; if the user wants that, say so, but don't silently expand scope to the whole repo.
2. **It verifies before it defers.** When a reference looks dead but can't be proven dead by structural analysis alone (it might be reached through a string, a config key, a registry, reflection), the instinct should be to dig further — check the patterns below — rather than immediately punting the question to the user. Most users asking for a cleanup don't have perfect recall of their own codebase's dynamic wiring either; "I'm not sure, you tell me" is a common and legitimate answer, so the burden is on investigation, not on asking. Only surface something as "needs your call" after genuinely trying to resolve it.
3. **It plans before it touches anything.** The deliverable of the analysis phase is a removal plan the user reviews and approves — a diff-shaped table of what goes, what stays and why, and what's still uncertain. Nothing gets deleted until that plan is confirmed. Once confirmed, execution is incremental and gated by the repo's own build/test suite, so a mistake surfaces immediately instead of compounding across dozens of files.
4. **The target end state is greenfield-clean.** Removing the references is not the finish line; the tree should end up looking as if the remaining design had been the only design. Turning off a rollback flag or deleting one caller is **not** done. Residue counts as part of the target: modules still wearing the deleted name, unused fallbacks, archive fixtures, seed-from-old-engine helpers, and stale **live** docs (feature `README.md`, `ARCHITECTURE.md`). Historical records are not residue — `CHANGELOG.md` and `documentation/jobs/**` entries stay.

   Two constraints on this principle, because it widens what gets proposed:

   - **It widens the plan, never the execution.** Residue items are line items in the Phase 3 plan like anything else, so principle 1 (targeted tool, no silent scope expansion) and the Phase 3 gate still hold. When the owner says "as clean as if we designed current from the start" (or equivalent), that changes the *default lean* for unresolved items — propose delete/rename rather than propose keep, no dead archives — but they are still proposed and still approved. Do not resolve them by acting.
   - **Renames are part of execution.** A leftover filename that only exists because of the old name goes into the approved plan as a rename step. During Phase 4, the agent performs the rename, updates imports and non-import references in both directions, searches for stale names, and runs the verification required by `.cursor/rules/file-placement/RULE.mdc`. Don't keep a slim husk of `oldName.ts` merely to avoid a verified rename.

## Phase 0 — Resolve the target

Parse the argument to `/purge` (or the plain-English request) into a concrete target: a component name, a directory, a route prefix, a module/package, a flag key. If it's ambiguous (e.g. the name matches both a UI component and an unrelated backend service), ask which one — this is a real ambiguity, not a guessable default.

Confirm you can see the repo (working tree, not just a description of it) before doing anything else. If several plausible target locations exist, list them and ask which is the one to remove, rather than assuming.

## Phase 1 — Map every reference

Build a reference map in two layers, mirroring how SCARF avoids both false positives (deleting something still alive) and false negatives (leaving cruft behind):

**Structural layer** — the normal stuff: imports/exports, function and component usage, class inheritance, route registrations, test files that import the target, type/interface references, GraphQL/API schema entries. Use the language's own tooling where available (compiler/linter "unused" diagnostics, `ts-prune`/`knip`/`depcheck` for JS-TS, `vulture` for Python, `deadcode` for Go, etc.) if present in the repo, but don't assume it's installed — grep-based structural search works fine as a fallback.

**Textual fallback layer** — this is the layer that catches what structural analysis misses: string-keyed dispatch tables, feature-flag keys, env var names, CI job names, config file entries, i18n strings, docs mentions, and any other place the target's name shows up as a string rather than a symbol. Run `scripts/reference_scan.py` against the repo root with the target's name and its case variants (PascalCase, camelCase, snake_case, kebab-case, SCREAMING_SNAKE_CASE, and the plain human-readable form) — it greps the whole tree, skips vendor/build directories, and buckets hits by kind (source, test, config, CI, docs, i18n) so you're not re-deriving that categorization by hand for every purge.

Read `references/asset-checklist.md` for the full list of asset types to check — it covers the "code + adjacent config" scope this skill is built for (source, tests, routes, types, feature flags, env vars, CI/build config, docs, i18n, and declared dependencies), and explicitly what's out of scope (database migrations/tables, data-warehouse assets — flag these if you stumble on them, but don't touch them).

## Phase 2 — Classify every hit

Sort every reference found into three buckets:

- **Remove** — only exists to support the target (a test file solely for it, an import used nowhere else, a route that dispatches to it, a flag key gating only it).
- **Keep** — the target is one of several things a shared piece of code handles (a switch statement with other live branches, a shared util still used elsewhere after the target's caller is gone).
- **Uncertain** — looks unreferenced by the structural layer, but the textual layer or context suggests it might still be reachable dynamically. Before giving up on these, actively investigate: search for the name as a plain string (not just as a symbol) across config/registry/dispatch-table files, check for decorator/annotation-based registration, check whether it's part of a public API/exported package that something outside this repo could call, check recent git history/commit messages for context on why it exists. Only leave something in "uncertain" for the user after this investigation comes up empty — and when you do, say specifically what you checked and why it's still unresolved, not just "not sure."

Three specific traps to watch for while classifying, all easy to miss:

- **Flag-off is not a purge.** Removing a rollback switch while leaving the old engine, its constants, fixtures, and test-only helpers in the tree is an incomplete removal, and it is the state a purge is most often called in to finish. So when the user asks "did you fully delete X?" or "purge the old engine", treat the leftover as the target and run the phases on it — do not answer that an earlier `implement` phase already handled it. A prior phase flipping the flag is evidence about the flag, not about the engine.

- **A removal leaves its container empty or structurally invalid.** If the target is the *only* job in a CI workflow file, the only route in a router file, the only entry in a config block, deleting just that piece can leave behind a file that's empty, malformed, or pointless (an empty `jobs:` block isn't a valid workflow). Don't silently pick a side — flag it in the plan as its own line item ("removing this empties the file — delete the whole file, or leave a scaffold?") rather than either leaving broken scaffolding behind or unilaterally deleting a whole file the user didn't ask about.
- **Cascading dead code inside a file you're editing rather than deleting.** When you remove a branch, call, or import, whatever *only* existed to feed that branch can become dead too — a prop or parameter only used by the removed branch, a helper function only called from it, an import only needed by it. This is second-order: it won't show up in the initial reference map because it was never a reference to the target itself, only to the code you just removed. After editing a file, take one more pass over just that file's diff and ask "did anything become unreachable as a side effect of this edit," and add it to the plan if so — don't stop at the first-order removal and call the file done.

## Phase 3 — Present the removal plan

Before editing anything, present a plan grouped by asset type (source files, tests, routes, types, flags/env, CI, docs, dependencies), each entry marked remove/keep/uncertain with a one-line reason. Explicitly call out the uncertain items and ask for a decision on those specifically — don't make the user re-review the whole plan, just resolve the open questions. Wait for confirmation before touching the working tree. This is a hard gate: do not start deleting files while waiting for the answer, and don't treat silence or a vague "yeah go ahead" on an unrelated point as approval for items still marked uncertain.

## Phase 4 — Execute

Once approved:

1. Create a git checkpoint first (a new branch, or note the current commit/stash) so the whole operation is trivially revertible — mention the checkpoint to the user in the final report.
2. Remove in small batches, grouped roughly by the categories above (e.g. all test files, then source, then routes, then config/flags/CI/docs) rather than one giant edit — this keeps any breakage traceable to a specific batch.
3. After each batch, run the repo's own build and/or test command (detect it — `package.json` scripts, `Makefile`, `pyproject.toml`/`pytest`, `go test`, `cargo test`, etc. — ask if genuinely ambiguous rather than guessing wrong and wasting a cycle) and confirm it's green before moving to the next batch. In this repo, use the tiers in `.cursor/rules/testing/RULE.mdc` § Local test authority — targeted per batch, `pnpm test:run` for CI parity at the end.
4. If a batch breaks the build or tests, stop immediately, report exactly what broke and why, and do not continue to the next batch until it's resolved — don't paper over a red build by pushing forward.
5. **Residue sweep after the last green batch.** Re-run `scripts/reference_scan.py` on the target's name — same case variants as Phase 1, so the before/after is comparable. Every surviving hit must be keep-justified in the final report, not merely observed. Live source and feature `README.md` hits are residue by default under principle 4; `CHANGELOG.md` and `documentation/jobs/**` hits are history and stay. If the sweep surfaces a leftover filename that exists only because of the old name, rename it, update references, and rerun the sweep rather than closing out with the old name still in the tree.

## Phase 5 — Final report

Summarize: what was removed (by category, with counts), the residue sweep result from step 4.5 (surviving hits and the justification for each), what was kept and why, anything left as a follow-up (e.g. "orphaned migration `xyz` spotted but out of scope — worth a look"), and how to roll back (the checkpoint from step 4.1). Keep this tight — a table or short list, not a narrated walkthrough of every file.

---

## What this is NOT

| Concern | Use instead |
|---------|-------------|
| One-file delete with no call sites / tests / config refs | `quick-piv` or direct edit |
| Cross-feature live-code duplication (keep features, unify patterns) | [`consolidate`](../consolidate/SKILL.md) |
| Whole-repo dead-code sweep | Say so; do not silently expand `/purge` scope |
| Commit / version / changelog | [`finish`](../finish/SKILL.md) after validate |

**Next:** After green build → [`validate`](../validate/SKILL.md) (gate) → [`finish`](../finish/SKILL.md) when the user wants a commit. Do not commit inside this skill.
