import { createTheme } from "@mui/material/styles";

export const getAppTheme = (mode = "dark") => {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,

      primary: {
        main: "#ff2e2e",
        dark: "#dc2626",
        light: "#ff7777",
        contrastText: "#ffffff",
      },

      secondary: {
        main: "#a1a1aa",
      },

      background: {
        default: isDark ? "#08090e" : "#f4f3f2",
        paper: isDark ? "#15161d" : "#ffffff",
      },

      text: {
        primary: isDark ? "#f5f5f7" : "#202027",
        secondary: isDark ? "#b0b0bb" : "#62626c",
        disabled: isDark ? "#858591" : "#92929b",
      },

      divider: isDark
        ? "rgba(255,255,255,0.12)"
        : "rgba(0,0,0,0.10)",

      success: {
        main: "#22c55e",
      },

      error: {
        main: "#ef4444",
      },

      warning: {
        main: "#f59e0b",
      },

      info: {
        main: "#3b82f6",
      },
    },

    typography: {
      fontFamily: '"Inter", sans-serif',

      h1: {
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        fontWeight: 800,
      },
      h2: {
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        fontWeight: 700,
      },
      h3: {
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        fontWeight: 700,
      },
      h4: {
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        fontWeight: 700,
      },
      h5: {
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        fontWeight: 700,
      },
      h6: {
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        fontWeight: 700,
      },
      button: {
        fontFamily: '"Inter", sans-serif',
        fontWeight: 600,
        textTransform: "none",
      },
      body1: {
        fontFamily: '"Inter", sans-serif',
      },
      body2: {
        fontFamily: '"Inter", sans-serif',
      },
    },

    shape: {
      borderRadius: 12,
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: "var(--bg-primary)",
            color: "var(--text-primary)",
            transition: "background-color 0.3s ease, color 0.3s ease",
          },

          "*": {
            scrollbarColor: isDark
              ? "#555 #08090e"
              : "#b8b8b8 #f4f3f2",
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            color: "var(--text-primary)",
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: "var(--bg-glass)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--glass-shadow)",
            backgroundImage: "none",
          },
        },
      },

      MuiTypography: {
        styleOverrides: {
          root: {
            color: "inherit",
          },
        },
      },

      MuiInputBase: {
        styleOverrides: {
          root: {
            color: "var(--text-primary)",
            fontFamily: '"Inter", sans-serif',
          },
          input: {
            "&::placeholder": {
              color: "var(--text-muted)",
              opacity: 1,
            },
          },
        },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: "var(--input-bg)",

            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--border-color)",
            },

            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#ff2e2e",
            },

            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#ff2e2e",
            },
          },
        },
      },

      MuiSelect: {
        styleOverrides: {
          icon: {
            color: "var(--text-secondary)",
          },
        },
      },

      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: "var(--surface-elevated)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--glass-shadow)",
          },
        },
      },

      MuiMenuItem: {
        styleOverrides: {
          root: {
            color: "var(--text-primary)",

            "&:hover": {
              backgroundColor: "var(--surface-hover)",
            },

            "&.Mui-selected": {
              backgroundColor: "rgba(255,46,46,0.12)",
            },
          },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            color: "var(--text-primary)",
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 12,
          },
        },
      },

      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? "#272832" : "#202027",
            color: "#ffffff",
            fontSize: "12px",
          },
        },
      },

      MuiTableCell: {
        styleOverrides: {
          root: {
            color: "var(--text-primary)",
            borderBottom: "1px solid var(--border-color)",
          },
          head: {
            color: "var(--text-secondary)",
            fontWeight: 600,
          },
        },
      },

      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: "var(--surface-elevated)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-color)",
            backgroundImage: "none",
            borderRadius: 20,
          },
        },
      },

      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: "var(--text-secondary)",
            "&.Mui-checked": {
              color: "#ff2e2e",
            },
          },
        },
      },

      MuiSwitch: {
        styleOverrides: {
          switchBase: {
            "&.Mui-checked": {
              color: "#ff2e2e",
            },
            "&.Mui-checked + .MuiSwitch-track": {
              backgroundColor: "#ff2e2e",
            },
          },
        },
      },
    },
  });
};