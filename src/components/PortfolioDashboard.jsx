import { Card } from '@/components/ui/card';
import { usePortfolioMetrics } from '@/hooks/usePortfolioMetrics';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, DollarSign, BarChart3, AlertTriangle, RefreshCw, Building, Plus } from 'lucide-react';

const PortfolioDashboard = () => {
  const { metrics, loading, error, refreshMetrics } = usePortfolioMetrics();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Portfolio Overview</h1>
          <Button disabled className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading...
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/3"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Portfolio Overview</h1>
        <Card className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Portfolio</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={refreshMetrics}>Try Again</Button>
        </Card>
      </div>
    );
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  const getRiskBadge = (riskScore) => {
    if (riskScore >= 70) return <Badge variant="destructive">High Risk</Badge>;
    if (riskScore >= 50) return <Badge className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>;
    return <Badge className="bg-green-100 text-green-800">Low Risk</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Portfolio Overview</h1>
        <Button onClick={refreshMetrics} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(metrics?.total_revenue)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Across {metrics?.metadata?.ventures_count || 0} ventures
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Monthly Burn</p>
              <p className="text-2xl font-bold">{formatCurrency(metrics?.total_burn_rate)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Combined burn rate
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Portfolio ROI</p>
              <p className="text-2xl font-bold">{formatPercentage(metrics?.portfolio_roi)}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Average across portfolio
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Risk Assessment</p>
              <div className="flex items-center gap-2 mt-1">
                {getRiskBadge(metrics?.risk_score)}
              </div>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Based on financial health
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Portfolio Health</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Runway</span>
              <span className="font-medium">
                {metrics?.total_runway ? `${Math.round(metrics.total_runway)} months` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Diversification Score</span>
              <span className="font-medium">{formatPercentage(metrics?.diversification_score)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Active Ventures</span>
              <span className="font-medium">{metrics?.metadata?.ventures_count || 0}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Data Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">KPIs Tracked</span>
              <span className="font-medium">{metrics?.metadata?.kpis_count || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Worksheets</span>
              <span className="font-medium">{metrics?.metadata?.worksheets_count || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">ROI Data Points</span>
              <span className="font-medium">{metrics?.metadata?.roi_data_points || 0}</span>
            </div>
          </div>
        </Card>
      </div>

      {(!metrics || metrics.metadata?.ventures_count === 0) && (
        <Card className="p-6 text-center">
          <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Ventures Yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first venture to start tracking portfolio metrics
          </p>
          <Button onClick={() => {
            window.dispatchEvent(new CustomEvent('openNewVentureModal'));
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Create Venture
          </Button>
        </Card>
      )}
    </div>
  );
};

export default PortfolioDashboard;