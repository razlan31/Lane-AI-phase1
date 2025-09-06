// No React import needed
import { usePricingTier } from '../../hooks/usePricingTier';
import { useUsageLimits } from '../../hooks/useUsageLimits';
import { Button } from '../ui/button';
import { Lock, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

const FeatureGate = ({ 
  feature,
  children,
  className,
  showUpgradeModal = true,
  customMessage,
  checkUsage = null // 'ventures', 'scratchpad', 'ai'
}) => {
  const { hasFeature, isFounder } = usePricingTier();
  const { 
    canCreateVenture, 
    canCreateScratchpadNote, 
    canUseAI,
    getVenturesLimitMessage,
    getScratchpadLimitMessage,
    getAILimitMessage
  } = useUsageLimits();

  // Founder accounts bypass all limits
  if (isFounder) {
    return children;
  }

  // Check feature access
  const hasAccess = hasFeature(feature);
  
  // Check usage limits if specified
  let canUse = true;
  let limitMessage = null;
  
  if (checkUsage) {
    switch (checkUsage) {
      case 'ventures':
        canUse = canCreateVenture();
        limitMessage = getVenturesLimitMessage();
        break;
      case 'scratchpad':
        canUse = canCreateScratchpadNote();
        limitMessage = getScratchpadLimitMessage();
        break;
      case 'ai':
        canUse = canUseAI();
        limitMessage = getAILimitMessage();
        break;
    }
  }

  // If user has access and can use, show content
  if (hasAccess && canUse) {
    return children;
  }

  const handleUpgradeClick = () => {
    if (showUpgradeModal) {
      window.dispatchEvent(new CustomEvent('showUpgradeModal', { 
        detail: { feature, checkUsage, limitMessage } 
      }));
    }
  };

  const getMessage = () => {
    if (customMessage) return customMessage;
    if (!hasAccess) return 'This feature requires a Pro plan';
    if (!canUse) return limitMessage || 'Usage limit reached';
    return 'Upgrade to unlock this feature';
  };

  return (
    <div className={cn("relative border border-dashed border-border rounded-lg", className)}>
      {/* Blurred content */}
      <div className="blur-sm opacity-30 pointer-events-none">
        {children}
      </div>
      
      {/* Lock overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/90">
        <div className="text-center p-6 max-w-sm">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
            {!canUse ? (
              <Zap className="h-6 w-6 text-muted-foreground" />
            ) : (
              <Lock className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          
          <h3 className="font-medium text-foreground mb-2">
            {!hasAccess ? 'Pro Feature' : 'Limit Reached'}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-4">
            {getMessage()}
          </p>
          
          {showUpgradeModal && (
            <Button onClick={handleUpgradeClick} size="sm">
              Upgrade Now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeatureGate;