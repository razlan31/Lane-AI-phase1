// No React import needed
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Check, Zap, Star, Crown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { usePricingTier } from '../../hooks/usePricingTier';
import { supabase } from '@/integrations/supabase/client';

const UpgradeModal = ({ isOpen, onClose, targetFeature }) => {
  const { isFounder } = usePricingTier();
  
  // Don't show upgrade modal for founder accounts
  if (isFounder) {
    return null;
  }
  const plans = [
    {
      id: 'pro-promo',
      name: 'Pro Promo',
      icon: Zap,
      price: '$9.90',
      period: '/month',
      description: 'Locked price for first 9 users until cancel',
      features: [
        'Worksheets: full CRUD',
        'Personal: full CRUD',
        'Scratchpad Reflect (AI)',
        'Founder Mode AI',
        'Export: PDF + CSV'
      ],
      popular: true
    },
    {
      id: 'pro-standard',
      name: 'Pro Standard',
      icon: Star,
      price: '$15',
      period: '/month', 
      description: 'Standard monthly plan',
      features: [
        'Everything in Pro Promo',
        '500 AI prompts/month',
        '2s AI cooldown'
      ]
    },
    {
      id: 'weekly',
      name: 'Weekly',
      icon: Crown,
      price: '$4',
      period: '/week',
      description: 'Short-term access',
      features: [
        'All paid features',
        'Billed weekly'
      ]
    },
    {
      id: 'annual',
      name: 'Annual',
      icon: Crown,
      price: '$150',
      period: '/year',
      description: '12 months for the price of 10',
      features: [
        'All paid features',
        'Best value'
      ]
    }
  ];

  const handlePlanSelect = async (planId) => {
    console.log('Selected plan:', planId, 'for feature:', targetFeature);
    
    try {
      // Map plan selection to Stripe plan types
      const planTypeMapping = {
        'pro-promo': 'pro-promo',
        'pro-standard': 'pro-standard',
        'weekly': 'weekly',
        'annual': 'annual'
      };
      
      const planType = planTypeMapping[planId];
      if (!planType) {
        console.error('Unknown plan type:', planId);
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planType }
      });

      if (error) {
        console.error('Error creating checkout:', error);
        return;
      }

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
      onClose();
    } catch (error) {
      console.error('Error in plan selection:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            Upgrade Your Plan
          </DialogTitle>
          <DialogDescription className="text-center">
            {targetFeature && `Unlock ${targetFeature} and more with a premium plan`}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={cn(
                "relative transition-all hover:shadow-lg",
                plan.popular && "ring-2 ring-primary",
                plan.comingSoon && "opacity-60"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center">
                <plan.icon className="h-8 w-8 mx-auto text-primary mb-2" />
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                  {plan.yearlyPrice && (
                    <div className="text-sm text-muted-foreground">
                      or {plan.yearlyPrice}/year
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  disabled={plan.comingSoon}
                  onClick={() => handlePlanSelect(plan.id)}
                >
                  {plan.comingSoon ? 'Coming Soon' : `Select ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={onClose}>
            Continue with Free Plan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;