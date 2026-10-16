import { Outlet } from "react-router-dom";
import { appViewportSx } from "@/shared/theme/appViewLayout";

import Container from "@mui/material/Container";
import Box from "@mui/material/Box";

export const MainLayout = () => {
  return (
    <Box sx={appViewportSx}>
      <Container
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <Outlet />
      </Container>
    </Box>
  );
};
