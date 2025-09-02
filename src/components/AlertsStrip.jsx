import React, { useState } from 'react';
import { useAlerts } from '@/hooks/useAlerts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle, AlertCircle, Info, Zap } from 'lucide-react';

const SEVERITY_ICONS = {
  low: Info,
  medium: AlertCircle,
  high: AlertTriangle,
  critical: Zap
};

const SEVERITY_COLORS = {
  low: 'bg-blue-50 border-blue-200 text-blue-800',
  medium: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  high: 'bg-orange-50 border-orange-200 text-orange-800',
  critical: 'bg-red-50 border-red-200 text-red-800'
};

export const AlertsStrip = ({ ventureId = null, maxAlerts = 3 }) => {
  const { alerts, markAsRead, dismissAlert } = useAlerts(ventureId);
  const [collapsedAlerts, setCollapsedAlerts] = useState(new Set());

  const visibleAlerts = alerts.slice(0, maxAlerts);

  const handleDismiss = async (alertId) => {
    await dismissAlert(alertId);
  };

  const toggleCollapse = (alertId) => {
    const newCollapsed = new Set(collapsedAlerts);
    if (newCollapsed.has(alertId)) {
      newCollapsed.delete(alertId);
    } else {
      newCollapsed.add(alertId);
    }
    setCollapsedAlerts(newCollapsed);
  };

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 mb-6">
      {visibleAlerts.map(alert => {
        const Icon = SEVERITY_ICONS[alert.severity];
        const isCollapsed = collapsedAlerts.has(alert.id);
        
        return (
          <Card key={alert.id} className={`border ${SEVERITY_COLORS[alert.severity]}`}>
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{alert.title}</h4>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCollapse(alert.id)}
                        className="h-6 w-6 p-0"
                      >
                        {isCollapsed ? '+' : '−'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDismiss(alert.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {!isCollapsed && (
                    <p className="text-xs mt-1 opacity-90">{alert.message}</p>
                  )}
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs opacity-75">
                      {new Date(alert.created_at).toLocaleDateString()}
                    </span>
                    
                    {alert.type === 'personal_runway_risk' && (
                      <Button variant="outline" size="sm" className="h-6 text-xs">
                        Review Budget
                      </Button>
                    )}
                    
                    {alert.type === 'portfolio_overextension' && (
                      <Button variant="outline" size="sm" className="h-6 text-xs">
                        View Portfolio
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      {alerts.length > maxAlerts && (
        <div className="text-center">
          <Button variant="outline" size="sm">
            View {alerts.length - maxAlerts} more alerts
          </Button>
        </div>
      )}
    </div>
  );
};