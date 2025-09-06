// No React import needed
import { useUsageLimits } from '../../hooks/useUsageLimits';
import { usePricingTier } from '../../hooks/usePricingTier';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/button';
import { Crown, Zap } from 'lucide-react';

const UsageIndicator = ({ type, className }) => {
  const { isFounder } = usePricingTier();
  const {
    venturesCount,
    scratchpadCount,
    aiMessagesUsed,
    capabilities,
    getVenturesLimitMessage,
    getScratchpadLimitMessage,
    getAILimitMessage
  } = useUsageLimits();

  // Don't show for founder accounts
  if (isFounder) return null;

  const handleUpgradeClick = () => {
    window.dispatchEvent(new CustomEvent('showUpgradeModal', { 
      detail: { feature: `${type}_usage` } 
    }));
  };

  const getUsageData = () => {
    switch (type) {
      case 'ventures':
        return {
          current: venturesCount,
          max: capabilities.ventures_max,
          label: 'Ventures',
          message: getVenturesLimitMessage(),
          icon: Crown
        };
      case 'scratchpad':
        return {
          current: scratchpadCount,
          max: capabilities.scratchpad_max_notes,
          label: 'Scratchpad Notes',
          message: getScratchpadLimitMessage(),
          icon: Zap
        };
      case 'ai':
        return {
          current: aiMessagesUsed,
          max: capabilities.ai_messages_monthly_limit,
          label: 'AI Messages',
          message: getAILimitMessage(),
          icon: Zap
        };
      default:
        return null;
    }
  };

  const usage = getUsageData();
  if (!usage) return null;

  const { current, max, label, message, icon: Icon } = usage;
  
  // Don't show if unlimited
  if (max === -1) return null;

  const percentage = Math.round((current / max) * 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = current >= max;

  return (
    <div className={`p-3 rounded-lg border ${isAtLimit ? 'bg-destructive/5 border-destructive/20' : isNearLimit ? 'bg-warning/5 border-warning/20' : 'bg-muted/30'} ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        {(isNearLimit || isAtLimit) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUpgradeClick}
            className="h-6 px-2 text-xs"
          >
            Upgrade
          </Button>
        )}
      </div>
      
      <ProgressBar 
        value={percentage} 
        className="mb-1"
        variant={isAtLimit ? 'destructive' : isNearLimit ? 'warning' : 'default'}
      />
      
      <p className="text-xs text-muted-foreground">
        {message}
      </p>
    </div>
  );
};

export default UsageIndicator;