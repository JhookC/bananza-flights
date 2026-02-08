import { createTheme, type ThemeOptions } from "@mui/material/styles";
import type {} from "@mui/x-date-pickers/themeAugmentation";
import type { CSSProperties } from "react";

declare module "@mui/material/styles" {
  interface TypographyVariants {
    price: CSSProperties;
  }
  interface TypographyVariantsOptions {
    price?: CSSProperties & Record<string, unknown>;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    price: true;
  }
}

const FONT_FAMILY = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";

const colors = {
  navy: "#1D2530",
  gold: "#FBCB46",
  goldDark: "#E0B53E",
  success: "#34C759",
  error: "#FF453A",
  info: "#5B9CF6",
  light: {
    background: "#F7F8FA",
    surface: "#FFFFFF",
    textPrimary: "#1D2530",
    textSecondary: "#5A6474",
    border: "#E2E5EA",
  },
  dark: {
    background: "#121820",
    surface: "#1D2530",
    textPrimary: "#F7F8FA",
    textSecondary: "#9BA4B0",
    border: "#2D3644",
  },
};

export function createAppTheme(mode: "light" | "dark") {
  const isDark = mode === "dark";
  const tokens = isDark ? colors.dark : colors.light;

  const options: ThemeOptions = {
    palette: {
      mode,
      primary: {
        main: colors.navy,
        contrastText: "#FFFFFF",
      },
      secondary: {
        main: colors.gold,
        dark: colors.goldDark,
        contrastText: colors.navy,
      },
      background: {
        default: tokens.background,
        paper: tokens.surface,
      },
      text: {
        primary: tokens.textPrimary,
        secondary: tokens.textSecondary,
      },
      divider: tokens.border,
      success: { main: colors.success },
      error: { main: colors.error },
      info: { main: colors.info },
      warning: { main: colors.gold },
    },

    typography: {
      fontFamily: FONT_FAMILY,
      h1: {
        fontSize: "1.75rem",
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: "-0.02em",
        "@media (min-width:900px)": { fontSize: "2.25rem" },
      },
      h2: {
        fontSize: "1.375rem",
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: "-0.02em",
        "@media (min-width:900px)": { fontSize: "1.75rem" },
      },
      h3: {
        fontSize: "1.125rem",
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: "-0.02em",
        "@media (min-width:900px)": { fontSize: "1.375rem" },
      },
      body1: {
        fontSize: "1rem",
        fontWeight: 400,
        lineHeight: 1.5,
      },
      body2: {
        fontSize: "0.875rem",
        fontWeight: 400,
        lineHeight: 1.5,
      },
      caption: {
        fontSize: "0.75rem",
        fontWeight: 400,
        lineHeight: 1.4,
      },
      button: {
        fontSize: "0.875rem",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      },
      price: {
        fontSize: "1.375rem",
        fontWeight: 700,
        lineHeight: 1.2,
        fontFamily: FONT_FAMILY,
        "@media (min-width:900px)": { fontSize: "1.625rem" },
      },
    },

    shape: {
      borderRadius: 10,
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            margin: 0,
          },
        },
      },

      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 10,
            minHeight: 44,
            "@media (min-width:900px)": { minHeight: 48 },
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          },
          containedSecondary: {
            backgroundColor: colors.gold,
            color: colors.navy,
            "&:hover": {
              backgroundColor: colors.goldDark,
            },
            "&.Mui-disabled": {
              backgroundColor: "rgba(251, 203, 70, 0.35)",
              color: "rgba(29, 37, 48, 0.4)",
            },
          },
          outlinedPrimary: isDark
            ? {
                borderColor: colors.gold,
                color: colors.gold,
                "&:hover": {
                  borderColor: colors.gold,
                  backgroundColor: "rgba(251, 203, 70, 0.08)",
                },
              }
            : {
                borderColor: colors.navy,
                color: colors.navy,
                "&:hover": {
                  borderColor: colors.navy,
                  backgroundColor: "rgba(29, 37, 48, 0.08)",
                },
              },
          text: {
            color: colors.gold,
          },
        },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            minHeight: 48,
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: colors.gold,
              borderWidth: 2,
            },
          },
          notchedOutline: {
            borderColor: tokens.border,
          },
        },
      },

      MuiInputLabel: {
        styleOverrides: {
          root: {
            "&.Mui-focused": {
              color: colors.gold,
            },
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            transition: "transform 200ms ease, box-shadow 200ms ease",
            ...(isDark && {
              border: `1px solid ${colors.dark.border}`,
            }),
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: isDark
                ? "0 8px 24px rgba(0,0,0,0.4)"
                : "0 8px 24px rgba(0,0,0,0.12)",
            },
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            height: 32,
            transition: "all 150ms ease",
          },
        },
      },

      MuiSlider: {
        styleOverrides: {
          root: {
            color: colors.gold,
          },
          thumb: {
            width: 20,
            height: 20,
            backgroundColor: isDark ? colors.dark.surface : "#FFFFFF",
            border: `2px solid ${colors.gold}`,
            "&:hover, &.Mui-focusVisible": {
              boxShadow: `0 0 0 8px rgba(251, 203, 70, 0.16)`,
            },
          },
          rail: {
            backgroundColor: isDark
              ? colors.dark.border
              : colors.light.border,
          },
        },
      },

      MuiAutocomplete: {
        styleOverrides: {
          paper: {
            borderRadius: 10,
          },
          listbox: {
            maxHeight: 300,
          },
          option: {
            minHeight: 48,
          },
        },
      },

      MuiPickersDay: {
        styleOverrides: {
          root: {
            "&.Mui-selected": {
              backgroundColor: colors.gold,
              color: colors.navy,
              "&:hover, &:focus": {
                backgroundColor: colors.goldDark,
              },
            },
          },
        },
      },

      MuiPaper: {
        defaultProps: {
          elevation: isDark ? 2 : 1,
        },
      },
    },
  };

  return createTheme(options);
}
