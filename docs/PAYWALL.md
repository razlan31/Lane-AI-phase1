# LaneAI Paywall & Pricing

## Plans

### Free Plan
- Single venture
- Basic dashboard
- Core worksheets
- Limited exports

### Founders Plan ($9/month or $86/year)
- Unlimited ventures
- Advanced worksheets
- AI chat assistance
- Basic reports
- Founder mode
- Priority support

### Pro Plan ($15/month or $144/year)
- Everything in Founders
- Advanced formula editor
- Export all reports
- Custom integrations
- Team collaboration
- Advanced analytics

### Enterprise (Coming Soon)
- Custom deployments
- SSO integration
- Advanced admin controls
- Dedicated support

## Feature Gating

### LockWrapper Component
- Blurs locked content
- Shows upgrade prompt
- Triggers UpgradeModal on click

### Locked Features
- Formula editor (Pro)
- Unlimited ventures (Founders+)
- Advanced reports (Founders+)
- AI chat (Founders+)
- Export all (Pro)

## Implementation
- No pricing links in header/nav
- Pricing only appears in Settings → Billing and UpgradeModal
- Uses usePricingTier hook for feature checks
- Stripe integration via stripeClientStub (TODO)