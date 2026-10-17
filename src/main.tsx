import React from "react";
import ReactDOM from "react-dom/client";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import "@fontsource-variable/inter/standard.css";
import "@fontsource-variable/inter/standard-italic.css";
import AppRouter from "./AppRouter";
import { PreviewRoleProvider } from "./components/PreviewRoleContext";
import { LanguageProvider } from "./i18n/Language";
import "./styles.css";
import "./logistics/styles.css";
import "./prototype.css";
import "./refinement.css";
import "./brand-foundation.css";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <FluentProvider
      theme={{
        ...webLightTheme,
        fontFamilyBase:
          '"Inter Variable", Inter, "Segoe UI", system-ui, sans-serif',
        fontFamilyNumeric:
          '"Inter Variable", Inter, "Segoe UI", system-ui, sans-serif',
      }}
    >
      <LanguageProvider>
        <PreviewRoleProvider>
          <AppRouter />
        </PreviewRoleProvider>
      </LanguageProvider>
    </FluentProvider>
  </React.StrictMode>,
);
