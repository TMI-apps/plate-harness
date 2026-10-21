/**
 * Active MUI theme. Edit tokens and overrides in ./defaultTheme.ts.
 *
 * Usage:
 * ```tsx
 * import { theme } from "@/shared/theme/theme";
 * import { ThemeProvider } from "@mui/material/styles";
 *
 * <ThemeProvider theme={theme}>
 *   <App />
 * </ThemeProvider>
 * ```
 */

import { createTheme } from "@mui/material/styles";
import { defaultThemeOptions } from "./defaultTheme";

export const theme = createTheme(defaultThemeOptions);
