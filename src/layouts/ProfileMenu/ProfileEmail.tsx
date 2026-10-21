import Typography from "@mui/material/Typography";

interface ProfileEmailProps {
  email: string;
}

export const ProfileEmail = ({ email }: ProfileEmailProps) => {
  return (
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{
        display: "block",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {email}
    </Typography>
  );
};
