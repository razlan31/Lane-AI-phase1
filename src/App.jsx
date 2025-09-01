import React, { useState, useEffect } from 'react';
import { TooltipProvider } from './components/ui/tooltip';
import HQDashboard from './components/dashboards/HQDashboard';
import VentureHub from './components/workspaces/VentureHub';
import ImportSeed from './pages/ImportSeed';
import ToolsScratchpads from './components/tools/ToolsScratchpads';
import TopBar from './components/navigation/TopBar';
import { DisplaySettingsProvider } from './hooks/useDisplaySettings.jsx';
import userProfile from './lib/userProfile';
import OnboardingWelcome from './components/onboarding/OnboardingWelcome';
import OnboardingSteps from './components/onboarding/OnboardingSteps';
import OnboardingComplete from './components/onboarding/OnboardingComplete';
import MainNavigation from './components/navigation/MainNavigation';
import QuickDock from './components/navigation/QuickDock';
import AICoPilot from './components/chat/AICoPilot';
import FounderMode from './components/modes/FounderMode';
import EnhancedOnboardingFlow from './components/onboarding/EnhancedOnboardingFlow';
import SettingsPage from './pages/SettingsPage';
import CommandPalette from './components/modals/CommandPalette';
import NewVentureModal from './components/modals/NewVentureModal';
import ExportModal from './components/export/ExportModal';

