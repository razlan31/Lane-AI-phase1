import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { X, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

const AlertStrip = ({ alerts = [], onDismiss }) => {
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));

  const handleDismiss = (alertId) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
    onDismiss?.(alertId);
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error':
        return XCircle;
      case 'warning':
        return AlertTriangle;
      case 'success':
        return CheckCircle;
      case 'info':
      default:
        return Info;
    }
  };

  const getAlertStyles = (type) => {
    switch (type) {
      case 'error':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'success':
        return 'bg-success/10 text-success border-success/20';
      case 'info':
      default:
        return 'bg-info/10 text-info border-info/20';
    }
  };

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="space-y-1">
      {visibleAlerts.map(alert => {
        const Icon = getAlertIcon(alert.type);
        
        return (
          <div
            key={alert.id}
            className={cn(
              "flex items-center gap-3 px-4 py-3 border-l-4 border-r border-t border-b",
              getAlertStyles(alert.type)
            )}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{alert.title}</div>
              {alert.message && (
                <div className="text-sm opacity-90 mt-1">{alert.message}</div>
              )}
            </div>

            {alert.action && (
              <Button
                size="sm"
                variant="outline"
                className="ml-4"
                onClick={alert.action.onClick}
              >
                {alert.action.label}
              </Button>
            )}

            {alert.dismissible !== false && (
              <Button
                size="sm"
                variant="ghost"
                className="ml-2 h-6 w-6 p-0"
                onClick={() => handleDismiss(alert.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Hook for managing alerts
export const useAlerts = () => {
  const [alerts, setAlerts] = useState([]);

  const addAlert = (alert) => {
    const newAlert = {
      id: Date.now() + Math.random(),
      type: 'info',
      dismissible: true,
      ...alert
    };
    setAlerts(prev => [...prev, newAlert]);
    
    // Auto-dismiss success messages after 5 seconds
    if (newAlert.type === 'success' && newAlert.dismissible !== false) {
      setTimeout(() => {
        removeAlert(newAlert.id);
      }, 5000);
    }
  };

  const removeAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  return {
    alerts,
    addAlert,
    removeAlert,
    clearAlerts
  };
};

// Named export for import { AlertStrip }
export { AlertStrip };

// Default export for import AlertStrip 
export default AlertStrip;