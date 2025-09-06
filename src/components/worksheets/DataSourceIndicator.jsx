import { Badge } from '../ui/badge';
import { CheckCircle, AlertCircle, TrendingUp, HelpCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export const DataSourceIndicator = ({ confidence, size = "sm", showLabel = true }) => {
  const getIndicatorStyle = (confidence) => {
    switch (confidence) {
      case 'actual':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          label: 'Real Data',
          description: 'Based on your actual business data'
        };
      case 'mixed':
        return {
          color: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: TrendingUp,
          label: 'Mixed Data',
          description: 'Combination of real data and industry averages'
        };
      case 'mock':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: AlertCircle,
          label: 'Industry Average',
          description: 'Based on industry benchmarks - replace with your data'
        };
      case 'estimate':
        return {
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: HelpCircle,
          label: 'Estimate',
          description: 'Calculated estimate - verify and update'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: HelpCircle,
          label: 'Unknown',
          description: 'Data source unclear'
        };
    }
  };

  const indicator = getIndicatorStyle(confidence);
  const Icon = indicator.icon;

  if (!showLabel) {
    return (
      <div className={cn("inline-flex items-center gap-1", size === "xs" && "scale-75")}>
        <Icon className="h-3 w-3" />
      </div>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className={cn(
        indicator.color,
        "text-xs font-medium border inline-flex items-center gap-1",
        size === "xs" && "px-1.5 py-0.5 text-xs",
        size === "sm" && "px-2 py-1 text-xs",
        size === "md" && "px-3 py-1.5 text-sm"
      )}
      title={indicator.description}
    >
      <Icon className={cn(
        size === "xs" && "h-2.5 w-2.5",
        size === "sm" && "h-3 w-3", 
        size === "md" && "h-3.5 w-3.5"
      )} />
      {showLabel && indicator.label}
    </Badge>
  );
};

export const DataSourceLegend = () => {
  return (
    <div className="space-y-3 p-4 border border-border rounded-lg bg-muted/30">
      <h4 className="text-sm font-medium text-foreground">Data Source Legend</h4>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <DataSourceIndicator confidence="actual" size="xs" />
          <span className="text-muted-foreground">Your real business data</span>
        </div>
        <div className="flex items-center gap-2">
          <DataSourceIndicator confidence="mixed" size="xs" />
          <span className="text-muted-foreground">Mix of real + industry data</span>
        </div>
        <div className="flex items-center gap-2">
          <DataSourceIndicator confidence="mock" size="xs" />
          <span className="text-muted-foreground">Industry benchmarks</span>
        </div>
        <div className="flex items-center gap-2">
          <DataSourceIndicator confidence="estimate" size="xs" />
          <span className="text-muted-foreground">Calculated estimates</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        💡 <strong>Pro tip:</strong> Replace industry averages with your real data for more accurate insights
      </p>
    </div>
  );
};