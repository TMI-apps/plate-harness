import type { MenuProps } from "@mui/material/Menu";

export const getAnchorMenuProps = (
  anchorEl: HTMLElement | null,
  open: boolean,
  onClose: () => void,
  menuId = "account-menu"
): MenuProps => ({
  id: menuId,
  anchorEl,
  open,
  onClose,
  anchorOrigin: { vertical: "bottom" as const, horizontal: "right" as const },
  transformOrigin: { vertical: "top" as const, horizontal: "right" as const },
  slotProps: {
    paper: {
      sx: {
        mt: 1,
        minWidth: 240,
        maxWidth: 280,
      },
    },
  },
});
