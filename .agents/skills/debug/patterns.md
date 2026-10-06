# Debug pattern library

Searchable reference for `.agents/skills/debug/SKILL.md`.

Use this file as a **lookup table**, not prose to skim. Search for exact symptom strings, Postgres error codes (`42501`, `42703`, `42P10`, `08P01`), HTTP/CORS tokens, subsystem names (`RLS`, `JWT`, `Edge Function`, `storage`), framework messages (`Maximum update depth`), and names from recent migrations or refactors.

Add new patterns at the bottom as they prove reusable across incidents.

---

## React: Maximum update depth exceeded

- Almost always: an object (not primitive) in a useCallback/useEffect dependency array
- Check: useMutation/useQuery return objects (unstable), Context values (unmemoized), inline objects
- Key question: "Is a callback being passed to Context via setState?" (classic loop pattern)
- Debug approach: Log which dependency actually changed using refs, don't guess
- Tokens: `Maximum update depth`

---

## N8N: Unused Respond to Webhook node (500)

- Symptom: Webhook returns 500 with message "Unused Respond to Webhook node found in the workflow"
- Root cause: Webhook node Response Mode is set to auto-respond (default) but a Respond to Webhook node exists downstream
- Key question: "Is the Webhook node's Response Mode set to 'Using Respond to Webhook node'?"
- Debug approach: Check N8N workflow configuration, not code - verify Response Mode setting in Webhook node (N8N v1.114+ requires explicit configuration)
- Tokens: `Respond to Webhook`, `Unused Respond`

---

## Auth: Protected route redirects before role loads

- Symptom: Protected routes (e.g., admin pages) redirect to fallback route on page refresh, even though user has proper role. User sees redirect flash before staying on page, or gets redirected incorrectly.
- Root cause: `loading` state becomes `false` before `userRole` is fetched. useEffect that fetches role runs on mount when `user` is `null` (initial state) and sets `loading: false` prematurely, allowing ProtectedRoute to render and redirect before role is available.
- Key question: "Is the loading state being set to false before the initial session check completes?"
- Debug approach: Track when `loading` changes to `false` relative to when `user` is set and when `userRole` is fetched. Use a ref to track if initial session check has completed before allowing `loading` to be set to `false` for null/anonymous users.
- Tokens: `ProtectedRoute`, refresh, redirect flash, role

---

## PowerShell: `&&` chaining fails immediately (parser error)

- Symptom: Shell command fails instantly with `The token '&&' is not a valid statement separator`
- Root cause: This repo runs on **Windows PowerShell**; bash-style `&&` is invalid
- Fix: Chain with `;` and check `$LASTEXITCODE` after each step, or run separate Shell tool calls
- Example: `pnpm build; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; pnpm validate:structure`
- SSOT: `.cursor/rules/platform/RULE.mdc` § Platform and Commands
- Tokens: PowerShell, `&&`, parser, Windows

---

## PowerShell: command hang or missing exit code (Cursor/hooks)

- Symptom: Commands like `pnpm type-check`, `pnpm lint`, or `pnpm test` appear to hang indefinitely in PowerShell/Cursor, especially in hooks or scripts
- Root cause: PowerShell doesn't always propagate exit codes correctly. Commands may fail but PowerShell returns 0, causing Cursor to wait indefinitely for a clear termination signal
- Key question: "Is the command actually hanging, or is Cursor waiting for an exit code that never comes?"
- Debug approach: Check `.cursor/rules/platform/RULE.mdc` for exit code handling patterns. Add explicit exit code handling: `command 2>&1; if ($LASTEXITCODE -ne 0) { exit 1 }` for PowerShell, or `command || exit 1` for bash scripts
- Tokens: PowerShell, `$LASTEXITCODE`, hook, stale

---

## React Fast Refresh: context hook throws during HMR

- Symptom: Context hook throws "must be used within Provider" error during hot reload, but works fine on full page refresh. Error disappears after refresh.
- Root cause: React Fast Refresh temporarily unmounts providers during hot reload while components using the context are still rendering, causing context to be undefined
- Key question: "Is this error only happening during hot reload in development mode, not on full refresh?"
- Debug approach: Make context hook return a safe default in development mode instead of throwing. Check `import.meta.env?.MODE === 'development'` and return fallback context. Still throw in production to catch real bugs.
- Tokens: Fast Refresh, HMR, Provider

---

## React: state vs URL desynchronization

- Symptom: Component creates new resources (conversations, items) on second action even though URL shows correct ID. State shows null/undefined but URL param exists.
- Root cause: Component checks only state (`currentConversationId`) but ignores URL params (`paramConversationId`). Race condition where routing effect hasn't loaded resource yet but URL already indicates existing resource.
- Key question: "Is the component checking both state AND URL params when determining resource context?"
- Debug approach: Check if `paramConversationId` exists in URL but state is null - if so, use `paramConversationId` as fallback. Log both values to identify desynchronization. Use `effectiveId = stateId ?? (paramId && hasData ? paramId : null)` pattern.
- Tokens: URL params, useParams, race

