---
name: debug
description: Structured scientific debugging for runtime bugs, regressions, flaky behavior, frontend/backend failures, Supabase/RLS/Auth/Storage issues, and user-reported errors. Use when the user invokes /debug, asks to debug, reports an error, or describes inconsistent behavior.
---

# debug

Use **Scientific Method Debugging**. The goal is to reduce uncertainty with evidence, not to patch around symptoms.

The user does **not** edit code. The user only:

- Performs actions in the app.
- Filters console logs if needed (when not in Cursor Debug Mode).
- Copies and pastes console logs (when not in Cursor Debug Mode; in Debug Mode the **agent** reads logs directly).
- Performs actions in external dashboards when the agent cannot.

Report faithfully: say what was verified and what was not. The user confirms when the issue is resolved.

---

## Chat intake (before Preflight)

When the user reports a bug without structured context, **ask in one message** (or fill from chat history) before editing code:

| Slot | Ask |
|------|-----|
| **Where tested** | Local dev / staging preview URL / production / other |
| **Repro steps** | Numbered, minimal |
| **Expected vs actual** | One line each |
| **Since when** | Always / after recent change / unknown |

If all four are already in the thread → **do not re-ask**; populate Preflight slots directly. Intake is for alignment only — never claim fixed.

After a fix lands, closure uses **`finish`** § User test handoff — user confirms resolution in the app.

---

## 0. Mandatory Preflight

Before forming hypotheses or editing code, fill these slots in your working notes and reflect them in the first debug response:

1. **Environment frozen:** Which app runtime, branch, deployed build, Supabase/project ref, user/account, browser/session, and feature flag state is being exercised? If unknown, state how you will prove it first.
2. **Recent-change audit:** Which recent files, migrations, PRs, config changes, deploys, or dashboard edits touched the failing surface or shared dependency?
3. **Event-chain draft:** What is the shortest user action → app behavior → side effect/API/DB call → failure chain you can reconstruct from current evidence?
4. **Pattern lookup:** Search [`patterns.md`](patterns.md) for symptom tokens, error codes, subsystem names, and recent-change terms. Record matched pattern names or `no match for: <tokens>`.
5. **Layer alignment:** Which layer does the best current evidence point to (UI state, client request, API/Edge, database/RLS, external service, deployment/config)? Is the next diagnostic step aimed at that same layer?

If any slot is skipped, explicitly write `skipped because ...`. Do not silently omit a section.

---

## 1. Process Guardrails

Use these guardrails during every evidence loop:

- **Environment first:** Before interpreting logs, prove which runtime environment, project/branch, and deployed build the user is exercising. Do not assume production, staging, local, or a branch from memory.
- **One turn should narrow:** Each debug iteration must explicitly state what uncertainty was removed. If the next action does not plausibly cut the remaining probability space roughly in half, pause and choose a better diagnostic step.
- **Cross-surface failures point down-stack:** When independent user actions fail across multiple UI flows but share an external dependency, inspect the shared dependency's health/logs before adding more application-level guards.
- **Localhost instrumentation has scope:** Browser debug logging to a local ingest endpoint only works when the exercised app can reach that local endpoint. For hosted or remote runtimes, prefer server-side logs, existing telemetry, MCP logs, or deployable remote-safe instrumentation.
- **Stop editing after layer refutation:** If runtime evidence moves the likely cause outside the layer being edited, stop accumulating mitigations there. Keep only changes that improve observability or user-facing clarity and are independently justified by evidence.
- **Recent changes are suspects:** A bug that appears after a refactor, migration, deploy, dashboard edit, dependency bump, or environment split must include at least one hypothesis tied to that change.
- **Do not outsource an app-owned failure:** External service instability can be a hypothesis, but it must compete against app-specific request shape, auth path, RLS, schema, config, and recent-change hypotheses.
- **Supabase stack:** For auth, RLS, Storage, and Edge Function errors, include hypotheses about JWT/session, policies, bucket policies, and request shape against `.cursor/rules/security/RULE.mdc` and `.cursor/rules/database/RULE.mdc` where relevant.

---

## 2. Expected Input

Accept any of:

- Error message + stack trace
- Console output
- Description of what the user did
- Mention of external systems involved

If information is missing, proceed with assumptions and state them.

---

## 3. Component Nesting & Structure Analysis (React/UI Issues)

For UI/React issues, analyze component nesting **before** behavioral instrumentation:

1. List the problematic component's full component/DOM hierarchy.
2. List relevant props, context values, refs, and derived state passed through that tree.
3. Identify likely structural culprits:
   - CSS inheritance/overrides from parents
   - Global styles affecting layout context (`body`, `html`, `#root`)
   - Overflow/stacking context issues (any element with overflow other than `visible` creates a new stacking context)
   - Prop type mismatches or undefined props
   - Context/provider mismatch
   - Z-index/positioning conflicts from nesting
4. Map any structural hypothesis back to the event chain.

Skip this section only when the bug is clearly not UI/React.

---

## 4. Event Chain Reconstruction

For each issue:

1. Reconstruct the chain from user action → app behavior → API calls/side effects → failure point.
2. Present it as a numbered list.
3. Identify the most suspicious link and why.

All diagnostic steps must map back to **specific links in this chain**. If a diagnostic step cannot be mapped, choose a better step.

---

## 5. Pattern Recognition

Known patterns live in [`patterns.md`](patterns.md). Use it as a searchable reference, not as prose to skim.

Before forming hypotheses:

