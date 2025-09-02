import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import AuthGate from "./components/auth/AuthGate.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthGate />
  </React.StrictMode>
);
