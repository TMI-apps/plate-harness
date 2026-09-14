---
name: learn
description: >-
  Turns recent code changes, failures, and conversation mistakes into durable guidance.
  Use when the user runs /learn, asks for a retrospective or to sharpen rules, or after
  resolving a multi-turn struggle (e.g. 3+ failed attempts, critical CI fix).
  IF the user invokes /learn (or attaches this skill) THEN run it in this same turn —
  persist the lesson before git commit/push. Do not defer behind a CI/code fix.
---

# Learn from changes and sharpen rules

Extract lessons from **what just happened** (diffs, errors, retries) and persist them where the assistant will see them **before** the same mistake repeats — or **remove/narrow** guidance that caused context bloat or wrong behavior. Prefer **one primary home** per lesson; cross-link instead of duplicating. **Never persist** what a capable model, Cursor’s product knowledge, or common training data already contains — that is context bloat, not a lesson. Restating it in rules/skills can also **degrade** how the model applies that same knowledge: the prompt snippet is a lossy stand-in, and the model then follows the snippet instead of its richer prior.

**Bias:** Removal-first when existing harness text contributed to the mistake or adds always-on noise without enforcement value. Mechanical lessons → validators (`validate:structure`, `harness_scan`, etc.), not prose.

**Related:** Rule grading: `.agents/skills/rule-quality/SKILL.md`. Structural harness conflicts → `.agents/skills/align-harness/SKILL.md`. Finish hook: `.agents/skills/finish/SKILL.md` § Lesson check. Skill authoring (domain knowledge the agent would not already know): `.agents/skills/create-skill/SKILL.md`.

**This project:** In-repo skills live under `.agents/skills/<name>/SKILL.md` (whitelisted in `projectStructure.config.cjs`). Add new skills as new folders with a `SKILL.md`; do not create other file types under `skills/` unless the whitelist is extended.

---

## Goal

Durable, discoverable guidance that a blank capable model would **not** already apply, with minimal duplication and no training-data restatement. Do not load textbook text into context: it can crowd out or distort the prior it was meant to “remind.”

---

## Triggers

- **Manual:** User invokes learn, asks for a retrospective, or “sharpen rules.”
- **Proactive:** After a loop (3+ failed attempts), a critical CI fix, or a non-obvious repo discovery — only when the user **confirms** debugging is resolved. **Never** run as primary in parallel with active **`debug`**.
- **Finish pipeline:** `finish` § Lesson check offers `/learn` when plan § Notes contain a mistake signal.

### Turn contract (manual `/learn` — no deferral)

**Manual invocation is blocking.** Attached or slash `/learn` is not a wrap-up after the fire. Do not wait for CI green, a code fix, or `finish` § Lesson check.

- **Same turn:** Run Steps 0–5 in this turn (audit → lesson → persist → report).
- **Before commit:** If a commit or push is also in flight, persist the lesson **before** `git commit`. Repair may continue after the Report (or after the skill/rule edit is on disk).
- **Do not misread Proactive:** “Never as primary in parallel with `debug`” and “only when debugging is resolved” apply to **proactive** learn only. They do **not** override a **manual** `/learn` on an incident message.
- **Salience:** A long CI log or red check in the same message is **not** a reason to skip this skill. Fixing the check does not complete `/learn`.

### Mistake shape (capture in plan § Notes during `implement` / `debug`)

`request → wrong action → fix → lesson → add | narrow | delete | enforce`

Record a one-line signal in the job plan **Notes during development** when the assistant was corrected, reverted, or repeated a failure — `finish` reads this before handoff.

---

## Steps

### 0. Context audit

- Read `.cursor/rules/INDEX.md` and any rule files that match the lesson domain.
- **Deduplicate:** Update an existing subsection if the lesson fits; add new only when no home fits.

### 1. Inspect what happened

- **The loop:** What broke the cycle (the “aha” moment)?
- **Git:** `git diff`, `git log` (full messages if needed) for intent and scope.
- **Conversation:** User corrections, wrong assumptions, failed tool calls.
- **CI / checks:** Failing job names; snippets from `pnpm lint`, `pnpm validate:structure`, `pnpm arch:check`, etc.

