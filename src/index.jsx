import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AuthWrapper from "./components/auth/AuthWrapper.jsx";
import { DisplaySettingsProvider } from "./hooks/useDisplaySettings.jsx";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "sonner";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <DisplaySettingsProvider>
      <TooltipProvider>
        <AuthWrapper />
        <Toaster />
      </TooltipProvider>
    </DisplaySettingsProvider>
  </StrictMode>
);
