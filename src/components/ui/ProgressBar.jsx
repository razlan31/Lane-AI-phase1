// src/components/ui/ProgressBar.jsx
import React from "react";
import { cn } from "../../lib/utils";

/**
 * ProgressBar
 * Small, reusable progress bar component.
 * Use instead of inlining a local Progress const in pages.
 *
 * Props:
 * - value: 0..100
 * - className: optional extra classes
 */

const ProgressBar = ({ value = 0, className = "" }) => {
  const pct = Math.max(0, Math.min(100, Number(value || 0)));
  return (
    <div className={cn("w-full bg-secondary rounded-full h-2", className)}>
      <div
        className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${pct}%` }}
        aria-valuenow={pct}
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
      />
    </div>
  );
};

export default ProgressBar;