Summarize in 3–7 bullets: **symptom → root cause → fix** (facts only).

### 1b. Reverse Audit — trace the cause to existing guidance

Using the root cause from Step 1, check whether existing guidance **steered the assistant toward** the mistake. While scanning that domain, also flag lines that only restate base knowledge (they load context and add no unique signal).

- **Scan:** Search `.cursor/rules/` and `.agents/skills/` for lines related to the root cause.
- **Classify each hit:**
  - **Misleading** — the rule directly caused or encouraged the wrong behavior → recommend **delete** or **rewrite**.
  - **Overly broad** — correct in spirit but its wording invites misapplication → recommend **narrow** (add scope qualifier or exception).
  - **Outdated** — was once valid but the codebase or tooling has changed → recommend **delete**.
  - **Base knowledge** — restates training-data, Cursor product knowledge, or what a capable model would already choose (e.g. GPU vs CPU, generic HTTP/React/SQL idioms) → recommend **delete**. Context cost, **and** risk of overriding or distorting trained priors (lossy restatement becomes the whole rule).
  - **Innocent** — did not contribute → leave alone.
- **Record findings** as a short list: `file : section/line → classification → proposed action`.
- If nothing in existing guidance contributed, state that explicitly and move on.

### 2. Form the lesson

- **Trigger:** When should the assistant remember this?
- **Constraint:** What must it do or avoid?
- **Scope:** One domain (e.g. migrations, React, Edge, structure validation).

Merge near-duplicates; drop one-off noise.

### 2b. Blank-model test (required before persist)

Ask: **Would a capable model with no project rules or skills already choose this correctly?**

- **Yes → do not persist.** List it under Report → Omissions. A model forgetting a well-known fact is not fixed by writing it into a rule. The line costs context on every later turn **and can make textbook application worse**: attention follows the written snippet; a partial GPU-vs-CPU bullet can produce worse hardware reasoning than a blank model.
- **No → persist** only when the lesson is **this-repo / this-product / this-user**: conventions, local exceptions to general practice, tooling defaults that differ from industry, product preferences.

| Persist | Do not persist |
|---------|----------------|
| This repo’s folder whitelist, branch gate, protected-file list | GPU vs CPU, generic hardware/perf folklore |
| Local exception that *contradicts* common practice | Language/framework idioms already in training data |
| This app’s auth/RLS/query-cache contract | Cursor product behavior already in Cursor’s base knowledge |
| User-tested preference that is not an industry default | “The model should have known X” with no repo-specific twist |

If the struggle was “the model ignored general knowledge,” omit the lesson. Do not compensate for a one-shot model miss by permanently loading textbook text — that can **adversely influence** the prior you were trying to reinforce.

### 3. Choose where it lives

Pick **one primary** location. Cross-link elsewhere in one line if needed — never paste the same paragraph in three files.

