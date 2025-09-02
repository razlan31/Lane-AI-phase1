// No React import needed for this component
import { cn } from '../../lib/utils';

const Progress = ({ value, className, ...props }) => (
  <div 
    className={cn("w-full bg-secondary rounded-full h-2", className)}
    {...props}
  >
    <div
      className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
      style={{ width: `${Math.min(100, Math.max(0, value || 0))}%` }}
    />
  </div>
);

export { Progress };