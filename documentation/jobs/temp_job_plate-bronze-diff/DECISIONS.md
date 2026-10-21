# Decisions — plate-bronze-diff

Job: `temp_job_plate-bronze-diff`
Updated: 2026-10-21

## Closed

| id | topic | status | choice | source | notes |
|----|-------|--------|--------|--------|-------|
| D1 | Intentional difference | closed | MUI vs shadcn/Tailwind is accepted, not a finding | grill-me | stated by user up front |
| D2 | Deliverable | closed | One-off audit list; no code or repo changes | grill-me | asked |
| D3 | Perimeter | closed | Harness and process only (skills, rules, git-workflow, CI, scripts, docs); app code out | grill-me | asked; app code deferred/excluded TBD |
| D4 | Accepted differences | closed | Only theming subsystem is accepted (besides shadcn). Airtable removal, model-c, Node 22 are findings to list | grill-me | asked |
| D5 | Delivery | closed | Markdown file in plate-harness repo (plate lags and needs most changes) | grill-me | asked; path under documentation/jobs/temp_job_plate-bronze-diff/ |
| D6 | 1.1 Node 22 | closed | Port: .node-version, CI, engines >=22, preinstall check + test | walkthrough | wrangler 4 needs Node 22+ |
| D7 | 1.2 NODE_VERSION | closed | Port: docs say never set dashboard NODE_VERSION | walkthrough | |
| D8 | 1.3 Supabase staging | closed | Port: separate staging project in docs/rules | walkthrough | plate itself has no Supabase project yet |
| D9 | 1.4 PR preview | closed | Port: `## Preview` section in every PR | walkthrough | |
| D10 | 1.5 Git mode | closed | Switch plate to model-c (0.41.0) | walkthrough | user updates GitHub rulesets + Cloudflare |
| D11 | 1.6 Release bootstrap | closed | Port bootstrap job | walkthrough | |
| D12 | 1.7 depcruise excludes | closed | Anchor + route 3 Supabase imports via supabaseService | walkthrough | anchoring exposed 3 hidden violations |
| D13 | 1.8 test-staged | closed | Port Vitest 4 fix + test | walkthrough | |
| D14 | 1.9 react-hooks lint | closed | Port (rules-of-hooks error, exhaustive-deps warn) | walkthrough | 0 new findings |
| D15 | 1.10 + 1.12 lint path, layouts | closed | Fix path; move ProfileMenu + Topbar to src/layouts/ | walkthrough | MUI imports re-grandfathered in depcruise baseline |
| D16 | 1.11 color lint | closed | Keep MUI sx rules | walkthrough | UI-kit difference |
| D17 | 2.1 .eslintrc.json | closed | Remove + repoint refs to eslint.config.js | walkthrough | protected files approved |
| D18 | 2.2 + 2.3 lint:arch | closed | Remove script; docs name arch:check + no-restricted-imports | walkthrough | verified broken |
| D19 | 3.1 Airtable | closed | Keep as optional module; label it | walkthrough | deliberate difference from bronze (absent there); kept over the other branch's removal at merge |
| D20 | 3.2 hooks | closed | Remove useUserProfile, useUpdateUserProfile; keep useAnchorMenuState | walkthrough | MUI ProfileMenu uses it |
| D21 | 3.3 doc folders | closed | Remove Authentication-main-app entirely; remove claude_outputs | walkthrough | revised at merge of claude/modest-turing-cn0yo7 (was: trim to reference) |
| D22 | 3.4 MUI debug pattern | closed | Keep | walkthrough | |
| D23 | ESLint deps | closed | Remove 10 unused devDependencies | walkthrough | bronze lint verified 0 errors |
| D25 | Plate base | closed | Build on claude/modest-turing-cn0yo7 (6bbb8ed: model-c cutover + tighten), not main | user | merged into this branch; .eslintrc refs in projectStructure.config.cjs still open (protected) |
| D24 | Cloudflare | closed | Connect plate to Workers Builds after this lands; Worker named plate-harness | walkthrough | user does dashboard step |

## Open

| id | topic | status | options briefly | blocked phase |
|----|-------|--------|-----------------|---------------|

## Log

- 2026-10-21 — D1 closed via grill-me (user statement)
- 2026-10-21 — D2 closed via grill-me (asked)
- 2026-10-21 — D3 closed via grill-me (asked)
- 2026-10-21 — D4 closed via grill-me (asked)
- 2026-10-21 — D5 closed via grill-me (asked)
- 2026-10-21 — D6–D24 closed in item-by-item walkthrough; implemented on branch `claude/intelligent-mccarthy-6juqge` (0.41.0)
- 2026-10-21 — D25: merged claude/modest-turing-cn0yo7; D19 confirmed, D21 revised
