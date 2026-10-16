import type { SxProps, Theme } from "@mui/material/styles";

/** Shared max width for centered form surfaces (sign-in, home, reset password). */
export const formContentMaxWidth = 420;

/** Centered form column width for stacked auth-style surfaces. */
export const centeredFormSurfaceSx: SxProps<Theme> = {
  maxWidth: formContentMaxWidth,
  mx: "auto",
  width: "100%",
};

/** Full viewport column below the app toolbar (shell layouts and auth pages). */
export const appViewportSx: SxProps<Theme> = {
  minHeight: (theme) => `calc(100dvh - ${theme.mixins.toolbar.minHeight}px)`,
  maxHeight: (theme) => `calc(100dvh - ${theme.mixins.toolbar.minHeight}px)`,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  boxSizing: "border-box",
};

/** Scrollable centered content inside `appViewportSx`. */
export const appScrollContentSx: SxProps<Theme> = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
  minHeight: 0,
  py: { xs: 0.5, sm: 1.5 },
  px: { xs: 2, sm: 3 },
  overflowY: "auto",
  overflowX: "hidden",
};

/** Responsive vertical rhythm inside stacked form panels. */
export const formStackSpacing = {
  section: { xs: 1, sm: 1.5 },
  divider: { xs: 1, sm: 1.5 },
  footer: { xs: 1, sm: 1.5 },
} as const;

/** Inline form alerts (errors, success) shared across sign-in surfaces. */
export const formInlineAlertSx: SxProps<Theme> = {
  mb: formStackSpacing.section,
  py: { xs: 0.5, sm: 1 },
};
