# Audit: plate-harness vs bronze-plate-harness (harness en proces)

Datum: 2026-10-21. Scope: skills, rules, git-workflow, CI, scripts, tooling-config en docs. App-code (`src/`) valt bewust buiten scope.
Bewust geaccepteerd (geen bevinding): MUI vs shadcn/Tailwind, en het theming-subsysteem (DTCG tokens, terrazzo, `DOC_THEMING.md`, kleurmodus).

## Relatie

- Bronze is een afstammeling van plate: merge-base is plate's huidige HEAD `8083ee4` (v0.40.0). Bronze loopt 24 commits voor, plate heeft niets wat bronze mist. Er zijn nu dus **geen git-conflicten**.
- Conflictrisico ontstaat zodra plate verder gaat op bestanden die bronze al heeft aangepast (zie tabel 5).
- Plate loopt achter: alle algemene verbeteringen uit bronze ontbreken in plate.

## 1. Bronze-verbeteringen die plate mist (algemeen, niet shadcn-specifiek)

| # | Onderwerp | Plate | Bronze | Bestanden |
|---|---|---|---|---|
| 1 | Node-versie | Node 20 (`.node-version`, CI, docs). | Node 22, `engines >=22`, `preinstall`-check. Reden in docs: wrangler 4 vereist Node 22+. | `.node-version`, `ci.yml`, `package.json`, `scripts/check-node-version.*`, `DOC_CLOUDFLARE_WORKERS.md`, `README.md` |
| 2 | Cloudflare `NODE_VERSION` | Docs adviseren `NODE_VERSION=20` als build-variabele. | Docs zeggen: nooit zetten, het overschrijft `.node-version`. | `README.md`, `DOC_CLOUDFLARE_WORKERS.md` |
| 3 | Supabase staging | Eén Supabase-project voor preview en productie; previews lezen en schrijven productiedata. | Apart staging-project voor previews, met stappenplan en caveats. | `DOC_CLOUDFLARE_WORKERS.md`, `cloud-functions` rule, `database` rule, `git-workflow` rule |
| 4 | Preview-link in PR | Geen regel. | Elke PR bevat een `## Preview` sectie. | `git-workflow` rule |
| 5 | Git-workflow default | `model-b`. | `model-c` (release 0.41.0). | `src/config/git-workflow.json` |
| 6 | Release-bootstrap | Ontbreekt. | `bootstrap`-job maakt de baseline-release `v<versie>` automatisch (model-c). | `.github/workflows/release-please.yml` |
| 7 | `dependency-cruiser` excludes | Unanchored `dist`, `build`, `coverage` in de exclude-lijst. Die matchen ook `node_modules/**/dist/*` en verbergen vendor-edges (bronze-comment). | Geankerd (`^dist/` enz.). | `.dependency-cruiser.cjs` |
| 8 | `test-staged` en Vitest 4 | Exit-status wordt vroeg teruggegeven. Vitest 4 geeft exit 1 als er geen related tests zijn, dus een commit zonder tests kan blokkeren. | Check komt vóór de status; plus extra test. | `scripts/test-staged.cjs` (+ test) |
| 9 | `react-hooks` lint | Geen hooks-regels in `eslint.config.js`. | `rules-of-hooks` (error) en `exhaustive-deps` (warn). Plate's code-style rule beschrijft ze wel. | `eslint.config.js` |
| 10 | `eslint.config.js` pad | `files: ['src/common/**']` wijst naar een map die niet bestaat. | `src/components/common/**`. | `eslint.config.js` |
| 11 | Hardcoded-kleur lint | `sx`-regels (MUI-specifiek). | Class-based regels (shadcn-specifiek). | Gevolg van de UI-kit; alleen relevant als plate ooit migreert. |
| 12 | ProfileMenu en Topbar | In `components/common`. | In `layouts/` (app-shell). Past bij de regel dat common geen features importeert. | `ARCHITECTURE.md`, `architecture` rule |

## 2. Plate-inconsistenties (los van bronze)

