import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthWrapper } from "./components/auth/AuthWrapper.jsx";
import ErrorBoundary from "./components/auth/ErrorBoundary.jsx";
import { DisplaySettingsProvider } from "./hooks/useDisplaySettings.jsx";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "sonner";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <DisplaySettingsProvider>
        <TooltipProvider>
          <AuthWrapper>
            <App />
          </AuthWrapper>
          <Toaster />
        </TooltipProvider>
      </DisplaySettingsProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
