import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import AuthWrapper from "./components/auth/AuthWrapper.jsx";
import ErrorBoundary from "./components/auth/ErrorBoundary.jsx";
import { DisplaySettingsProvider } from "./hooks/useDisplaySettings.jsx";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "sonner";

createRoot(document.getElementById("root")).render(
  <StrictMode>
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
  </StrictMode>
);
