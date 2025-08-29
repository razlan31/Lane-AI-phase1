import React, { useState, useEffect } from 'react';
import { TooltipProvider } from './components/ui/tooltip';
import HQDashboard from './pages/HQDashboard';
import VentureDashboard from './components/dashboards/VentureDashboard';
import PricingPage from './components/billing/PricingPage';
import BillingTab from './components/billing/BillingTab';
import { AIChatShell, CommandBar } from './components/chat/AIChat';
import AlertStrip, { useAlerts } from './components/notifications/AlertStrip';
import OnboardingFlow from './pages/OnboardingFlow';
import FounderModeOverlay from './components/overlays/FounderMode';
import { AutosaveStatus, useAutosaveNotifications } from './components/notifications/AutosaveNotifications';
import DisplaySettings from './components/settings/DisplaySettings';
import { DisplaySettingsProvider } from './hooks/useDisplaySettings.jsx';
import TopBar from './components/navigation/TopBar';
import Sidebar from './components/navigation/Sidebar';
import GoalMode from './components/modes/GoalMode';
import StreamMode from './components/modes/StreamMode';
import PlaygroundMode from './components/modes/PlaygroundMode';
import ActivityLog from './components/activity/ActivityLog';
import AdminUsageDashboard from './components/admin/AdminUsageDashboard';

function App() {
  const [currentMode, setCurrentMode] = useState('goal');
  const [currentView, setCurrentView] = useState('hq');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showCommandBar, setShowCommandBar] = useState(false);
  const [showFounderMode, setShowFounderMode] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Mock ventures data
  const ventures = [
    { id: 1, name: 'Coffee Kiosk' },
    { id: 2, name: 'Tech Startup' }
  ];

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

  const handleModeChange = (mode) => {
    setCurrentMode(mode);
    // Set appropriate default view for each mode
    if (mode === 'goal') {
      setCurrentView('goal');
    } else if (mode === 'workspace') {
      setCurrentView('hq');
    } else if (mode === 'stream') {
      setCurrentView('stream');
    } else if (mode === 'playground') {
      setCurrentView('playground');
    }
  };

  const handleSuggestedPath = (goal) => {
    if (goal) {
      // Navigate to appropriate worksheet/dashboard based on goal
      setCurrentMode('workspace');
      setCurrentView('hq');
    } else {
      // User chose to skip, go to workspace mode
      setCurrentMode('workspace');
      setCurrentView('hq');
    }
  };

  const handlePromoteToWorkspace = (canvasBlocks) => {
    // Handle promotion of playground canvas to workspace
    setCurrentMode('workspace');
    setCurrentView('hq');
  };

  const renderCurrentView = () => {
    // Mode-specific views
    if (currentMode === 'goal') {
      return <GoalMode onSuggestedPath={handleSuggestedPath} />;
    }
    if (currentMode === 'stream') {
      return <StreamMode />;
    }
    if (currentMode === 'playground') {
      return <PlaygroundMode onPromoteToWorkspace={handlePromoteToWorkspace} />;
    }

    // Workspace mode views
    switch (currentView) {
      case 'venture-1':
        return <VentureDashboard ventureId={1} ventureName="Coffee Kiosk" />;
      case 'venture-2':
        return <VentureDashboard ventureId={2} ventureName="Tech Startup" />;
      case 'personal':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Personal Dashboard</h1>
            <p className="text-muted-foreground">Your personal finance and life dashboard</p>
          </div>
        );
      case 'tools':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Tools & Scratchpads</h1>
            <p className="text-muted-foreground">Custom worksheets and sandbox area</p>
          </div>
        );
      case 'reports':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Reports</h1>
            <p className="text-muted-foreground">Global reports across all ventures</p>
          </div>
        );
      case 'settings':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Settings</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Display Settings</h3>
                <DisplaySettings />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Billing</h3>
                <BillingTab />
              </div>
            </div>
          </div>
        );
      case 'activity':
        return <ActivityLog />;
      case 'admin':
        return <AdminUsageDashboard />;
      case 'hq':
      default:
        return <HQDashboard />;
    }
  };

  return (
    <DisplaySettingsProvider>
      <TooltipProvider>
        <div className="min-h-screen bg-background w-full">
          {/* Alert Strip */}
          <AlertStrip alerts={alerts} onDismiss={removeAlert} />
          
          {/* Top Bar */}
          <TopBar 
            onSearchClick={() => setShowCommandBar(true)}
            onProfileClick={() => setCurrentView('settings')}
          />

          <div className="flex w-full">
            {/* Sidebar */}
            <Sidebar
              currentMode={currentMode}
              onModeChange={handleModeChange}
              currentView={currentView}
              onViewChange={setCurrentView}
              ventures={ventures}
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
              <div className="p-6">
                {renderCurrentView()}
              </div>
            </main>
          </div>

          {/* AutoSave Status */}
          <div className="fixed bottom-4 right-4 z-50">
            <AutosaveStatus status={saveStatus} lastSaved={lastSaved} />
          </div>

          {/* Phase 3 Components */}
          <AIChatShell isOpen={showAIChat} onToggle={() => setShowAIChat(!showAIChat)} />
          <CommandBar isOpen={showCommandBar} onClose={() => setShowCommandBar(false)} />
          <FounderModeOverlay isOpen={showFounderMode} onClose={() => setShowFounderMode(false)} />
          <OnboardingFlow isOpen={showOnboarding} onComplete={() => setShowOnboarding(false)} onClose={() => setShowOnboarding(false)} />
        </div>
      </TooltipProvider>
    </DisplaySettingsProvider>
  );
}

export default App;
