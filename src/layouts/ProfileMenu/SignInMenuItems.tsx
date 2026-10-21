import LoginIcon from "@mui/icons-material/Login";

import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";

interface SignInMenuItemsProps {
  onSignInWithGoogle: () => void;
  onGoToLogin: () => void;
}

export const SignInMenuItems = ({ onSignInWithGoogle, onGoToLogin }: SignInMenuItemsProps) => {
  return (
    <>
      <MenuItem key="sign-in-google" onClick={onSignInWithGoogle}>
        <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
          <LoginIcon fontSize="small" />
        </Box>
        Sign In with Google
      </MenuItem>
      <MenuItem key="go-to-login" onClick={onGoToLogin}>
        <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
          <LoginIcon fontSize="small" />
        </Box>
        Sign in with email
      </MenuItem>
    </>
  );
};
