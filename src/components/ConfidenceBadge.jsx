// No React import needed
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const CONFIDENCE_CONFIG = {
  real: {
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800 border-green-200',
    label: '✅ Real',
    tooltip: 'This data is user-provided and verified'
  },
  estimate: {
    icon: AlertTriangle,
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    label: '⚠️ Estimate',
    tooltip: 'This data is estimated by AI based on industry standards'
  },
  mock: {
    icon: HelpCircle,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    label: '🟦 Mock',
    tooltip: 'This is placeholder data - replace with real values'
  }
};

export const ConfidenceBadge = ({ level, className = '' }) => {
  const config = CONFIDENCE_CONFIG[level] || CONFIDENCE_CONFIG.mock;
  const Icon = config.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge 
          variant="outline" 
          className={`text-xs ${config.color} ${className}`}
        >
          <Icon className="w-3 h-3 mr-1" />
          {config.label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>{config.tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
};