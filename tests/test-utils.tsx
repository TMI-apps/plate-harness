import type { ReactElement, ReactNode } from "react";
import { render, renderHook, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import type { AuthContextValue } from "@/features/auth/types/auth.types";

/**
 * Creates a QueryClient for tests with retry disabled.
 * Use this instead of the app's queryClient to avoid flaky tests from retries.
 */
export const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: 0,
      },
    },
  });

/**
 * Wraps children with QueryClientProvider for tests.
 *
 * @example
 * render(createQueryClientWrapper()(<ProfileMenu />));
 */
export const createQueryClientWrapper = (options?: { queryClient?: QueryClient }) => {
  const queryClient = options?.queryClient ?? createTestQueryClient();

  return function QueryClientWrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

export interface ProviderRenderOptions extends Omit<RenderOptions, "wrapper"> {
  withRouter?: boolean;
  withQueryClient?: boolean;
  initialEntries?: string[];
  queryClient?: QueryClient;
}

function AllProviders({
  children,
  options,
}: {
  children: ReactNode;
  options: ProviderRenderOptions;
}) {
  const { withRouter = true, withQueryClient = true, initialEntries, queryClient } = options;

  let tree: ReactNode = children;

  if (withQueryClient) {
    const client = queryClient ?? createTestQueryClient();
    tree = <QueryClientProvider client={client}>{tree}</QueryClientProvider>;
  }

  if (withRouter) {
    tree = initialEntries ? (
      <MemoryRouter initialEntries={initialEntries}>{tree}</MemoryRouter>
    ) : (
      <BrowserRouter>{tree}</BrowserRouter>
    );
  }

  return <>{tree}</>;
}

/**
 * Renders a component with Router and QueryClient wrappers (both on by default).
 *
 * @example
 * renderWithProviders(<ProfileMenu />);
 *
 * @example
 * renderWithProviders(<Dashboard />, { initialEntries: ["/dashboard"] });
 */
export function renderWithProviders(ui: ReactElement, options: ProviderRenderOptions = {}) {
  const { withRouter, withQueryClient, initialEntries, queryClient, ...renderOptions } = options;

  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders options={{ withRouter, withQueryClient, initialEntries, queryClient }}>
        {children}
      </AllProviders>
    ),
    ...renderOptions,
  });
}

/**
 * Renders a hook with Router and QueryClient wrappers (both on by default).
 *
 * @example
 * const { result } = renderHookWithProviders(() => useAuthRedirect());
 */
export function renderHookWithProviders<TResult, TProps>(
  hook: (props: TProps) => TResult,
  options: ProviderRenderOptions & { initialProps?: TProps } = {}
) {
  const { initialProps, withRouter, withQueryClient, initialEntries, queryClient } = options;

  return renderHook(hook, {
    initialProps,
    wrapper: ({ children }) => (
      <AllProviders options={{ withRouter, withQueryClient, initialEntries, queryClient }}>
        {children}
      </AllProviders>
    ),
  });
}

/**
 * Default AuthContext mock shape for component tests that mock useAuthContext.
 */
export function createDefaultAuthContextValue(
  overrides: Partial<AuthContextValue> = {}
): AuthContextValue {
  return {
    user: null,
    loading: false,
    error: null,
    login: vi.fn(),
    signUp: vi.fn(),
    logout: vi.fn(),
    signInWithGoogle: vi.fn(),
    requestPasswordReset: vi.fn(),
    updatePassword: vi.fn(),
    clearAuthError: vi.fn(),
    setAuthError: vi.fn(),
    ...overrides,
  };
}
