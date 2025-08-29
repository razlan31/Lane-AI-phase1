// src/components/notifications/AlertStrip.jsx
import React from "react";

/**
 * AlertStrip
 * Displays a list of alert/warning messages.
 * Exported as both default and named to avoid import errors.
 *
 * Props:
 * - alerts: [{ text: string, level: 'warn' | 'error' }]
 *
 * Safe, minimal markup, accessible (aria-live).
 */

const AlertStrip = ({ alerts = [] }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="w-full space-y-2" role="region" aria-label="Alerts">
      {alerts.map((a, i) => {
        const base = "rounded p-2 text-sm";
        const cls =
          a.level === "error"
            ? `${base} bg-red-50 text-red-700 border border-red-100`
            : `${base} bg-yellow-50 text-yellow-800 border border-yellow-100`;
        return (
          <div key={i} className={cls} role="status" aria-live="polite">
            {a.text}
          </div>
        );
      })}
    </div>
  );
};

// named export (so `import { AlertStrip } from '...'` works)
export { AlertStrip };

// default export (so `import AlertStrip from '...'` also works)
export default AlertStrip;