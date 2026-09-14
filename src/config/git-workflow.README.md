# Git workflow mode

Machine-readable mode lives in `git-workflow.json`. Behavior SSOT: `.cursor/rules/git-workflow/RULE.mdc`.

| Mode | Daily work | Integration |
|------|------------|-------------|
| `model-a` (default) | `feature/*` / `fix/*` branches | Squash PR → `develop` |
| `model-b` | Commit on `develop` | Direct push → `develop` |

Both modes: production via **Promote to production** (fast-forward `main` to `develop`). Never commit app code to `main`.

**Fork choice:** `start` skill asks at onboarding. Template (plate-harness) stays `model-a`.

**Mid-project switch:** See `documentation/DOC_CONTRIBUTING.md` § Mid-project mode switch. No automated migrator in v1.
