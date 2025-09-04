// No React import needed
import { usePricingTier } from '../../hooks/usePricingTier';
import { cn } from '../../lib/utils';
import { Lock } from 'lucide-react';

const LockWrapper = ({ 
  children, 
  feature, 
  requiredTier = 'pro',
  showTooltip = true,
  className 
}) => {
  const { hasFeature, tier, isFounder } = usePricingTier();
  
  // Founder accounts bypass all feature locks
  if (isFounder) {
    return children;
  }
  
  const isLocked = !hasFeature(feature);
  
  if (!isLocked) {
    return children;
  }
  
  const handleUpgradeClick = () => {
    // Trigger upgrade modal via global event or context
    window.dispatchEvent(new CustomEvent('showUpgradeModal', { 
      detail: { feature } 
    }));
  };
  
  return (
    <div className={cn("relative group", className)}>
      {/* Blurred content */}
      <div className="blur-sm opacity-50 pointer-events-none">
        {children}
      </div>
      
      {/* Lock overlay */}
      <div 
        className="absolute inset-0 flex items-center justify-center bg-background/80 cursor-pointer rounded-lg border border-dashed"
        onClick={handleUpgradeClick}
      >
        <div className="text-center p-4">
          <Lock className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm font-medium text-foreground">
            {requiredTier === 'pro' ? 'Pro Feature' : 'Premium Feature'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Click to upgrade
          </p>
        </div>
      </div>
      
      {/* Tooltip on hover */}
      {showTooltip && (
        <div className="absolute top-0 left-0 right-0 bg-popover border rounded-lg p-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          Upgrade to {requiredTier} to unlock this feature
        </div>
      )}
    </div>
  );
};

export default LockWrapper;