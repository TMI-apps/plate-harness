import VerifiedIcon from "@mui/icons-material/Verified";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface ProfileNameProps {
  displayName: string;
  isVerified: boolean;
}

export const ProfileName = ({ displayName, isVerified }: ProfileNameProps) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: (theme) => theme.typography.fontWeightBold,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {displayName}
      </Typography>
      {isVerified && (
        <VerifiedIcon
          fontSize="small"
          color="primary"
          sx={{ fontSize: (theme) => theme.typography.body2.fontSize, flexShrink: 0 }}
        />
      )}
    </Box>
  );
};
