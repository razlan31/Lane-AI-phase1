import React from 'react';
import { Building2, TrendingUp, Users, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { formatNumber } from '../../lib/utils';
import { useVentures } from '../../hooks/useVentures';

const PortfolioTiles = ({ onVentureClick }) => {
  const { ventures, loading } = useVentures();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (ventures.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            No ventures yet. Create your first venture to get started.
          </p>
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

  const getKpiIcon = (label) => {
    const iconMap = {
      'Revenue': DollarSign,
      'MRR': DollarSign,
      'Customers': Users,
      'Users': Users,
      'Runway': TrendingUp,
      'Churn': TrendingUp
    };
    return iconMap[label] || DollarSign;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {ventures.map((venture) => {
        return (
          <Card 
            key={venture.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onVentureClick?.(venture.id)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {venture.name}
              </CardTitle>
              <div className="text-sm text-muted-foreground capitalize">
                {venture.type} • {venture.status}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {venture.kpis.slice(0, 3).map((kpi, index) => {
                  const IconComponent = getKpiIcon(kpi.title);
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{kpi.title}</span>
                      </div>
                      <span className="font-medium">
                        {formatKpiValue(kpi.value, kpi.unit)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PortfolioTiles;