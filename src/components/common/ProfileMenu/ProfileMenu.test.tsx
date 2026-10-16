import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createDefaultAuthContextValue, renderWithProviders } from "tests/test-utils";
import { ProfileMenu } from "@/components/common/ProfileMenu";
import { useAuthContext } from "@/shared/context/AuthContext";
import { useUserProfileQuery } from "@/features/auth/hooks/useUserProfileQuery";
import { useAuthBackendConfigured } from "@/shared/hooks/useAuthBackendConfigured";
import type { User } from "@/features/auth/types/auth.types";

vi.mock("@/shared/context/AuthContext");
vi.mock("@/features/auth/hooks/useUserProfileQuery");
vi.mock("@/shared/hooks/useAuthBackendConfigured");

const mockSignInWithGoogle = vi.fn();
const mockLogout = vi.fn();
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("ProfileMenu", () => {
  const defaultAuthContext = createDefaultAuthContextValue({
    logout: mockLogout,
    signInWithGoogle: mockSignInWithGoogle,
  });

  const defaultUserProfileQuery = {
    data: null,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  };

  const renderMenu = () => renderWithProviders(<ProfileMenu />);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthContext).mockReturnValue(defaultAuthContext);
    vi.mocked(useUserProfileQuery).mockReturnValue(defaultUserProfileQuery as never);
    vi.mocked(useAuthBackendConfigured).mockReturnValue({ isConfigured: true });
  });

  describe("Internal anchor mode (default)", () => {
    it("should render trigger button when user is not logged in", () => {
      renderMenu();
      expect(screen.getByRole("button")).toBeInTheDocument();
      expect(screen.getByLabelText(/sign in/i)).toBeInTheDocument();
    });

    it("should render trigger button when user is logged in", () => {
      const mockUser: User = {
        id: "123",
        email: "test@example.com",
      } as User;
      vi.mocked(useAuthContext).mockReturnValue({
        ...defaultAuthContext,
        user: mockUser,
      });
      renderMenu();
      expect(screen.getByRole("button")).toBeInTheDocument();
      expect(screen.getByLabelText(/account/i)).toBeInTheDocument();
    });

    it("should open menu when trigger button is clicked", async () => {
      const user = userEvent.setup();
      renderMenu();

      const triggerButton = screen.getByRole("button");
      await user.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByRole("menu")).toBeInTheDocument();
      });
    });

    it("should show sign-in options when menu is opened and user is not logged in", async () => {
      const user = userEvent.setup();
      renderMenu();

      const triggerButton = screen.getByRole("button");
      await user.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByText(/sign in with google/i)).toBeInTheDocument();
        expect(screen.getByText(/sign in with email/i)).toBeInTheDocument();
      });
    });

    it("should show profile info and sign-out when menu is opened and user is logged in", async () => {
      const mockUser: User = {
        id: "123",
        email: "test@example.com",
      } as User;
      vi.mocked(useAuthContext).mockReturnValue({
        ...defaultAuthContext,
        user: mockUser,
      });
      const user = userEvent.setup();
      renderMenu();

      const triggerButton = screen.getByRole("button");
      await user.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByText(/sign out/i)).toBeInTheDocument();
      });
    });
  });

  describe("Sign-in interactions", () => {
    it("should call signInWithGoogle when Google sign-in is clicked", async () => {
      const user = userEvent.setup();
      renderMenu();

      const triggerButton = screen.getByRole("button");
      await user.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByText(/sign in with google/i)).toBeInTheDocument();
      });

      const signInButton = screen.getByText(/sign in with google/i);
      await user.click(signInButton);

      expect(mockSignInWithGoogle).toHaveBeenCalled();
    });

    it("should navigate to login when email sign-in is clicked", async () => {
      const user = userEvent.setup();
      renderMenu();

      const triggerButton = screen.getByRole("button");
      await user.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByText(/sign in with email/i)).toBeInTheDocument();
      });

      const signInButton = screen.getByText(/sign in with email/i);
      await user.click(signInButton);

      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  describe("Sign-out interaction", () => {
    it("should call logout when sign-out is clicked", async () => {
      const mockUser: User = {
        id: "123",
        email: "test@example.com",
      } as User;
      vi.mocked(useAuthContext).mockReturnValue({
        ...defaultAuthContext,
        user: mockUser,
      });
      const user = userEvent.setup();
      renderMenu();

      const triggerButton = screen.getByRole("button");
      await user.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByText(/sign out/i)).toBeInTheDocument();
      });

      const signOutButton = screen.getByText(/sign out/i);
      await user.click(signOutButton);

      expect(mockLogout).toHaveBeenCalled();
    });
  });
});
