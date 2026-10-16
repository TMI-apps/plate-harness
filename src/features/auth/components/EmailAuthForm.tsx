import { useState } from "react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { useAuthContext } from "@/shared/context/AuthContext";
import { useAuthRedirect } from "@/features/auth/hooks/useAuthRedirect";
import { PASSWORD_RESET_SENT_MESSAGE } from "@/features/auth/types/authMessages";
import { useEmailAuthValidation } from "@/features/auth/hooks/useEmailAuthValidation";
import type { LoginCredentials, SignUpCredentials } from "@/features/auth/types/auth.types";
import { formInlineAlertSx, formStackSpacing } from "@/shared/theme/appViewLayout";

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Link from "@mui/material/Link";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

type EmailAuthMode = "sign-in" | "sign-up" | "forgot-password";

interface EmailAuthFormProps {
  authDisabled?: boolean;
}

const compactFieldSx = {
  "& .MuiInputBase-root": { fontSize: { xs: "0.875rem", sm: "1rem" } },
};

export const EmailAuthForm = ({ authDisabled = false }: EmailAuthFormProps) => {
  const { login, signUp, requestPasswordReset, loading, clearAuthError } = useAuthContext();
  const { validateEmailField, validatePasswordField } = useEmailAuthValidation();
  const resetRedirect = useAuthRedirect();
  const [mode, setMode] = useState<EmailAuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isForgotMode = mode === "forgot-password";
  const displayError = validationError;

  const handleModeChange = (_: React.MouseEvent<HTMLElement>, newMode: EmailAuthMode | null) => {
    if (!newMode) return;
    setMode(newMode);
    setValidationError(null);
    setSuccessMessage(null);
    clearAuthError();
  };

  const handleForgotPassword = () => {
    setMode("forgot-password");
    setValidationError(null);
    setSuccessMessage(null);
    clearAuthError();
  };

  const handleBackToSignIn = () => {
    setMode("sign-in");
    setValidationError(null);
    setSuccessMessage(null);
    clearAuthError();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (authDisabled) {
      return;
    }
    setValidationError(null);
    setSuccessMessage(null);
    clearAuthError();

    const emailError = validateEmailField(email);
    if (emailError) {
      setValidationError(emailError);
      return;
    }

    if (isForgotMode) {
      const sent = await requestPasswordReset(email);
      if (sent) {
        setSuccessMessage(PASSWORD_RESET_SENT_MESSAGE);
      }
      return;
    }

    const passwordError = validatePasswordField(password);
    if (passwordError) {
      setValidationError(passwordError);
      return;
    }

    resetRedirect();

    if (mode === "sign-up") {
      const credentials: SignUpCredentials = { email: email.trim(), password };
      await signUp(credentials);
      return;
    }

    const credentials: LoginCredentials = { email: email.trim(), password };
    await login(credentials);
  };

  const submitLabel = (() => {
    if (loading) return "Please wait…";
    if (isForgotMode) return "Send reset link";
    if (mode === "sign-up") return "Create account";
    return "Sign in with email";
  })();

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
      {!isForgotMode && (
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={handleModeChange}
          fullWidth
          size="small"
          sx={{ mb: formStackSpacing.section }}
        >
          <ToggleButton value="sign-in">Sign in</ToggleButton>
          <ToggleButton value="sign-up">Sign up</ToggleButton>
        </ToggleButtonGroup>
      )}

      {displayError && (
        <Alert severity="error" sx={formInlineAlertSx}>
          {displayError}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={formInlineAlertSx}>
          {successMessage}
        </Alert>
      )}

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
        required
        fullWidth
        size="small"
        margin="dense"
        autoComplete="email"
        sx={compactFieldSx}
      />

      {!isForgotMode && (
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
          required
          fullWidth
          size="small"
          margin="dense"
          autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
          sx={compactFieldSx}
        />
      )}

      {mode === "sign-in" && (
        <Box sx={{ textAlign: "right", mt: 0.5 }}>
          <Link component="button" type="button" variant="caption" onClick={handleForgotPassword}>
            Forgot password?
          </Link>
        </Box>
      )}

      {isForgotMode && (
        <Box sx={{ mt: 0.5 }}>
          <Link component="button" type="button" variant="caption" onClick={handleBackToSignIn}>
            Back to sign in
          </Link>
        </Box>
      )}

      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={loading || authDisabled}
        sx={{ mt: formStackSpacing.section }}
      >
        {submitLabel}
      </Button>

      {mode === "sign-up" && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: "block", lineHeight: 1.35 }}
        >
          By creating an account you agree to our terms of service.
        </Typography>
      )}
    </Box>
  );
};
