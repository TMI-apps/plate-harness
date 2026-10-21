# Changesets (release flow)

How version bumps on `develop` relate to feature work, production promotion, and **`finish`**.

Mode: `src/config/git-workflow.json`. Behavior: `.cursor/rules/git-workflow/RULE.mdc`.

## Model A — feature branches

- Add a changeset under `.changeset/*.md` when the change should appear in the next release (user-facing or semver-relevant).
- **`finish`** owns conventional commits, `package.json` version sync, and `CHANGELOG.md` on the feature branch (see `.agents/skills/finish/SKILL.md`).
- Version + changelog land with each feature PR via **`finish`** (squash-merged to `develop`).

## Model B — direct `develop`

- **`finish`** runs on `develop` (no feature branch). Version + changelog land with each push to `develop`.
- Prefer **one active agent per checkout** on `develop` — shared-branch contention is higher than Model A.
- Pushing to `develop` updates staging — it does **not** ship production.

## Model C — Claude Code defaults (default for new forks)

- No per-PR bump: `finish` does **not** edit `package.json` or `CHANGELOG.md`, and commits carry no `[VERSION]` prefix.
- The squash PR title (`type: subject`, enforced by the `pr-title` CI check) becomes the commit on `main`.
- `.github/workflows/release-please.yml` keeps a release PR open that bumps `package.json` and writes `CHANGELOG.md` from those titles; the user merges it to tag the release. It dispatches `ci.yml` on the release branch so the required `test` check runs there.
- Config: `release-please-config.json` + `.release-please-manifest.json` (manifest holds the last released version; tags are `v<version>`). Before 1.0, `bump-minor-pre-major` makes a breaking change (`feat!:`) bump the minor version instead of jumping to 1.0.0; remove it when the project is ready for 1.0.
- No `.changeset/` files.

## On `develop` (Model A/B)

- Merging or pushing to `develop` updates staging — it does **not** ship production.

## Production (`main`, Model A/B)

- Run **Promote to production** (`promote-to-production.yml`) to fast-forward `main` to `develop` after staging verification.
- Do not squash-merge `develop` into `main` or back-merge `main` into `develop`.

## Related

- Layer model: `documentation/DOC_AGENT_WORKFLOW_LAYERS.md` § Release and versioning
- Commit/changelog SSOT: `.agents/skills/finish/SKILL.md`
- Branch strategy SSOT: `.cursor/rules/git-workflow/RULE.mdc`
