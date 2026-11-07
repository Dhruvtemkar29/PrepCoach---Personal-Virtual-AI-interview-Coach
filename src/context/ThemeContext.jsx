import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { getAppTheme } from "../theme/theme";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("prepcoach-theme");

    return savedTheme === "light" || savedTheme === "dark"
      ? savedTheme
      : "dark";
  });

  const isDark = theme === "dark";

  // Generate the MUI theme whenever the mode changes.
  const muiTheme = useMemo(
    () => getAppTheme(theme),
    [theme]
  );

  // Synchronize CSS variables and browser preference.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);

    document.documentElement.style.colorScheme = theme;

    localStorage.setItem("prepcoach-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) =>
      current === "dark" ? "light" : "dark"
    );
  };

  const value = {
    theme,
    isDark,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={muiTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
}