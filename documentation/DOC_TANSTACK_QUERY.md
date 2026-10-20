# TanStack Query – Server State Management

## Overview

TanStack Query manages server state with caching, deduplication, and stale-while-revalidate. This addresses the following problems:

- Slow back navigation (data reloading)
- Duplicate API calls for the same data
- Stale information without refresh

## Query Keys

### Shared keys (cross-cutting)

`src/shared/utils/queryKeys.ts`:

```typescript
export const sharedQueryKeys = {
  user: {
    all: ["user"] as const,
    profile: (userId: string) => ["user", "profile", userId] as const,
  },
} as const;
```

### Feature-based keys

Per feature: `features/[feature]/api/keys.ts`:

```typescript
export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  detail: (id: string) => [...projectKeys.all, "detail", id] as const,
} as const;
```

### Conventions

- Hierarchy: `[resource, subResource?, ...params]`
- Use `as const` for type-safety
- Use spread for derived keys: `[...keys.all, "detail", id]`

## Mutations and Invalidation Patterns

### Rule

Only invalidate directly related keys. Avoid broad `invalidateQueries({ queryKey: [] })`.

### Patterns per mutation type

| Mutation            | Invalidate                                      | Do not invalidate         |
| ------------------- | ----------------------------------------------- | ------------------------- |
| Create project      | `projectKeys.lists()`                           | Detail (not yet existing) |
| Update project      | `projectKeys.detail(id)`, `projectKeys.lists()` | Other features            |
| Delete project      | `projectKeys.detail(id)`, `projectKeys.lists()` | User, config              |
| Update user profile | Merge via `setQueryData` on mutation result | Same profile key on happy path |

### Example: useUpdateUserProfile

```typescript
// features/auth/hooks/useUpdateUserProfile.ts
export const useUpdateUserProfile = (userId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserProfileUpdate) => updateUserProfile(userId!, data),
    onSuccess: (result) => {
      if (userId && result) {
        queryClient.setQueryData(sharedQueryKeys.user.profile(userId), result);
      }
    },
  });
};
```

### Optimistic updates (optional)

Only for fast, reversible actions (toggles, likes). Not for: payments, account changes.

```typescript
onMutate: async (newData) => {
  await queryClient.cancelQueries({ queryKey: projectKeys.detail(id) });
  const previous = queryClient.getQueryData(projectKeys.detail(id));
  queryClient.setQueryData(projectKeys.detail(id), newData);
  return { previous };
},
onError: (_err, _vars, context) => {
  if (context?.previous) {
    queryClient.setQueryData(projectKeys.detail(id), context.previous);
  }
},
```

## Plain optimistic + server-canonical response (playbook)

**SSOT** for mutation UX (summary + trigger: `.cursor/rules/architecture/RULE.mdc` § Plain optimistic + server-canonical response). Goal: one optimistic render, then one committed render that matches persisted data — no third render from a refetch that disagrees with the patch. Same model in other libraries: Apollo `optimisticResponse`, RTK Query `updateQueryData`, SWR `mutate` with `optimisticData` + `populateCache`.

### Playbook steps (in order)

1. **Canonical API contracts**  
   Server mutation paths should return the **canonical projection** the UI renders (updated row(s), counts, or list slice), e.g. PostgREST `.select(...)` after `.update()` / `.insert()`. Avoid **204 No Content / void success + mandatory refetch** as the default contract for row-level edits when the UI already holds query cache for that entity.

2. **Optimistic phase** (`onMutate`, before `await`)  
   - `cancelQueries` for affected keys if needed to avoid races.  
   - Snapshot previous cache via `getQueryData` (or equivalent).  
   - Apply a cache **patch** that uses the **same field shape and normalizers** the server response will use.  
   - Return rollback context (e.g. `{ previous }`) from `onMutate`.

3. **Error phase** (`onError`)  
   - Restore the snapshot with `setQueryData` using stored context.  
   - Surface **one** non-blocking error (toast/snackbar); do not stack multiple error UIs from the same gesture.

4. **Success phase** (`onSuccess` / `onSettled` when error-corrected)  
   - Merge the **mutation result** into the cache with `setQueryData` (or targeted `setQueriesData`) so cache matches the server response **byte-for-byte** for that projection.  
   - **Do not** call `invalidateQueries` or `refetch` on the **happy path** for the **same** list/detail keys you just reconciled—this is the main cause of an extra refetch render that does not match the optimistic patch and produces flashes.

5. **Pending / “saving” chrome**  
   Clear loading or “saving” indicators only after the cache holds **server-canonical** data for the relevant keys (e.g. after `setQueryData` from the response), not merely when the mutation `Promise` resolves if you still rely on a follow-up refetch.

6. **React rendering**  
   - Wrap non-urgent success-path updates in `startTransition` when they might defer heavy tree work.  
   - Keep **stable list keys** (`id`-based; avoid array index keys) through optimistic → server merge so React does not remount rows unnecessarily.

7. **When `invalidateQueries` / refetch *is* acceptable**  
   - Unknown or large blast radius (bulk operations, admin actions touching many rows).  
   - Cross-table aggregates or summaries where the mutation response does not carry the full derived state.  
   - **Secondary staleness**: refresh other caches **after** the user-visible path has already merged canonical data for the focused query—optionally deferred (`queueMicrotask`, `setTimeout(0)`, or transition).

8. **Hybrid escape hatch**  
   Reconcile the **focused** query from the **response body** first. If other caches might be stale, **invalidate only secondary keys**, preferably **deferred**, never in the same tick as a redundant invalidation of the key you just `setQueryData`’d.

### Anti-patterns (treat as bugs when fixing flashes)

