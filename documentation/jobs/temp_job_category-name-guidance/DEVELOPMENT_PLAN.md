# Development plan: category names win over the first example

## Summary

- **Goal:** Agent instructions name folders and the category rule. They stop prescribing the first feature's filename, loading only on legacy folders, or skipping the naming check because the first caller is a one-off.
- **Why:** Placement tables, style samples, activation globs, and the one-off skip are louder than `code-style` § Category, not instance. Later work copies the first name or piles into that file, because changing the name means editing the guidance.
- **Complexity:** M — cross-cutting rule and skill edits, several phases, no schema or app-behavior change.
- **Plan review:** Done 2026-10-04
- **Scope / constraints:** Guidance and docs only (D1). No production renames. No new linter (D2). Model B (`src/config/git-workflow.json`): implement on `develop`. `.cursor/rules/**` and `.agents/skills/**` are protected; edit them only after this plan is accepted. Changelog stays in `finish`.

## Phase overview

| Phase | Goal | Gate | Status |
|-------|------|------|--------|
| 1 | Naming check runs on the first identifier, before the one-off skip | Read-back: procedure step 4 leads with shape #5; the machinery sentence cannot waive naming | Done |
| 2 | Placement tables and style samples point at folders plus the category rule | Grep: frozen destination filenames gone from those sections | Done |
| 3 | Activation globs match the homes the rule text names; catalogs match the globs | Frontmatter and `AGENTS.md` catalog show the same glob lists | Done |

## Conflict & compliance

- Applicable rules:
  - `.cursor/rules/code-style/RULE.mdc` § Category, not instance — SSOT for the naming test. This job makes louder text defer to it.
  - `.cursor/rules/architecture/RULE.mdc` § Layer consistency — keep the workaround stop; move the naming carve-out ahead of the one-off skip.
  - `.cursor/rules/file-placement/RULE.mdc` — destination lines become folders. SQL migrations stay `supabase/migrations/` (D3).
  - `.cursor/rules/agent-behavior/RULE.mdc` — rules and skills are protected. Acceptance of this plan is the approval to edit the files listed below. Do not edit `projectStructure.config.cjs`, `.eslintrc.json`, or git hooks.
  - `.cursor/rules/git-workflow/RULE.mdc` — mode `model-b`. Rules may be edited on any branch after confirmation. Skill files and `ARCHITECTURE.md` follow the branch gate (`develop`).
  - `.cursor/rules/testing/RULE.mdc` — no new runtime behavior. Gate is a read-back and grep, not a new test harness (D2).
- File placements (edit in place; no new source files):
  - `.agents/skills/layer-consistency-check/SKILL.md`
  - `.agents/skills/layer-consistency-check/references/workaround-shapes.md`
  - `.cursor/rules/code-style/RULE.mdc`
  - `.cursor/rules/architecture/RULE.mdc`
  - `.cursor/rules/file-placement/RULE.mdc`
  - `.cursor/rules/cloud-functions/RULE.mdc`
  - `.cursor/rules/api-integration/RULE.mdc`
  - `.cursor/rules/project-specific/RULE.mdc`
  - `ARCHITECTURE.md`
  - `AGENTS.md` (portable catalog glob cells only)
  - Job docs stay in this folder.
- Reuse / packages: skipped — instruction prose and frontmatter. No library.
- Risks / open questions:
  - `AGENTS.md` copies glob lists by hand. Phase 3 updates those cells in the same edit as the frontmatter, or the catalog drifts again.
  - Root `migrations/` remains in `projectStructure.config.cjs` as a `*.ts` whitelist. Leave that config alone (protected; D3). Do not send SQL there.
  - `useHotkeys`, `useDnd`, and `errorReporting` are reasonable category words. The bug is locking them as the only legal filename. Do not replace one concrete filename with another.
- Standards diversions: none. See Pattern & precedent.

## Pattern & precedent

| Field | Value |
|-------|--------|
| **Capability** | Instruction precedence: the general naming rule beats examples, file-match globs, and a skip written for a different case |
| **Precedents** | Cursor rule globs (a rule loads for the paths it governs); style guides whose examples are illustrative and whose normative line wins; ubiquitous-language naming (the role, not the first client) |
| **Aspects reviewed** | Extensibility — the next feature should not have to rename guidance to get a category name. Instruction composition — a specific example must not outrank the general rule. Coupling — guidance coupled to fictional filenames and to legacy directories. User-facing app UX, identity, async, and accessibility do not apply: no product behavior change. |
| **Findings** | Extensibility: aligns — destinations become folders plus the existing category test. Composition: aligns — the numbered procedure states the naming obligation before the one-off skip. Coupling: aligns — globs match `supabase/functions/` and `cloud-functions/`, which the rule text already names. |
| **Verdict** | `Aligns with precedent` |

