/**
 * MUI Theme Configuration
 *
 * This file contains ALL app styling, colors, typography, and component overrides.
 * It is the single source of truth for visual design in the application.
 *
 * Structure:
 * - palette: All color definitions (primary, secondary, background, text, etc.)
 * - typography: Font families, sizes, weights for all text elements
 * - components: MUI component style overrides
 *
 * Principles:
 * - Use palette references instead of hardcoded colors where possible
 * - All component styling should be defined here, not in individual components
 * - Use sx prop in components only for layout/spacing, not colors/styling
 */

import { ThemeOptions, Theme, alpha } from "@mui/material/styles";

// Color constants - define once, reference everywhere
const COLORS = {
  primary: "#CF13B3",
  secondary: "#E6196B",
  background: {
    default: "#070614",
    paper: "#1C1B29",
  },
  text: {
    primary: "#ffffff",
    secondary: "#F5F5F7",
  },
  gradient: {
    start: "#8D0BD1",
    end: "#CF13B3",
  },
} as const;

export const defaultThemeOptions: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: {
      main: COLORS.primary,
    },
    secondary: {
      main: COLORS.secondary,
      light: "rgba(230, 25, 107, 0.2)",
      dark: "#C0145A",
    },
    background: {
      default: COLORS.background.default,
      paper: COLORS.background.paper,
    },
    text: {
      primary: COLORS.text.primary,
      secondary: COLORS.text.secondary,
    },
  },
  typography: {
    fontFamily: "Montserrat, sans-serif",
    h1: {
      fontFamily: "Montserrat, sans-serif",
      fontWeight: 700,
    },
    h2: {
      fontFamily: "Montserrat, sans-serif",
      fontWeight: 700,
    },
    h3: {
      fontFamily: "Montserrat, sans-serif",
      fontWeight: 700,
    },
    h4: {
      fontFamily: "Montserrat, sans-serif",
      fontWeight: 700,
    },
    h5: {
      fontFamily: "Montserrat, sans-serif",
      fontWeight: 700,
    },
    h6: {
      fontFamily: "Montserrat, sans-serif",
      fontWeight: 700,
    },
    // Use MUI's built-in body2 variant for code text (0.875rem)
    // Keep Montserrat for consistency across the app
    body2: {
      fontSize: "0.875rem",
    },
    // Use MUI's built-in caption variant for small text
    // Customize fontSize to 0.65rem for small chips
    caption: {
      fontSize: "0.65rem",
    },
  },
  components: {
    // AppBar styling
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "background.paper",
          color: "text.primary",
        },
      },
    },
    // Toolbar styling
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 64,
        },
      },
    },
    // Link styling - handles all anchor tags and Link components
    MuiLink: {
      styleOverrides: {
        root: {
          color: "text.primary",
          textDecoration: "none",
          "&:hover": {
            color: "primary.main",
            textDecoration: "none",
          },
        },
      },
    },
    // Button styling
    // All button styling is centralized here. Variants determine colors automatically:
    // - contained: uses primary color (main actions)
    // - outlined: uses white color (secondary actions)
    // - text: uses primary color (text buttons)
    // Components should NOT specify color prop - variant handles it.
    MuiButton: {
      defaultProps: {
        color: "primary", // Default color for all buttons
      },
      styleOverrides: {
        root: {
          borderRadius: 32,
          height: 48,
          padding: "8px 24px",
        },
        // Contained variant: primary color (main actions)
        contained: {
          background: `linear-gradient(45deg, ${COLORS.gradient.start} 0%, ${COLORS.primary} 30%, ${COLORS.gradient.start} 60%, ${COLORS.primary} 90%, ${COLORS.gradient.start} 100%)`,
          backgroundSize: "200% 200%",
          backgroundPosition: "0% 50%",
          border: 0,
          boxShadow: "0 3px 5px 2px rgba(0, 0, 0, 0.4)",
          color: COLORS.text.primary,
          transition: "background-position 0.6s ease",
          "&:hover": {
            backgroundPosition: "100% 50%",
          },
          "&:active": {
            boxShadow: "0 2px 4px 1px rgba(0, 0, 0, 0.5)",
          },
        },
        // Text variant: primary color
        text: {
          color: COLORS.primary,
          "&:hover": {
            backgroundColor: "rgba(207, 19, 179, 0.1)",
          },
        },
        // Outlined variant: white color (secondary actions)
        // On hover, gradient slides from transparent to white, text changes to dark
        // Background size ensures gradient is only visible during transition
        outlined: {
          borderColor: COLORS.text.primary,
          color: COLORS.text.primary,
          backgroundColor: "transparent",
          position: "relative",
          overflow: "hidden",
          isolation: "isolate",
          transition: "color 0.6s ease",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(45deg, transparent 0%, transparent 45%, ${COLORS.text.primary} 75%, ${COLORS.text.primary} 100%)`,
            backgroundSize: "250% 250%",
            backgroundPosition: "0% 50%",
            transition: "background-position 0.6s ease",
            zIndex: -1,
            borderRadius: "inherit",
          },
          "&:hover": {
            color: COLORS.background.default,
            "&::before": {
              backgroundPosition: "100% 50%",
            },
          },
        },
      },
    },
    // CssBaseline customization - handles global styles
    MuiCssBaseline: {
      styleOverrides: {
        code: ({ theme }: { theme: Theme }) => ({
          fontFamily: theme.typography.fontFamily, // Use Montserrat for consistency
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
        }),
        pre: ({ theme }: { theme: Theme }) => ({
          fontFamily: theme.typography.fontFamily, // Use Montserrat for consistency
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
        }),
        "*": {
          boxSizing: "border-box",
          // Firefox scrollbar styling
          scrollbarWidth: "thin",
          scrollbarColor: `${alpha(COLORS.text.primary, 0.3)} transparent`,
        },
        "*::-webkit-scrollbar": {
          width: "8px",
          height: "8px",
        },
        "*::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "*::-webkit-scrollbar-thumb": {
          backgroundColor: alpha(COLORS.text.primary, 0.3),
          borderRadius: "4px",
          "&:hover": {
            backgroundColor: alpha(COLORS.text.primary, 0.5),
          },
        },
        body: {
          margin: 0,
          minHeight: "100vh",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
      },
    },
    // Typography component styling - handles code elements via component="code"
    MuiTypography: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          "& code": {
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
            padding: "2px 4px",
            borderRadius: 1,
            fontSize: theme.typography.body2.fontSize,
            fontFamily: theme.typography.fontFamily, // Use Montserrat for consistency
          },
        }),
      },
    },
    // Chip component styling - small chips with custom height
    MuiChip: {
      styleOverrides: {
        sizeSmall: ({ theme }: { theme: Theme }) => ({
          height: 20, // Fixed height for small chips
          fontSize: theme.typography.caption.fontSize,
        }),
      },
    },
  },
};
