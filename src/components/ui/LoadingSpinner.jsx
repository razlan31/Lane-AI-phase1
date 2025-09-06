import { cn } from "../../lib/utils";

export function LoadingSpinner({ className, size = "default", ...props }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function LoadingDots({ className, ...props }) {
  return (
    <div className={cn("flex space-x-1", className)} {...props}>
      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
    </div>
  );
}

export function LoadingSkeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "loading-shimmer rounded-md h-4",
        className
      )}
      {...props}
    />
  );
}

export function LoadingCard({ className, ...props }) {
  return (
    <div className={cn("animate-pulse", className)} {...props}>
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-muted rounded-full loading-shimmer"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted rounded loading-shimmer"></div>
            <div className="h-3 bg-muted rounded loading-shimmer w-3/4"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded loading-shimmer"></div>
          <div className="h-3 bg-muted rounded loading-shimmer w-5/6"></div>
        </div>
      </div>
    </div>
  );
}