import React, { useState, useEffect } from 'react';
import { TooltipProvider } from './components/ui/tooltip';
import HQDashboard from './pages/HQDashboard';
import VentureWorkspace from './components/workspaces/VentureWorkspace';
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
    onAddVenture: () => console.log('Add venture (Pro feature)')
  };

  // Render main content
  const renderMainContent = () => {
    switch (currentView) {
      case 'hq':
        return <HQDashboard ventures={ventures} userProfile={userProfileData} />;
      case 'workspace':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Workspace</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ventures.map(venture => (
                <div key={venture.id} className="p-4 border rounded-lg">
                  <h3 className="font-semibold">{venture.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{venture.description}</p>
                  <button 
                    onClick={() => setCurrentView(`venture-${venture.id}`)}
                    className="text-primary hover:underline"
                  >
                    Open Workspace →
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'venture-1':
        return <VentureWorkspace ventureId={1} ventureName="Coffee Kiosk" />;
      case 'venture-2':
        return <VentureWorkspace ventureId={2} ventureName="Tech Startup" />;
      case 'chat-build':
        return <div className="p-6"><h1 className="text-2xl font-bold">Chat Build</h1><p>AI-guided builder coming soon...</p></div>;
      case 'stream':
        return <div className="p-6"><h1 className="text-2xl font-bold">Stream</h1><p>Timeline of insights coming soon...</p></div>;
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
          />
        </div>
      </TooltipProvider>
    </DisplaySettingsProvider>
  );
}

export default App;