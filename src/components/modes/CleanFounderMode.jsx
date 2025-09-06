import { useState, useEffect } from 'react';
import { Crown, X, TrendingUp, DollarSign, Timer, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../../lib/utils';
import { usePortfolioMetrics } from '../../hooks/usePortfolioMetrics';
import { useVentures } from '../../hooks/useVentures';
import EnhancedAIChat from '../chat/EnhancedAIChat';

const CleanFounderMode = ({ onClose, className }) => {
  const [showAIChat, setShowAIChat] = useState(true);
  const { portfolioMetrics, loading: metricsLoading } = usePortfolioMetrics();
  const { ventures } = useVentures();

  // Only show metrics if there are actual ventures
  if (!ventures || ventures.length === 0) {
    return (
      <div className={cn("fixed inset-0 z-50 bg-background/80 backdrop-blur-sm", className)}>
        <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-background shadow-2xl border-l">
          <div className="p-6 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="h-6 w-6 text-amber-500" />
              <h1 className="text-xl font-semibold">Founder Mode</h1>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-6 text-center">
            <h3 className="text-lg font-medium mb-2">No Ventures Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create a venture to unlock Founder Mode insights and AI-powered analysis.
            </p>
            <Button onClick={() => {
              onClose();
              window.dispatchEvent(new CustomEvent('openNewVentureModal'));
            }}>
              Create Your First Venture
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate real venture metrics from portfolio data
  const ventureMetrics = {
    revenue: portfolioMetrics?.total_revenue || 0,
    growth: portfolioMetrics?.revenue_growth || '+0%',
    runway: portfolioMetrics?.average_runway || '0 months',
    burnRate: portfolioMetrics?.total_burn_rate || 0,
    cashflow: portfolioMetrics?.net_cashflow || 0,
    alerts: portfolioMetrics?.risk_alerts || 0
  };

  const keyMetrics = [
    {
      label: 'Monthly Revenue',
      value: `$${ventureMetrics.revenue.toLocaleString()}`,
      trend: ventureMetrics.growth,
      status: 'positive',
      icon: DollarSign
    },
    {
      label: 'Runway',
      value: ventureMetrics.runway,
      trend: '-2m',
      status: 'warning',
      icon: Timer
    },
    {
      label: 'Monthly Burn',
      value: `$${ventureMetrics.burnRate.toLocaleString()}`,
      trend: '+5%',
      status: 'negative',
      icon: TrendingUp
    },
    {
      label: 'Active Alerts',
      value: ventureMetrics.alerts,
      trend: 'new',
      status: 'warning',
      icon: AlertTriangle
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'positive':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'negative':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      default:
        return 'text-muted-foreground bg-muted/50 border-border';
    }
  };

  return (
    <div className={cn(
      "fixed inset-0 bg-background z-50 overflow-hidden",
      className
    )}>
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Founder Mode</h1>
              <p className="text-sm text-muted-foreground">Strategic Command Center</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} size="sm">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Content - Metrics Dashboard */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {keyMetrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <Card key={index} className={cn("border-2", getStatusColor(metric.status))}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Icon className="h-5 w-5 opacity-60" />
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-full font-medium",
                          metric.status === 'positive' && "bg-green-100 text-green-700",
                          metric.status === 'negative' && "bg-red-100 text-red-700",
                          metric.status === 'warning' && "bg-amber-100 text-amber-700"
                        )}>
                          {metric.trend}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl font-bold">{metric.value}</div>
                        <div className="text-sm text-muted-foreground">{metric.label}</div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                    <div className="font-medium mb-1">Review Metrics</div>
                    <div className="text-sm text-muted-foreground">Dive deep into performance</div>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                    <div className="font-medium mb-1">Strategic Planning</div>
                    <div className="text-sm text-muted-foreground">Plan next quarter</div>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                    <div className="font-medium mb-1">Team Check-in</div>
                    <div className="text-sm text-muted-foreground">Review team progress</div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Context for AI */}
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Use the AI assistant to discuss strategy, analyze metrics, or get insights
                  </p>
                  <Button 
                    onClick={() => setShowAIChat(!showAIChat)}
                    variant={showAIChat ? "secondary" : "default"}
                    size="sm"
                  >
                    {showAIChat ? 'Hide' : 'Show'} AI Assistant
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Assistant Panel */}
        {showAIChat && (
          <div className="w-96 border-l border-border bg-card/30">
            <EnhancedAIChat 
              isOpen={true}
              onToggle={() => setShowAIChat(false)}
              context="founder-mode"
              className="relative right-0 top-0 w-full h-full border-none shadow-none bg-transparent"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CleanFounderMode;