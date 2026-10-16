import { Link as RouterLink, useLocation } from "react-router-dom";
import Fab from "@mui/material/Fab";

/**
 * Dev-only floating entry to /tasks (import.meta.env.DEV).
 */
export const DevTasksFab = () => {
  const location = useLocation();

  if (!import.meta.env.DEV || location.pathname === "/tasks") {
    return null;
  }

  return (
    <Fab
      component={RouterLink}
      to="/tasks"
      variant="extended"
      color="secondary"
      aria-label="Open dev task backlog"
      sx={{
        position: "fixed",
        right: 24,
        bottom: 24,
        zIndex: (theme) => theme.zIndex.modal - 1,
      }}
    >
      Tasks
    </Fab>
  );
};
