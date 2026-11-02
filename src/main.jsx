
import React from "react";
import ReactDOM from "react-dom/client";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import App from "./App";
import "./index.css";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#FF2E2E",
    },
    background: {
      default: "#050505",
      paper: "#111111",
    },
  },
  typography: {
    fontFamily: "Inter, sans-serif",
  },
  shape: {
    borderRadius: 14,
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
