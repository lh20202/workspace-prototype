import React from "react";
import ReactDOM from "react-dom/client";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import AppRouter from "./AppRouter";
import "./styles.css";
import "./logistics/styles.css";
import "./prototype.css";
import "./refinement.css";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <FluentProvider
      theme={{
        ...webLightTheme,
        fontFamilyBase:
          '"Segoe UI", "Segoe UI Variable", system-ui, sans-serif',
        fontFamilyNumeric:
          '"Segoe UI", "Segoe UI Variable", system-ui, sans-serif',
      }}
    >
      <AppRouter />
    </FluentProvider>
  </React.StrictMode>,
);
