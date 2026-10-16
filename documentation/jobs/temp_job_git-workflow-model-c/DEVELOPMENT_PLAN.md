# Development plan: Git workflow Model C (Claude Code defaults)

## Summary

- **Goal:** Add `model-c`, a git, release and deploy mode that matches Claude Code's documented defaults. Switch plate-harness to it and make it the default for forks. Also strip the non-git behavior rules that fight Claude Code defaults, for every tool.
- **Why:** Models A and B and several behavior rules conflict with what Claude Code does by default:
  - PRs go to the repo's default branch (`main`);
  - the desktop app runs per-session worktrees under `.claude/worktrees/`;
  - the app watches PRs, can fix CI, and auto-merges with squash when the user turns it on;
  - the default commit flow;
  - faithful outcome reporting;
  - the question tool allows at most 4 options.

  The result is either wrong actions (PRs to `main` → ancestor failures, see `e9ceee3`) or skipped repo steps.

- **Weighting rule (user, 2026-10-16):** every choice in this job weighs moving toward Claude Code's documented default behavior. Where the default is unknown, look it up. Where it is still unknown, lean to the existing repo behavior.
- **Complexity:** L. About 40 files across rules, skills, docs, workflows, settings and scripts, plus outward GitHub and Cloudflare cutover steps.
- **Plan review:** Done 2026-10-16 (seven lenses; amendments 1–15)
- **Plan validate:** Done 2026-10-16 (11 rule audits; amendments 16–31; D26–D28 decided)
- **Scope / constraints:**
  - **In:**
    - D7 behavior strip, done first (D17–D19)
    - `model-c` mode enum and validator
    - one mode × behavior table in the git-workflow rule (D22)
    - skills and rules point at that table
    - release-please with dispatched CI (D21), the PR-title check and CI hygiene
    - Claude wiring: SessionStart install hook, `main` write guard (D25, no override per D26), worktree ignore, validator ignore handling
    - docs
    - cutover of this repo (D20, with rollback)
  - **Out:**
    - removing Models A or B
    - removing `promote-to-production.yml` (A/B use it)
    - splitting `finish` (D13)
    - Cursor-only babysit skill changes
    - Dependabot and SHA pinning (D27)
    - app code under `src/**` other than `src/config/git-workflow.*` and the hosting row in `src/config/app-tasks.json`
  - **Decisions:** sibling [`DECISIONS.md`](DECISIONS.md) (D1–D28). Do not re-ask closed rows.
  - **Protected files:** the user's approval of this plan covers exactly the protected files named in the phases below. Any other protected edit still stops for approval (`agent-behavior/RULE.mdc` § Protected Files).
  - **Script conventions (amendment 29):**
    - new Node hook and CLI scripts are CommonJS `scripts/<name>.cjs` with a sibling `scripts/<name>.test.cjs` (`node:test`), listed in `package.json` `test:classify`;
    - double quotes;
    - header JSDoc (purpose, why, exit-code contract) and JSDoc on exports;
    - complexity limits from `code-style` (cyclomatic ≤10, cognitive ≤15, ≤100 lines). Check them with `pnpm exec eslint --ext .cjs scripts/<file>`, because `pnpm lint` does not cover `.cjs`.
  - **Implementation branch:** current mode is `model-b`, so implement on `develop` (gate). The mode flips to `model-c` only in Phase 8.

## Phase overview

| Phase | Goal                                                | Gate                                                                                                                           | Status  |
| ----- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------- |
| 1     | Behavior strip (all tools)                          | Phase 1 grep gate returns 0 hits; `pnpm validate:docs` green                                                                   | Done |
| 2     | `model-c` accepted; one mode reader                 | `pnpm test:classify` green; `--print-mode` tested incl. failure                                                                | Done |
| 3     | Mode × behavior table (SSOT) + pointers             | Table complete; case-insensitive mode-word grep shows the words mostly inside the table; no "both modes" claims left           | Done |
| 4     | Skills + rules point at the table                   | Each listed file references the table; no C path targets `develop`, promote, or a per-PR bump                                  | Done |
| 5     | Release + PR-title + CI hygiene                     | actionlint clean; release job _skipped_ under A/B; `pnpm test:classify` green                                                  | Done (GitHub-side checks deferred to Phase 8) |
| 6     | Claude wiring (install hook, `main` guard, ignores) | In a **new** session: deps + hooks in the worktree; guard bypass tests pass; `validate:structure` green with worktrees present | Done (fresh-session checks pending) |
| 7     | Docs aligned                                        | `pnpm validate:docs` green; widened grep gate                                                                                  | Done |
| 8     | Cutover plate-harness to Model C                    | Worktree-session PR → preview → green checks → user merge → production; release PR merges with checks                          | Pending |

## Phase 1: Behavior strip (repo-wide, all tools)

**Goal:** remove or soften the non-git rules that conflict with Claude Code defaults (D7, D17–D19). This phase is mode-independent, so it goes first.

**Steps (protected files named exactly):**

1. `.cursor/rules/agent-behavior/RULE.mdc`:
   - **§ Agent Role and Control, line 15:** "wait for validation before claiming success" becomes D18 wording.
   - **§ Decision Questioning Protocol:** drop "raw text first" and the mandatory UX-research option; keep "inspect codebase, then ask"; the recommended option comes first. **Line 26** (progressively stronger order) is reworded to "after the recommended option, order the alternatives from lightest to strongest".
   - **§ Success Validation:** D18 wording. Report what was verified and what wasn't; the user decides whether product behavior is right.
   - **Unchanged:** § Protected Files, Exception: mechanism-rename references, Required Behavior, § Related Rules. Keep the section headings.
2. `.agents/skills/grill-me/SKILL.md` § Question style: the omnipresent options become optional, the challenge option stays, max 4 options. Keep the heading.
3. `.agents/skills/finish/SKILL.md`:
   - remove the forbidden-phrases paragraph and keep the handoff card;
   - Option 4 `sleep 180` becomes "stop; ask the user to re-run finish later".