function App() {
  const [currentView, setCurrentView] = useState('copilot'); // AI Co-Pilot first per spec
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [userProfileData, setUserProfileData] = useState(null);
  const [showCoPilot, setShowCoPilot] = useState(true);
  const [showFounderMode, setShowFounderMode] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [newVentureModalOpen, setNewVentureModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

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

    // Global keyboard shortcuts
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
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
  const handleOnboardingComplete = async (profileData) => {
    // Handle skipped onboarding
    if (profileData.skipped) {
      await userProfile.completeOnboarding({ skipped: true, role: 'founder', ventureType: 'startup' });
      setUserProfileData({ skipped: true });
      setIsOnboarded(true);
      setCurrentView('copilot');
      return;
    }

    // Save full profile and create initial venture/KPIs
    await userProfile.completeOnboarding(profileData);
    setUserProfileData(profileData);
    
    // Create initial venture based on profile
    const initialVenture = {
      id: Date.now(),
      name: getVentureNameFromProfile(profileData),
      description: getVentureDescriptionFromProfile(profileData),
      runway: 12,
      cashflow: -1500,
      revenue: 5000,
      burnRate: 2500
    };
    
    setVentures([initialVenture]);
    setIsOnboarded(true);
    setCurrentView('copilot'); // Start with AI Co-Pilot
  };

  const handleCreateVenture = (ventureData) => {
    const newVentures = [...ventures, ventureData];
    setVentures(newVentures);
  };

  const getVentureNameFromProfile = (profile) => {
    const names = {
      tech_startup: 'My SaaS Startup',
      service_business: 'My Consulting Business',
      ecommerce: 'My Online Store',
      local_business: 'My Local Business',
      creative: 'My Creative Studio',
      other: 'My Business'
    };
    return names[profile.ventureType] || 'My Business';
  };

  const getVentureDescriptionFromProfile = (profile) => {
    const descriptions = {
      tech_startup: 'Building innovative software solutions',
      service_business: 'Providing professional services',
      ecommerce: 'Selling products online',
      local_business: 'Serving the local community',
      creative: 'Creating digital content and designs',
      other: 'Working on exciting projects'
    };
    return descriptions[profile.ventureType] || 'A new business venture';
  };

  // Quick dock handlers
  const handleQuickActions = {
    onAddWorksheet: () => console.log('Add worksheet'),
    onAddDashboard: () => console.log('Add dashboard'),
    onImportCsv: () => console.log('Import CSV'),
    onAddVenture: () => setNewVentureModalOpen(true),
    onFounderMode: () => setShowFounderMode(true),
    onExport: () => setExportModalOpen(true)
  };

  // TopBar handlers
  const handleTopBarActions = {
    onSearchClick: () => setCommandPaletteOpen(true),
    onProfileClick: () => setCurrentView('settings'),
    onFounderMode: () => setShowFounderMode(true),
    onHomeClick: () => setCurrentView('hq')
  };

  // Render main content
  const renderMainContent = () => {
    switch (currentView) {
      case 'copilot':
        return (
          <div className="h-full bg-background flex items-center justify-center">
            <div className="text-center space-y-6 max-w-2xl px-6">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-3">Welcome to AI Co-Pilot</h1>
                <p className="text-lg text-muted-foreground mb-6">
                  Your AI-first business assistant. Just describe what you need and I'll build it for you.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="font-medium mb-2">💬 Natural Language</div>
                    <div className="text-muted-foreground">"I run a coffee shop and need to track daily sales"</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="font-medium mb-2">🎯 Goal-Based</div>
                    <div className="text-muted-foreground">"I need to reach $10k monthly revenue"</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="font-medium mb-2">📊 Auto-Generated</div>
                    <div className="text-muted-foreground">Dashboards, worksheets, and KPIs built for you</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="font-medium mb-2">🚀 Always Learning</div>
                    <div className="text-muted-foreground">Adapts to your business as it grows</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'hq':
        return <HQDashboard ventures={ventures} userProfile={userProfileData} />;
      case 'workspace':
        return (
          <div className="min-h-screen bg-background">
            {/* Main Content */}
            <main className="px-6 py-8">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground">Workspace</h1>
                <p className="text-muted-foreground mt-2">Manage your ventures and projects</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {ventures.map(venture => (
                  <div key={venture.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-200 cursor-pointer" 
                       onClick={() => setCurrentView(`venture-${venture.id}`)}>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-foreground">{venture.name}</h2>
                        <p className="text-sm text-muted-foreground mt-1">{venture.description}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-muted-foreground">Active</span>
                      </div>
                    </div>
                    
                    {/* Mini Dashboard Metrics */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">${venture.revenue.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Monthly Revenue</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className={`text-2xl font-bold ${venture.cashflow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${Math.abs(venture.cashflow).toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">Cashflow</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{venture.runway}m</div>
                        <div className="text-xs text-muted-foreground">Runway</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">${venture.burnRate.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Burn Rate</div>
                      </div>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="flex justify-between items-center pt-4 border-t border-border">
                      <span className="text-primary hover:text-primary/80 font-medium inline-flex items-center gap-2">
                        Open Workspace →
                      </span>
                      <div className="flex gap-2">
                        <button className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">View Metrics</button>
                        <button className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">Settings</button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Add New Venture Card */}
                <div 
                  className="bg-card border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 transition-colors cursor-pointer flex items-center justify-center min-h-[300px]"
                  onClick={() => setNewVentureModalOpen(true)}
                >
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">+</span>
                    </div>
                    <h3 className="font-semibold mb-2">Add New Venture</h3>
                    <p className="text-sm text-muted-foreground">Create a new workspace for your business</p>
                  </div>
                </div>
              </div>
            </main>
          </div>
        );
      case 'playground':
        return <div className="p-6"><h1 className="text-2xl font-bold">Playground</h1><p>Experimental canvas coming soon...</p></div>;
      case 'scratchpads':
        return <ToolsScratchpads ventures={ventures} />;
      case 'reports':
        return <div className="p-6"><h1 className="text-2xl font-bold">Reports</h1><p>Global reports coming soon...</p></div>;
      case 'personal':
        return <div className="p-6"><h1 className="text-2xl font-bold">Personal Dashboard</h1><p>Personal metrics coming soon...</p></div>;
      case 'settings':
        return <SettingsPage userProfile={userProfileData} />;
      // Dynamic venture views
      default:
        if (currentView.startsWith('venture-')) {
          const ventureId = currentView.replace('venture-', '');
          const venture = ventures.find(v => v.id.toString() === ventureId);
          if (venture) {
            return <VentureHub ventureId={venture.id} ventureName={venture.name} />;
          }
        }
        return <HQDashboard ventures={ventures} userProfile={userProfileData} />;
    }
  };

  // Handle onboarding flow
  if (!isOnboarded) {
    return (
      <EnhancedOnboardingFlow 
        onComplete={handleOnboardingComplete}
      />
    );
  }

  return (
    <DisplaySettingsProvider>
      <TooltipProvider>
        <div className="min-h-screen bg-background w-full">
          <div className="flex h-screen overflow-hidden">
            {/* Main Navigation */}
            <MainNavigation 
              currentView={currentView}
              onViewChange={setCurrentView}
              ventures={ventures}
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
              onAddVenture={() => setNewVentureModalOpen(true)}
            />

            {/* Main Content Area with TopBar */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* TopBar */}
              <TopBar 
                onSearchClick={handleTopBarActions.onSearchClick}
                onProfileClick={handleTopBarActions.onProfileClick}
                onFounderMode={handleTopBarActions.onFounderMode}
                onHomeClick={handleTopBarActions.onHomeClick}
              />

              {/* Main Content */}
              <main className="flex-1 overflow-auto">
                {renderMainContent()}
              </main>
            </div>
          </div>

          {/* AI Co-Pilot - Always Available */}
          {showCoPilot && currentView !== 'copilot' && (
            <AICoPilot 
              isOpen={showCoPilot}
              onToggle={() => setShowCoPilot(!showCoPilot)}
              context={currentView.startsWith('venture-') ? 'venture' : 'global'}
              ventureId={currentView.startsWith('venture-') ? currentView.split('-')[1] : null}
            />
          )}

          {/* Founder Mode Overlay */}
          {showFounderMode && (
            <FounderMode onClose={() => setShowFounderMode(false)} />
          )}

          {/* Quick Actions Dock */}
          <QuickDock 
            onAddWorksheet={handleQuickActions.onAddWorksheet}
            onAddDashboard={handleQuickActions.onAddDashboard}
            onImportCsv={handleQuickActions.onImportCsv}
            onAddVenture={handleQuickActions.onAddVenture}
            onFounderMode={() => setShowFounderMode(true)}
          />

          {/* Global Modals */}
          <CommandPalette 
            isOpen={commandPaletteOpen} 
            onClose={() => setCommandPaletteOpen(false)} 
          />
          
          <NewVentureModal
            isOpen={newVentureModalOpen}
            onClose={() => setNewVentureModalOpen(false)}
            onCreateVenture={handleCreateVenture}
          />
          
          <ExportModal
            isOpen={exportModalOpen}
            onClose={() => setExportModalOpen(false)}
          />
        </div>
      </TooltipProvider>
    </DisplaySettingsProvider>
  );
}

export default App;