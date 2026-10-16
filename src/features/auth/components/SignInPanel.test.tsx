import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { SignInPanel } from "./SignInPanel";
import { useAuthContext } from "@/shared/context/AuthContext";
import { useAuthBackendConfigured } from "@/shared/hooks/useAuthBackendConfigured";

vi.mock("@/shared/context/AuthContext");
vi.mock("@/shared/hooks/useAuthBackendConfigured");
vi.mock("@/features/auth/hooks/useAuthRedirect", () => ({
  useAuthRedirect: () => vi.fn(),
}));

describe("SignInPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthContext).mockReturnValue({
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
    });
    vi.mocked(useAuthBackendConfigured).mockReturnValue({
      isConfigured: true,
    });
  });

  it("should render key sign-in controls when Supabase is configured", () => {
    render(<SignInPanel />);

    expect(screen.getByRole("button", { name: /sign in with google/i })).toBeInTheDocument();
    expect(screen.getByText("or")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in with email/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /privacy/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /terms/i })).toBeInTheDocument();
  });

  it("should show configuration info and disable OAuth when Supabase is not configured", () => {
    vi.mocked(useAuthBackendConfigured).mockReturnValue({
      isConfigured: false,
    });

    render(<SignInPanel />);

    expect(screen.getByText(/authentication requires supabase configuration/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in with google/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /sign in with email/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /sign in$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });
});
