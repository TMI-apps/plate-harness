# Git workflow mode

Machine-readable mode lives in `git-workflow.json` (`mode`: `model-a` | `model-b` | `model-c`). Default for new forks: `model-c`.

- **Validate / read:** `pnpm validate:git-workflow`; CI and hooks read the mode with `node scripts/validate-git-workflow.cjs --print-mode` (the only reader).
- **What each mode does:** `.cursor/rules/git-workflow/RULE.mdc` § Mode behavior table (SSOT — do not restate it here).
- **Fork choice:** the `start` skill asks at onboarding.
- **Mid-project switch:** `documentation/DOC_CONTRIBUTING.md` § Mid-project mode switch.
