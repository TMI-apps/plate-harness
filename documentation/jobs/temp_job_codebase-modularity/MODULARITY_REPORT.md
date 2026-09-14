# Modularity report (2026-09-11)

Source: `pnpm modularity:report` (dependency-cruiser JSON). Enforcement: `pnpm arch:check` with `stack-port-*` rules; **64** current MUI edges grandfathered in `.dependency-cruiser-baseline.json`.

## Score A — product features

| Feature | Inbound | Wiring | Outbound features | Outbound stack |
|---------|---------|--------|-------------------|----------------|
| auth | 13 | 5 | — | MUI |
| tasks | 1 | 1 | — | MUI |

**Reading:** `tasks` is cheap to *remove* (one page mount). `auth` is expensive to *remove* (profile menu, context, several pages). Both features still **know MUI** — that is Score B leaking into the feature, not cross-feature coupling.

## Score B — stack slots

| Slot | Files that know the secret | Busywork | Ratchet |
|------|----------------------------|----------|---------|
| MUI | 38 | high | **Yes** — new imports from features/pages/layouts fail unless they go through `components/common` or `shared/theme` |
| Supabase | 0 in this graph | none | **Yes** — value imports of `@supabase/*` outside `supabaseService.ts` fail. Type-only and the service file often do not appear as npm edges in this cruise |
| Airtable | 1 | low | **Yes** — only `airtableService.ts` should import `airtable` |
| Vite | not from graph | — | **No** |

## Opportunities (deferred — not this job)

1. Concentrate remaining feature/page `@mui` imports into `src/components/common` so Score B drops and grandfathered baseline rows can be deleted.
2. Keep Airtable as the model port (one file).
3. Do not treat Vite `import.meta.env` as a fail rule.

## Limits

- Report CLI always exits 0. Failures are `arch:check`.
- Informational snapshot: `scripts/modularity-baseline.json` (`--write-baseline`).
- ESLint `no-restricted-imports` for `@mui` in features was **skipped** — current files would go red; cruiser+baseline is the v1 ratchet.
