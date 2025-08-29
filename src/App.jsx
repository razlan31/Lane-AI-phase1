import React, { useState, useEffect } from 'react';
import { TooltipProvider } from './components/ui/tooltip';
import HQDashboard from './components/dashboards/HQDashboard';
import VentureDashboard from './components/dashboards/VentureDashboard';
import PricingPage from './components/billing/PricingPage';
import BillingTab from './components/billing/BillingTab';
import { AIChatShell, CommandBar } from './components/chat/AIChat';
import AlertStrip, { useAlerts } from './components/notifications/AlertStrip';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import FounderModeOverlay from './components/overlays/FounderMode';
import { AutosaveStatus, useAutosaveNotifications } from './components/notifications/AutosaveNotifications';
import DisplaySettings from './components/settings/DisplaySettings';
import { DisplaySettingsProvider } from './hooks/useDisplaySettings';

function App() {
  const [currentView, setCurrentView] = React.useState('hq');
  const [showAIChat, setShowAIChat] = useState(false);
  const [showCommandBar, setShowCommandBar] = useState(false);
  const [showFounderMode, setShowFounderMode] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const { alerts, addAlert, removeAlert } = useAlerts();
  const { saveStatus, lastSaved } = useAutosaveNotifications();

  // Global shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandBar(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

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
      case 'settings':
        return (
          <div className="min-h-screen bg-background">
            <header className="border-b border-border">
              <div className="container mx-auto px-6 py-4">
                <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage your display preferences</p>
              </div>
            </header>
            <main className="container mx-auto px-6 py-8">
              <DisplaySettings />
            </main>
          </div>
        );
      case 'hq':
      default:
        return <HQDashboard />;
    }
  };

  return (
    <DisplaySettingsProvider>
      <TooltipProvider>
      {/* Alert Strip */}
      <AlertStrip alerts={alerts} onDismiss={removeAlert} />
      
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
              <AutosaveStatus status={saveStatus} lastSaved={lastSaved} />
              <button
                onClick={() => setCurrentView('settings')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  currentView === 'settings' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Settings
              </button>
              <button
                onClick={() => setShowFounderMode(true)}
                className="px-3 py-1 text-sm rounded-md text-muted-foreground hover:text-foreground"
              >
                Founder Mode
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16">
        {renderCurrentView()}
      </div>

      {/* Phase 3 Components */}
      <AIChatShell isOpen={showAIChat} onToggle={() => setShowAIChat(!showAIChat)} />
      <CommandBar isOpen={showCommandBar} onClose={() => setShowCommandBar(false)} />
      <FounderModeOverlay isOpen={showFounderMode} onClose={() => setShowFounderMode(false)} />
      <OnboardingFlow isOpen={showOnboarding} onComplete={() => setShowOnboarding(false)} onClose={() => setShowOnboarding(false)} />
      </TooltipProvider>
    </DisplaySettingsProvider>
  );
}

export default App;