## Source / context

Chat finding: placement tables (`useLayout*`, `useHotkeys.ts`, `use*Shortcuts.ts`, `DndContext.tsx`, `useDnd.ts`, `errorReporting.ts`), style samples (`useTodos`, `greenpt-proxy`, `useSupabaseConfig` as the shared-hook specimen), globs (`functions/`, `edge-functions/`, missing `cloud-functions/`), and the one-off skip in the layer-consistency procedure. The category principle already exists. It loses because those other lines are earlier or more specific.

## Scope / out of scope

In scope: the three mechanisms above, plus the "extension machinery still needs a real use case" sentence where it can be read as permission to keep an instance name until a second caller.

Out of scope:

- Renaming `useSupabaseConfig`, `useUpdateUserProfile`, or any other `src/` symbol (D1).
- A new validator or CI check (D2).
- Editing `projectStructure.config.cjs` or `.eslintrc.json`.
- Inventing a rate-limit design for non-Supabase hosts (D5).
- Changelog and commit (`finish`).

## Phase 1 — Naming check fires on the first name

### Goal

The procedure an agent executes refuses to skip instance-encoded names. The sentence that blocks speculative factories no longer reads as a waiver of that test.

### Steps

1. In `.agents/skills/layer-consistency-check/SKILL.md`, rewrite the one-line **Do** and procedure step 4 so the shape #5 rule comes first: a new function, component, type, file, or feature folder is not a one-off skip. One caller is when the name locks. Rename to the category, or stop with WARNING. After that sentence, keep the skip for every other shape: genuinely one-off exceptions with no recurring cost.
2. In `references/workaround-shapes.md` § Severity filter, move the existing "Do not use that skip for shape #5" sentence to the start of the section. Leave the modal-corner / never-recur skip in place for the other shapes.
3. In `.cursor/rules/architecture/RULE.mdc` § Layer consistency, lead the paragraph with the same order: new identifiers follow category-not-instance on the first caller; the one-off skip does not apply to them. Then the skip for other workarounds.
4. In `.cursor/rules/code-style/RULE.mdc` § Generic core, contextual edge, replace the closing sentence so the two duties stay separate:
   - Do not add plugin registries, unused ports, or other extension machinery until a second consumer exists.
   - That limit does not waive category naming. The first function, file, and feature folder still use the category name.

### Gate

Read those four spots. Each one states the first-caller naming duty before any skip or "wait for a second use" limit. The modal-corner skip is still present and applies only to non-naming shapes.

## Phase 2 — Folders, not frozen filenames

### Goal

"Put new code here" lines and style samples no longer cite a concrete file as the official home.

### Steps

1. `.cursor/rules/architecture/RULE.mdc`
   - Folder diagram comments for `shared/hooks` and `shared/services`: describe the role ("cross-feature hooks", "cross-feature services"). Remove `useAuth`, `useLayout`, `useLocalStorage`, and `errorReporting` from those comments. `useAuth` lives under `src/features/auth/hooks/`, so the diagram currently points at a file that is not there.
   - Shared-folder examples (`useAuth`, `formatDate`, `errorReporting`): drop the hook and service filenames. Keep the folder roles.
   - § Edge Case Placement: layout hooks, keyboard shortcuts, error reporting, and drag-and-drop name the folder only (`src/shared/hooks/`, `src/shared/services/`, `src/shared/context/`) plus "name the category (`code-style` § Category, not instance)". Remove `useLayout*.ts`, `useHotkeys.ts`, `use*Shortcuts.ts`, `errorReporting.ts`, `DndContext.tsx`, and `useDnd.ts` as required names.
   - Optimistic-update see-also for `useUpdateUserProfile`: label it "one shipped instance (profile update), not a template prefix." Other mutations get their own category name in the owning feature.
2. `.cursor/rules/file-placement/RULE.mdc`
   - Layout hooks row: `src/shared/hooks/`, category name. Remove `useLayout*.ts`.
   - SQL migration row: `supabase/migrations/*.sql` only. Remove `or migrations/` (D3). Root `migrations/` is a TypeScript whitelist, not a SQL home.
   - Skill `patterns.md` row: allowed on any skill folder the whitelist already permits. `debug` is one current user, not the only legal name.
