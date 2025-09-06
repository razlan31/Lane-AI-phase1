import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePricingTier } from '@/hooks/usePricingTier';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Calendar, DollarSign, Settings, ExternalLink, AlertCircle, Crown, Check } from 'lucide-react';

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
      
      // Open customer portal in new tab
      window.open(data.url, '_blank');
    } catch (error) {
      toast.error("Failed to open billing portal. Please try again.");
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
      features: [
        '1 venture',
        '5 scratchpad notes',
        '10 AI messages/month',
        'Basic worksheets',
        'Read-only mode'
      ]
    },
    {
      id: 'pro_promo',
      name: 'Pro Promo',
      price: '$9.90',
      period: '/month',
      popular: true,
      features: [
        'Unlimited ventures',
        'Unlimited scratchpad notes',
        '500 AI messages/month',
        'All worksheet types',
        'AI scratchpad reflection',
        'PDF & CSV exports',
        'Founder Mode AI'
      ]
    },
    {
      id: 'pro_standard',
      name: 'Pro Standard',
      price: '$15',
      period: '/month',
      features: [
        'Everything in Pro Promo',
        'Priority support',
        'Early access to features'
      ]
    },
    {
      id: 'annual',
      name: 'Annual',
      price: '$150',
      period: '/year',
      features: [
        'All Pro features',
        '17% savings',
        'Priority support'
      ]
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

      {/* Payment Method */}
      {tier !== 'free' && (
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Payment Method</h2>
          <div className="border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">
                    {billingInfo.paymentMethod.brand} •••• {billingInfo.paymentMethod.last4}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Expires {billingInfo.paymentMethod.expiryMonth}/{billingInfo.paymentMethod.expiryYear}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleManageSubscription}
                disabled={loadingPortal}
              >
                Update
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Usage & Limits */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Usage & Limits</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Ventures</span>
              {tier === 'free' && (
                <AlertCircle className="h-4 w-4 text-warning" />
              )}
            </div>
            <div className="text-2xl font-bold text-foreground">
              {tier === 'free' ? '1/1' : '3/∞'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {tier === 'free' ? 'Upgrade for unlimited' : 'Unlimited ventures'}
            </p>
          </div>
          
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">AI Chat</span>
              {tier === 'free' && (
                <AlertCircle className="h-4 w-4 text-warning" />
              )}
            </div>
            <div className="text-2xl font-bold text-foreground">
              {tier === 'free' ? 'Limited' : 'Unlimited'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {tier === 'free' ? 'Upgrade for full access' : 'Full AI integration'}
            </p>
          </div>

          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Reports</span>
              {tier === 'free' && (
                <AlertCircle className="h-4 w-4 text-warning" />
              )}
            </div>
            <div className="text-2xl font-bold text-foreground">
              {tier === 'free' ? 'Basic' : 'Advanced'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {tier === 'free' ? 'Limited export options' : 'Full report library'}
            </p>
          </div>
        </div>
      </section>

      {/* Billing History */}
      {tier !== 'free' && billingInfo.invoices.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Billing History</h2>
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="bg-muted/30 px-6 py-3 border-b border-border">
              <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground">
                <span>Date</span>
                <span>Amount</span>
                <span>Status</span>
                <span>Invoice</span>
              </div>
            </div>
            <div className="divide-y divide-border">
              {billingInfo.invoices.map((invoice) => (
                <div key={invoice.id} className="px-6 py-4">
                  <div className="grid grid-cols-4 gap-4 items-center">
                    <span className="text-foreground">
                      {new Date(invoice.date).toLocaleDateString()}
                    </span>
                    <span className="text-foreground font-medium">
                      ${invoice.amount}
                    </span>
                    <span className={cn(
                      "capitalize text-sm px-2 py-1 rounded-full inline-block w-fit",
                      invoice.status === 'paid' && "bg-live/20 text-live-foreground",
                      invoice.status === 'pending' && "bg-warning/20 text-warning-foreground"
                    )}>
                      {invoice.status}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadInvoice(invoice)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Help */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Need Help?</h2>
        <div className="border border-border rounded-lg p-6">
          <p className="text-muted-foreground mb-4">
            Have questions about your billing or need to change your plan? We're here to help.
          </p>
          <div className="flex gap-3">
            <Button variant="outline">
              Contact Support
            </Button>
            <Button variant="outline">
              View Documentation
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BillingTab;