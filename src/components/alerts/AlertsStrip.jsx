import React from 'react';
import { AlertTriangle, TrendingDown, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

const AlertsStrip = ({ alerts = [] }) => {
  // Mock alerts data - replace with real data from Supabase
  const mockAlerts = [
    {
      id: 1,
      type: 'warning',
      message: "Spending up 20% this month",
      icon: TrendingDown,
      timestamp: new Date()
    },
    {
      id: 2,
      type: 'alert',
      message: "Cash runway under 3 months",
      icon: Clock,
      timestamp: new Date()
    }
  ];

  const displayAlerts = alerts.length > 0 ? alerts : mockAlerts;

  if (displayAlerts.length === 0) {
    return (
      <div className="border border-dashed border-border rounded-lg p-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <AlertTriangle className="h-4 w-4" />
          <span>No alerts at this time</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium text-foreground">Active Alerts</h3>
      <div className="space-y-2">
        {displayAlerts.map((alert) => {
          const IconComponent = alert.icon || AlertTriangle;
          return (
            <div
              key={alert.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border",
                alert.type === 'warning' && "bg-warning/10 border-warning text-warning-foreground",
                alert.type === 'alert' && "bg-destructive/10 border-destructive text-destructive-foreground"
              )}
            >
              <IconComponent className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm font-medium">{alert.message}</span>
              <span className="text-xs text-muted-foreground ml-auto">
                {alert.timestamp.toLocaleDateString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AlertsStrip;