- Search for exact symptoms/error codes (`08P01`, `42501`, `42703`, `42P10`, `CORS`, `Maximum update depth`, etc.).
- Search for subsystem terms (`RLS`, `storage`, `JWT`, `Edge Function`, `stream`, `cache`, etc.).
- Search for recent-change terms (migration/function/table/component names touched near the regression).

If a pattern matches, promote it into the hypothesis set with a falsifier. If no pattern matches, record the searched tokens.

When a fixing session yields a **new reusable** pattern, add it to `patterns.md` per `.agents/skills/finish/SKILL.md` (quality gate applies).

---

## 6. Hypotheses (Scientific Method)

For each issue propose **2–3 hypotheses**:

- Each maps to a **specific event-chain step**.
- Each predicts **specific observable outcomes**.
- Each includes a **falsification condition**.
- At least one involves **external configuration** when errors involve auth, permissions, RLS, API keys, service URLs, quotas, environment mismatch, or dev/prod differences.
- At least one involves a **recent change** when the bug appeared after a refactor, migration, deploy, dashboard change, dependency bump, or environment split.

Hypotheses must be designed so that logs or observations can **decide between them**. Avoid hypotheses that all predict the same next observation.

---

## 7. Instrumentation

All hypotheses must be verifiable through evidence captured after reproducing the issue. Logs should include all information needed for falsification or verification. For API calls, raw API input and output can be needed; avoid exposing secrets.

Place instrumentation at the layer the evidence currently points to:

- UI symptoms with uncertain client state → instrument component state/events.
- Correct client state but bad request/response → instrument service/request boundaries.
- Cross-surface failures sharing DB/Auth/Storage/Edge → inspect server, database, dashboard, MCP, or provider logs before adding more client logs.
- Hosted or remote app → do not rely on localhost-only browser logging unless the app can reach that endpoint.

**When Cursor Debug Mode is active** (system reminder contains "DEBUG MODE" with a provisioned server endpoint, log path, and session ID):

- Use the provisioned logging infrastructure instead of `console.log`. The agent reads the log file directly; the user does not need to copy/paste logs.
- Each log entry must be a structured JSON payload with these fields:
  - `sessionId` — from the provisioned session
  - `runId` — to distinguish initial run vs post-fix verification (e.g. `"run1"`, `"post-fix"`)
  - `hypothesisId` — which hypothesis this log tests (e.g. `"H1"`, `"H2"`)
  - `location` — file and function/line when practical
  - `message` — short description
  - `data` — relevant values
  - `timestamp` — `Date.now()`
- Wrap each debug log in a collapsible code region (`// #region agent log` / `// #endregion`) to keep the editor clean.
- Aim for 2–6 log points (minimum 1, maximum 10). If you think you need more than 10, narrow hypotheses first.
- Delete or clear the log file before each reproduction run.

**When Cursor Debug Mode is NOT active** (default):

- Hypotheses must be verifiable by the user performing an action and sharing filtered console output, or by agent-accessible logs/MCP/tools.
- Console logs should include all possibly needed information for hypothesis falsification/verification.

---

## 8. Unified Diagnostic Steps

Provide **one integrated numbered list** of user/agent actions. These may include in-app interactions, DevTools checks, network observations, dashboard inspections, MCP queries, log reads, or focused code edits.

Each step must:

- Correspond to a **specific location** in the event chain.
- State **what observation supports or refutes each hypothesis**.
- Aim to **cut the search space in half**.
- Indicate precisely what the user should do or return only when the agent cannot perform the action.

Avoid category labels; all steps belong to one ordered plan.

---

## 9. Iterative Evidence Loop

When new evidence is available (user returns with logs, or agent reads logs directly):

1. Update the event chain using the new evidence.
2. Mark each hypothesis as **supported**, **refuted**, or **uncertain**, and briefly explain why with evidence.
3. Re-check [`patterns.md`](patterns.md) using any newly discovered tokens.
4. **Revert or remove code changes from rejected hypotheses.** Do not let defensive guards, speculative fixes, or unproven changes accumulate. Only keep modifications supported by runtime evidence.
5. Form a smaller, more precise hypothesis set.
6. Provide the next unified action list.

When verifying a fix, compare **before and after** evidence for the same code path. Do not claim a fix works without user confirmation.

Repeat until only the user declares the issue resolved.

---

## 10. Output Structure for Debug Responses

Every substantive debug response must include these slots. Keep each concise; write `skipped because ...` when not applicable.

```markdown
## Debug State
- Environment frozen:
- Recent-change audit:
- Event-chain step under test:
- Pattern lookup:
- Layer alignment:
## Hypotheses
- H1:
  - Prediction:
  - Falsifier:
- H2:
  - Prediction:
  - Falsifier:
## Evidence Plan
1. Step:
   - Tests:
   - Supports/refutes:
   - What to return:
## Evidence Update
- Removed uncertainty:
- Supported:
- Refuted:
- Still uncertain:
## Next Narrowing Step
```

For small follow-up turns, a compact version is fine, but it must still mention environment, pattern lookup, hypotheses/evidence status, and the next narrowing step.

---

## Next

When the user **confirms** the issue is resolved, optionally offer **`.agents/skills/learn/SKILL.md`** to persist reusable lessons. For commit/changelog, **`.agents/skills/finish/SKILL.md`** only when the user requests it.

---

## Boundaries

| Not `debug` | Use instead |
|-------------|-------------|
| Pre-registered experiment after failed fixes | `hypothesis` |
| Known small scoped fix | `quick-piv` |
| Persist lessons after resolution | `learn` |
| Plan-driven feature work | `implement` |
| Commit / push | `finish` / `push` |
