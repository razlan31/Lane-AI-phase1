import React, { useState, useEffect } from 'react';
import { TooltipProvider } from './components/ui/tooltip';
import HQDashboard from './components/dashboards/HQDashboard';
import VentureHub from './components/workspaces/VentureHub';
import ImportSeed from './pages/ImportSeed';
import ToolsScratchpads from './components/tools/ToolsScratchpads';
import { DisplaySettingsProvider } from './hooks/useDisplaySettings.jsx';
import userProfile from './lib/userProfile';
import OnboardingWelcome from './components/onboarding/OnboardingWelcome';
import OnboardingSteps from './components/onboarding/OnboardingSteps';
import OnboardingComplete from './components/onboarding/OnboardingComplete';
import MainSidebar from './components/navigation/MainSidebar';
import QuickDock from './components/navigation/QuickDock';

function App() {
  const [currentView, setCurrentView] = useState('hq');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState('welcome'); // 'welcome', 'steps', 'complete'
  const [userProfileData, setUserProfileData] = useState(null);

  // Check onboarding status on mount
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const onboarded = await userProfile.isOnboarded();
      setIsOnboarded(onboarded);
      if (onboarded) {
        const { data } = await userProfile.getProfile();
        setUserProfileData(data);
      }
    };
    checkOnboardingStatus();
  }, []);

  // Mock ventures data
  const [ventures, setVentures] = useState([
    { 
      id: 1, 
      name: "Coffee Kiosk", 
      description: "Local coffee shop business",
      runway: 8, 
      cashflow: -2400, 
      revenue: 8500, 
      burnRate: 3200 
    },
    { 
      id: 2, 
      name: "Tech Startup", 
      description: "SaaS platform for small businesses",
      runway: 15, 
      cashflow: 1200, 
      revenue: 12000, 
      burnRate: 5500 
    }
  ]);

  // Onboarding handlers
  const handleOnboardingStart = () => {
    setOnboardingStep('steps');
  };

  const handleOnboardingSkip = async () => {
    // Save minimal profile and mark as onboarded
    await userProfile.completeOnboarding({
      role: 'other',
      ventureType: 'small_business',
      stage: 'idea',
      generatedKpis: ['Runway', 'Cashflow', 'Obligations']
    });
    setIsOnboarded(true);
    setCurrentView('hq');
  };

  const handleOnboardingComplete = async (profileData) => {
    // Save full profile
    await userProfile.completeOnboarding(profileData);
    setUserProfileData(profileData);
    setOnboardingStep('complete');
  };

  const handleEnterApp = () => {
    setIsOnboarded(true);
    setCurrentView('hq');
  };

  // Quick dock handlers
  const handleQuickActions = {
    onAddWorksheet: () => console.log('Add worksheet'),
    onAddDashboard: () => console.log('Add dashboard'),
    onImportCsv: () => console.log('Import CSV'),
    onAddVenture: () => console.log('Add venture'),
    onFounderMode: () => console.log('Open Founder Mode')
  };

  // Render main content
  const renderMainContent = () => {
    switch (currentView) {
      case 'hq':
        return <HQDashboard ventures={ventures} userProfile={userProfileData} />;
      case 'workspace':
        return (
          <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-background/95 backdrop-blur-sm">
              <div className="container mx-auto px-6 py-6">
                <h1 className="text-3xl font-bold text-foreground">Workspace</h1>
                <p className="text-muted-foreground mt-2">Manage your ventures and projects</p>
              </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {ventures.map(venture => (
                  <div key={venture.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="mb-4">
                      <h2 className="text-xl font-bold text-foreground">{venture.name}</h2>
                      <p className="text-sm text-muted-foreground mt-1">{venture.description}</p>
                    </div>
                    
                    <button 
                      onClick={() => setCurrentView(`venture-${venture.id}`)}
                      className="text-primary hover:text-primary/80 font-medium inline-flex items-center gap-2"
                    >
                      Open Workspace →
                    </button>
                  </div>
                ))}
              </div>
            </main>
          </div>
        );
      case 'venture-1':
        return <VentureHub ventureId={1} ventureName="Coffee Kiosk" />;
      case 'venture-2':
        return <VentureHub ventureId={2} ventureName="Tech Startup" />;
      case 'chat-build':
        return <div className="p-6"><h1 className="text-2xl font-bold">Chat Build</h1><p>AI-guided builder coming soon...</p></div>;
      case 'stream':
        return <div className="p-6"><h1 className="text-2xl font-bold">Stream</h1><p>Timeline of insights coming soon...</p></div>;
      case 'import-seed':
        return <ImportSeed />;
      case 'playground':
        return <div className="p-6"><h1 className="text-2xl font-bold">Playground</h1><p>Freeform canvas coming soon...</p></div>;
      case 'scratchpads':
        return <ToolsScratchpads ventures={ventures} />;
      case 'reports':
        return <div className="p-6"><h1 className="text-2xl font-bold">Reports</h1><p>Global reports coming soon...</p></div>;
      case 'personal':
        return <div className="p-6"><h1 className="text-2xl font-bold">Personal Dashboard</h1><p>Personal metrics coming soon...</p></div>;
      case 'settings':
        return <div className="p-6"><h1 className="text-2xl font-bold">Settings</h1><p>Profile and preferences coming soon...</p></div>;
      default:
        return <HQDashboard ventures={ventures} userProfile={userProfileData} />;
    }
  };

  // Handle onboarding flow
  if (!isOnboarded) {
    switch (onboardingStep) {
      case 'welcome':
        return (
          <OnboardingWelcome 
            onGetStarted={handleOnboardingStart}
            onSkip={handleOnboardingSkip}
          />
        );
      case 'steps':
        return (
          <OnboardingSteps 
            onComplete={handleOnboardingComplete}
          />
        );
      case 'complete':
        return (
          <OnboardingComplete 
            profileData={userProfileData}
            onContinue={handleEnterApp}
          />
        );
      default:
        return null;
    }
  }

  return (
    <DisplaySettingsProvider>
      <TooltipProvider>
        <div className="min-h-screen bg-background w-full">
          <div className="flex h-screen overflow-hidden">
            {/* Main Sidebar */}
            <MainSidebar 
              currentView={currentView}
              onViewChange={setCurrentView}
              ventures={ventures}
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
              {renderMainContent()}
            </main>
          </div>

          {/* Quick Actions Dock */}
          <QuickDock 
            onAddWorksheet={handleQuickActions.onAddWorksheet}
            onAddDashboard={handleQuickActions.onAddDashboard}
            onImportCsv={handleQuickActions.onImportCsv}
            onAddVenture={handleQuickActions.onAddVenture}
            onFounderMode={handleQuickActions.onFounderMode}
          />
        </div>
      </TooltipProvider>
    </DisplaySettingsProvider>
  );
}

export default App;