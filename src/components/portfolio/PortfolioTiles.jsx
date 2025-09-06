// No React import needed
import { Building2, TrendingUp, TrendingDown, Users, DollarSign, Clock, Target, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { formatNumber } from '../../lib/utils';
import { useVentures } from '../../hooks/useVentures.jsx';

const PortfolioTiles = ({ onVentureClick }) => {
  const { ventures, loading } = useVentures();

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-64 bg-muted animate-pulse rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (ventures.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No ventures yet</h3>
          <p className="text-muted-foreground text-center mb-4">
            Create your first venture to start tracking metrics and building your portfolio
          </p>
          <button 
            className="text-sm text-primary hover:text-primary/80 font-medium"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('openNewVentureModal'));
            }}
          >
            + Create Your First Venture
          </button>
        </CardContent>
      </Card>
    );
  }

  const formatKpiValue = (value, unit) => {
    switch (unit) {
      case 'currency':
        return formatNumber(value, { style: 'currency' });
      case 'percentage':
        return `${value}%`;
      case 'months':
        return `${value}mo`;
      default:
        return formatNumber(value);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'paused':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trendDirection) => {
    return trendDirection === 'up' ? TrendingUp : TrendingDown;
  };

  const getTrendColor = (trendDirection) => {
    return trendDirection === 'up' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {ventures.map((venture) => {
        return (
          <Card 
            key={venture.id} 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 shadow-md"
            onClick={() => onVentureClick?.(venture.id)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">{venture.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{venture.description}</p>
                  </div>
                </div>
                <Badge 
                  className={`${getStatusColor(venture.status)} text-xs font-medium border`}
                >
                  {venture.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {venture.kpis.slice(0, 4).map((kpi, index) => {
                  const TrendIcon = getTrendIcon(kpi.trendDirection);
                  return (
                    <div key={index} className="bg-muted/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {kpi.title}
                        </span>
                        <div className="flex items-center gap-1">
                          <TrendIcon className={`h-3 w-3 ${getTrendColor(kpi.trendDirection)}`} />
                          <span className={`text-xs font-medium ${getTrendColor(kpi.trendDirection)}`}>
                            {kpi.trend}%
                          </span>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-foreground">
                        {formatKpiValue(kpi.value, kpi.unit)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Additional Metrics Row */}
              <div className="flex items-center justify-between py-3 px-4 bg-muted/20 rounded-lg mb-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {Math.floor(Math.random() * 12) + 6}mo runway
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {Math.floor(Math.random() * 50) + 10} customers
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {Math.floor(Math.random() * 30) + 70}% goal
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="text-xs text-muted-foreground">
                  Created {new Date(venture.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {Math.floor(Math.random() * 5) + 3} worksheets
                  </span>
                  <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                  <span className="text-xs text-muted-foreground">
                    {Math.floor(Math.random() * 10) + 5} reports
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      {/* Add New Venture Card */}
      <Card 
        className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors cursor-pointer"
        onClick={() => {
          window.dispatchEvent(new CustomEvent('openNewVentureModal'));
        }}
      >
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">Add New Venture</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Start tracking a new business or project
          </p>
          <button 
            className="text-sm text-primary hover:text-primary/80 font-medium"
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click from firing
              window.dispatchEvent(new CustomEvent('openNewVentureModal'));
            }}
          >
            + Create Venture
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioTiles;