import React from "react";
import ReactDOM from "react-dom/client";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import AppRouter from "./AppRouter";
import "./styles.css";
import "./logistics/styles.css";
import "./prototype.css";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <FluentProvider theme={webLightTheme}>
      <AppRouter />
    </FluentProvider>
  </React.StrictMode>,
);