| # | Bevinding | Waar |
|---|---|---|
| 1 | `.eslintrc.json` is legacy naast `eslint.config.js` (flat). Rules, hooks en docs verwijzen er nog naar ("SSOT: `.eslintrc.json` lines 65-70"). Bronze heeft het bestand verwijderd en de verwijzingen bijgewerkt. | `.eslintrc.json`, `code-style` rule, `agent-behavior` rule, `.husky/pre-commit`, `.claude/settings.json` |
| 2 | `pnpm lint:arch` draait `boundaries/element-types`, maar `eslint.config.js` bevat geen `boundaries`-plugin. Het script en de verwijzingen in `architecture` rule en settings zijn dus waarschijnlijk dood. Verifieer met `pnpm lint:arch` in plate. | `package.json`, `architecture` rule |
| 3 | Plate-docs claimen `eslint-plugin-boundaries` en `eslint-plugin-import` als actieve handhaving; bronze noemt dependency-cruiser en `no-restricted-imports` als werkelijke handhaving. | `AGENTS.md`, `architecture` rule |
| 4 | Plate bevat Model C in code maar staat zelf op `model-b`. Kies bewust of dit zo blijft. | `git-workflow.json` |

## 3. Plate-only, door bronze bewust of gedwongen verwijderd (nog niet door jou bevestigd)

| # | Onderwerp | Opmerking |
|---|---|---|
| 1 | Airtable: `airtableService.ts`, 3 scripts, `vendor-airtable.md`, `stack-port-airtable`, onboarding-task 4, README-sectie | Bronze is "lean". Jij hebt dit **niet** als bewust verschil aangemerkt, dus beslis of plate-only Airtable een optionele module moet blijven. |
| 2 | `useUserProfile`, `useUpdateUserProfile`, `useAnchorMenuState` | In bronze verwijderd of verplaatst (lean). Raakt `src/`; buiten scope maar wel samenhangend met #1. |
| 3 | `documentation/Authentication-main-app/`, `documentation/claude_outputs/` | Alleen in plate; bronze noemt in de `file-placement` rule `handoffs/` als voorbeeld. |
| 4 | `.agents/skills/debug/patterns.md`: sectie "Vitest + MUI: Cannot require ES Module in a cycle" | Alleen relevant met MUI; hoort bij plate. |

## 4. Gevolg van shadcn (verwacht, geen actie)

Skills `review`, `start`, `router`, `modularity-review`, `finish`, `react-perf-vite`, `optimize2`, `consolidate`, `plan`, `feature`, `implement`, `improve`, `prime`, `rule-quality`, `api-integrate`; rules `code-style` (styling-scope tabel), `architecture`; docs `README`, `ARCHITECTURE`, `AGENTS`, `DOC_REACT_PERF`, `DOC_TANSTACK_QUERY`, `DOC_TESTING`; `.dependency-cruiser` (`stack-port-mui` vs `stack-port-radix`); `modularity-report-lib`; `projectStructure.config.cjs` tokens-map; `package.json` dependencies. Dit zijn vooral woordvervangingen of stack-slots.

## 5. Conflictrisico bij toekomstige sync

Bestanden die in bronze zowel generieke als shadcn-wijzigingen hebben. Een latere plate-wijziging hieraan geeft handmatig mergewerk:

`AGENTS.md`, `README.md`, `ARCHITECTURE.md`, `package.json` (+lock), `eslint.config.js`, `.dependency-cruiser.cjs`, `.cursor/rules/{architecture,code-style,git-workflow,cloud-functions}`, `.agents/skills/{start,review,router}`, `documentation/DOC_CLOUDFLARE_WORKERS.md`, `projectStructure.config.cjs`.

Tip: neem de generieke punten uit tabel 1 en 2 eerst over (los van de UI-kit), dan wordt de latere diff kleiner.

## Onzekerheden (niet geverifieerd)

- Bronze heeft in `package.json` enkele ESLint-dependencies verwijderd (`@eslint/js`, `eslint-config-prettier`, `eslint-plugin-react*`, `globals`, `typescript-eslint`). Niet gecontroleerd of lint nog volledig werkt zonder deze.
- Niet gedraaid: `pnpm lint:arch`, lint of tests in een van beide repo's.
- `src/`-verschillen (auth, tasks, pages, layouts) zijn buiten scope en niet beoordeeld.

## Uitkomst (2026-10-21)

- Geverifieerd: `pnpm lint:arch` faalt in plate (`could not find plugin "boundaries"`); `pnpm lint` in bronze geeft 0 errors zonder de verwijderde ESLint-dependencies.
- Bronze verwijderde 10 ESLint-dependencies (lijst hierboven was onvolledig): ook `eslint-plugin-boundaries`, `eslint-plugin-import`, `eslint-import-resolver-typescript`, `eslint-plugin-unused-imports`, `eslint-plugin-react-refresh`.
- Per punt beslist in `DECISIONS.md` (D6–D24) en doorgevoerd in plate 0.41.0; zie `CHANGELOG.md`.
