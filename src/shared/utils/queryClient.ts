import { QueryClient } from "@tanstack/react-query";

/**
 * Creates a QueryClient with shared defaults.
 * Override per query when needed (e.g. staleTime: 0 for realtime data).
 */
export const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 min default
        gcTime: 1000 * 60 * 30, // 30 min cache
        refetchOnWindowFocus: true,
        retry: (failureCount, error) => {
          if (
            error &&
            typeof error === "object" &&
            "code" in error &&
            (error as { code: string }).code === "PGRST116"
          ) {
            return false;
          }
          if (
            error &&
            typeof error === "object" &&
            "status" in error &&
            (error as { status: number }).status === 404
          ) {
            return false;
          }
          return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        retry: 0,
      },
    },
  });

/** Singleton QueryClient for app-wide use (e.g. logout cache clear). */
export const queryClient = createQueryClient();
