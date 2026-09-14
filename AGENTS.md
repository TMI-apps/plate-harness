# AGENTS.md

Project memory for coding agents (Cursor, Claude Code, Codex, and other AGENTS.md-aware tools).

## Project

**plate-harness** — Vite + React 19 + TypeScript + MUI + Supabase + TanStack Query harness (boilerplate + agent harness) with strict, enforced architecture.

- **Stack:** Vite 8, React 19, TypeScript 6 (strict), MUI 9, TanStack Query 5, Supabase 2, Airtable, React Router 7, Vitest 4, ESLint 10 + GTS + Prettier, Husky + lint-staged, dependency-cruiser, eslint-plugin-boundaries. Pin versions in `package.json`.
- **Package manager:** `pnpm@9.15.4` (enforced via `packageManager` field — do **not** use npm or yarn).

## Workflow — agent skills

Project agent workflows live under **`.agents/skills/<name>/SKILL.md`**. **Full catalog and routing:** `.agents/skills/router/SKILL.md` § Skill index.

**Routing:** For ambiguous work, read `.agents/skills/router/SKILL.md` first.

**Product context:** Fill `documentation/DOC_APP_VISION.md` (see `.agents/skills/start/SKILL.md`).

Layer model: `documentation/DOC_AGENT_WORKFLOW_LAYERS.md`.

**Package / pattern reuse:** `.agents/skills/dont-reinvent-the-wheel/SKILL.md` (before custom generic subsystems).

**Harness maintenance:** Coherence audit → `.agents/skills/align-harness/SKILL.md`. External intake → drop in `.agents/harness-inbox/` then `.agents/skills/update-harness/SKILL.md`.

## Rules

**Bodies (SSOT):** `.cursor/rules/**/RULE.mdc` — open the file for full guidance; do not treat this catalog as the rule text.

**Short "what for" (SSOT):** YAML `description` on each `RULE.mdc`. Rows below are a portable copy for tools that load `AGENTS.md` only (e.g. Claude Code). When editing a description, update the YAML first, then this catalog.

**Deep topic map (Cursor):** `.cursor/rules/INDEX.md` — richer topic bullets; not the short-description SSOT.

### `@` imports (Claude/Codex)

Cursor loads `alwaysApply: true` rules directly from `.mdc` frontmatter, so no rule body is imported here (avoids double-load; `temp_job_harness-skills` D14).

**Verified 2026-08-12:** Cursor does **not** expand these `@` lines — it injects `AGENTS.md` verbatim. Treat the paths below as pointers you must **open yourself** when you need them; do not assume their contents are already in context. Tools that do expand `@` imports (Claude Code) get them inlined.

@.cursor/rules/INDEX.md

Claude-specific behavioral reminders (thin pointers):

@.claude/rules/file-placement.md
@.claude/rules/git-workflow.md

### Portable catalog (all `RULE.mdc`)

Grouped by YAML `alwaysApply`. Include `globs` when present.

#### `alwaysApply: true`

| Path | Description |
|------|-------------|
| `.cursor/rules/architecture/RULE.mdc` | Architectural patterns and structural organization standards · `alwaysApply: true` |
| `.cursor/rules/file-placement/RULE.mdc` | CRITICAL: Before creating any new file or folder, validate placement against projectStructure.config.cjs and architecture rules. Check structure whitelist, verify allowed file patterns, and suggest correct locations if invalid. Applies when user requests file/folder creation or assistant needs to create files. · `alwaysApply: true` |
| `.cursor/rules/code-style/RULE.mdc` | Global code style and formatting standards for all projects · `alwaysApply: true` |
| `.cursor/rules/workflow/RULE.mdc` | Development workflow hub — code review, dev process, deployment pointers · `alwaysApply: true` |
| `.cursor/rules/agent-behavior/RULE.mdc` | Agent decision protocol, success validation, and protected-file consent · `alwaysApply: true` |
| `.cursor/rules/testing/RULE.mdc` | Testing standards, patterns, and quality requirements · `alwaysApply: true` |
| `.cursor/rules/debugging/RULE.mdc` | Debugging strategy, logging, issue analysis, and scientific method debugging · `alwaysApply: true` |
| `.cursor/rules/security/RULE.mdc` | Security best practices and vulnerability prevention · `alwaysApply: true` |

#### `alwaysApply: false`

| Path | Description |
|------|-------------|
| `.cursor/rules/git-workflow/RULE.mdc` | Git branch models (Model A / Model B), PRs, and production promotion · `alwaysApply: false` |
| `.cursor/rules/platform/RULE.mdc` | Windows/PowerShell command rules and local environment configuration · `alwaysApply: false` |
| `.cursor/rules/database/RULE.mdc` | SQL migration best practices for the configured relational database (this fork: Supabase/PostgreSQL; not client queries or TanStack) · `alwaysApply: false` · `globs: ["**/supabase/migrations/**/*.sql", "**/supabase/**/*.sql"]` |
| `.cursor/rules/cloud-functions/RULE.mdc` | When to use Edge Functions vs frontend, function organization, and architecture guidelines · `alwaysApply: false` · `globs: ["**/functions/**", "**/edge-functions/**", "**/supabase/functions/**"]` |
| `.cursor/rules/project-specific/RULE.mdc` | Project-specific rate limiting and security patterns for Edge Functions · `alwaysApply: false` · `globs: ["**/supabase/functions/**/*.ts"]` |
| `.cursor/rules/api-integration/RULE.mdc` | Principles for researching an external API, vendor, or backend before writing integration code (MCP-first, doc-freshness, POC-before-code) · `alwaysApply: false` · `globs: ["**/services/**", "**/functions/**", "**/lib/**", "supabase/functions/**"]` |

## Defaults

- **Always read before edit.** Run `pnpm validate:structure` if creating new files in unfamiliar locations.
- **Git workflow mode:** Read `src/config/git-workflow.json`, then apply `.cursor/rules/git-workflow/RULE.mdc` § Mode-aware branch gate (Model A default / Model B opt-in).
- **Layer consistency before code.** Every request to change existing behavior carries an assumption about how the system works — verify it before acting (user can't see the impl). Cues: `.agents/skills/layer-consistency-check/references/workaround-shapes.md` § Request-side cues → run `.agents/skills/layer-consistency-check/SKILL.md` and stop for user choice before writing code.
- **Plan before non-trivial work.** Anything beyond a one-line fix should start with the `plan` skill (`.agents/skills/plan/SKILL.md`).
- **Lean output.** Don't restate skill content — point to the file and follow it.
