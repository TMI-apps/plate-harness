import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import { ProfileInfo } from "./ProfileInfo";
import { SignInMenuItems } from "./SignInMenuItems";
import type { User } from "@/features/auth/types/auth.types";
import type { UserProfile } from "@/features/auth/types/auth.types";

import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";

interface ProfileMenuContentProps {
  isLoggedIn: boolean;
  authBackendConfigured: boolean;
  user: User | null;
  profile: UserProfile | null;
  profileLoading: boolean;
  onSignInWithGoogle: () => void;
  onGoToLogin: () => void;
  onSignOut: () => void;
}

export const ProfileMenuContent = ({
  isLoggedIn,
  authBackendConfigured,
  user,
  profile,
  profileLoading,
  onSignInWithGoogle,
  onGoToLogin,
  onSignOut,
}: ProfileMenuContentProps) => {
  if (isLoggedIn) {
    return (
      <>
        <ProfileInfo user={user} profile={profile} profileLoading={profileLoading} />
        <Divider key="divider" />
        <MenuItem key="sign-out" onClick={onSignOut}>
          <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
            <LogoutIcon fontSize="small" />
          </Box>
          Sign Out
        </MenuItem>
      </>
    );
  }

  if (authBackendConfigured) {
    return <SignInMenuItems onSignInWithGoogle={onSignInWithGoogle} onGoToLogin={onGoToLogin} />;
  }

  return (
    <MenuItem key="not-configured" disabled>
      <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
        <LoginIcon fontSize="small" />
      </Box>
      Supabase not configured
    </MenuItem>
  );
};
