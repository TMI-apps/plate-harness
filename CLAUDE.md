# CLAUDE.md

Claude Code entry point. `AGENTS.md` is the vendor-neutral SSOT for project memory (Cursor, Claude Code, Codex); this file only imports it and adds Claude-specific notes. Do not duplicate `AGENTS.md` content here.

@AGENTS.md

## Claude Code notes

- **Skills:** live in `.agents/skills/<name>/SKILL.md` (vendor-neutral; intentionally not moved to `.claude/skills/`). Claude Code does **not** auto-list them, so the Skill tool will not show them (or shows only stale user-level copies). For any workflow request (`/plan`, `/finish`, `/validate`, `/push`, `/router`, ...) or non-trivial task: first read `.agents/skills/router/SKILL.md` § Skill index, then open the matching `.agents/skills/<name>/SKILL.md` by path and follow it. Prefer the repo copy over any same-named user-level skill.
- **Rules:** bodies live in `.cursor/rules/**/RULE.mdc` (SSOT, also read by Cursor). Open the relevant one on demand; `.claude/rules/*.md` are thin pointers only.
- **Tool mapping:** skills written with Cursor wording map as — "Task subagent" → `Agent` tool; "AskQuestion" → `AskUserQuestion`; `~/.cursor/skills-cursor/*` → not available here, skip.
- **Shell:** Windows. Use `pnpm` only. The Bash tool is Git Bash — follow `.cursor/rules/platform/RULE.mdc` § Git Bash; its PowerShell sections apply only in PowerShell.
- **Personal settings** go in `.claude/settings.local.json` (not shared); team settings in `.claude/settings.json`.
