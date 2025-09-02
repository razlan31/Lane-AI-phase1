import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AuthWrapper from "./components/auth/AuthWrapper.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthWrapper />
  </StrictMode>
);