4. `.agents/skills/implement/SKILL.md:172`: a faithful-status line.
5. D18 one-liners:
   - `.agents/skills/challenge/SKILL.md:207`
   - `.agents/skills/consolidate/SKILL.md:448`
   - `.agents/skills/feature/SKILL.md:383`
   - `.agents/skills/improve/SKILL.md:24`
   - `.agents/skills/standards-align/SKILL.md:21`
   - `.cursor/rules/debugging/RULE.mdc:75` ("Never claim the issue is fixed" → say what was verified; the user confirms the fix)
6. Subagents (D17), auto-chaining becomes "offer":
   - `.agents/skills/plan/SKILL.md` § 5–7 Next lines
   - `.agents/skills/router/SKILL.md` dispatch
   - `.agents/skills/implement/SKILL.md:176`

   `plan-grill-auto:96,141` stays auto.

7. Shell scoping (D19). `.cursor/rules/platform/RULE.mdc`:
   - **Scoped "when the shell is PowerShell" (text unchanged):** § Platform and Commands (no `&&`, no `rm -rf`, sequential) and § Shell/PowerShell Handling, including its Notes bullet "`$LASTEXITCODE` (not `$?`)", marked PowerShell-only.
   - **Unscoped:** § Environment Variables and Configuration, Hidden Files, Server Restarts.
   - **Environment line:** "Windows; Cursor terminal = PowerShell; Claude Bash tool = Git Bash".
   - **New § Git Bash subsection:** `command || exit 1`, `$?`, heredocs OK, same form as `debug/patterns.md:57`.
   - **Frontmatter description:** "Windows shell rules (PowerShell + Git Bash) and local environment configuration". Update the YAML first, then the `AGENTS.md` catalog row.

   Same scoping in `.cursor/rules/git-workflow/RULE.mdc` (pre-promote `$LASTEXITCODE`, heredoc note) and `.agents/skills/debug/patterns.md:41-58`.

8. `CLAUDE.md` shell bullet: "Bash tool = Git Bash; PowerShell rules apply only in PowerShell."
9. `.cursor/rules/architecture/RULE.mdc:62` (Performance-cost Ask step): replace the inline protocol with a pointer to `agent-behavior` § Decision Questioning Protocol.
10. "User-test gate" labels become "success reporting (verified vs unverified)":
    - `.cursor/rules/debugging/RULE.mdc:89`
    - `.cursor/rules/workflow/RULE.mdc:17` (consistent with :33 and :97)
    - `.cursor/rules/README.md:17`
    - `.cursor/rules/INDEX.md:88`
    - `.cursor/rules/git-workflow/RULE.mdc:246`
    - `.agents/skills/learn/SKILL.md:124`
11. When a YAML `description` changes, update the YAML first, then the `AGENTS.md` catalog row.

**Gate:** 0 hits outside `documentation/jobs/**` and `CHANGELOG.md`, then `pnpm validate:docs` green:

```bash
grep -rniE "Forbidden closure|Never claim success without|Never claim the issue is fixed|raw text before|raw question first|Implementation complete|This should work|omnipresent|sleep 180|wait for validation before claiming" .agents .cursor AGENTS.md CLAUDE.md
```

## Phase 2: Mode plumbing, one mode reader

**Goal:** the validator accepts `model-c` and is the only code that reads `git-workflow.json`. The repo config does not change yet.

**Steps:**

1. `scripts/validate-git-workflow.cjs`:
   - add `"model-c"` (double quotes, amendment 29);
   - export a pure `readMode(rootDir)` helper;
   - `--print-mode` prints only the mode. On an invalid or missing config it prints nothing to stdout, writes the error to stderr, and exits 1;
   - update the header comment (Model A / B / C, `--print-mode`).
2. `scripts/validate-git-workflow.test.cjs`:
   - the "should fail when mode is not allowed" fixture changes from `model-c` to `model-z` (amendment 21);
   - add a pass case for `model-c`;
   - add `--print-mode` cases through a child-process spawn against a temp config: valid → mode on stdout, exit 0; invalid or missing → empty stdout, exit 1.
3. `src/config/git-workflow.README.md`: collapse it to the machine-config note plus a pointer to `git-workflow/RULE.mdc` § Mode behavior table. Remove the per-mode table, "Both modes: production via Promote", and "Template stays model-a" (amendment 27).

**Gate:** Review contract § Tooling gate. `pnpm test:classify` green.

## Phase 3: Mode × behavior table (SSOT) + pointers

**Goal:** one table in `.cursor/rules/git-workflow/RULE.mdc` holds every mode-dependent behavior (D22).

**Steps:**

1. YAML `description` first ("Git branch models (Model A / B / C), PRs, and production promotion"), then `AGENTS.md:68`.
2. **§ Mode behavior table**, rows × A/B/C:

   | Row                            | A / B                                                                                                                                           | C                                                                                                                                            |
   | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
   | daily branch                   | —                                                                                                                                               | —                                                                                                                                            |
   | branch gate                    | —                                                                                                                                               | stop only on `main` (D14)                                                                                                                    |
   | how work lands                 | —                                                                                                                                               | squash PR → `main`                                                                                                                           |
   | commit timing                  | `finish` only                                                                                                                                   | when the user asks, directly or via `finish` (D12/D13)                                                                                       |
   | version source                 | `finish` bump                                                                                                                                   | release-please                                                                                                                               |
   | CI watcher                     | A: babysit; B: report URL                                                                                                                       | app PR monitor                                                                                                                               |
   | staging                        | `develop`                                                                                                                                       | per-PR preview (frontend only)                                                                                                               |
   | production                     | promote                                                                                                                                         | user merges the PR, manually or with the app's per-PR auto-merge toggle (D28)                                                                |
   | `main` ruleset                 | deletion + non_fast_forward                                                                                                                     | + pull_request squash-only + required `test`, `pr-title`; source pinned to GitHub Actions; no bypass actors; no up-to-date requirement (D23) |
   | `develop` ruleset              | A: pull_request + `test` + non_fast_forward + deletion; B: no pull_request, keep the rest (with the B note that checks are not a pre-land gate) | none                                                                                                                                         |
   | fork setup                     | `develop` from `main` + rulesets + bootstrap                                                                                                    | rulesets + squash-only + allow auto-merge + Cloudflare production `main` with all-branch previews + baseline release tag                     |
   | "land on main / release" means | promote dispatch                                                                                                                                | merge the PR                                                                                                                                 |

