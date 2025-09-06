import { useState, useEffect, useCallback } from 'react';
// CACHE BUST v4: Fixed circular imports and provider setup
import HQDashboard from './components/dashboards/HQDashboard';
import EnvChecker from './components/EnvChecker';
import ServiceChecker from './components/ServiceChecker';
import { AuthWrapper } from './components/auth/AuthWrapper';
import ImportSeed from './pages/ImportSeed';
import ToolsScratchpads from './components/tools/ToolsScratchpads';
import TopBar from './components/navigation/TopBar';
import { useDisplaySettings } from './hooks/useDisplaySettings.jsx';
import userProfile from './lib/userProfile';
import { useVentures } from './hooks/useVentures.jsx';
import { useAuth } from './hooks/useAuth.jsx';
import { useRouter } from './hooks/useRouter';
import { supabase } from '@/integrations/supabase/client';
import { useKeyboardShortcuts, useGlobalShortcuts } from './hooks/useKeyboardShortcuts';

import OnboardingWelcome from './components/onboarding/OnboardingWelcome';
import OnboardingSteps from './components/onboarding/OnboardingSteps';
import OnboardingComplete from './components/onboarding/OnboardingComplete';
import MainNavigation from './components/navigation/MainNavigation';
import QuickDock from '@/components/dock/QuickDock';
import GlobalOrb from './components/navigation/GlobalOrb';
import EnhancedAIChat from './components/chat/EnhancedAIChat';
import CleanFounderMode from './components/modes/CleanFounderMode';
import { Activity, Play, Download, MessageCircle } from 'lucide-react';
import EnhancedOnboardingFlow from './components/onboarding/EnhancedOnboardingFlow';
import SettingsPage from './pages/SettingsPage';
import CommandPalette from './components/modals/CommandPalette';
import NewVentureModal from './components/modals/NewVentureModal';
import ExportModal from './components/export/ExportModal';
import AdvancedExportModal from './components/export/AdvancedExportModal';
import AdvancedReportsPanel from './components/reports/AdvancedReportsPanel';
import WorksheetTemplatesGallery from './components/templates/WorksheetTemplatesGallery';
import HelpModal from './components/modals/HelpModal';
import FeatureDiscovery from './components/discovery/FeatureDiscovery';
import FeatureTooltips from './components/discovery/FeatureTooltips';
import ComprehensiveHelpSystem from './components/help/ComprehensiveHelpSystem';
import AICopilotPage from './pages/AICopilotPage';
import { PersonalPage } from './pages/PersonalPage';
import PortfolioDashboard from './components/PortfolioDashboard';
import { AlertsStrip } from './components/AlertsStrip';
import PlaygroundCanvas from './components/playground/PlaygroundCanvas';
import VentureHub from './components/workspaces/VentureHub';
import ErrorBoundary from './components/ErrorBoundary';
import GlobalUpgradeHandler from './components/gating/GlobalUpgradeHandler';


