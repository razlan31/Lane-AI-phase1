import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePricingTier } from '@/hooks/usePricingTier';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Calendar, Settings, ExternalLink, Crown, Check } from 'lucide-react';

const BillingTab = () => {
  const { profile, isFounder, hasFeature } = usePricingTier();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      if (!profile?.id) return;

      const { data, error } = await supabase
        .from('billing_subscriptions')
        .select('*')
        .eq('user_id', profile.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
      } else {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      window.open(data.url, '_blank');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open billing portal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingPortal(false);
    }
  };

  const handleUpgrade = () => {
    window.dispatchEvent(new CustomEvent('showUpgradeModal', { 
      detail: { feature: 'billing' } 
    }));
  };

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: '/month',
      features: ['1 venture', '5 scratchpad notes', '10 AI messages/month']
    },
    {
      id: 'pro_promo',
      name: 'Pro Promo',
      price: '$9.90',
      period: '/month',
      popular: true,
      features: ['Unlimited ventures', 'Unlimited scratchpad', '500 AI messages/month', 'All features']
    },
    {
      id: 'pro_standard', 
      name: 'Pro Standard',
      price: '$15',
      period: '/month',
      features: ['Everything in Pro Promo', 'Priority support']
    },
    {
      id: 'annual',
      name: 'Annual',
      price: '$150', 
      period: '/year',
      features: ['All Pro features', '17% savings']
    }
  ];

  const currentPlan = profile?.plan || profile?.subscription_plan || 'free';
  const isActive = subscription?.status === 'active' || isFounder;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading billing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isFounder && <Crown className="h-5 w-5 text-amber-500" />}
              <div>
                <h3 className="font-semibold">
                  {isFounder ? 'Founder' : plans.find(p => p.id === currentPlan)?.name || 'Free'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isFounder ? 'Lifetime access to all features' : 
                   isActive ? 'Active subscription' : 'Free tier'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold">
                {isFounder ? 'Free' : plans.find(p => p.id === currentPlan)?.price || '$0'}
                {!isFounder && (
                  <span className="text-sm text-muted-foreground">
                    {plans.find(p => p.id === currentPlan)?.period || '/month'}
                  </span>
                )}
              </p>
              <Badge variant={isActive ? "default" : "secondary"}>
                {isFounder ? 'Founder' : isActive ? 'Active' : 'Free'}
              </Badge>
            </div>
          </div>

          {subscription && !isFounder && (
            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current period:</span>
                <span>
                  {new Date(subscription.current_period_start).toLocaleDateString()} - {' '}
                  {new Date(subscription.current_period_end).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Next billing:</span>
                <span>{new Date(subscription.current_period_end).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                  {subscription.status}
                </Badge>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            {!isFounder && currentPlan === 'free' && (
              <Button onClick={handleUpgrade} className="flex-1">
                Upgrade to Pro
              </Button>
            )}
            
            {subscription && !isFounder && (
              <Button 
                variant="outline" 
                onClick={handleManageSubscription}
                disabled={loadingPortal}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                {loadingPortal ? 'Loading...' : 'Manage Subscription'}
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Usage This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold">
                {profile?.ai_requests_used || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                AI Messages Used
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Limit: {isFounder || isActive ? '500' : '10'}/month
              </div>
            </div>
            
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold">∞</div>
              <div className="text-sm text-muted-foreground">
                Ventures
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {isFounder || isActive ? 'Unlimited' : 'Limited to 1'}
              </div>
            </div>
            
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="text-2xl font-bold">∞</div>
              <div className="text-sm text-muted-foreground">
                Scratchpad Notes
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {isFounder || isActive ? 'Unlimited' : 'Limited to 5'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      {!isFounder && (
        <Card>
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative p-4 border-2 rounded-lg ${
                    plan.id === currentPlan
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  } ${plan.popular ? 'ring-2 ring-primary/20' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary">Most Popular</Badge>
                    </div>
                  )}
                  
                  <div className="text-center space-y-2">
                    <h3 className="font-semibold">{plan.name}</h3>
                    <div>
                      <span className="text-2xl font-bold">{plan.price}</span>
                      <span className="text-sm text-muted-foreground">{plan.period}</span>
                    </div>
                  </div>
                  
                  <ul className="space-y-1 mt-4 text-sm">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-green-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    variant={plan.id === currentPlan ? "secondary" : "outline"}
                    className="w-full mt-4"
                    disabled={plan.id === currentPlan}
                    onClick={plan.id === currentPlan ? undefined : handleUpgrade}
                  >
                    {plan.id === currentPlan ? 'Current Plan' : 'Select Plan'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing History */}
      {subscription && !isFounder && (
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Billing history is available in the</p>
              <Button 
                variant="link" 
                onClick={handleManageSubscription}
                disabled={loadingPortal}
                className="p-0 h-auto font-normal"
              >
                Stripe Customer Portal <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BillingTab;