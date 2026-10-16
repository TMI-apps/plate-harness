import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/shared/context/AuthContext";
import { SignInPanel } from "@/features/auth/components/SignInPanel";
import { useAuthRedirect } from "@/features/auth/hooks/useAuthRedirect";
import { PageLoadingState } from "@/components/common/PageLoadingState";
import { storeRedirectPath } from "@/shared/utils/redirectUtils";
import { appScrollContentSx, appViewportSx } from "@/shared/theme/appViewLayout";

import Box from "@mui/material/Box";

export const LoginPage = () => {
  const { user, loading } = useAuthContext();
  const navigate = useNavigate();
  useAuthRedirect();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");
    if (redirect) {
      storeRedirectPath(redirect);
    }
  }, []);

  useEffect(() => {
    if (!loading && user) {
      void navigate("/", { replace: true });
    }
  }, [loading, user, navigate]);

  if (loading) {
    return <PageLoadingState />;
  }

  if (user) {
    return null;
  }

  return (
    <Box sx={appViewportSx}>
      <Box sx={appScrollContentSx}>
        <SignInPanel />
      </Box>
    </Box>
  );
};