3. Rewrite the sections that claim to cover every mode so they point at the table (amendment 17):
   - "Shared in both modes"
   - "Forbidden in both modes"
   - § Branch Protection "only via promote"
   - § Branch-Specific Rules "Other branches: ask" (C: proceed per D14)
   - § Divergence prevention
4. Collapse the existing mode sections (§ Workflow mode, § Mode-aware branch gate, § Ruleset expectations, § Commit and Push Workflow) into the table. Re-point the inbound links straight to § Mode behavior table and drop the empty headings (amendment 28):
   - `debug/patterns.md:195`
   - `cloud-functions/RULE.mdc:201`
   - `workflow/RULE.mdc:25,32`
   - `testing/RULE.mdc:177`
5. § Model C, at most 5 lines: it follows Claude Code's documented defaults (cite `code.claude.com/docs/en/desktop`), parallel worktree sessions are expected, and the ruleset and CI are the guard. Add: **"Under C, never relax the `main` ruleset."**
6. § Pull Requests and § Promote to production become "A/B only". § Agent UX gets a mode check: under C, "land on main / promote / release" means merge the PR, never dispatch promote. § Failure modes "reduce `main` ruleset" becomes A/B-only.
7. **Main-guard interplay (D26):** the guard always blocks agents on `main`, with no override.
   - **§ First promotion bootstrap** (A/B): the ff-push (`git checkout main` … `git push origin main`) becomes a block labelled "**User runs this** (agents are blocked by the main write guard)", with the command shown for the user to copy.
   - **§ Emergency Main Branch Changes:** keep the three conditions. Replace "proceed with main branch code changes" with "the agent prepares the change on a branch and hands the user the exact commands; **the user** commits and pushes on `main`".
   - Add one line to § Model C and to the Claude pointer: "Agents never write to `main`; a hook enforces it (D25/D26)."
8. `.claude/rules/git-workflow.md` (Claude pointer): rewrite the "Branch model" and "Commits happen in /finish only" bullets as pointers to the table rows. Keep one guard line derived from the table: under A/B, never open a PR to `main`, and "promote" means the dispatch.

**Gate:**

- table complete;
- `grep -ciE "model[- ][abc]" .cursor/rules/git-workflow/RULE.mdc` shows the mode words mostly inside the table;
- `grep -niE "both modes" .cursor/rules/git-workflow/RULE.mdc` returns 0.

## Phase 4: Skills + rules point at the table

**Goal:** skills and rules stop driving Claude toward `develop`, promote, or a per-PR bump under C. Topology-independent duties are kept (D12, D13).

**Steps (protected files named exactly):**

1. `.agents/skills/finish/SKILL.md`: the version/changelog gate and `[VERSION]` subject point at "version source". Repo-only duties stay for all modes (D13).
2. `.agents/skills/push/SKILL.md`: the push target and post-push steps point at the table rows. Babysit is "A + Cursor only".
3. `.agents/skills/bundle-ship/SKILL.md`: one line saying that under C, parallel work lives in separate worktrees.
4. `.agents/skills/router/SKILL.md:66,375` + `.agents/skills/router/references/dev-cycle-matrix.md:22`: the "CI watcher" row.
5. `.agents/skills/plan/SKILL.md` § 0: the "branch gate" row.
6. `.agents/skills/start/SKILL.md`: offer C as the default; setup comes from the "fork setup" row; prerequisites are `gh` installed and authenticated and repo auto-merge allowed.
7. `.agents/skills/debug/patterns.md:190`: the § Promote fails heading gets an "A/B only" prefix.
8. `src/config/app-tasks.json:9`: the hosting task references the mode table.
9. **`.cursor/rules/workflow/RULE.mdc`** (amendment 16):
   - `:69` "commits happen in finish only" → "commit timing per mode table" (fixes the **Blocker**);
   - `:19`, `:31`, `:47-48`, `:78`, `:80` (semver, changelog, commit format) → "per mode table § version source";
   - `:88` "develop → preview, main → production" → a pointer to the DOC_CLOUDFLARE_WORKERS SSOT and the table's staging and production rows.
10. **`.cursor/rules/testing/RULE.mdc`**:
    - `:179`, `:194` → "per mode table § staging";
    - `:190` and § Release Validation Gate trigger on the "production" row (C: before merging the PR to `main`).
11. **`.cursor/rules/cloud-functions/RULE.mdc`** (rewrite, not a word swap; amendment 30):
    - `:41-47` → "production (`main`) and all previews share one Supabase project (D24)";
    - `:178-182` → "No staging for Edge Functions in any mode; a deploy hits production and every preview; PR previews test frontend only; test locally with `supabase functions serve` first";
    - `:187`, `:191` → "per mode table § production" (A/B promote; C re-validate on the PR preview, then merge);
    - `:199-201` Migration Path gets a C path (branch → PR preview → merge → remove function);
    - `:211` "both branches" → "production and all previews";
    - `:96`, `:131`, `:163` get the wording swap;
    - `:321` (legacy Firebase) is not touched;
    - note that the functions listed at `:73-77` are fork examples (this repo has no `supabase/`).

**Gate:**

