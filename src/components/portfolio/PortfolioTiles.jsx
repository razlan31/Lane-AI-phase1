import React from 'react';
import { cn } from '../../lib/utils';
import KpiCard from '../primitives/KpiCard';
import { Button } from '../ui/button';
import { Plus, MoreHorizontal, TrendingUp, TrendingDown } from 'lucide-react';

const PortfolioTiles = ({ ventures = [], onVentureClick, onCreateVenture, className }) => {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Portfolio Overview</h2>
          <p className="text-sm text-muted-foreground">
            {ventures.length} {ventures.length === 1 ? 'venture' : 'ventures'}
          </p>
        </div>
        <Button onClick={onCreateVenture} className="gap-2">
          <Plus className="h-4 w-4" />
          New Venture
        </Button>
      </div>

      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ventures.map(venture => (
          <VentureTile
            key={venture.id}
            venture={venture}
            onClick={() => onVentureClick(venture.id)}
          />
        ))}
        
        {/* Add New Venture Tile */}
        <div
          onClick={onCreateVenture}
          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer flex items-center justify-center min-h-[200px]"
        >
          <div className="text-center">
            <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">Add New Venture</p>
            <p className="text-xs text-muted-foreground mt-1">Track another company</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const VentureTile = ({ venture, onClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'live':
        return 'text-success';
      case 'draft':
        return 'text-draft';
      case 'warning':
        return 'text-warning';
      case 'alert':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusDot = (status) => {
    switch (status) {
      case 'live':
        return 'bg-success';
      case 'draft':
        return 'bg-draft';
      case 'warning':
        return 'bg-warning';
      case 'alert':
        return 'bg-destructive';
      default:
        return 'bg-muted-foreground';
    }
  };

  return (
    <div
      onClick={onClick}
      className="border border-border rounded-lg p-6 hover:shadow-md transition-all cursor-pointer bg-card"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-base">{venture.name}</h3>
            <div className={cn("w-2 h-2 rounded-full", getStatusDot(venture.status))} />
          </div>
          <p className="text-sm text-muted-foreground">{venture.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={cn("text-xs font-medium capitalize", getStatusColor(venture.status))}>
              {venture.status}
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">
              Updated {venture.lastUpdated}
            </span>
          </div>
        </div>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard
          title="Runway"
          description="Money left"
          value={venture.metrics?.runway || '—'}
          trend={venture.metrics?.runwayTrend}
          state={venture.metrics?.runwayState || 'draft'}
          size="sm"
          className="p-3"
        />
        <KpiCard
          title="Cash Flow"
          description="Monthly flow"
          value={venture.metrics?.cashFlow || '—'}
          trend={venture.metrics?.cashFlowTrend}
          state={venture.metrics?.cashFlowState || 'draft'}
          size="sm"
          className="p-3"
        />
        <KpiCard
          title="Revenue"
          description="Sales income"
          value={venture.metrics?.revenue || '—'}
          trend={venture.metrics?.revenueTrend}
          state={venture.metrics?.revenueState || 'draft'}
          size="sm"
          className="p-3"
        />
        <KpiCard
          title="Burn Rate"
          description="Monthly spend"
          value={venture.metrics?.burnRate || '—'}
          trend={venture.metrics?.burnTrend}
          state={venture.metrics?.burnState || 'draft'}
          size="sm"
          className="p-3"
        />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-border">
        <Button size="sm" variant="outline" className="flex-1 text-xs">
          View Details
        </Button>
        <Button size="sm" variant="ghost" className="flex-1 text-xs">
          Quick Update
        </Button>
      </div>
    </div>
  );
};

export default PortfolioTiles;