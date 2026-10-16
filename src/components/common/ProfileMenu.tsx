import { useAuthContext } from "@/shared/context/AuthContext";
import { useAuthBackendConfigured } from "@/shared/hooks/useAuthBackendConfigured";
import { useUserProfileQuery } from "@/features/auth/hooks/useUserProfileQuery";
import { ProfileMenuContent } from "./ProfileMenu/ProfileMenuContent";
import { ProfileMenuTrigger } from "./ProfileMenu/ProfileMenuTrigger";
import { getAnchorMenuProps } from "./ProfileMenu/anchorMenuProps";
import { useAccountMenuActions } from "./ProfileMenu/hooks/useAccountMenuActions";
import { useAnchorMenuState } from "./ProfileMenu/hooks/useAnchorMenuState";

import Menu from "@mui/material/Menu";

interface ProfileMenuProps {
  anchorEl?: HTMLElement | null;
  onClose?: () => void;
}

/**
 * ProfileMenu component for displaying user account information and sign-in options.
 * Shows sign-in buttons when user is not logged in, and profile/logout when logged in.
 */
export const ProfileMenu = ({
  anchorEl: externalAnchorEl,
  onClose: externalOnClose,
}: ProfileMenuProps) => {
  const { user } = useAuthContext();
  const { data: profile, isLoading: profileLoading } = useUserProfileQuery(user?.id ?? null);
  const { isConfigured: authBackendConfigured } = useAuthBackendConfigured();

  const { anchorEl, open, handleClick, handleClose } = useAnchorMenuState({
    externalAnchorEl,
    externalOnClose,
  });

  const { handleSignIn, handleGoToLogin, handleSignOut } = useAccountMenuActions({
    onClose: handleClose,
  });

  const menuContent = (
    <ProfileMenuContent
      isLoggedIn={user !== null}
      authBackendConfigured={authBackendConfigured}
      user={user}
      profile={profile ?? null}
      profileLoading={profileLoading}
      onSignInWithGoogle={handleSignIn}
      onGoToLogin={handleGoToLogin}
      onSignOut={handleSignOut}
    />
  );

  const menuProps = getAnchorMenuProps(anchorEl, open, handleClose);

  if (!externalAnchorEl) {
    return (
      <>
        <ProfileMenuTrigger
          user={user}
          profile={profile ?? null}
          onClick={handleClick}
          open={open}
        />
        <Menu {...menuProps}>{menuContent}</Menu>
      </>
    );
  }

  return <Menu {...menuProps}>{menuContent}</Menu>;
};
