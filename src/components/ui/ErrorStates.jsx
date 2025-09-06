import { AlertCircle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { cn } from "../../lib/utils";

export function ErrorBoundaryFallback({ error, resetErrorBoundary, className }) {
  return (
    <div className={cn("min-h-[400px] flex items-center justify-center p-6", className)}>
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-destructive">Something went wrong</CardTitle>
          <CardDescription>
            An unexpected error occurred. We've been notified and are working on a fix.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error?.message && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-mono text-muted-foreground break-words">
                {error.message}
              </p>
            </div>
          )}
          <div className="flex gap-2 justify-center">
            <Button onClick={resetErrorBoundary} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={() => window.location.href = "/"} variant="secondary" size="sm">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function NotFound({ title = "Page Not Found", description = "The page you're looking for doesn't exist.", onBack, className }) {
  return (
    <div className={cn("min-h-[400px] flex items-center justify-center p-6", className)}>
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto text-6xl font-bold text-muted-foreground mb-4">404</div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 justify-center">
            {onBack && (
              <Button onClick={onBack} variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            )}
            <Button onClick={() => window.location.href = "/"} variant="default" size="sm">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function EmptyState({ 
  icon: Icon = AlertCircle, 
  title = "No data available", 
  description = "There's nothing to show here yet.", 
  action,
  actionLabel = "Get Started",
  className 
}) {
  return (
    <div className={cn("min-h-[300px] flex items-center justify-center p-6", className)}>
      <div className="text-center space-y-4 max-w-md">
        <div className="mx-auto w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center">
          <Icon className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {action && (
          <Button onClick={action} className="mt-4">
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

export function NetworkError({ onRetry, className }) {
  return (
    <div className={cn("min-h-[200px] flex items-center justify-center p-6", className)}>
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-warning" />
          </div>
          <CardTitle>Connection Error</CardTitle>
          <CardDescription>
            Unable to connect to our servers. Please check your internet connection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onRetry} variant="outline" size="sm" className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Connection
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}