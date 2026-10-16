import { Button } from "@/components/common/Button";
import { useAuthContext } from "@/shared/context/AuthContext";
import { useAuthBackendConfigured } from "@/shared/hooks/useAuthBackendConfigured";
import {
  formContentMaxWidth,
  formInlineAlertSx,
  formStackSpacing,
} from "@/shared/theme/appViewLayout";
import { PRIVACY_URL, TERMS_URL } from "@/config/legal";
import { GoogleIcon } from "./GoogleIcon";
import { EmailAuthForm } from "./EmailAuthForm";

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Link from "@mui/material/Link";
import Divider from "@mui/material/Divider";

const SUPABASE_CONFIG_MESSAGE =
  "Authentication requires Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY) in your environment.";

export const SignInPanel = () => {
  const { signInWithGoogle, loading, error } = useAuthContext();
  const { isConfigured: authBackendConfigured } = useAuthBackendConfigured();
  const authDisabled = !authBackendConfigured;

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: formContentMaxWidth,
        flexShrink: 0,
      }}
    >
      {authDisabled && (
        <Alert
          severity="info"
          sx={{
            mb: formStackSpacing.section,
            py: { xs: 0.5, sm: 1 },
            "& .MuiAlert-message": { fontSize: { xs: "0.8rem", sm: "0.875rem" } },
          }}
        >
          {SUPABASE_CONFIG_MESSAGE}
        </Alert>
      )}

      <Button
        variant="outlined"
        fullWidth
        startIcon={<GoogleIcon />}
        onClick={() => void signInWithGoogle()}
        disabled={loading || authDisabled}
        sx={{ mb: formStackSpacing.section }}
      >
        Sign in with Google
      </Button>

      {error && (
        <Alert severity="error" sx={formInlineAlertSx}>
          {error}
        </Alert>
      )}

      <Divider sx={{ my: formStackSpacing.divider }}>
        <Typography variant="body2" color="text.secondary">
          or
        </Typography>
      </Divider>

      <EmailAuthForm authDisabled={authDisabled} />

      <Box sx={{ mt: formStackSpacing.footer, textAlign: "center" }}>
        <Typography variant="caption" color="text.secondary" component="span">
          <Link href={PRIVACY_URL} target="_blank" rel="noopener noreferrer">
            Privacy
          </Link>
          {" · "}
          <Link href={TERMS_URL} target="_blank" rel="noopener noreferrer">
            Terms
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};
