import { useState } from 'react';
import { CreditCard, Download, ExternalLink, Crown, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { usePricingTier } from '../../hooks/usePricingTier';
import { cn } from '../../lib/utils';

const BillingTab = () => {
  const { tier, loading, user } = usePricingTier();
  const [loadingPortal, setLoadingPortal] = useState(false);

  // Mock billing data - in real app, this comes from Supabase/Stripe
  const billingInfo = {
    subscription: {
      tier: tier,
      status: 'active',
      nextBilling: '2024-02-15',
      amount: tier === 'pro' ? 15 : 0
    },
    paymentMethod: {
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expiryMonth: 12,
      expiryYear: 2027
    },
    invoices: [
      {
        id: 'inv_001',
        date: '2024-01-15',
        amount: 15,
        status: 'paid',
        downloadUrl: '#'
      },
      {
        id: 'inv_002',
        date: '2023-12-15',
        amount: 15,
        status: 'paid',
        downloadUrl: '#'
      },
      {
        id: 'inv_003',
        date: '2023-11-15',
        amount: 15,
        status: 'paid',
        downloadUrl: '#'
      }
    ]
  };

  const handleManageSubscription = async () => {
    setLoadingPortal(true);
    try {
      // In real app: call Stripe customer portal
      console.log('Opening Stripe customer portal...');
      // Example implementation:
      // const { data } = await supabase.functions.invoke('customer-portal');
      // window.open(data.url, '_blank');
      
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Portal would open here');
    } catch (error) {
      console.error('Error opening customer portal:', error);
    } finally {
      setLoadingPortal(false);
    }
  };

  const handleUpgrade = () => {
    // In real app: redirect to pricing page or open checkout
    console.log('Redirecting to upgrade flow...');
  };

  const handleDownloadInvoice = (invoice) => {
    console.log('Downloading invoice:', invoice.id);
    // In real app: download invoice PDF
  };

  const getTierIcon = (tierName) => {
    switch (tierName) {
      case 'pro':
        return <Crown className="h-5 w-5 text-primary" />;
      case 'enterprise':
        return <Crown className="h-5 w-5 text-primary" />;
      default:
        return <div className="w-5 h-5 rounded bg-muted" />;
    }
  };

  const getTierColor = (tierName) => {
    switch (tierName) {
      case 'pro':
        return 'border-primary bg-primary/5';
      case 'enterprise':
        return 'border-primary bg-primary/5';
      default:
        return 'border-border bg-muted/20';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading billing information...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Current Plan */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Current Plan</h2>
        <div className={cn("border rounded-lg p-6", getTierColor(tier))}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getTierIcon(tier)}
              <div>
                <h3 className="font-semibold text-foreground capitalize">
                  {tier === 'free' ? 'Free / Starter' : tier} Plan
                </h3>
                {tier !== 'free' && (
                  <p className="text-sm text-muted-foreground">
                    ${billingInfo.subscription.amount}/month • Next billing: {new Date(billingInfo.subscription.nextBilling).toLocaleDateString()}
                  </p>
                )}
                {tier === 'free' && (
                  <p className="text-sm text-muted-foreground">
                    Free forever • Limited features
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {tier === 'free' ? (
                <Button onClick={handleUpgrade}>
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade to Pro
                </Button>
              ) : (
                <Button 
                  variant="outline"
                  onClick={handleManageSubscription}
                  disabled={loadingPortal}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {loadingPortal ? 'Loading...' : 'Manage Subscription'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

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