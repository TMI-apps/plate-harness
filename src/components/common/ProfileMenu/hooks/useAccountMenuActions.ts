import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/shared/context/AuthContext";

interface UseAccountMenuActionsProps {
  onClose: () => void;
}

export const useAccountMenuActions = ({ onClose }: UseAccountMenuActionsProps) => {
  const { signInWithGoogle, logout } = useAuthContext();
  const navigate = useNavigate();

  const handleSignIn = useCallback(() => {
    void signInWithGoogle();
    onClose();
  }, [signInWithGoogle, onClose]);

  const handleGoToLogin = useCallback(() => {
    onClose();
    void navigate("/login");
  }, [navigate, onClose]);

  const handleSignOut = useCallback(async () => {
    onClose();
    await logout();
  }, [logout, onClose]);

  return {
    handleSignIn,
    handleGoToLogin,
    handleSignOut,
  };
};
