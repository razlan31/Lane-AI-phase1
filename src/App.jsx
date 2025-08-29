import React from 'react';
import { TooltipProvider } from './components/ui/tooltip';
import HQDashboard from './components/dashboards/HQDashboard';
import VentureDashboard from './components/dashboards/VentureDashboard';
import PricingPage from './components/billing/PricingPage';
import BillingTab from './components/billing/BillingTab';

function App() {
  const [currentView, setCurrentView] = React.useState('hq'); // 'hq' | 'venture' | 'pricing' | 'billing'

  const renderCurrentView = () => {
    switch (currentView) {
      case 'venture':
        return <VentureDashboard ventureId={1} ventureName="Coffee Kiosk" />;
      case 'pricing':
        return <PricingPage />;
      case 'billing':
        return (
          <div className="min-h-screen bg-background">
            <header className="border-b border-border">
              <div className="container mx-auto px-6 py-4">
                <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage your account and billing</p>
              </div>
            </header>
            <main className="container mx-auto px-6 py-8">
              <BillingTab />
            </main>
          </div>
        );
      case 'hq':
      default:
        return <HQDashboard />;
    }
  };

  return (
    <TooltipProvider>
      {/* Navigation Bar for Demo */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <h1 className="text-xl font-bold text-foreground">LaneAI</h1>
              <span className="text-xs text-muted-foreground">Phase 2 Demo</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentView('hq')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  currentView === 'hq' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                HQ Dashboard
              </button>
              <button
                onClick={() => setCurrentView('venture')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  currentView === 'venture' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Venture
              </button>
              <button
                onClick={() => setCurrentView('pricing')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  currentView === 'pricing' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Pricing
              </button>
              <button
                onClick={() => setCurrentView('billing')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  currentView === 'billing' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Billing
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16">
        {renderCurrentView()}
      </div>
    </TooltipProvider>
  );
}

export default App;