function App() {
  
  // All hooks must be called before any conditional returns
  const [currentView, setCurrentView] = useState('copilot');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 768); // Auto-collapse on mobile
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [userProfileData, setUserProfileData] = useState(null);
  const [showCoPilot, setShowCoPilot] = useState(false);
  const [showFounderMode, setShowFounderMode] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [newVentureModalOpen, setNewVentureModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [advancedExportModalOpen, setAdvancedExportModalOpen] = useState(false);
  const [advancedReportsOpen, setAdvancedReportsOpen] = useState(false);
  const [templatesGalleryOpen, setTemplatesGalleryOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [featureDiscoveryOpen, setFeatureDiscoveryOpen] = useState(false);
  const [comprehensiveHelpOpen, setComprehensiveHelpOpen] = useState(false);
  const [discoveryTarget, setDiscoveryTarget] = useState(null);
  const { ventures, loading: venturesLoading, createVenture } = useVentures();
  const { user: currentUser } = useAuth();
  const { showPlainExplanations } = useDisplaySettings();

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();
  
  // Handle global shortcuts
  useGlobalShortcuts({
    onNavigate: setCurrentView,
    onOpenCommandPalette: () => setCommandPaletteOpen(true),
    onToggleCopilot: () => setShowCoPilot(!showCoPilot),
    onToggleFounderMode: () => setShowFounderMode(true),
    onOpenSearch: () => setCommandPaletteOpen(true),
    onEscape: () => {
      setShowCoPilot(false);
      setShowFounderMode(false);
      setCommandPaletteOpen(false);
      setNewVentureModalOpen(false);
      setExportModalOpen(false);
      setAdvancedExportModalOpen(false);
      setAdvancedReportsOpen(false);
      setTemplatesGalleryOpen(false);
      setHelpModalOpen(false);
      setFeatureDiscoveryOpen(false);
      setComprehensiveHelpOpen(false);
    },
  });

  // Get user profile and check onboarding status
  // Global event listeners for UX features
  useEffect(() => {
    const handleFeatureDiscovery = (e) => {
      setDiscoveryTarget(e.detail?.target || null);
      setFeatureDiscoveryOpen(true);
    };
    const handleComprehensiveHelp = () => setComprehensiveHelpOpen(true);

    window.addEventListener('showFeatureDiscovery', handleFeatureDiscovery);
    window.addEventListener('showComprehensiveHelp', handleComprehensiveHelp);

    return () => {
      window.removeEventListener('showFeatureDiscovery', handleFeatureDiscovery);
      window.removeEventListener('showComprehensiveHelp', handleComprehensiveHelp);
    };
  }, []);

  useEffect(() => {
    const setupUserProfile = async () => {
      if (!currentUser) {
        setUserProfileData(null);
        setIsOnboarded(false);
        return;
      }

      try {
        const onboarded = await userProfile.isOnboarded();
        setIsOnboarded(onboarded);
        if (onboarded) {
          const { data } = await userProfile.getProfile();
          setUserProfileData(data);
        }
      } catch (error) {
        console.error('Profile setup error:', error);
        setIsOnboarded(false);
      }
    };

    setupUserProfile();
  }, [currentUser]);

  console.log('User authenticated:', !!currentUser);


  // Onboarding handlers
  const handleOnboardingComplete = async (profileData) => {
    // Handle skipped onboarding
    if (profileData.skipped) {
      await userProfile.completeOnboarding({ role: 'founder', venture_type: 'startup' });
      setUserProfileData({ role: 'founder', venture_type: 'startup' });
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
    onAddWorksheet: () => setTemplatesGalleryOpen(true),
    onAddDashboard: () => console.log('Add dashboard'),
    onImportCsv: () => console.log('Import CSV'),
    onAddVenture: () => setNewVentureModalOpen(true),
    onFounderMode: () => setShowFounderMode(true),
    onExport: () => setAdvancedExportModalOpen(true),
    onAdvancedReports: () => setAdvancedReportsOpen(true),
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
            <main className="px-4 sm:px-6 py-8">
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Workspace</h1>
                <p className="text-muted-foreground mt-2">Manage your ventures and projects</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {ventures.map(venture => (
                  <div key={venture.id} className="bg-card border border-border rounded-lg p-4 sm:p-6 hover-lift cursor-pointer animate-fade-in" 
                       onClick={() => setCurrentView(`venture-${venture.id}`)}>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg sm:text-xl font-bold text-foreground truncate">{venture.name}</h2>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{venture.description}</p>
                      </div>
                      <div className="flex items-center gap-1 ml-4">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-muted-foreground">Active</span>
                      </div>
                    </div>
                    
                    {/* Mini Dashboard Metrics */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-lg sm:text-2xl font-bold text-green-600">${venture.revenue?.toLocaleString() || '0'}</div>
                        <div className="text-xs text-muted-foreground">Monthly Revenue</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className={`text-lg sm:text-2xl font-bold ${(venture.cashflow || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${Math.abs(venture.cashflow || 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">Cashflow</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-lg sm:text-2xl font-bold text-blue-600">{venture.runway || 0}m</div>
                        <div className="text-xs text-muted-foreground">Runway</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-lg sm:text-2xl font-bold text-orange-600">${(venture.burnRate || 0).toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Burn Rate</div>
                      </div>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="flex justify-between items-center pt-4 border-t border-border">
                      <span className="text-primary hover:text-primary/80 font-medium inline-flex items-center gap-2 text-sm">
                        Open Workspace →
                      </span>
                      <div className="flex gap-2">
                        <button className="text-xs bg-primary/10 text-primary px-2 py-1 rounded touch-manipulation">
                          View Metrics
                        </button>
                        <button className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded touch-manipulation">
                          Settings
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Add New Venture Card */}
                <div 
                  className="bg-card border-2 border-dashed border-border rounded-lg p-4 sm:p-6 hover:border-primary/50 transition-colors cursor-pointer flex items-center justify-center min-h-[280px] sm:min-h-[300px] hover-lift"
                  onClick={() => setNewVentureModalOpen(true)}
                >
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-2xl text-primary">+</span>
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
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">Advanced Reports</h1>
                <p className="text-muted-foreground">Comprehensive business analytics and insights</p>
              </div>
              <Button onClick={() => setAdvancedReportsOpen(true)}>
                Open Advanced Reports
              </Button>
            </div>
            <div className="text-center py-12 text-muted-foreground">
              <p>Click "Open Advanced Reports" to access comprehensive analytics</p>
            </div>
          </div>
        );
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
      <EnvChecker>
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
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* TopBar */}
          <TopBar 
            onSearchClick={handleTopBarActions.onSearchClick}
            onProfileClick={handleTopBarActions.onProfileClick}
            onFounderMode={handleTopBarActions.onFounderMode}
            onHomeClick={handleTopBarActions.onHomeClick}
            onToggleCoPilot={() => setShowCoPilot(!showCoPilot)}
            onToggleMobileMenu={() => setSidebarCollapsed(!sidebarCollapsed)}
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
        <CleanFounderMode onClose={() => setShowFounderMode(false)} />
      )}

      {/* QuickDock - Main Auto-Promotion Flow */}
      <ErrorBoundary>
        <QuickDock onNavigate={setCurrentView} />
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

      <HelpModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
      />

      <AdvancedExportModal
        isOpen={advancedExportModalOpen}
        onClose={() => setAdvancedExportModalOpen(false)}
        data={{ ventures, currentView }}
      />

      <AdvancedReportsPanel
        isOpen={advancedReportsOpen}
        onClose={() => setAdvancedReportsOpen(false)}
        ventures={ventures}
      />

      <WorksheetTemplatesGallery
        isOpen={templatesGalleryOpen}
        onClose={() => setTemplatesGalleryOpen(false)}
        onSelectTemplate={(template) => {
          console.log('Selected template:', template);
          // Handle template selection
        }}
      />

      <GlobalUpgradeHandler />

      {/* Feature Discovery and Help */}
      <FeatureDiscovery
        isOpen={featureDiscoveryOpen}
        onClose={() => setFeatureDiscoveryOpen(false)}
        targetFeature={discoveryTarget}
      />

      <ComprehensiveHelpSystem
        isOpen={comprehensiveHelpOpen}
        onClose={() => setComprehensiveHelpOpen(false)}
      />

      <FeatureTooltips />
      </div>
      </EnvChecker>
    </div>
  );
}

export default App;