3. `.cursor/rules/code-style/RULE.mdc` file-naming and import samples: replace `TodoItem` / `useTodos` / `todoService` / `todo.types` with role words that illustrate case and suffix only (`ItemList.tsx`, `useItems.ts`, `itemService.ts`, `item.types.ts`), and add a clause that they are not destinations. Point the path-alias samples at the real file `@/features/auth/hooks/useAuth`. Remove `@/shared/hooks/useTodos`.
4. `.cursor/rules/cloud-functions/RULE.mdc`: delete the `cloud-functions/greenpt-proxy/` example. Keep `cloud-functions/<service-name>/`.
5. `ARCHITECTURE.md`: shared-hooks tree label drops `useSupabaseConfig` as the specimen (do not rename the hook). Layer-import samples use `@/features/auth/hooks/useAuth` instead of `@/features/todos/hooks/useTodos`.

Do not introduce a replacement concrete filename anywhere a frozen name was removed.

### Gate

Search the edited files for `useLayout`, `useHotkeys`, `useDnd`, `DndContext`, `errorReporting.ts`, `useTodos`, `greenpt-proxy`, and `or migrations/`. No remaining hit is a required destination. `useUpdateUserProfile` may remain only with the shipped-instance label.

## Phase 3 — Globs match the prescribed homes

### Goal

A rule loads when the agent edits the folder that rule tells them to use. Legacy directory names stop being the activation key. The rate-limit rule stays Supabase-specific on purpose.

### Steps

1. `.cursor/rules/cloud-functions/RULE.mdc` frontmatter `globs`: `**/supabase/functions/**` and `cloud-functions/**`. Remove `**/functions/**` and `**/edge-functions/**` (D4).
2. `.cursor/rules/api-integration/RULE.mdc` frontmatter `globs`: `**/services/**`, `**/lib/**`, `**/supabase/functions/**`, `cloud-functions/**`. Remove `**/functions/**` and the root-only `supabase/functions/**` entry (the `**/supabase/functions/**` pattern covers it).
3. `.cursor/rules/project-specific/RULE.mdc`: keep `**/supabase/functions/**/*.ts`. Under the title, state that this rule is the Supabase Edge Function rate-limit mechanism (Postgres `rate_limits`, service role, `supabase/functions/_shared/rateLimit.ts`). Other hosts are out of scope. Do not copy that helper or add their limits into that file (D5).
4. `AGENTS.md` portable catalog: set the `cloud-functions` and `api-integration` glob cells to the same lists as the frontmatter. Leave the database and project-specific glob cells as they are.
5. Database rule globs stay `**/supabase/migrations/**/*.sql` and `**/supabase/**/*.sql`. No root `migrations/` pattern (D3).

### Gate

Frontmatter globs and the matching `AGENTS.md` cells are identical for cloud-functions and api-integration. `cloud-functions/**` is present. `**/functions/**` and `**/edge-functions/**` are absent from those two rules. Project-specific still matches only Supabase function TypeScript, and its boundary sentence is in the rule body.

## Notes during development

- 2026-10-04 — Review lenses agreed the plan direction. Two gaps were folded into the same files: route guards still cited `shared/hooks/useAuth`, and `cloud-functions/RULE.mdc` still taught a top-level `functions/` tree. Rebel's meta-linter and placement-SSOT collapse were not adopted (D2).
- 2026-10-04 — `project-specific` YAML description now states the Supabase-only boundary so the `AGENTS.md` catalog row matches the rule body.
- 2026-10-04 — Gates: shape #5 leads the skill **Do** line, procedure step 4, the severity section, the architecture paragraph, and the code-style machinery sentence. Grep of the edited rules found no `useLayout`, `useHotkeys`, `useDnd`, `DndContext`, `errorReporting`, `useTodos`, `greenpt-proxy`, or `or migrations/`. `useUpdateUserProfile` remains only with the shipped-instance label. Frontmatter globs match the `AGENTS.md` catalog cells.

## Decisions made

Impl-time only. Product/scope forks are in sibling `DECISIONS.md`.

| # | Topic | Choice | Precedent? |
|---|-------|--------|------------|
| 1 | Protected-file consent | User said "proceed" after the plan was presented. Review ran first. That is the approval to edit the listed rules and skills. | Yes — agent-behavior |
| 2 | Review extras | Fix route-guard path and retarget `functions/` examples in the cloud-functions rule. Do not add a harness linter or merge the placement tables. | Yes — review-dev-plan, ≥2 lenses |
| 3 | Rate-limit visibility | State the Supabase-only boundary in both `project-specific` and `cloud-functions`, so the host that does not load the rate-limit rule still sees the limit. | Yes — D5 |
