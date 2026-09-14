# Vendor: Airtable (no-MCP path)

No Airtable MCP server exists in this workspace today — this vendor uses the REST/script path. If an Airtable MCP ships later, re-run Phase 0's `GetMcpTools` check; this file stays the fallback either way.

Requires `VITE_AIRTABLE_API_KEY` and `VITE_AIRTABLE_BASE_ID` in `.env` or `.env.local` (loaded by `scripts/load-airtable-env.js`).

## Layers (harness vs fork)

1. **Airtable-agnostic:** Meta API `GET /v0/meta/bases/{baseId}/tables`; Data API field ids vs display names.
2. **This harness:** Env `VITE_AIRTABLE_*`; runtime Meta usage and types in `src/shared/services/airtableService.ts`; onboarding task in dev backlog (`src/config/app-tasks.json`).
3. **Fork / product:** If you need a single SSOT for many `tbl`*/`fld`* constants, add a small module under `src/shared/` following `.cursor/rules/file-placement/RULE.mdc` and `.cursor/rules/architecture/RULE.mdc` (this repo does not ship one).

## Phase 1 — Schema commands

| Command | Purpose |
| ------- | ------- |
| `pnpm airtable:meta-dump` | Same as `node scripts/airtable-meta-dump.js` — full base tables + fields |
| `node scripts/airtable-meta-dump.js --pretty --out meta.json` | Pretty JSON to a file (prefer a path outside git) |

Forks may add their own drift-check script (compare a checked-in constants module to a saved Meta dump); this harness does not ship one.

**Workflow:**

1. Run `pnpm airtable:meta-dump -- --pretty` (or `--out <path>`) with valid env.
2. For the relevant table, list **every** field: name, `id`, `type`, and link options if applicable.
3. Cross-check with `src/shared/services/airtableService.ts` (and any fork-owned id constants): fields present in Airtable but absent in code often cause drift bugs.

## Phase 2 — Sample commands

- `scripts/airtable-sample-records.js` hits the **public Airtable REST API** and prints JSON (`records[].fields`).
- `src/shared/services/airtableService.ts` may normalize or select fields for the UI. For "what does the REST API return today?", **run the script** (or an equivalent fetch); reading the service alone shows app behavior, not necessarily the raw envelope.

**Default table:** if you omit both `--table` and `--table-name`, the script uses `VITE_AIRTABLE_TABLE_ID` (same as the setup wizard primary table). If it is missing or still the placeholder, pass `--table` or `--table-name` explicitly.

```bash
pnpm airtable:sample -- --max-records 2

node scripts/airtable-sample-records.js --table tblXXXXXXXXXXXXXX --max-records 1

node scripts/airtable-sample-records.js --table-name "Your table" --max-records 1 --fields fldAAA,fldBBB
```

Output is JSON: `records[].fields` keyed by `fld…` (matches `returnFieldsByFieldId=true` — same style as id-based API consumers).

**Workflow:**

1. **Structure:** Full field list from Phase 1.
2. **Pick fields:** Choose `fld…` ids for `--fields` when narrowing PII or payload size.
3. Run `pnpm airtable:sample` or `node scripts/airtable-sample-records.js` with low `--max-records`.
4. Relate shapes to helpers in `src/shared/services/airtableService.ts` (and fork code).

## Related

- `README.md` § Airtable — env vars and onboarding
- `src/config/app-tasks.json` — "Configure Airtable (optional)" onboarding task
