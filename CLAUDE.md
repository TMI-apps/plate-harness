# CLAUDE.md

Claude Code entry point. `AGENTS.md` is the vendor-neutral SSOT for project memory (Cursor, Claude Code, Codex); this file only imports it and adds Claude-specific notes. Do not duplicate `AGENTS.md` content here.

@AGENTS.md

## Claude Code notes

- **Skills:** live in `.agents/skills/<name>/SKILL.md` (vendor-neutral; intentionally not moved to `.claude/skills/`). Read the `SKILL.md` directly or invoke via the Skill tool when listed. Index: `.agents/skills/router/SKILL.md`.
- **Rules:** bodies live in `.cursor/rules/**/RULE.mdc` (SSOT, also read by Cursor). Open the relevant one on demand; `.claude/rules/*.md` are thin pointers only.
- **Tool mapping:** skills written with Cursor wording map as — "Task subagent" → `Agent` tool; "AskQuestion" → `AskUserQuestion`; `~/.cursor/skills-cursor/*` → not available here, skip.
- **Shell:** Windows. Use `pnpm` only. Follow `.cursor/rules/platform/RULE.mdc` for PowerShell rules.
- **Personal settings** go in `.claude/settings.local.json` (not shared); team settings in `.claude/settings.json`.
