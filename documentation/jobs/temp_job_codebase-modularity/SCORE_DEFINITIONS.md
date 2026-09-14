# Score definitions — replaceability

Job: `temp_job_codebase-modularity`

Two scores, never blended. The **graph** is dependency-cruiser. The **gate** is cruiser forbidden rules + baseline grandfathering. The **report** is busywork counts (inform).

## Nominated adapters (where *new* vendor imports may land)

| Slot | Adapter path(s) |
|------|-----------------|
| MUI | `src/components/common/**`, `src/shared/theme/**` |
| Supabase | `src/shared/services/supabaseService.ts` |
| Airtable | `src/shared/services/airtableService.ts` |
| Vite | none — not gated (`import.meta.env` is app-wide) |

## Gate vs measure

| | Measure (report) | Gate (`pnpm arch:check`) |
|--|------------------|--------------------------|
| **Score A features** | Inbound / outbound / wiring file counts | Existing `no-cross-feature-internals` only |
| **Score B stack** | Raw files that import the vendor | **New** edges from `src/features`, `src/pages`, `src/layouts` to MUI/Supabase/Airtable except adapters. Existing edges in `.dependency-cruiser-baseline.json` |
| **Vite** | Qualitative note if visible | **Not gated** |

Grandfather means: today’s violating files stay until someone unwraps them. A **new** file or a **new** import of the vendor from a gated layer fails.

## Worked examples (Phase 1 gate)

1. **New** `src/features/foo/components/X.tsx` with `import Button from "@mui/material/Button"` → **gate fail** (`stack-port-mui`). Report still counts the file as MUI leakage.
2. `src/shared/theme/defaultTheme.ts` importing `@mui/material/styles` → **allowed** (adapter). Report still counts it as a file that knows MUI.

## Score A — features

Discover keys with `discoverFeatureRoots` (nested folders that contain a layer dir). Attribute a module to the **longest matching** feature key.

- **Inbound:** modules *outside* the feature that depend on a module *inside* it, excluding `*.test.*`.
- **Wiring:** inbound whose source is under `src/pages/`, `src/layouts/`, or `src/routes/` — listed separately; expected mount points.
- **Outbound:** modules *inside* the feature that depend on another feature or a stack package (`@mui/`, `@supabase/`, `airtable`).

## Score B — stack

Count unique `src/` modules (not tests) whose dependencies resolve to:

- MUI: `node_modules/@mui/` or specifier `@mui/`
- Supabase: `@supabase/`
- Airtable: package `airtable`
- Vite: not inferred from the graph; report footer only

Busywork bands (file counts): **low** 1–3, **medium** 4–15, **high** 16+.

## Baseline files

- **Enforcement:** `.dependency-cruiser-baseline.json` (known violations).
- **Informational delta (optional):** `scripts/modularity-baseline.json` — previous report JSON; `pnpm modularity:report --write-baseline` only. Never overwrite silently.
