# Testing Guide

Single source of truth for **where tests live**, **which runner to use**, and **which patterns to copy** when building on this starter.

Agent philosophy and commit-tier authority: [`.cursor/rules/testing/RULE.mdc`](../.cursor/rules/testing/RULE.mdc).  
Local git test modes (pre-commit / CI): [`DOC_AGENT_WORKFLOW_LAYERS.md`](./DOC_AGENT_WORKFLOW_LAYERS.md) § Local git.

---

## Quick commands

| Command | What it does |
|---------|----------------|
| `pnpm test` | Vitest watch mode (app tests under `src/`) |
| `pnpm test:run` | Full Vitest suite — **CI merge gate** |
| `pnpm test:classify` | `scripts/*.test.cjs` (Node test runner) |
| `pnpm test:staged` | Dry-run pre-commit test mode + paths |
| `pnpm test:staged:live` | Run pre-commit tests without committing |
| `pnpm test:coverage` | Vitest coverage report |
| `pnpm test:ui` | Vitest UI |

**CI parity before a large PR:** `pnpm test:classify && pnpm test:run && pnpm type-check`

---

## Runner decision tree

```
Is the file under src/** or tests/** (except scripts)?
  YES → Vitest (*.test.ts / *.test.tsx) — pnpm test:run
  NO → Is it scripts/*.test.cjs?
    YES → node:test — pnpm test:classify
    NO → Do not add tests there without updating this doc
```

- **Never** put the same logic in both runners.
- `vitest.config.ts` **excludes** `scripts/**`; classifier tests are intentional.

---

## File placement

| What | Where | Example |
|------|--------|---------|
| Unit test (default) | **Colocated** beside source | `authService.ts` → `authService.test.ts` |
| Shared test helpers | `tests/test-utils.tsx` | `renderWithProviders` |
| Global Vitest setup | `tests/setup.ts` | RTL cleanup |
| Integration tests (future) | `tests/integration/` | — |
| E2E tests (future) | `tests/e2e/` | — |

**Do not** create a mirrored `tests/src/...` tree for unit tests. Colocation is the default.

---

## Naming

```typescript
describe("moduleOrComponentName", () => {
  it("should [expected behavior] when [condition]", () => {
    // ...
  });
});
```

`scripts/*.test.cjs` use Node’s `test()` function but the **same naming string** inside quotes.

---

## Layer → pattern → example

| Layer | Test type | Tools | Example in repo |
|-------|-----------|-------|-----------------|
| `shared/utils`, domain pure functions | Unit | `describe` / `it`, no render | `src/shared/utils/dateFormatters.test.ts` |
| Feature `services/` | Unit + mocks | `vi.mock` for Supabase / APIs | `src/features/auth/services/authService.test.ts` |
| Feature `hooks/` | Hook | `renderHookWithProviders` | `src/features/auth/hooks/useAuthRedirect.test.tsx` |
| `components/` | Component | `renderWithProviders` or plain `render` | `src/components/common/ProfileMenu/ProfileMenu.test.tsx` |
| `scripts/` (tooling) | Unit | `node:test` + `assert` | `scripts/change-classify.test.cjs` |

---

## Shared utilities (`tests/test-utils.tsx`)

Import via the Vitest alias:

```typescript
import { renderWithProviders, renderHookWithProviders, createDefaultAuthContextValue } from "tests/test-utils";
```

| Helper | When to use |
|--------|-------------|
| `renderWithProviders(ui)` | Component needs Router and/or QueryClient (default: both on) |
| `renderHookWithProviders(hook)` | Hook needs Router and/or QueryClient |
| `createDefaultAuthContextValue(overrides?)` | Mock `useAuthContext` return shape in component tests |
| `createTestQueryClient()` | Custom QueryClient when you need specific cache behavior |
| Plain `render()` from RTL | Component has no router/query deps (e.g. `SignInPanel` with mocked hooks only) |

Options: `{ withRouter: false }`, `{ withQueryClient: false }`, `{ initialEntries: ["/dashboard"] }`.

---

## Mocking

1. Put `vi.mock("...")` at the **top** of the file (before imports of mocked modules if hoisting requires it).
2. Prefer mocking **services** and **hooks** over child components.
3. Use `vi.clearAllMocks()` in `beforeEach` when reusing mock fns.
4. Expected values must trace to shipped behavior — see testing rule § Test Authority.

---

## What not to automate (by default)

| Area | Approach |
|------|----------|
| Full E2E / browser flows | Manual or add Playwright later — not in this harness |
| Supabase Edge Functions | Manual deploy + test — see `cloud-functions/RULE.mdc` |
| MUI layout polish | DevTools / device — see `workflow/RULE.mdc` hub |

---

## Adding a new test (checklist)

1. **Runner:** `src/` → Vitest; `scripts/*.cjs` → `node:test`.
2. **Path:** Colocate `YourModule.test.ts(x)` next to `YourModule.ts(x)`.
3. **Name:** `it("should … when …", ...)`.
4. **Wrapper:** `renderWithProviders` / `renderHookWithProviders` only if Router or QueryClient is required.
5. **Gate:** `pnpm test:run` (and `pnpm test:classify` if you touched `scripts/`).

---

## Config reference

| File | Role |
|------|------|
| `vitest.config.ts` | jsdom, `@/` and `tests/` aliases, excludes `scripts/` |
| `tests/setup.ts` | `@testing-library/jest-dom`, RTL cleanup |
| `package.json` | Script names above |