---

## Postgres: invalid UUID — array index passed as id

- Symptom: Database error "invalid input syntax for type uuid: '1'" or similar when saving records with foreign key relationships. Error occurs when creating linked records (files, messages, etc.).
- Root cause: Passing stringified array index (`String(index)`) instead of actual UUID from object. Common in `.map()` callbacks where index is mistakenly used instead of object ID property.
- Key question: "Is the ID being passed the actual UUID property from the object, or a stringified array index?"
- Debug approach: Check where ID is set in event handlers - verify it uses `(object as TypedObject).id` or `object.id`, not `String(index)`. Log the value being passed to identify if it's a numeric string vs UUID format.
- Tokens: `uuid`, `invalid input syntax`

---

## localStorage cleared on logout breaks routing persistence

- Symptom: Feature works correctly on window close/reopen but fails after logout/login. Routing or state restoration doesn't work after login even though it works on refresh.
- Root cause: `clearUserLocalStorage()` function clears localStorage keys that should persist across logout/login. Keys are user-specific but being cleared unnecessarily, breaking persistence.
- Key question: "Is the localStorage clearing function removing keys that should persist across logout/login sessions?"
- Debug approach: Check `clearUserLocalStorage()` function - verify which keys are cleared. User-specific keys (e.g., `lastOpenedChat:v1:{userId}`) should typically persist unless there's a security/privacy reason to clear them. Compare behavior: window close/reopen (keys persist) vs logout/login (keys cleared).
- Tokens: localStorage, logout, persist

---

## CORS preflight: custom header not allowed (generic Failed in UI)

- Symptom: Browser console shows "Request header field X-Header-Name is not allowed by Access-Control-Allow-Headers in preflight response" but frontend only shows generic "I encountered an error: Failed" message. Request fails before reaching server.
- Root cause: Edge function CORS configuration doesn't include custom headers being sent by frontend. Preflight OPTIONS request fails, causing fetch to throw generic error that gets truncated to just "Failed".
- Key question: "Are all custom headers (x-title, http-referer, etc.) listed in the edge function's Access-Control-Allow-Headers?"
- Debug approach: Check browser Network tab for OPTIONS preflight request - verify which headers are being sent vs allowed. Check edge function CORS configuration (`_shared/cors.ts`) - ensure all custom headers match exactly (case-sensitive). Improve frontend error handling to detect network/CORS errors and show clearer messages.
- Tokens: `CORS`, `OPTIONS`, `Access-Control-Allow-Headers`, preflight

---

## React: stale local copy returned after setState in async flow

- Symptom: Data appears in UI but disappears after save/reload, or save fails with validation errors. Only happens on first message or specific scenarios. Subsequent operations work fine.
- Root cause: Async function creates local copy of state array (`let localArray = initialArray`), updates React state via callbacks (`setState`), but local copy isn't updated. When function returns, it returns stale local copy instead of updated state.
- Key question: "Is the async function returning a local copy of state that was never updated, even though React state was updated via callbacks?"
- Debug approach: Check if async function returns state - verify returned value matches React state. Look for `let localArray = initialArray` pattern followed by `setState` updates but no `localArray = updatedArray`. Fix: Update local copy before returning, or return updated state from callback.
- Tokens: stale closure, setState, async

---

## Postgres: ON CONFLICT mismatch after migration (42P10)

- Symptom: Database error `42P10` "there is no unique or exclusion constraint matching the ON CONFLICT specification" when upserting/inserting records. Error occurs after database migrations that changed primary keys or unique constraints.
- Root cause: Migration changed table constraints (e.g., primary key from `(assistant_id, tool_name)` to `(assistant_id, tool_id)`) but application code still references old constraint in `ON CONFLICT` clauses or queries.
- Key question: "Did a recent migration change the primary key or unique constraint that this code references?"
- Debug approach: Check migration files for table schema changes - verify current primary key/constraints match what code expects. Look for `ON CONFLICT` clauses, upsert operations, or unique constraint checks. Fix: Update code to use new constraint columns (may require lookup if old column is deprecated but kept for compatibility).
- Tokens: `42P10`, `ON CONFLICT`, migration

---

## Git on Windows: env.exe signal pipe Win32 error 5

- Symptom: `git commit` fails with `env.exe: *** fatal error - couldn't create signal pipe, Win32 error 5` when run from Cursor's terminal/agent, but works on another PC or from external terminal.
- Root cause: Win32 error 5 = ACCESS_DENIED. Primary confirmed cause: Cursor's sandbox restricts pipe creation when running terminal commands, blocking env.exe from spawning. Other possible causes: antivirus blocking spawn; user account lacks permission; Git for Windows issue.
- Key question: "Does the commit work with full permissions or from an external terminal?"
- Debug approach: For Cursor agent: request full permissions when running git commit. For manual commits: use external terminal. If still failing: check AV exclusions, Group Policy.
- Tokens: `env.exe`, `signal pipe`, Win32 error 5

