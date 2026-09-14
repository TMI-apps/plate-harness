# Decisions — codebase modularity score

Job: `temp_job_codebase-modularity`
Updated: 2026-09-11

## Closed

| id | topic | status | choice | source | notes |
|----|-------|--------|--------|--------|-------|
| D1 | Product vision as SSOT for this job | closed | Defer `DOC_APP_VISION.md` (DRAFT); this job is architecture review, not end-user product | plan-grill | clear-winner |
| D2 | v1 deliverable | closed | Depcruise-based two-score **report** + **grandfather ratchet** on new stack leakage + `modularity-review` skill | plan-grill | asked; superseded after rebel weigh → hybrid |
| D3 | Count perimeter | closed | Counts from `src/` ; Vite/tooling outside `src/` qualitative only — **no Vite `import.meta.env` fail rule** | plan-grill | asked; Vite ratchet rejected as noise |
| D4 | What a bad **new** leak does | closed | **Ratchet** — new stack leakage outside nominated adapters fails `arch:check` / lint; existing files grandfathered | plan-grill | asked inform, then hybrid after rebel weigh |
| D7 | What “more modular” must make easier | closed | Replace / add / remove modules with minimal busywork | plan-grill | asked — Parnas + ports |
| D8 | What counts as a module | closed | Both features and stack slots; two scores; never blended; Vite = blast-radius not folder-delete | plan-grill | asked |
| D9 | Which stack slots in v1 | closed | Measure: MUI, Vite-in-src, Supabase, Airtable. **Ratchet v1:** MUI + Supabase (+ Airtable if not already unique). Not Vite | plan-grill | clear-winner after hybrid |
| D10 | Adapter credit | closed | **Score** = raw files that know the secret. **Gate** = nominated adapters may take **new** vendor imports; features/pages/layouts may not | plan-grill | score stays honest; ratchet needs an allowlist |
| D11 | Production unwrap / protected files | closed | No `src/` unwrap. **May edit** `.dependency-cruiser.cjs`, baseline JSON, and `.eslintrc.json` **only** for port/ratchet rules. No Husky change | plan-grill | hybrid; owner picked after rebel weigh |
| D12 | Agent skill | closed | `modularity-review` + router + hooks in `feature`, `plan`, **`implement`**, **`quick-piv`** | plan-grill | asked; implement/quick-piv from plan review |
| D13 | Ever-growing app | closed | Auto-discover features; ratchet new stack leaks; skill on new feature/vendor; depcruise is the graph | plan-grill | hybrid replaces inform-delta-only |
| D14 | Graph engine | closed | Ride dependency-cruiser (JSON/metrics). No custom import walker / regex scorer | plan-grill | clear-winner — five review lenses + rebel |

## Open

| id | topic | status | options briefly | blocked phase |
|----|-------|--------|-----------------|---------------|
| — | — | — | — | — |

## Log

- 2026-09-11 — D4 originally inform-only (asked)
- 2026-09-11 — D11 originally no cruiser/ESLint edits
- 2026-09-11 — Rebel weigh; owner picked **hybrid**
- 2026-09-11 — D4, D2, D9–D13, D14 updated via plan-grill (asked / clear-winner)
