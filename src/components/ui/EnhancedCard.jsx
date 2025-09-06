import { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { LoadingSpinner, LoadingSkeleton } from './LoadingSpinner';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from './card';

export const MetricCard = forwardRef(({ 
  title, 
  value, 
  description, 
  icon: Icon,
  trend,
  trendDirection = "up",
  loading = false,
  className,
  ...props 
}, ref) => {
  const getTrendColor = () => {
    if (trendDirection === "up") return "text-green-600";
    if (trendDirection === "down") return "text-red-600";
    return "text-yellow-600";
  };

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)} ref={ref} {...props}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <LoadingSkeleton className="h-4 w-20" />
            <div className="w-8 h-8 bg-muted rounded loading-shimmer" />
          </div>
        </CardHeader>
        <CardContent>
          <LoadingSkeleton className="h-8 w-32 mb-2" />
          <LoadingSkeleton className="h-3 w-24" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn("hover-lift", className)} 
      ref={ref} 
      {...props}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardDescription className="text-sm font-medium">
            {title}
          </CardDescription>
          {Icon && (
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon className="w-4 h-4 text-primary" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold text-foreground animate-fade-in">
            {value}
          </div>
          {trend && (
            <div className={cn("text-sm font-medium", getTrendColor())}>
              {trend}
            </div>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
});

MetricCard.displayName = "MetricCard";

export const ActionCard = forwardRef(({ 
  title, 
  description, 
  icon: Icon,
  action,
  actionLabel = "Get Started",
  loading = false,
  disabled = false,
  className,
  ...props 
}, ref) => {
  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)} ref={ref} {...props}>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-muted rounded-lg mx-auto loading-shimmer" />
            <div className="space-y-2">
              <LoadingSkeleton className="h-5 w-32 mx-auto" />
              <LoadingSkeleton className="h-4 w-48 mx-auto" />
            </div>
            <LoadingSkeleton className="h-10 w-24 mx-auto" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "border-dashed transition-all duration-200",
        !disabled && "hover:border-primary/50 hover:bg-primary/5 cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )} 
      ref={ref} 
      onClick={!disabled ? action : undefined}
      {...props}
    >
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          {Icon && (
            <div className="w-12 h-12 bg-primary/10 rounded-lg mx-auto flex items-center justify-center">
              <Icon className="w-6 h-6 text-primary" />
            </div>
          )}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {action && !disabled && (
            <button className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
              {actionLabel} →
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

ActionCard.displayName = "ActionCard";

export const StatusCard = forwardRef(({ 
  title, 
  status = "active",
  message,
  icon: Icon,
  actions = [],
  loading = false,
  className,
  ...props 
}, ref) => {
  const getStatusStyles = () => {
    switch (status) {
      case "success":
        return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950";
      case "warning":
        return "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950";
      case "error":
        return "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950";
      case "info":
        return "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950";
      default:
        return "border-border bg-card";
    }
  };

  const getStatusIconColor = () => {
    switch (status) {
      case "success":
        return "text-green-600 dark:text-green-400";
      case "warning":
        return "text-yellow-600 dark:text-yellow-400";
      case "error":
        return "text-red-600 dark:text-red-400";
      case "info":
        return "text-blue-600 dark:text-blue-400";
      default:
        return "text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)} ref={ref} {...props}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-muted rounded loading-shimmer" />
            <div className="flex-1 space-y-2">
              <LoadingSkeleton className="h-4 w-24" />
              <LoadingSkeleton className="h-3 w-48" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(getStatusStyles(), className)} 
      ref={ref} 
      {...props}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {Icon && (
            <div className={cn("mt-0.5", getStatusIconColor())}>
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div className="flex-1 space-y-1">
            <h4 className="text-sm font-medium text-foreground">{title}</h4>
            {message && (
              <p className="text-sm text-muted-foreground">{message}</p>
            )}
            {actions.length > 0 && (
              <div className="flex gap-2 mt-3">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

StatusCard.displayName = "StatusCard";