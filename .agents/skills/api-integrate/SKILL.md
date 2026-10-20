---
name: api-integrate
description: >-
  Research an external API, vendor, or backend before writing integration code: check for a
  matching MCP server first, then fall back to docs/REST/scripts. Two phases — schema/contract
  first, sample/wire shape second — same discipline as the retired airtable-inspect skill,
  generalized to any vendor. Worked examples: Supabase (MCP path), Airtable (no-MCP path).
  Triggers: new API integration, unfamiliar vendor, MCP tool discovery, schema drift, wire shape,
  contract-first, POC before code.
---

# API integrate: research before you build

Two phases, same discipline as this repo's retired `airtable-inspect` skill, generalized to any vendor. **Always run Phase 1 (schema/contract) before Phase 2 (sample/wire shape)** — you need to know what exists before you fetch real values.

**Boundary:** this skill covers *researching* an API/vendor, not writing the integration code. If a maintained client/SDK might already cover the work, run [`.agents/skills/dont-reinvent-the-wheel/SKILL.md`](../dont-reinvent-the-wheel/SKILL.md) **first**.

**Next:** Hand off to [`.agents/skills/plan/SKILL.md`](../plan/SKILL.md) § Investigate / Foundation validation for file-level integration work.

**Use this skill when** researching an **unfamiliar or new** vendor/API. **Use a stack plugin skill instead** (`supabase`, `cloudflare`, `wrangler`, etc.) when **operating inside a stack you're already on** — see [`.agents/skills/router/references/tiebreaks.md`](../router/references/tiebreaks.md) § External API research. If a fork has its own vendor-specific skill that's more specific than this generic path, prefer that.

## Security (both phases)

- Never print API keys or raw `.env` lines.
- Redact PII in any sample output; prefer 1–3 records, a fields allowlist when the vendor supports one, and truncate in chat.
- Do not commit raw response samples without review.

---

## Phase 0 — Locate

Find the official docs URL, OpenAPI/GraphQL spec, or SDK for the vendor. Then check whether an MCP server already covers it — **before** assuming REST/browser fetch is the only path.

1. Call `GetMcpTools` with no arguments (or a pattern matching the vendor name) to see what's registered in this workspace.
2. Decide which path this vendor falls into using the fallback decision tree below.

### MCP fallback decision tree

| Situation | Action |
|---|---|
| **No server matches the vendor name** | Use docs/REST/scripts. State explicitly: "no MCP server found for `<vendor>`" — make the gap visible, don't silently assume none exists. |
| **A server matches but reports `needsAuth` / `error` / `loading`** (per the MCP meta-tool `serverStatus`) | Treat as unusable. Do not retry indefinitely. Fall back to docs/REST/scripts and state which server was skipped and why. |
| **A server matches and looks usable, but the specific tool call fails** (auth, rate limit, wrong project/scope) | Fall back after one retry. State the failure — never silently trust a stale or partial result. |
| **Multiple servers match the same vendor** (e.g. a stack plugin skill's MCP server vs a fork's own project-specific server) | Prefer the one scoped to the environment actually being worked in. State which was chosen and why. Never hardcode a fork-specific server name as *the* default — see the Supabase worked example. |

**Always report which path was used** (MCP tool name, or REST/script/docs) in your output — the choice must be auditable, not implicit.

---

## Phase 1 — Schema / contract (what exists)

Answer **what exists**: endpoints, auth method, required fields, types, linked/nested structures — from docs or MCP schema tools, **not memory**. No request bodies or row data yet.

### Output template

```markdown
## Scope
[Vendor / feature]

## Contract
- Path used: [MCP tool name(s), or docs URL(s) / REST endpoint(s)]
- Auth method: [...]
- Endpoints / resources relevant to this task: [...]
- Types / required fields: [...]

## Code alignment
- Matches existing service code (if any): [...]
- Gaps: [...]

## Follow-up
- [Sample phase scope, or hand off to `plan`]
```

---

## Phase 2 — Sample / wire shape (what values look like)

See **actual shapes**: pagination envelope, error format, nested/linked structures — via one real MCP tool call, a minimal script, or a documented example. Only meaningful once Phase 1 told you what to ask for.

- Prefer the smallest possible call (1-3 records/rows, narrow field selection when the vendor supports it).
- Note where the app's normalization layer (if any) differs from the raw wire shape — reading app code alone shows app behavior, not necessarily what the vendor actually returns today.

---

## Worked examples

Vendor-specific commands and exact paths live in `references/`, not inline here, so this file stays a thin dispatcher as more vendors are added:

- [`references/vendor-supabase.md`](references/vendor-supabase.md) — MCP path (schema/docs tools available)
- [`references/vendor-airtable.md`](references/vendor-airtable.md) — no-MCP path (REST scripts)

Add a new vendor by adding a new `references/vendor-<slug>.md` file — do not grow this file inline (this repo's `references/` folder only allows flat `*.md` files, no subdirectories — see `projectStructure.config.cjs`).

---

## Related

- [`.agents/skills/plan/SKILL.md`](../plan/SKILL.md) § Optional: Foundation validation — POC gate after this skill's research is done
- [`.agents/skills/router/references/tiebreaks.md`](../router/references/tiebreaks.md) § External API research
- [`.cursor/rules/api-integration/RULE.mdc`](../../../.cursor/rules/api-integration/RULE.mdc) — globs-scoped principles this skill implements (`alwaysApply: false`)
- `README.md` — env vars for currently configured vendors (Supabase, Airtable)
