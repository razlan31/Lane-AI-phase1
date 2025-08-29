import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Check, Zap, Star, Crown } from 'lucide-react';
import { cn } from '../../lib/utils';

const UpgradeModal = ({ isOpen, onClose, targetFeature }) => {
  const plans = [
    {
      id: 'founders',
      name: 'Founders',
      icon: Zap,
      price: '$9',
      period: '/month',
      yearlyPrice: '$86',
      description: 'Perfect for individual founders',
      features: [
        'Unlimited ventures',
        'Advanced worksheets', 
        'AI chat assistance',
        'Basic reports',
        'Founder mode',
        'Priority support'
      ],
      popular: true
    },
    {
      id: 'pro',
      name: 'Pro',
      icon: Star,
      price: '$15',
      period: '/month', 
      yearlyPrice: '$144',
      description: 'For growing businesses',
      features: [
        'Everything in Founders',
        'Advanced formula editor',
        'Export all reports',
        'Custom integrations',
        'Team collaboration',
        'Advanced analytics'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      icon: Crown,
      price: 'Custom',
      period: '',
      description: 'For teams and organizations',
      features: [
        'Everything in Pro',
        'Custom deployments',
        'SSO integration',
        'Advanced admin controls',
        'Dedicated support',
        'Custom training'
      ],
      comingSoon: true
    }
  ];

  const handlePlanSelect = (planId) => {
    // TODO: Integrate with Stripe - call stripeClientStub
    console.log(`Selected plan: ${planId} for feature: ${targetFeature}`);
    // Close modal after selection
    onClose();
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