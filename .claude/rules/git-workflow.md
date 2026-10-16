# Claude rule: git workflow

SSOT: `.cursor/rules/git-workflow/RULE.mdc` — every mode-dependent behavior is a row in its § Mode behavior table. Mode: `src/config/git-workflow.json` (or `node scripts/validate-git-workflow.cjs --print-mode`); apply § Mode-aware branch gate. Do not infer mode from the current branch. `.cursor/rules/agent-behavior/RULE.mdc` for protected files and agent behaviors.

**Key behavioral reminders:**

- **Branch model / landing / CI follow-up:** per § Mode behavior table rows **daily branch**, **how work lands**, **CI watcher**. Never force-push protected branches.
- **Agents never write to `main`** in any mode — a hook blocks `git commit` / `git push` there (the user runs bootstrap or emergency commands themselves).
- **Under A/B (derived from the table):** never open a PR to `main`; "promote / land on main / merge develop to main" means § Promote to production (workflow dispatch). Cursor's babysit step = the desktop app's PR monitor here.
- **Commit timing and version source:** per the table rows **commit timing** and **version source** (A/B: `finish` only, with bump; C: when the user asks, release-please owns versions).
- **Staging gate:** Before committing, show staged + unstaged lists. If unstaged work exists, **stop and ask**.
- **Pre-commit hooks:** Never use `--no-verify`. Fix the underlying issue instead. Staged test tiers: `documentation/DOC_AGENT_WORKFLOW_LAYERS.md` § Local git.
- **Protected files** (need explicit user approval): full manifest in `.cursor/rules/agent-behavior/RULE.mdc` § Protected Files — do not duplicate the list here.
