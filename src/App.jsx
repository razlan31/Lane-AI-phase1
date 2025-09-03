import { useState, useEffect } from 'react';
// CACHE BUST v4: Fixed circular imports and provider setup
import HQDashboard from './components/dashboards/HQDashboard';
import ImportSeed from './pages/ImportSeed';
import ToolsScratchpads from './components/tools/ToolsScratchpads';
import TopBar from './components/navigation/TopBar';
import { useDisplaySettings } from './hooks/useDisplaySettings.jsx';
import userProfile from './lib/userProfile';
import { useVentures } from './hooks/useVentures';
import { useRouter } from './hooks/useRouter';
import { supabase } from '@/integrations/supabase/client';

import OnboardingWelcome from './components/onboarding/OnboardingWelcome';
import OnboardingSteps from './components/onboarding/OnboardingSteps';
import OnboardingComplete from './components/onboarding/OnboardingComplete';
import MainNavigation from './components/navigation/MainNavigation';
import QuickDock from '@/components/dock/QuickDock';
import GlobalOrb from './components/navigation/GlobalOrb';
import EnhancedAIChat from './components/chat/EnhancedAIChat';
import FounderMode from './components/modes/FounderMode';
import { Activity, Play, Download, MessageCircle } from 'lucide-react';
import EnhancedOnboardingFlow from './components/onboarding/EnhancedOnboardingFlow';
import SettingsPage from './pages/SettingsPage';
import CommandPalette from './components/modals/CommandPalette';
import NewVentureModal from './components/modals/NewVentureModal';
import ExportModal from './components/export/ExportModal';
import AICopilotPage from './pages/AICopilotPage';
import { PersonalPage } from './pages/PersonalPage';
import { PortfolioDashboard } from './components/PortfolioDashboard';
import { AlertsStrip } from './components/AlertsStrip';
import PlaygroundCanvas from './components/playground/PlaygroundCanvas';
import VentureHub from './components/workspaces/VentureHub';
import ErrorBoundary from './components/ErrorBoundary';


function App() {
  console.log('App component rendering...');
  
  // All hooks must be called before any conditional returns
  const [currentView, setCurrentView] = useState('copilot');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [userProfileData, setUserProfileData] = useState(null);
  const [showCoPilot, setShowCoPilot] = useState(false);
  const [showFounderMode, setShowFounderMode] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [newVentureModalOpen, setNewVentureModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const { ventures, loading: venturesLoading, createVenture } = useVentures();
  const [currentUser, setCurrentUser] = useState(null);
  const { showPlainExplanations } = useDisplaySettings();

  // Get current user and check onboarding status
  useEffect(() => {
    const setupUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      if (user) {
        const onboarded = await userProfile.isOnboarded();
        setIsOnboarded(onboarded);
        if (onboarded) {
          const { data } = await userProfile.getProfile();
          setUserProfileData(data);
        }
      }
    };
    setupUser();

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

  console.log('User authenticated:', !!currentUser);


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
    const initialVentureData = {
      name: getVentureNameFromProfile(profileData),
      description: getVentureDescriptionFromProfile(profileData),
      type: profileData.ventureType || 'startup',
      stage: 'concept'
    };
    
    await createVenture(initialVentureData);
    setIsOnboarded(true);
    setCurrentView('copilot'); // Start with AI Co-Pilot
  };

  const handleCreateVenture = async (ventureData) => {
    const result = await createVenture(ventureData);
    if (!result.success) {
      console.error('Failed to create venture:', result.error);
    }
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
    onExport: () => setExportModalOpen(true),
    onAddData: () => console.log('Add data'),
    onSignals: () => console.log('View signals'),
    onRunFlow: () => console.log('Run flow'),
    onChat: () => setShowCoPilot(true)
  };

  // TopBar handlers
  const handleTopBarActions = {
    onSearchClick: () => setCommandPaletteOpen(true),
    onProfileClick: (section) => setCurrentView(section || 'settings'),
    onFounderMode: () => setShowFounderMode(true),
    onHomeClick: () => setCurrentView('hq')
  };

  const renderMainContent = () => {
    switch (currentView) {
      case 'copilot':
        return (
          <ErrorBoundary>
            <AICopilotPage />
          </ErrorBoundary>
        );
      case 'personal':
        return <PersonalPage />;
      case 'portfolio':
        return <PortfolioDashboard />;
      case 'hq':
        return (
          <>
            <AlertsStrip maxAlerts={2} />
            <HQDashboard ventures={ventures} userProfile={userProfileData} />
          </>
        );
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
        return <PlaygroundCanvas />;
      case 'scratchpads':
        return <ToolsScratchpads ventures={ventures} />;
      case 'reports':
        return <div className="p-6"><h1 className="text-2xl font-bold">Reports</h1><p>Global reports coming soon...</p></div>;
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
  console.log('Onboarded:', isOnboarded);
  if (!isOnboarded) {
    return (
      <EnhancedOnboardingFlow 
        onComplete={handleOnboardingComplete}
      />
    );
  }

  return (
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
            onToggleCoPilot={() => setShowCoPilot(!showCoPilot)}
          />

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {renderMainContent()}
          </main>
        </div>
      </div>

      {/* AI Co-Pilot - Enhanced Version */}
      {showCoPilot && (
        <EnhancedAIChat 
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

      {/* QuickDock - Main Auto-Promotion Flow */}
      <ErrorBoundary>
        <QuickDock />
      </ErrorBoundary>

      {/* GlobalOrb with AI Copilot Integration */}
      {!showCoPilot && (
        <ErrorBoundary>
          <GlobalOrb 
            context={currentView.startsWith('venture-') ? 'venture' : currentView}
            ventureId={currentView.startsWith('venture-') ? currentView.split('-')[1] : null}
          />
        </ErrorBoundary>
      )}

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
  );
}

export default App;