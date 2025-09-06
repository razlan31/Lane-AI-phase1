import React from "react";
import ReactDOM from "react-dom/client";

// CRITICAL: Global React hooks check before any components load
window.ReactDebug = { React, ReactDOM };
console.log('🔍 CRITICAL - Global React check in index.jsx:', {
  React: !!React,
  ReactDOM: !!ReactDOM,
  ReactVersion: React.version,
  useState: !!React.useState,
  useCallback: !!React.useCallback,
  useEffect: !!React.useEffect,
  window: typeof window,
  document: typeof document,
  timestamp: new Date().toISOString()
});

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

console.log('🔍 index.jsx - React versions check:', { 
  React: !!React, 
  ReactDOM: !!ReactDOM,
  ReactVersion: React.version,
  timestamp: new Date().toISOString()
});

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
