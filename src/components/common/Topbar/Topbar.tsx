import { Link } from "react-router-dom";
import { ProfileMenu } from "@/components/common/ProfileMenu";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

/**
 * Topbar component that is always visible.
 * This component is designed to be reusable across all apps.
 */
export const Topbar = () => {
  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Box
            component={Link}
            to="/"
            sx={{
              color: "primary.main",
              textDecoration: "none",
              "&:hover": {
                textDecoration: "none",
              },
            }}
          >
            plate-harness
          </Box>
        </Typography>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <ProfileMenu />
        </Box>
      </Toolbar>
    </AppBar>
  );
};