| Lesson type | Primary location (this repo) |
|-------------|-------------------------------|
| `AGENTS.md` catalog drift | Update YAML on `RULE.mdc` first, then `AGENTS.md` row |
| `.claude/rules/*` thin pointers | `.claude/rules/*.md` — link to `RULE.mdc`, no body copy |
| Deep topic map | `.cursor/rules/INDEX.md` |
| Layer / harness coupling | `documentation/DOC_AGENT_WORKFLOW_LAYERS.md` |
| Architecture overview (human) | `ARCHITECTURE.md` — link to `architecture/RULE.mdc` |
| Subagent brief duplication | Owning skill's `references/subagent-briefs.md` |
| Postgres migrations, Supabase schema, RLS, idempotent migrations | `.cursor/rules/database/RULE.mdc` |
| Local dev URLs, `pnpm dev`, env wiring, Supabase setup | `.cursor/rules/platform/RULE.mdc` and/or `README.md` Quick Start |
| Auth, secrets, validation | `.cursor/rules/security/RULE.mdc` |
| Folder placement, imports, layers, path aliases | `.cursor/rules/architecture/RULE.mdc` or `.cursor/rules/file-placement/RULE.mdc` |
| Vitest, coverage, test layout | `.cursor/rules/testing/RULE.mdc` |
| Branch strategy, PRs, production promotion | `.cursor/rules/git-workflow/RULE.mdc` |
| Protected files, agent decision protocol, user-test gate | `.cursor/rules/agent-behavior/RULE.mdc` |
| Code review, dev process, workflow hub routing | `.cursor/rules/workflow/RULE.mdc` |
| Changelog, version, finish / commit flow | `.agents/skills/finish/SKILL.md` |
| Known symptom → fix pattern (repeatable) | `.agents/skills/debug/patterns.md` |
| Edge Functions vs frontend | `.cursor/rules/cloud-functions/RULE.mdc` |
| TanStack Query, server state | `ARCHITECTURE.md`, `documentation/DOC_TANSTACK_QUERY.md`, or feature `api/` keys patterns (one primary) |
| Long procedural workflow | Relevant `.agents/skills/<name>/SKILL.md` |
| **Product problem, persona, app role (fillable template)** | `documentation/DOC_APP_VISION.md` (onboarding: `.agents/skills/start/SKILL.md`) |
| Reusable multi-step procedure (not a one-line rule) | New or existing `.agents/skills/<name>/SKILL.md` in this repo, or a user-level skill outside the repo |
| Harness-wide structural conflict | `.agents/skills/align-harness/SKILL.md` (not ad-hoc multi-file edits) |

Confirm ownership via `.cursor/rules/INDEX.md` and `documentation/DOC_AGENT_WORKFLOW_LAYERS.md`.

**Procedures vs rules:** Single-line constraints belong in the right `RULE.mdc`. Use a **skill** (this folder pattern or user skills) when the lesson is a reusable workflow the agent should follow step-by-step.

**Tiering:** Use `[CRITICAL]` / `[HINT]` only if the target file already uses that style; otherwise use clear “Always” / “Never” per `.agents/skills/rule-quality/SKILL.md`.

### 4. Apply the edit

- Read the target file (or section); match tone and structure.
- **Imperatives:** Direct verbs (“Always…”, “Never…”).
- **Examples:** Short `// BAD` / `// GOOD` only where this repo already uses code in that file (e.g. `debug.md` patterns). For `RULE.mdc` edits, prefer concise bullets; follow `.agents/skills/rule-quality/SKILL.md` when tightening prose.
- **Minimal diff:** Small subsection or bullet group; merging duplicates in the same section is fine. Large rewrites need **explicit user confirmation**.
- **Deletions & narrowing (from Step 1b):** When the Reverse Audit flagged misleading, outdated, or **base-knowledge** guidance, present each proposed removal or rewrite to the user **before** applying. Never delete or substantially rewrite rule content without explicit user approval.

### 5. Report

- **TL;DR:** What was learned (1–2 sentences).
- **Location:** The exact file path and section heading where it was saved.
- **Removals:** List any rules proposed for deletion or narrowing, with the user's decision (applied / deferred / rejected). If none, omit this line.
- **Omissions:** Briefly list anything explicitly *not* saved and why. Always include blank-model drops (training-data / Cursor-base / general CS).
- **Stop.** Wait for next instructions. Do not print the whole file or long code blocks.

---

## Anti-patterns

- Pasting long SQL or stack traces into rules — summarize; reference migration filenames if useful.
- Duplicating the same lesson across many files.
- Logging textbook or training-data knowledge as a lesson (blank-model test fails). Not merely noise: restating it can degrade application of that knowledge.
- Putting secrets or new credentials in rules or skills.
- Rewriting large rule sections without approval.
- Deleting or silently rewriting existing rules without presenting the offending line and recommendation to the user first.
- Adding files under `.agents/skills/` that are not allowed by `projectStructure.config.cjs` (each subfolder: `SKILL.md`, optional `patterns.md`, optional `references/*.md`).
