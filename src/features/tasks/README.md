# Dev task backlog (`/tasks`)

In-repo development backlog for coding agents and local UI.

## Purpose

- Dev-only task board at `/tasks` for onboarding and agent work
- SSOT for active and archived tasks in JSON files
- Pre-seeded onboarding checklist on fresh clones (Supabase, Hosting, App vision, Airtable optional, Theme)

**Intentional exception:** This feature uses local React state + `fetch` (not TanStack Query) because it is a dev-only tool backed by the Vite dev plugin, not user-facing server state.

## Structure

| Layer | Path | Purpose |
|-------|------|---------|
| Components | `components/` | `TasksBacklogPanel`, `ActiveTaskList`, `ArchiveTaskList`, task rows, `TasksAutosaveIndicator`, `TasksListEmptyState`, `taskStatusUi`, `DevTasksFab` |
| Hooks | `hooks/` | `useAppTasksBacklog` — CRUD, reorder, archive/restore, dirty-aware text autosave |
| Services | `services/` | `appTasksDomain` (validation/logic), `appTasksApiService` (HTTP to dev API) |
| Types | `types/` | `AppTask`, `ActiveTaskStatus`, `TaskStatus` |

**Config SSOT:** `src/config/app-tasks.json` (active), `src/config/app-tasks-archive.json` (done).

**Dev API (Vite serve only):** `vite-plugin-dev-tasks.ts` — `/__dev/tasks`, `/__dev/tasks/archive`, `/__dev/tasks/restore`.

**UI entry:** `DevTasksFab` on all routes in dev; route `/tasks` with minimal chrome (card rows, toolbar autosave chip, no column headers).

**Bundle:** Task UI components import MUI and icons via direct path imports (not barrel files) to keep the lazy `/tasks` chunk lean in dev and production.

## User feedback policy

- **Mutation/async errors:** single MUI `Snackbar` via `TasksFeedback` (tasks pattern is SSOT for non-form mutations).
- **Initial load failures:** same snackbar path via `reloadForView` try/catch.

## Testing

Colocated `*.test.ts` under `services/`; shared wrappers in `tests/test-utils.tsx`. See `documentation/DOC_TESTING.md`.

## Dependencies

- `vite-plugin-dev-tasks.ts` (project root)
- MUI 9, dnd-kit (reorder)
- Agent skills: `.agents/skills/start/SKILL.md`, `router`, `finish` for task sync

## Onboarding

Fresh clones ship five pre-seeded tasks in `app-tasks.json`. Agents sync status at session boundaries per start/router/finish skills.