- Optimistic patch followed immediately by **`invalidateQueries` / `refetch` on the same list or detail key** on success.  
- **Multiple concurrent refresh mechanisms** on one gesture (`refetch()` + `invalidateQueries()` + resetting local duplicated state) without a **single** canonical merge step into TanStack Query cache.  
- **Divergent data shapes** between optimistic updates and server normalizers (different sort keys, computed fields, `null` vs. `[]`, missing timestamps).  
- Clearing “saving” state before the cache reflects the server response while a refetch is still the planned source of truth.

## Auth Boundary

On logout: `queryClient.clear()` in `authService.logout`, before `signOut()`. Prevents user A's data from being visible after user B logs in.

## User-Specific Data (RLS + Cache)

Supabase uses Row Level Security (RLS). Always include `userId` in the query key for user-specific data. Otherwise the cache may incorrectly treat User A's data as valid for User B.

- **Rule:** `userId` must be part of the query key for any RLS-protected data.
- **Example:** `sharedQueryKeys.user.profile(userId)` – already correct.
- **Cache clear on logout** (Auth Boundary) handles switching users; correct keys prevent cache collisions.

## Stale/gc Times

- Defaults: 5 min stale, 30 min gc (in `queryClient.ts`)
- Override per query when needed (e.g. `staleTime: 0` for realtime data)

| Data type             | staleTime       | gcTime           | Notes                              |
| --------------------- | --------------- | ---------------- | ---------------------------------- |
| User profile          | 5 min (default) | 30 min (default) | Merge via `setQueryData` on update |
| Lists (e.g. projects) | 5 min           | 30 min           | Invalidate on create/update/delete |
| Detail (e.g. project) | 2–5 min         | 30 min           | Invalidate on update/delete        |
| Realtime data         | 0               | 5 min            | Polling or websocket-driven        |

## Intentional exceptions

**`/tasks` dev backlog** (`src/features/tasks`) uses local React state and direct fetch to the Vite dev middleware — not TanStack Query. This is intentional: the backlog is a dev-only tool backed by local JSON, not user-facing server state. See `src/features/tasks/README.md`.

## Testing

**File:** `tests/test-utils.tsx`

- `createTestQueryClient()` – QueryClient with `retry: false`, `gcTime: 0` for fast, deterministic tests
- `createQueryClientWrapper()` – Returns a wrapper component for `render(..., { wrapper })`

### Example

```tsx
import { render, screen } from "@testing-library/react";
import { createQueryClientWrapper } from "@/../tests/test-utils";
import { ProfileMenu } from "../ProfileMenu";

// When testing components that use useQuery/useMutation without mocking:
render(<ProfileMenu />, {
  wrapper: createQueryClientWrapper(),
});
```

### When to use

- **Use wrapper:** When rendering components that call `useUserProfileQuery` or other query hooks without mocking them
- **Mock instead:** When you want to control the returned data (e.g. `vi.mock("@/features/auth/hooks/useUserProfileQuery")`)

### Service tests

Mock `queryClient` in service tests when the service uses it (e.g. invalidation on logout).

### Not covered by automated tests

Unit tests cover hooks and services. The following require **manual verification**:

- Login/logout flow and cache clear on logout
- Cached data when navigating back

## Lazy loading + Suspense

- Lazy load heavy pages: `lazy(() => import("@/pages/tasks/TasksPage"))`
- Wrap routes in `<Suspense fallback={<PageLoadingState />}>`
- Cached query data + code splitting = fast navigation on return visits

## Supabase Realtime (Optional)

When using Supabase Realtime (INSERT/UPDATE broadcasts via WebSockets), TanStack Query cache does not update automatically. Add a listener that calls `queryClient.invalidateQueries()` when the channel receives a change:

```typescript
// Example: features/projects/hooks/useProjectsRealtime.ts
supabase.channel('projects').on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
  queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
}).subscribe();
```

Place this in a hook or effect that runs when the relevant data is in scope.

## Error Boundary

**File:** `src/components/common/QueryErrorBoundary/QueryErrorBoundary.tsx`

- Wraps route-level content to catch render errors (including failed lazy loads)
- Default fallback: "Something went wrong" + Retry button (reloads page)
- **Placement:** Around `Suspense` + `Routes` in App.tsx

## Retry Logic

Configured in `queryClient.ts`:

- **Queries:** Retry up to 2 times, exponential backoff (1s, 2s, max 30s). No retry on 404.
- **Mutations:** No retry (default).
- **Tests:** `createTestQueryClient()` uses `retry: false` for deterministic tests.

**Supabase:** When using Supabase, use `PostgrestError` from `@supabase/supabase-js` for type-safe error handling. Check `error.code` (e.g. `PGRST116` for 404, `23503` for foreign key violations) instead of generic `"status" in error`. Improves retry logic and QueryErrorBoundary handling.

## Migration Strategy for New Features

For new features that fetch server data, use these patterns:

### useEntityList

```typescript
// features/projects/hooks/useProjectList.ts
export const useProjectList = (filters?: ProjectFilters) => {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: () => ProjectService.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};
```

### useEntityDetail

```typescript
// features/projects/hooks/useProjectDetail.ts
export const useProjectDetail = (id: string | null) => {
  return useQuery({
    queryKey: projectKeys.detail(id ?? ""),
    queryFn: () => ProjectService.getById(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};
```

### Checklist for new features

1. Add query keys in `features/[feature]/api/keys.ts`
2. Create fetch function in service (or use existing)
3. Create `useXxxQuery` hook with `useQuery`
4. Optionally keep legacy `useXxx` as thin wrapper for backward compatibility
5. Add mutation hooks with `onSuccess` invalidation
