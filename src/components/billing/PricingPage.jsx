// No React import needed
import { Check, Zap, Crown, Building2 } from 'lucide-react';
import { Button } from '../ui/button';
import { usePricingTier } from '../../hooks/usePricingTier';
import { cn } from '../../lib/utils';
import { supabase } from '@/integrations/supabase/client';

const PricingPage = () => {
  const { tier: currentTier, isAuthenticated } = usePricingTier();

  const plans = [
    {
      id: 'starter',
      name: 'Free / Starter',
      price: 0,
      billing: 'forever',
      icon: Zap,
      description: 'Perfect for getting started',
      features: [
        '1 Venture workspace',
        '5-10 core worksheets',
        'Basic dashboard',
        'Limited signals',
        'HQ overview',
        'Community support'
      ],
      limitations: [
        'Chat UI visible but limited',
        'No AI backend integration',
        'Basic export options'
      ],
      cta: currentTier === 'free' ? 'Current Plan' : 'Downgrade',
      highlight: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 15,
      billing: 'month',
      icon: Crown,
      description: 'Everything you need to scale',
      features: [
        'Unlimited ventures',
        'Full worksheet library (130+ blocks)',
        'Advanced signals & correlations',
        'Full AI chat integration',
        'Founder Mode overlays',
        'Reports & exports',
        'Priority support'
      ],
      limitations: [],
      cta: currentTier === 'pro' ? 'Current Plan' : 'Upgrade to Pro',
      highlight: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      billing: 'contact us',
      icon: Building2,
      description: 'For teams and organizations',
      features: [
        'Everything in Pro',
        'Multi-user collaboration',
        'Admin roles & permissions',
        'Custom integrations',
        'Dedicated support',
        'SLA guarantees',
        'Custom deployment options'
      ],
      limitations: [],
      cta: currentTier === 'enterprise' ? 'Current Plan' : 'Contact Sales',
      highlight: false
    }
  ];

  const handleUpgrade = async (planId) => {
    console.log('Upgrading to:', planId);
    
    if (!isAuthenticated) {
      console.log('User needs to sign in first');
      // In real app: redirect to login
      return;
    }
    
    try {
      // Map plan selection to Stripe plan types
      const planTypeMapping = {
        'starter': 'weekly',
        'pro': 'pro-standard',
        'enterprise': 'pro-standard' // Enterprise uses same as pro for now
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
    } catch (error) {
      console.error('Error in plan upgrade:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="container mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade as you grow. All plans include our core dashboard and worksheet features.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = currentTier === plan.id;
            
            return (
              <div
                key={plan.id}
                className={cn(
                  "relative border border-border rounded-xl p-8 bg-card",
                  plan.highlight && "border-primary shadow-lg scale-105",
                  isCurrentPlan && "ring-2 ring-primary"
                )}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4">
                    <span className="bg-live text-live-foreground px-3 py-1 rounded-full text-xs font-medium">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <Icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {plan.description}
                  </p>
                  <div className="text-4xl font-bold text-foreground">
                    {typeof plan.price === 'number' ? (
                      <>
                        ${plan.price}
                        <span className="text-lg text-muted-foreground font-normal">
                          /{plan.billing}
                        </span>
                      </>
                    ) : (
                      plan.price
                    )}
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.limitations.map((limitation, index) => (
                    <div key={index} className="flex items-start gap-3 opacity-60">
                      <div className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground text-sm">
                        ⚠️ {limitation}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrentPlan}
                  variant={plan.highlight ? 'default' : 'outline'}
                  className="w-full"
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-24 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Can I change plans anytime?
              </h3>
              <p className="text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately for upgrades, and at the end of your billing cycle for downgrades.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                What happens to my data if I downgrade?
              </h3>
              <p className="text-muted-foreground">
                Your data is never deleted. Premium features become read-only, but all your work remains accessible when you upgrade again.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Do you offer annual discounts?
              </h3>
              <p className="text-muted-foreground">
                Yes! Annual plans are automatically discounted and applied at checkout. Save up to 20% with yearly billing.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Is there a free trial for Pro?
              </h3>
              <p className="text-muted-foreground">
                You can try all Pro features for free with our generous Free plan. Upgrade when you're ready to unlock unlimited ventures and advanced features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;