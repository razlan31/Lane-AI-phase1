// No React import needed
import { AlertTriangle, TrendingDown, Clock, X } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

const AlertsStrip = ({ alerts = [], loading = false, onDismiss }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-foreground">Active Alerts</h3>
        <div className="space-y-2">
          {[1, 2].map(i => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-foreground">Active Alerts</h3>
        <div className="border border-dashed border-border rounded-lg p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            <span>No alerts at this time</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium text-foreground">Active Alerts</h3>
      <div className="space-y-2">
        {alerts.map((alert) => {
          const getIcon = () => {
            if (alert.type === 'warning') return TrendingDown;
            if (alert.type === 'alert') return AlertTriangle;
            return Clock;
          };
          
          const IconComponent = getIcon();
          
          return (
            <div
              key={alert.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border",
                alert.type === 'warning' && "bg-amber-50 border-amber-200 text-amber-800",
                alert.type === 'alert' && "bg-red-50 border-red-200 text-red-800",
                alert.type === 'info' && "bg-blue-50 border-blue-200 text-blue-800"
              )}
            >
              <IconComponent className="h-4 w-4 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-medium">{alert.title}</div>
                <div className="text-xs">{alert.message}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {new Date(alert.created_at).toLocaleDateString()}
                </span>
                {onDismiss && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => onDismiss(alert.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AlertsStrip;