- each file above references the table;
- `grep -rniE "develop → preview|commits happen in .?finish.? only|before .?Promote to production" .cursor/rules .agents/skills .claude/rules` hits only lines marked A/B.

## Phase 5: Release + PR-title + CI hygiene

**Goal:** version and changelog from release-please, release-PR CI without secrets, enforced PR titles, least-privilege CI (D6, D15, D16, D21, D27).

**Steps (protected: `.github/workflows/**`):\*\*

1. New `.github/workflows/release-please.yml`. `runs-on: ubuntu-latest`, top-level `permissions: {}`, on `push` to `main`. Action pins use tags (`@vN`, D27).
   - **Job `mode`** (`contents: read`): checkout with `persist-credentials: false`; run `node scripts/validate-git-workflow.cjs --print-mode >> "$GITHUB_OUTPUT"` (via `mode=$(…)`).
   - **Job `release`** (`contents: write`, `pull-requests: write`): `needs: mode`, `if: needs.mode.outputs.mode == 'model-c'`; `googleapis/release-please-action@v4`, `release-type: node`.
   - **Job `dispatch-ci`** (`actions: write` only): `needs: release`, `if:` the release PR was created or updated; `gh workflow run ci.yml --ref "$RELEASE_BRANCH"`, with the branch passed through `env:` from the action's documented output, never interpolated into `run:`.
2. `.github/workflows/ci.yml`:
   - add a `workflow_dispatch` trigger;
   - top-level `permissions: contents: read`;
   - `concurrency: { group: ci-${{ github.ref }}, cancel-in-progress: true }`;
   - job `pr-title`: `amannn/action-semantic-pull-request@v5` (tag), `if: github.event_name == 'pull_request'`, `pull-requests: read`, on `pull_request` `types: [opened, edited, synchronize, reopened]`;
   - job name `test` unchanged;
   - existing action tags unchanged (D27);
   - `develop` triggers stay.
3. `scripts/validate-version-sync.js`:
   - extract an exported `getLatestChangelogVersion(content)` plus a `require.main === module` guard, keeping the CI entry point;
   - new `scripts/validate-version-sync.test.cjs`, added to `test:classify`. Its cases come from a cited release-please node CHANGELOG sample: a release heading with compare link and date; `## [Unreleased]` before the first version is skipped; no version → null.
4. `documentation/DOC_CHANGESETS.md`: § Model C.

**Gate:**

- `pnpm dlx actionlint` clean;
- a mode `model-b` run shows `release` **skipped**;
- `pnpm test:classify` green;
- dispatched `test` on the release PR head SHA satisfies the required check, verified after cutover. If it fails, fall back to a GitHub App token per D21, with handling written down first: an Actions secret, an App with minimal permissions (contents + pull-requests on this repo), a short-lived token via a pinned token action, and a rotation note.

## Phase 6: Claude wiring

**Goal:** every Claude session, worktrees included, has deps and hooks (D9, D10). Writes to `main` are blocked deterministically (D25; no override, D26). Worktrees and runtime files don't affect validation.

**Steps:**

1. New `scripts/ensure-deps-installed.cjs`:
   - read stdin JSON;
   - `cwd` must be an absolute path inside the repo root or its `.claude/worktrees/`, otherwise warn and exit 0;
   - install when `node_modules/.modules.yaml` or `.husky/_` is missing there;
   - spawn with an argv array and the `cwd` option, no string interpolation;
   - on win32 use `shell: true` or resolve `pnpm.cmd` (amendment 25), and check the exit status explicitly;
   - silent on success; one warning line plus exit 0 on any failure, including malformed JSON.
2. New `scripts/deny-git-write-on-main.cjs` (PreToolUse, Bash):
   - parse `tool_input.command` into tokens and split on `&&`, `||`, `;`, `|`;
   - find every `git` call, skipping global options (`-C <dir>`, `-c k=v`) and env prefixes;
   - block `commit` when the branch at the effective dir is `main`;
   - block `push` when any refspec destination resolves to `main` (`HEAD:main`, `x:main`, bare `push` with `main` checked out), whatever the current branch is;
   - nested `bash -c "…"`: re-scan the inner string;
   - malformed or empty stdin fails **closed** (block with reason) only when the raw text contains `git`, otherwise allow;
   - no override (D26): the block message says "the user runs this command themselves" and points at the git-workflow rule § Emergency Main Branch Changes.
3. Shared stdin parsing: each script carries the F2 second-copy marker naming the other script (amendment 26). A third hook script triggers extraction into `scripts/hook-input.cjs`.
4. Tests:
   - `scripts/ensure-deps-installed.test.cjs`: deps present → skip; install failure → warning + exit 0; stdin `cwd` used; `cwd` outside repo → skip; win32 spawn form. pnpm and git runners are injected, and no real install runs.
   - `scripts/deny-git-write-on-main.test.cjs`: non-main allowed; `git -C x commit`; `a && git push`; `push origin HEAD:main` from a feature branch; `bash -c`; non-git command; empty or malformed stdin; detached HEAD.
   - Both files go into `test:classify`.
5. `.claude/settings.json`:
   - `hooks.SessionStart`: matcher `startup`, `node scripts/ensure-deps-installed.cjs`, `timeout`, `shell: "bash"`;
   - `hooks.PreToolUse`: matcher `Bash`, `node scripts/deny-git-write-on-main.cjs`, `shell: "bash"`;
   - commands are shell-neutral (no `&&`, no env expansion).
6. `.gitignore` (protected): add `.claude/worktrees/` and `**/.claude/scheduled_tasks.lock`. This lands **in the same commit** as step 7.
7. `scripts/project-structure-validator.js`:
   - precompute the ignored set once with `git ls-files --others --ignored --exclude-standard --directory` and check it in `createIgnoreChecker`;
   - keep the `DEFAULT_IGNORE_PATTERNS` fallback when git or `.git` is missing;
   - tracked files are always validated;
   - update the header comment (lines 30-35).

   New `scripts/project-structure-validator.test.cjs` (git runner injected; cases: ignored path skipped, tracked path validated, force-added ignored file validated, git missing → fallback), added to `test:classify`.

