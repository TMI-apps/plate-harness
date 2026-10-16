# How to Contribute Safely

This guide points you to the canonical process documents. Follow these links for authoritative rules—do not rely on duplicated text elsewhere.

## Before You Start

1. **Workflow SSOT** – [`.agents/skills/finish/SKILL.md`](../.agents/skills/finish/SKILL.md)  
   - Commit format, versioning, changelog sync  
   - Run this command before committing

2. **Branch strategy** – [`.cursor/rules/git-workflow/RULE.mdc`](../.cursor/rules/git-workflow/RULE.mdc)  
   - Mode: [`src/config/git-workflow.json`](../src/config/git-workflow.json) (Model C default; A/B selectable)  
   - § Mode behavior table (SSOT for every mode-dependent behavior); § Mode-aware branch gate

3. **Protected files** – [`.cursor/rules/agent-behavior/RULE.mdc`](../.cursor/rules/agent-behavior/RULE.mdc)  
   - Files requiring explicit user approval before agent edits

4. **Architecture SSOT** – [`.cursor/rules/architecture/RULE.mdc`](../.cursor/rules/architecture/RULE.mdc)  
   - Layer rules, code placement, import patterns  
   - See also: [ARCHITECTURE.md](../ARCHITECTURE.md), [projectStructure.config.cjs](../projectStructure.config.cjs), [.dependency-cruiser.cjs](../.dependency-cruiser.cjs)

5. **Release & changelog SSOT** – per § Mode behavior table → **version source**: Model A/B [`.agents/skills/finish/SKILL.md`](../.agents/skills/finish/SKILL.md) (bump rules, changelog format, version sync); Model C release-please ([DOC_CHANGESETS.md](./DOC_CHANGESETS.md))

## CI Gate Expectations

**Pre-commit hook** runs staged tests (related or full), type-check, and validators on app-surface commits. See `documentation/DOC_AGENT_WORKFLOW_LAYERS.md` § Local git.

**Before opening a PR** (Model A/C) **or pushing `develop`** (Model B), ensure CI parity locally:

| Check | Command |
|-------|---------|
| Classifier + executor tests | `pnpm test:classify` |
| Vitest suite | `pnpm test:run` |
| Preview staged test selection | `pnpm test:staged` (after `git add`) |
| Type check | `pnpm type-check` |
| Lint | `pnpm lint` |
| Format | `pnpm format:check` |
| Version/changelog sync | `pnpm validate:version-sync` |
| Git workflow mode config | `pnpm validate:git-workflow` |
| Structure | `pnpm validate:structure` |
| Architecture | `pnpm arch:check:ci` |
| Build | `pnpm build` |

CI runs these on every push to `main` or `develop` and every PR targeting `main` or `develop`. The **authoritative gate** is the green CI `test` job where work lands (§ Mode behavior table → **how work lands**: the PR to `main` under C, `develop` under A/B). Under C, the `pr-title` check also gates the PR.

## How to write tests

See **[DOC_TESTING.md](./DOC_TESTING.md)** — runner choice, colocated file placement, naming (`should … when …`), and `tests/test-utils` helpers.

## Release Direction

Read mode from `src/config/git-workflow.json`; behavior per `.cursor/rules/git-workflow/RULE.mdc` § Mode behavior table (rows **how work lands**, **staging**, **production**):

- **Model C:** per-task branch → squash PR → `main`; each PR has a preview URL; the user merging the PR ships production; release-please handles versions
- **Model A:** `feature/*` → `develop` via squash PR; **Promote to production** ff `main` ← `develop`
- **Model B:** commit and push directly to `develop`; promote as in A. Workers Builds may deploy a `develop` push before CI `test` is green
- Every mode: agents never push to `main`; no squash PR `develop` → `main`, no back-merge

## Mid-project mode switch

No automated migrator. Manual steps:

**Between A and B:**

1. Finish or close open `feature/*` PRs (merge to `develop` or abandon).
2. Update the GitHub `develop` ruleset to the target column of § Mode behavior table → **`develop` ruleset**.
3. Set `"mode"` in `src/config/git-workflow.json` to `model-a` or `model-b`.
4. `git switch develop && git pull origin develop` (or create a fresh `feature/*` if switching to Model A).
5. Confirm agents read the new mode (`pnpm validate:git-workflow`).

**From A/B to C** (the checklist plate-harness itself uses — `documentation/jobs/temp_job_git-workflow-model-c/DEVELOPMENT_PLAN.md` Phase 8):

1. Sweep stranded work: commit or shelve local changes on `develop`; retarget or close PRs based on `develop` (`gh pr list --base develop`); list unmerged `feature/*` branches.
2. Promote `develop` to `main` one last time (A/B flow).
3. **Before any C merge:** set the `main` ruleset per the table (PR + required `test` and `pr-title`, no bypass, no required approvals), squash-only merges with PR title as commit message, auto-delete head branches, allow auto-merge, and allow GitHub Actions to create pull requests.
4. Cloudflare: production branch `main`; previews on all branches; `develop` no longer staging. Check the Supabase redirect wildcard covers previews.
5. On a branch off `main`: fold `CHANGELOG.md` `[Unreleased]` into the next version, bump `package.json` to match, set `"mode": "model-c"`, open a `feat:` PR. This one PR to `main` while the config still says A/B is allowed once, for the cutover.
6. After merge, **the user** tags that commit (`vX.Y.Z`) and creates a GitHub release so release-please has a baseline.
7. Wait at least a week, then remove the `develop` ruleset and delete `develop`.

**Rolling back C → A/B:** set the mode back via a PR; relax the `main` ruleset to deletion + non_fast_forward; recreate `develop` from `main` (or, inside the waiting week, heal it with `git merge origin/main` per § Promote to production § Ancestor failure); restore the `develop` ruleset and Cloudflare staging; resume promote.

## Finding Authoritative Rules

- **≤3 clicks**: Start at [documentation/DOC_INDEX.md](./DOC_INDEX.md) → DOC_CONTRIBUTING → SSOT links above.
- **Protected files** (e.g. `.cursor/**`, `.husky/**`, `projectStructure.config.cjs`) require explicit approval before changes.
