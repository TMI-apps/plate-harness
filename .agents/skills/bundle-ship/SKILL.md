---
name: bundle-ship
description: >-
  Bundles all uncommitted work from multiple Cursor agent threads on the same branch and
  checkout into one finish commit, then pushes. Use when the user runs /bundle-ship,
  /finish-all, or asks to finish and push everything across threads on one checkout.
---

# bundle-ship

Land **all** uncommitted changes on the current branch and checkout when multiple agent threads may have contributed — one bundled commit, then push.

**SSOT for commit mechanics:** `.agents/skills/finish/SKILL.md` (bundle mode).  
**SSOT for push mechanics:** `.agents/skills/push/SKILL.md`.

## When to use

| Use `bundle-ship` | Use plain `finish` → `push` instead |
|-------------------|-------------------------------------|
| Multiple agent chats touched the **same** working folder | Single thread owns the full diff |
| User wants **one** commit for the whole tree snapshot | User wants thread-scoped commit only |
| User explicitly invokes `/bundle-ship` or `/finish-all` | Normal session wrap-up |

**Skip gate:** Clean tree with nothing to commit → report and stop (do not invent work).

## What this skill owns

Orchestration and **bundle intent** only. It does not duplicate version rules, staging gates, changelog format, or push safety checks — those stay in `finish` and `push`.

## Preconditions

1. **Same branch, same checkout** — not worktrees, not per-thread branches.
2. **Other threads idle** — user has paused or finished other agent chats on this checkout. This skill cannot stop other agents.
3. User invoked bundle-ship (explicit combined finish + push intent).

If `git status` or the full diff **changes between two fresh reads** without this thread editing those paths, **stop**. Tell the user the tree is still moving; wait until other threads are idle, then re-run.

## Workflow

Copy and track:

```
Bundle-ship progress:
- [ ] Step 1: Snapshot the full tree
- [ ] Step 2: Confirm bundle scope with user
- [ ] Step 3: Run finish (bundle mode)
- [ ] Step 4: Run push
```

### Step 1: Snapshot the full tree

1. Run `git status -sb` and read the **full** diff from disk (`git diff` and `git diff --cached`; include untracked paths that belong in the release).
2. Summarize **everything** that would land — by area/feature, not by which thread wrote it.
3. Do **not** filter to “this thread’s files.” The perimeter is the **entire** working tree.

### Step 2: State bundle scope, then continue

Invoking this skill **is** consent to finish and push the current snapshot. State what will land (files and areas, version/changelog when required, other threads should be paused) and **continue in the same turn**.

**Never** ask whether the user is ready to bundle, commit, or push after they invoked this skill.

**Stop and ask only when the snapshot deviates** from a straight landing:

- The tree changed between two fresh reads (another thread is still writing).
- A protected file, secret, or path the invocation did not cover must change.
- Several in-progress tasks exist and it is unclear which to archive.
- The named destination breaks the branch gate (`git-workflow`). Follow that gate. Do not add a second ready-check.

If the user declines after such a stop, stop. If they want thread-scoped finish instead, route to plain `finish` (no push in that turn unless they ask).

**Task backlog:** If `src/config/app-tasks.json` has multiple `in-progress` rows from different threads, ask which task(s) to archive before commit — same as `finish`, but expect ambiguity more often in multi-thread landings.

### Step 3: Run finish (bundle mode)

Read `.agents/skills/finish/SKILL.md` and execute it with these overrides:

| `finish` default | `bundle-ship` override |
|------------------|------------------------|
| Concurrent smoke → AskQuestion (pause / bundle / stash / wait) | **Skip** the four-option menu — user already chose **bundle** by invoking this skill |
| Scope = this thread’s work | Scope = **full tree** from Step 1 |
| Ends with offer to push | Continue to Step 4 in **this same turn** after a successful commit |
| Stash lane / wait-and-recheck | **Out of scope** — user must pause other threads first |
| Ready-to-commit confirmation | **Skip** — invocation is consent. Ask only for a Step 2 deviation |

Follow all other `finish` requirements: archive task when applicable, version/changelog gate, staging decision gate, **Lesson check** (§ Lesson check — offers `/learn` when plan Notes have mistake signals), commit message standards, protected files, feature-doc validation.

**One commit** for the full snapshot. Changelog and version bump (when required) must reflect **all** bundled changes.

### Step 4: Run push

After a **successful** commit:

1. Read `.agents/skills/push/SKILL.md` and execute it in this same turn.
2. Do **not** ask “ready to push?”. The invocation already authorized the push. Run `push` preconditions; stop only when those fail or a Step 2 deviation appears.
3. If push preconditions fail (dirty tree, behind remote), stop per `push` and report — do not commit-fix inside `push`.

## Non-goals

| Will NOT do | Mark |
|-------------|------|
| Per-thread separate commits | *excluded* |
| Coordinate git worktrees or merge branches first | *excluded* |
| Stash other threads’ work and restore after push | *excluded* — use plain `finish` Option 3 if needed |
| Auto-poll or wait for other threads | *excluded* — user pauses them |
| Replace `finish` or `push` rules | *excluded* — delegates SSOT |
| Open PRs or promote to production | *deferred* — after push, open PR per `.cursor/rules/git-workflow/RULE.mdc` § Pull Requests (`gh pr create --base develop`; Summary + Test plan body; verify `baseRefName`; never bare `pull/new/<branch>`) |

## Boundaries

| Not `bundle-ship` | Use instead |
|-------------------|-------------|
| Single-thread wrap-up | `finish` → `push` |
| Only push existing commits | `push` |
| Validate before landing | `validate` |
| Concurrent smoke; user unsure about bundle | `finish` (full AskQuestion menu) |

## Invocation aliases

Treat these as the same skill: `/bundle-ship`, `/finish-all`, “finish and push everything across threads.”
