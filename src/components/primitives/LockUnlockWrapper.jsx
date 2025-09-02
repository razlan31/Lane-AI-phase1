import { useState } from 'react';
import { Lock, Crown, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
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
  const { hasFeature, tier } = usePricingTier();
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  
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
    // TODO: Implement actual upgrade flow
    console.log(`Upgrade to ${requiredTier}`);
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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <LockedContent />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Upgrade to {tierInfo?.name} to unlock this feature</p>
          </TooltipContent>
        </Tooltip>

        {/* Upsell Modal */}
        <Dialog open={showUpsellModal} onOpenChange={setShowUpsellModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {tierInfo?.icon && <tierInfo.icon className={cn("h-5 w-5", tierInfo.color)} />}
                Upgrade to {tierInfo?.name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{tierInfo?.price}</p>
                <p className="text-sm text-muted-foreground">Unlock all features</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">What you'll get:</h4>
                <ul className="space-y-1">
                  {tierInfo?.features.map((feature, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleUpgrade}
                  className="flex-1"
                  variant="default"
                >
                  Upgrade Now
                </Button>
                <Button 
                  onClick={() => setShowUpsellModal(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </TooltipProvider>
    );
  }

  return <LockedContent />;
};

export default LockUnlockWrapper;