8. `.cursor/rules/file-placement/RULE.mdc` § Tooling artifacts and `documentation/PROJECT-STRUCTURE-VALIDATION.md`: the git-ignore skip becomes the documented mechanism. The tracked `.gitignore` is the SSOT, and personal excludes are not relied on.
9. Handoff note: hooks take effect only in a **new or restarted** Claude Code session. Phase 6 gate checks run in a fresh session.
10. Check whether permission ask rules gate hook commands, and record the answer in Notes.

**Gate (fresh session):**

- in a new desktop worktree session, `node_modules` and `.husky/_` exist **in the worktree**;
- a staged `src/` change commits with pre-commit output;
- a second start skips the install;
- the guard test suite passes, including the bypass cases;
- `pnpm validate:structure` is green with a worktree present;
- `.cjs` complexity is checked per the script conventions.

## Phase 7: Docs

**Goal:** human docs match C as the default.

**Steps:**

1. `AGENTS.md:78`: the default-mode line points at the table.
2. `README.md`, `documentation/DOC_CONTRIBUTING.md`: C is the default; § Mid-project switch to C (Phase 8 checklist + rollback).
3. `documentation/DOC_AGENT_WORKFLOW_LAYERS.md`: § Local git merge gate under C; the agent chain for C; **worktree cleanup note** (the desktop app's archive / auto-archive removes worktrees).
4. `documentation/DOC_CLOUDFLARE_WORKERS.md`:
   - C column;
   - rollback (`wrangler rollback` / dashboard);
   - previews share production Supabase (D24) with a warning that Edge Functions have no staging;
   - Workers Builds quota check.
5. `.cursor/rules/README.md`, `.cursor/rules/INDEX.md`, `.agents/skills/plan/references/rules-registry.md`: mode mentions point at the table.

**Gate:**

- `pnpm validate:docs` green;
- `grep -rln "model-c\|Mode behavior table" README.md AGENTS.md documentation/DOC_*.md .cursor/rules src/config/git-workflow.README.md` lists every file above.

## Phase 8: Cutover plate-harness (D20, user-confirmed outward steps)

**Goal:** this repo runs Model C, with a way back.

**One-time rule exception (amendment 18):** steps 5–6 merge a PR into `main` while the config on `main` is still `model-b`. That is allowed once, for this cutover only, because the same PR flips the mode. Do not run § Ancestor failure "healing" in response.

**Steps (each outward step needs the user's go-ahead in chat):**

1. **Sweep stranded work:**
   - list the uncommitted changes on `develop`; the user decides what goes into the `finish` commit;
   - `gh pr list --base develop`: retarget or close;
   - list unmerged `feature/*` branches.
2. Under Model B: `finish` → push `develop` → CI green → pre-promote check → `gh workflow run promote-to-production.yml`.
3. GitHub settings, **before any C merge**:
   - squash-only, PR title as the default commit message;
   - auto-delete head branches;
   - allow auto-merge;
   - Settings → Actions → General: **allow GitHub Actions to create and approve pull requests** (release-please needs it);
   - after the first merge, confirm the `release` job runs, and under A/B forks that it shows **skipped**; confirm the dispatched `test` reports on the release PR head SHA (Phase 5 gate items that only GitHub can prove);
   - `main` ruleset per the table: required `test` + `pr-title` from GitHub Actions, no bypass actors, no required approvals (D28).
4. Cloudflare dashboard (user):
   - production `main`;
   - all-branch previews;
   - `develop` no longer the staging branch;
   - Supabase redirect wildcard covers previews.
5. **Cutover PR** (amendment 32), on a branch off `main` (`feat/model-c-cutover`):
   - mode `model-c` only — **no** version bump or `[Unreleased]` fold: 0.40.0 already shipped through Model B (`8083ee4`, promoted to `main`);
   - this plan note;
   - PR title `feat: switch git workflow to Model C`.
6. **Release baseline before merging the cutover PR:** release-please runs on the cutover merge itself (the mode is `model-c` from that commit on). With no tag or release, it would treat all history as unreleased. So **the user** first tags `8083ee4` (current `main`, version 0.40.0) as `v0.40.0` and creates a GitHub release for it. Then the user merges the cutover PR once `test` + `pr-title` are green and the preview builds.
7. The cutover merge (`feat:`) makes release-please open a 0.41.0 release PR → dispatched `test` (D21) → the user merges → `validate:version-sync` green.
8. **Wait period:** at least one week. Then:
   - **remove the `develop` ruleset** (it includes `deletion`);
   - the user deletes `develop` (remote + local).

**Rollback:**

1. **Inside the wait period:**
   - mode back to `model-b` via a PR to `main`;
   - relax the `main` ruleset to deletion + non_fast_forward;
   - on `develop`, run § Ancestor failure healing (`git merge origin/main`, CI green), because `develop` diverged at step 6;
   - resume promote;
   - restore Cloudflare `develop` staging.
2. **After `develop` is deleted:** recreate `develop` from `main` (`git push origin main:develop`), restore the `develop` ruleset, then do the same as inside the wait period.

**Gate:**

- one desktop worktree-session PR has gone from branch → preview → green `test` + `pr-title` → user merge (manual or app auto-merge toggle) → production, with no repo skill invoked;
- one release PR merged with checks;
- `develop` deleted after the wait period.

## Conflict & compliance

- **Applicable rules:** `git-workflow`, `agent-behavior` (protected files), `file-placement`, `workflow`, `platform`, `testing`, `security`, `code-style`, plus `architecture` (protected edit `:62`; ARCHITECTURE.md checked: it has no git, deploy or hook content, so no change), `cloud-functions` and `debugging` (edited).
- **File placements:**
  - New, all whitelisted:
    - `.github/workflows/release-please.yml`
    - `scripts/ensure-deps-installed.cjs` (+ `.test.cjs`)
    - `scripts/deny-git-write-on-main.cjs` (+ `.test.cjs`)
    - `scripts/validate-version-sync.test.cjs`
    - `scripts/project-structure-validator.test.cjs`
  - No `projectStructure.config.cjs` edit (Dependabot dropped, D27).
  - Hook scripts live in `scripts/`, not `.claude/hooks/`.
- **Reuse / packages:** release-please action, `amannn/action-semantic-pull-request`, Claude Code hooks, Workers rollback.
- **Risks / open questions:**
  - D21 is verified after cutover, with the documented App-token fallback.
  - Every user merge deploys production (D28); rollback is documented.
  - Edge Functions have no staging in any mode (documented).
  - Phase 1 changes Cursor behavior (D7).
  - Hooks need a new session.
- **Standards diversions:**
  - previews share the production DB (D24);
  - no up-to-date requirement (D23);
  - tag pins rather than SHA pins (D27, existing repo behavior);
  - no required review (D28; merge is a user act).

## Review contract

- **Rules pinned:** `rules@e9ceee3`: `git-workflow`, `agent-behavior`, `file-placement`, `workflow`, `platform`, `testing`, `security`, `code-style`.
- **Required lenses:**
  - Pattern & precedent (L): below.
  - Reuse / packages: done.
  - Feature decomposition: skipped (no `src/features/` change).
  - Name the mechanism: script names describe the mechanism; the single mode reader is `validate-git-workflow.cjs`; the hook stdin parser carries the F2 marker.
- **Tooling gate:** `validate` § Tooling pass: `pnpm lint`, `pnpm format:check`, `pnpm type-check`, `pnpm test:classify`, `pnpm test:run`, `pnpm validate:structure`, `pnpm validate:docs`, `pnpm validate:version-sync`, `pnpm validate:git-workflow`, plus `pnpm exec eslint --ext .cjs` on new or edited scripts and `actionlint` for workflow phases.
- **Locked decisions:** `DECISIONS.md` (D1–D28) + Decisions made + Amendments.

### Amendments

| #   | Date       | Source                                                         | Change                                                                                                                                                                               | Applied to               |
| --- | ---------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------ |
| 1   | 2026-10-16 | review-dev-plan                                                | Release PR checks via `workflow_dispatch` (D21); App token fallback                                                                                                                  | Phase 5, 8               |
| 2   | 2026-10-16 | review-dev-plan                                                | Mode guard = job output + job `if:` via single reader                                                                                                                                | Phase 2, 5               |
| 3   | 2026-10-16 | review-dev-plan                                                | Ruleset + Cloudflare before first C merge                                                                                                                                            | Phase 8                  |
| 4   | 2026-10-16 | review-dev-plan                                                | Release baseline 0.40.0 + tag; `feat:` cutover title                                                                                                                                 | Phase 8                  |
| 5   | 2026-10-16 | review-dev-plan                                                | SessionStart uses stdin `cwd`; matcher, timeout, shell, silent, non-fatal                                                                                                            | Phase 6                  |
| 6   | 2026-10-16 | review-dev-plan                                                | `pr-title` pull_request-only, types, stable names                                                                                                                                    | Phase 5                  |
| 7   | 2026-10-16 | review-dev-plan                                                | Phase 1 grep gate fixed; `standards-align` added                                                                                                                                     | Phase 1                  |
| 8   | 2026-10-16 | review-dev-plan                                                | YAML → AGENTS.md catalog; `AGENTS.md:78`                                                                                                                                             | Phase 3, 7               |
| 9   | 2026-10-16 | review-dev-plan (user-promoted)                                | Behavior strip first                                                                                                                                                                 | Phase order              |
| 10  | 2026-10-16 | review-dev-plan (user-promoted)                                | Stranded-work sweep, wait period, rollback                                                                                                                                           | Phase 8                  |
| 11  | 2026-10-16 | review-dev-plan (user-promoted)                                | Mode × behavior table (D22)                                                                                                                                                          | Phases 3, 4, 7           |
| 12  | 2026-10-16 | review-dev-plan (user-promoted)                                | Rename to `ensure-deps-installed.cjs`                                                                                                                                                | Phase 6                  |
| 13  | 2026-10-16 | review-dev-plan (user-promoted)                                | "matches documented defaults"; § Model C ≤5 lines                                                                                                                                    | Summary, Phase 3         |
| 14  | 2026-10-16 | review-dev-plan (user-promoted)                                | CI concurrency/permissions/actionlint; worktree ignore; main guard; prerequisites; stragglers. SHA pins + Dependabot later superseded by D27                                         | Phases 1, 4–7            |
| 15  | 2026-10-16 | review-dev-plan synthesis                                      | Validator skips git-ignored paths                                                                                                                                                    | Phase 6                  |
| 16  | 2026-10-16 | validate (workflow, **Blocker**)                               | `workflow:69` commit gate + `:19,31,47-48,78,80,88` point at table                                                                                                                   | Phase 4.9                |
| 17  | 2026-10-16 | validate (git-workflow)                                        | Rewrite "both modes" sections; `develop` ruleset, fork setup, "land on main" rows; never relax `main` under C; Agent UX mode check                                                   | Phase 3                  |
| 18  | 2026-10-16 | validate (git-workflow)                                        | One-time B-rule exception for cutover PR; `develop` ruleset removal; rollback via ancestor heal in the wait period                                                                   | Phase 8                  |
| 19  | 2026-10-16 | validate (agent-behavior)                                      | Line 15, line 26 ordering, unchanged-sections list; Phase 7 worktree note gets a target file                                                                                         | Phase 1, 7               |
| 20  | 2026-10-16 | validate (testing)                                             | `:190` + Release Validation Gate on production row                                                                                                                                   | Phase 4.10               |
| 21  | 2026-10-16 | validate (testing, code-style)                                 | Invalid-mode fixture → `model-z`; `--print-mode` tests incl. failure; version-sync extraction + test file                                                                            | Phase 2, 5               |
| 22  | 2026-10-16 | validate (testing, file-placement)                             | Named test files; validator test; all in `test:classify`                                                                                                                             | Phase 5, 6               |
| 23  | 2026-10-16 | validate (file-placement)                                      | Tracked `.gitignore` entries (not personal excludes); precomputed ignored set; git-missing fallback; same-commit ordering; rule + doc updates                                        | Phase 6                  |
| 24  | 2026-10-16 | validate (security)                                            | Per-job permissions, separate `dispatch-ci`, `env:` for outputs, `persist-credentials: false`, checks pinned to GitHub Actions, no bypass; App-token handling if fallback            | Phase 3, 5, 8            |
| 25  | 2026-10-16 | validate (security, platform)                                  | Guard tokenizes chained/`-C`/`bash -c`, blocks push to `main` refspecs, fail-closed on malformed git input; hook input validation; win32 pnpm spawn; named shell; fresh-session note | Phase 6                  |
| 26  | 2026-10-16 | validate (code-style)                                          | F2 second-copy marker on hook stdin parsing                                                                                                                                          | Phase 6                  |
| 27  | 2026-10-16 | validate (architecture)                                        | README collapsed to a pointer; Claude pointer bullets rewritten as table pointers                                                                                                    | Phase 2, 3               |
| 28  | 2026-10-16 | validate (architecture)                                        | Inbound links re-pointed to the table, empty headings dropped; `:62` moved to protocol edit; ARCHITECTURE.md check recorded                                                          | Phase 1, 3, C&C          |
| 29  | 2026-10-16 | validate (code-style)                                          | Script conventions: `.cjs` + `.test.cjs`, double quotes, JSDoc, explicit eslint `.cjs` check                                                                                         | Summary, Review contract |
| 30  | 2026-10-16 | validate (cloud-functions, debugging, platform; user: fix all) | cloud-functions rewrite (no function staging in any mode); `debugging:75`; `patterns.md:41-58`; platform scoping detail + Git Bash subsection                                        | Phase 1, 4.11            |
| 31  | 2026-10-16 | validate (git-workflow; user D26)                              | Guard has no override; bootstrap ff-push and emergency-on-main become user-run commands in the rule; one "agents never write to `main`" line in § Model C + Claude pointer           | Phase 3.7, 6.2           |
| 32  | 2026-10-16 | implement (Phase 8) | Cutover PR is mode-flip only (0.40.0 shipped via Model B); `v0.40.0` tag + GitHub release on `8083ee4` move **before** the cutover merge, because release-please runs on that merge | Phase 8.5–8.7 |

## Pattern & precedent

| Field                        | Value                                                                                                                                                                                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Capability**               | Agent-default git flow: per-task worktree branch → PR to `main` → CI → user merge → continuous deploy, with automated semver releases                                                                                                                        |
| **Precedents**               | GitHub flow; Vercel/Netlify/Workers per-PR preview with `main` as production; release-please on googleapis repos; Claude Code desktop worktree + PR monitor + opt-in squash auto-merge                                                                       |
| **Aspects reviewed**         | Branching; production gate; rollback; release incl. token trigger limits; mode guard; preview data isolation; concurrency; local vs CI checks; hook failure behavior; action pinning                                                                         |
| **Findings**                 | Branching aligns. Production gate aligns (ruleset before first merge; merge is a user act). Rollback documented. Release aligns (dispatch CI + baseline tag). Preview data **diverges** (D24). Pinning: tags, not SHAs (D27, below common hardening advice). |
| **Verdict**                  | Acceptable product-specific (D24, D27 owner-accepted under the weighting rule)                                                                                                                                                                               |
| **If non-standard: options** | A: keep (chosen). B: Supabase branching. C: SHA pins + Dependabot                                                                                                                                                                                            |

## Notes during development

- [Phase 1] Gate caught one target not in the step list: `.agents/skills/debug/SKILL.md:17` ("Never claim the issue is fixed"). Same D18 class; edited under the phase goal and gate (see Decisions made #2).
- [Phase 1] Python text-mode writes on Windows turned LF files into CRLF; normalized back to LF (`.gitattributes` is `eol=lf`). Edit files in binary mode or with the Edit tool.
- [Phase 1] Markdown is not under `pnpm format:check` (it covers `src/**` only); Prettier warnings on edited `.md` files were already there and were left alone.
- [Phase 1] Pre-existing uncommitted edits by another thread in `router/SKILL.md`, `AGENTS.md`, `CLAUDE.md`, `align-harness/SKILL.md` were left intact; Phase 1 touched different lines. Smoke signal for `finish`.

- [Phase 2] `eslint.ignores.js` ignores all of `scripts/`, so the plan's `pnpm exec eslint --ext .cjs` complexity check cannot run; script complexity is checked by hand (`runCli` 3 branches, `validateGitWorkflow` unchanged). Follow-up candidate: lint `scripts/` (protected config edit).
- [Phase 2] `validate-git-workflow.cjs` and its test were converted to double quotes with Prettier (repo `.prettierrc`), per amendment 29.

- [Phase 3] `git-workflow/RULE.mdc` rewritten around § Mode behavior table (12 rows × A/B/C). `grep -ciE "model[- ][abc]"` = 11 (table header, Branch Strategy subsection headings, A/B prevention lines); 0 "both modes" hits.
- [Phase 3] `implement/SKILL.md:35` pointed at § Branch Strategy for the gate; re-pointed to § Mode-aware branch gate.

- [Phase 4] All 11 listed files reference § Mode behavior table. Negative grep (`develop → preview`, `finish only`, `Before Promote`, `--base develop`) hits only lines labelled Model A or A/B. `test:classify` 62/62, `validate:docs` green.
- [Phase 4] `start` skill: template mode changed from `model-a` to `model-c` (D5), and the A/B bootstrap ff-push is now a user-run command (D26).
- [Phase 4] cloud-functions `:73-77` existing-function list relabelled as fork examples (repo has no `supabase/`); legacy Firebase lines 320-321 left untouched as planned.

- [Phase 5] Action versions from the vendors' READMEs (checked 2026-10-16): `googleapis/release-please-action@v4` (needs `contents`, `issues`, `pull-requests: write`, plus the repo setting allowing Actions to open PRs); `amannn/action-semantic-pull-request@v6` (plan said v5; v6 is current).
- [Phase 5] `actionlint` not run: the npm package `actionlint` is a third-party wasm wrapper (maintainer hops-release/XING), not rhysd's upstream tool, so I did not execute it. Workflows were parsed with the repo's `js-yaml` (both valid; jobs `mode,release,dispatch-ci` and `pr-title,test`). Run upstream actionlint before cutover if available.
- [Phase 5] `pull_request` now also fires on `edited` so `pr-title` re-runs on title edits; `test` re-runs too (concurrency cancels the older run). The `test` job is deliberately **not** skipped on `edited`: a skipped `test` check on the same SHA would count as passing.
- [Phase 5] `validate-version-sync.js` kept as `.js` (renaming would touch the CI step); exported `getLatestChangelogVersion` + `require.main` guard; 5 tests in `validate-version-sync.test.cjs` from a heading copied out of release-please's own CHANGELOG; wired into `test:classify` (67/67).

- [Phase 6] Hook spec checked against code.claude.com/docs/en/hooks (2026-10-16): `shell` accepts `bash`/`powershell`; `timeout` is seconds (default 600); SessionStart stdout reaches Claude's context; PreToolUse blocks with exit 2 + stderr. Whether hooks run under `bypassPermissions` is not stated in the docs (they receive `permission_mode`, so they appear to run).
- [Phase 6] Hook commands use `node "$CLAUDE_PROJECT_DIR/scripts/…"` with `shell: "bash"`. That is one env expansion, against the platform audit's 'no `$VAR`' advice: a relative path would resolve against whatever directory the hook starts in. The worktree target comes from stdin `cwd`.
- [Phase 6] `ensure-deps-installed` accepts any work tree that shares the project's `git --git-common-dir` (covers custom desktop worktree locations), rather than only `.claude/worktrees/`.
- [Phase 6] Guard covers chained commands, `cd`, `-C`/`-c`, env prefixes, `bash -c`, refspecs to `main`, `--all`/`--mirror`; 17 tests. Live check on this repo: `git push origin HEAD:main` → exit 2 with the reason; `git commit` on `develop` → allowed.
- [Phase 6] Validator: `createGitIgnoredChecker` uses `--exclude-per-directory=.gitignore` (not `--exclude-standard`) so personal excludes don't change results. One git call, about 0.1s. A probe file in `.claude/worktrees/probe/src/` validated green, then the probe was removed. The validator file keeps its existing single-quote style (converting ~900 lines would be churn); the new test file uses double quotes.
- [Phase 6] **Still to verify in a fresh desktop worktree session** (hooks load at session start): deps + `.husky/_` appear in the worktree; a staged `src/` change commits with pre-commit output; a second start skips the install; `git commit` on `main` is blocked.
- [Phase 6] `test:classify` 98/98; `pnpm lint` 0 errors (39 pre-existing warnings; `scripts/` is eslint-ignored); new scripts checked by hand against complexity limits (small functions; largest file 179 non-empty lines).

- [Phase 7] Docs now point at § Mode behavior table: `AGENTS.md`, `README.md` (Step 3 mode table now leads with C), `DOC_CONTRIBUTING` (A↔B switch, A/B→C cutover checklist, C→A/B rollback), `DOC_AGENT_WORKFLOW_LAYERS` (merge gate, agent chain, worktree note), `DOC_CLOUDFLARE_WORKERS` (C ruleset column, all-branch previews + quota note, Rollback section, D24 warning), rules `README`/`INDEX`, `rules-registry`. `validate:docs` green; no "Model A default"/"Model B opt-in" left.
- [Phase 7] A long inline `python - <<'PYEOF'` script failed on bash quoting and **applied nothing** (caught by re-checking). Long edit scripts now go in a scratchpad `.py` file.

Advisory items not promoted (visible, not binding):

- Rebel: C-only, archive A/B (would reopen D1).
- Rebel: split `finish` (kept per D13).
- Precedent: require up-to-date branches / merge queue (rejected, D23).
- Scale: Workers Builds branch patterns (kept all branches; quota check in Phase 7.4).
- Fidelity: Claude Code Review as automatic PR review (optional later).

## Decisions made

Impl-time only (`implement` fills). Product/scope forks → sibling `DECISIONS.md`.

| #   | Topic | Choice | Precedent? |
| --- | ----- | ------ | ---------- |
| 1 | Protected-file consent | User's "Run implement on the Model C plan" after approving the plan covers the protected files named per phase | No (user approval in chat, 2026-10-16) |
| 2 | `debug/SKILL.md:17` not in Phase 1 list | Edited: same D18 class, required by the Phase 1 gate | No (gate-driven) |
| 3 | `readMode(rootDir)` helper (Phase 2.1) | Not added: `validateGitWorkflow(rootDir)` already returns the mode; added an injectable `runCli(argv, io)` for `--print-mode` tests instead, plus one spawn test of the real script | No (avoids a duplicate reader) |
| 4 | Inbound-link headings (amendment 28) | Kept § Mode-aware branch gate, § Commit and Push Workflow, § Branch Protection, § Pull Requests, § Promote to production as short sections with real content (procedure/pointers) instead of dropping them: ~16 inbound references across skills/docs keep resolving, and none is an empty pointer heading | No (avoids 16-file link churn) |
