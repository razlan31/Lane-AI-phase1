// src/components/ui/ProgressBar.jsx
import { forwardRef } from "react";
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

const ProgressBar = ({ 
  value = 0, 
  max = 100, 
  className = "",
  variant = 'default',
  size = 'default'
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const variants = {
    default: 'bg-primary',
    destructive: 'bg-destructive',
    warning: 'bg-orange-500',
    success: 'bg-green-500'
  };

  const sizes = {
    sm: 'h-1',
    default: 'h-2',
    lg: 'h-3'
  };

  return (
    <div className={cn(
      'w-full bg-muted rounded-full overflow-hidden',
      sizes[size],
      className
    )}>
      <div 
        className={cn(
          'h-full transition-all duration-300 ease-out rounded-full',
          variants[variant]
        )}
        style={{ width: `${percentage}%` }}
        aria-valuenow={percentage}
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
      />
    </div>
  );
};

export { ProgressBar };
export default ProgressBar;