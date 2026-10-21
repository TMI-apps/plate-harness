import type { UserProfile } from "@/features/auth/types/auth.types";
import { getRoleDisplay } from "@/shared/utils/profileHelpers";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";

interface ProfileChipsProps {
  profile: UserProfile;
}

export const ProfileChips = ({ profile }: ProfileChipsProps) => {
  const roleDisplay = getRoleDisplay(profile);
  const hasCredits = profile.remaining_credits !== null && profile.remaining_credits !== undefined;
  const hasOrganization = Boolean(profile.ef_nl_edu_person_home_organization);

  if (!roleDisplay && !hasCredits && !hasOrganization) {
    return null;
  }

  return (
    <Box sx={{ display: "flex", gap: 0.5, mt: 0.5, flexWrap: "wrap" }}>
      {roleDisplay && (
        <Chip
          label={roleDisplay}
          size="small"
          variant="outlined"
          sx={{ fontSize: (theme) => theme.typography.caption.fontSize }}
        />
      )}
      {hasCredits && (
        <Chip
          label={`${profile.remaining_credits} credits`}
          size="small"
          variant="outlined"
          color="primary"
          sx={{ fontSize: (theme) => theme.typography.caption.fontSize }}
        />
      )}
      {hasOrganization && (
        <Chip
          label={profile.ef_nl_edu_person_home_organization}
          size="small"
          variant="outlined"
          sx={{ fontSize: (theme) => theme.typography.caption.fontSize }}
        />
      )}
    </Box>
  );
};
