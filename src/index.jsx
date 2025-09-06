import React, { useState, useCallback, useEffect } from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./hooks/useAuth.jsx";
import { VenturesProvider } from "./hooks/useVentures.jsx";
import { AICopilotProvider } from "./hooks/useAICopilotProvider.jsx";
import ErrorBoundary from "./components/auth/ErrorBoundary.jsx";
import ReactHooksErrorBoundary from "./components/ReactHooksErrorBoundary.jsx";
import { AuthWrapper } from "./components/auth/AuthWrapper.jsx";
import { DisplaySettingsProvider } from "./hooks/useDisplaySettings.jsx";
import { TooltipProvider } from "./components/ui/tooltip";
import { PricingProvider } from "./contexts/PricingProvider.jsx";
import { Toaster } from "sonner";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ReactHooksErrorBoundary>
      <ErrorBoundary>
      <DisplaySettingsProvider>
        <TooltipProvider>
          <AuthProvider>
            <VenturesProvider>
              <AICopilotProvider>
                <PricingProvider>
                  <AuthWrapper>
                    <App />
                  </AuthWrapper>
                </PricingProvider>
              </AICopilotProvider>
            </VenturesProvider>
          </AuthProvider>
          <Toaster />
        </TooltipProvider>
      </DisplaySettingsProvider>
    </ErrorBoundary>
    </ReactHooksErrorBoundary>
  </React.StrictMode>
);