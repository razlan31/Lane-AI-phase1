import { useState } from 'react';
import { Lock, Crown, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { cn } from '../../lib/utils';
import { usePricingTier } from '../../hooks/usePricingTier';

const LockUnlockWrapper = ({ 
  children, 
  feature, 
  requiredTier = 'pro',
  className,
  showTooltip = true,
  blurWhenLocked = true
}) => {
  const { hasFeature, tier, isFounder } = usePricingTier();
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  
  // Founder accounts bypass all feature locks
  if (isFounder) {
    return children;
  }
  
  const isLocked = !hasFeature(feature);

  const getTierInfo = (tierName) => {
    const tiers = {
      pro: {
        name: 'Pro',
        price: '$9/month',
        icon: Crown,
        color: 'text-primary',
        features: [
          'Unlimited ventures',
          'Full worksheet library (130+ blocks)',
          'Advanced signals & correlations',
          'Full AI chat integration',
          'Reports & exports',
          'Founder Mode overlays'
        ]
      },
      enterprise: {
        name: 'Enterprise',
        price: 'Contact us',
        icon: Zap,
        color: 'text-orange-500',
        features: [
          'Everything in Pro',
          'Multi-user collaboration',
          'Admin roles & permissions',
          'Custom integrations',
          'Dedicated support'
        ]
      }
    };
    return tiers[tierName];
  };

  const tierInfo = getTierInfo(requiredTier);

  const handleUpgrade = () => {
    console.log(`Initiating upgrade to ${requiredTier}`);
    
    // Open upgrade modal or pricing page
    window.dispatchEvent(new CustomEvent('openUpgradeModal', {
      detail: { 
        requiredTier: requiredTier,
        feature: feature,
        currentTier: 'free' // This would come from user context
      }
    }));
    
    setShowUpsellModal(false);
  };

  if (!isLocked) {
    return children;
  }

  const LockedContent = () => (
    <div 
      className={cn(
        "relative",
        blurWhenLocked && "filter blur-sm",
        className
      )}
      onClick={() => setShowUpsellModal(true)}
    >
      {children}
      
      {/* Lock overlay */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center cursor-pointer rounded-lg">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {tierInfo?.name} Feature
          </p>
          <p className="text-xs text-muted-foreground">
            Click to upgrade
          </p>
        </div>
      </div>
    </div>
  );

  if (showTooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`relative ${className} ${isUnlocked ? '' : 'opacity-60'}`}
            onClick={isUnlocked ? undefined : () => setShowUpgradeModal(true)}
          >
            {/* Overlay for locked content */}
            {!isUnlocked && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg cursor-pointer">
                <div className="text-center p-4">
                  <LockIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">{unlockMessage}</p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUpgradeModal(true);
                    }}
                  >
                    <UpgradeIcon className="h-4 w-4 mr-2" />
                    {upgradeButtonText}
                  </Button>
                </div>
              </div>
            )}
            {children}
          </div>
        </TooltipTrigger>
        {!isUnlocked && (
          <TooltipContent>
            <p>{tooltipMessage}</p>
          </TooltipContent>
        )}

        <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UpgradeIcon className="h-5 w-5 text-primary" />
                Upgrade Required
              </DialogTitle>
              <DialogDescription>
                {upgradeMessage}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">What you'll get:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-green-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowUpgradeModal(false)}
                  variant="outline" 
                  className="flex-1"
                >
                  Maybe Later
                </Button>
                <Button 
                  onClick={onUpgrade}
                  className="flex-1"
                >
                  <UpgradeIcon className="h-4 w-4 mr-2" />
                  Upgrade Now
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </Tooltip>
    );
  }

  return <LockedContent />;
};

export default LockUnlockWrapper;