---

## Vitest + MUI Material: Cannot require ES Module in a cycle

- Symptom: Vitest tests fail with `Error: Cannot require() ES Module ... @mui/material/esm/index.js in a cycle` when testing components that import MUI Material. Tests work on some machines but fail on others.
- Root cause: MUI Material uses ESM-first exports with directory imports that Vitest cannot resolve. Vitest tries to use CommonJS `require()` for ESM modules, creating a cycle.
- Key question: "Does the test work on another machine or after clearing Vite cache?"
- Debug approach: Add `server.deps.inline: ["@mui/material", "@mui/icons-material"]` to `vitest.config.ts`. Consider `fallbackCJS: true` for ESM/CJS compatibility. Clear Vite cache if issue persists.
- Tokens: `vitest`, `@mui/material`, ESM, cycle

---

## Stale closure / setState callback race (generic)

- Value read from a closure or computed inside an async callback is used before it runs; or Handler A sets state, Handler B runs before React flushes and reads stale state.
- Key question: "Is the value built synchronously and passed in, or only available inside a callback? Does the next handler receive the updated value or a stale snapshot?"
- Debug approach: Build values synchronously before async calls; pass updated data forward explicitly; use refs for cross-handler communication. In loops, pass a getter (`getX: () => liveValue`) instead of a snapshot.
- Examples: Form submit clears values; earlier messages disappear on save; data disappears after save; sequential operations revert earlier status.

---

## Code vs DB schema mismatch (generic)

- Code expects a column, constraint, or table name that no longer exists (or vice versa), usually after a migration.
- Key question: "Did migrations run on this environment? Do column names, constraint names, and ON CONFLICT clauses match the current DB schema?"
- Debug approach: Check migration files; query `information_schema.columns` for the affected table; verify constraint names; run missing migrations. Watch for staging/production drift.
- Examples: `ON CONFLICT` 42P10 after a migration; "column X does not exist" in one environment but not another; trigger references a dropped column.
- Tokens: `42703`, migration drift, RLS

---

## Order of operations — async sequencing (generic)

- Client or server performs step B before step A has persisted, causing a foreign key violation, missing record, or stale read.
- Key question: "Is the dependent operation guaranteed to run after the prerequisite has fully committed, not just after the async call returns?"
- Examples: insert of a child record before parent is saved; invoking a function with an ID before the row exists; clearing dirty state after navigation instead of before.
- Debug approach: Defer dependent calls until after the prerequisite's success callback; return the DB-generated ID from create operations and thread it forward rather than using a client-generated ID.

---

## Mobile: layout OK in DevTools but broken on a real phone

- Symptom: Fixed bottom UI, full-height shell, or login layout looks correct in Chrome DevTools device mode at the same CSS width, but is clipped, scrolls wrong, or misaligned on a physical Android/iOS device. Mobile OAuth may work on desktop localhost but fail when opening `http://192.168.x.x:N` on the phone.
- Root cause: DevTools emulates width only — not visible viewport height (`100vh` vs browser chrome), system nav bars, virtual keyboard, or IdP redirect rules for LAN IPs vs localhost.
- Key question: "Was this verified on a physical device using the SSOT URL pattern (adb reverse + localhost on Android, or tunnel/preview on iOS)?"
- Debug approach: Read **`documentation/DOC_MOBILE_LOCAL_DEV.md`** before closing the issue. Do not ship viewport or mobile-login fixes on DevTools-only evidence. For Android + Supabase/Google OAuth locally: `adb reverse tcp:N tcp:N` and open `http://localhost:N` on the phone — not the LAN IP.
- Tokens: mobile, DevTools, adb reverse, viewport, OAuth, 100vh, keyboard

---

## Git: Promote fails — main is not an ancestor of develop

- Symptom: `promote-to-production.yml` fails at "Verify fast-forward preconditions" with `main is not an ancestor of develop`. Local `git diff origin/main origin/develop` may show only small deltas while history is forked.
- Root cause: Same logical change landed on **`main`** and **`develop`** as **sibling commits** (common in Model B: squash PR merged to `main` while an equivalent commit was pushed to `develop`).
- Key question: "Does `git log --oneline --graph origin/main origin/develop` show two branches after one parent?"
- Debug approach: Reconcile on `develop` (`git merge origin/main`, push, green CI), then re-run promote — SSOT `.cursor/rules/git-workflow/RULE.mdc` § Promote to production § Ancestor failure. On PowerShell, verify `merge-base --is-ancestor` with `$LASTEXITCODE` alone.
- Tokens: promote, ancestor, Model B, fast-forward, develop, main

---

## Add other patterns here as they're discovered.
