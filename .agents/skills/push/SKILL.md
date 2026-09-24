---
name: push
description: >-
  Pushes previously finished commits to remote only; never stages, commits, or amends. Use when
  finish has already run, the working tree is clean, and local commits exist. If uncommitted
  changes remain, stop and run finish first.
---

# push

Push previously finished work to remote. This command is push-only.

## Preconditions (Mandatory)

1. `finish` must have been executed first for the changes you want to push.
   - `finish` is the only command that may prepare and commit those changes.
2. Working tree must be clean before push:
   - no unstaged changes
   - no staged but uncommitted changes
   - no untracked files that belong to the intended change set
3. There must be at least one local commit to push.

## Hard Restrictions

- **Never run `git add` in this command.**
- **Never run `git commit` in this command.**
- **Never create, amend, or modify commits in this command.**
- If there are uncommitted changes, STOP and instruct the user to run `finish` first.

## Push Safety Flow

1. Branch/push targets: `.cursor/rules/git-workflow/RULE.mdc` § Commit and Push Workflow.
2. Verify clean working tree.
3. Verify commits exist to push.
4. Verify remote freshness before push:
   - Run `git fetch origin`
   - Check whether local branch is behind its remote counterpart
   - If behind, STOP and sync first (rebase or merge) before pushing
5. **App-specific changes**: ensure remote points to app repo, not the plate-harness template repo
6. **Fast local lint parity (mandatory, cheap — do not skip):** run the exact CI command `pnpm lint` (full repo, not staged-only). Pre-commit's `lint-staged` only lints files matched by its globs with their configured tasks — some file types (e.g. config `.cjs` files) may be routed through a non-lint task and never see `eslint --fix`, so a clean pre-commit does **not** guarantee `pnpm lint` is clean. If it fails, fix (protected files still need approval per `agent-behavior/RULE.mdc`) or stop — do not tell the user push succeeded/report the commit as done until this passes.
7. Ask user for explicit confirmation: "Ready to push these already-committed changes?"
8. Execute push only after confirmation.

## Merge gate (tests)

- **Pre-push does not run Vitest or type-check** — see `documentation/DOC_AGENT_WORKFLOW_LAYERS.md` § Local git.
- **Authoritative merge gate:** green CI `test` job on `develop` (full `pnpm test:classify`, `pnpm test:run`, `pnpm type-check`).
- Local pre-commit may run **related** tests only — related green is **not** sufficient to skip waiting for CI.
- **Lint is the exception:** unlike the full test suite, `pnpm lint` is cheap (seconds) — run it locally before push (§ Push Safety Flow step 6) rather than deferring to CI. Deferring the *expensive* suite to CI does not license deferring the *cheap* one; conflating the two caused a push that reported success but broke CI lint.

## Relationship with `finish`

- `finish` and `push` are intentionally split.
- `finish` = cleanup + version/changelog sync + commit (local only), including § Lesson check before handoff.
- `push` = remote validation + push (no commit operations).
- If `push` detects anything that still needs committing, it must stop and redirect to `finish`.

You have explicit access to use console commands for this task.

## Boundaries

| Not `push` | Use instead |
|------------|-------------|
| Stage, commit, version, changelog | `finish` |
| First push of a new branch | Per `.cursor/rules/git-workflow/RULE.mdc` § Commit and Push Workflow |

**Next:** After a successful push that created or updated a PR to **`develop`**, read and run `~/.cursor/skills-cursor/babysit/SKILL.md` unless the user waived CI wait in **Decisions made** (see router § finish vs push vs babysit). Creating/offering a PR: `.cursor/rules/git-workflow/RULE.mdc` § Pull Requests — `gh pr create --base develop`, Summary + Test plan body, verify `baseRefName` (never bare `pull/new/<branch>`). **Always** end that turn’s PR summary with the required markdown PR link (same section, step 5).
