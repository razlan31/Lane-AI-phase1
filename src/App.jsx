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
import { toast } from 'sonner';

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
    const handleOpenAIChat = (e) => {
      setShowCoPilot(true);
      // Optional: pass context for AI chat initialization
    };
    const handleToggleAICopilot = () => setShowCoPilot(!showCoPilot);
    const handleOpenNewVentureModal = () => setNewVentureModalOpen(true);
    const handleOpenWorksheetBuilder = () => {
      // Forward the event to the current view component
      setShowCoPilot(true);
    };
    const handleOpenScenarioSandbox = () => {
      // You can add scenario sandbox modal here if needed
      setShowCoPilot(true);
    };
    const handleAutoGenerateKPIs = async (e) => {
      const { type, count = 3, ventureId } = e.detail || {};
      console.log(`Auto-generating ${count} KPIs of type: ${type}${ventureId ? ` for venture ${ventureId}` : ''}`);

      // If a specific venture is provided, derive and INSERT KPIs based on existing venture data
      if (ventureId) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            toast.error('Please sign in to generate KPIs.');
            return;
          }

          const { data: existingKpis, error: fetchErr } = await supabase
            .from('kpis')
            .select('id, name, value')
            .eq('venture_id', ventureId);
          if (fetchErr) throw fetchErr;

          const byName = (name) => (existingKpis || []).find(k => (k.name || '').toLowerCase() === name.toLowerCase());
          const hasName = (name) => !!byName(name);
          const lookupValue = (names) => {
            const lower = (existingKpis || []).map(k => ({ n: (k.name || '').toLowerCase(), v: Number(k.value) }));
            for (const candidate of names) {
              const hit = lower.find(x => x.n === candidate.toLowerCase());
              if (hit && !Number.isNaN(hit.v)) return hit.v;
            }
            return null;
          };

          const revenue = lookupValue(['monthly recurring revenue','mrr','monthly revenue','revenue']);
          const expenses = lookupValue(['expenses','monthly expenses','burn rate']);
          const customers = lookupValue(['customers','customer count','users','active users']);
          const churn = lookupValue(['churn rate','churn']);

          const recommendations = [];
          if (revenue != null && expenses != null && !hasName('Monthly Profit')) {
            recommendations.push({ name: 'Monthly Profit', value: Number((revenue - expenses).toFixed(2)) });
          }
          if (revenue != null && customers != null && customers > 0 && !hasName('Average Revenue Per User')) {
            recommendations.push({ name: 'Average Revenue Per User', value: Number((revenue / customers).toFixed(2)) });
          }
          if (revenue != null && churn != null && !hasName('Net MRR After Churn')) {
            const net = revenue * (1 - Number(churn) / 100);
            recommendations.push({ name: 'Net MRR After Churn', value: Number(net.toFixed(2)) });
          }

          if (recommendations.length === 0) {
            toast.info('No new KPIs could be derived from existing data.');
            window.dispatchEvent(new CustomEvent('kpisUpdated'));
            return;
          }

          const toInsert = recommendations.slice(0, count).map(r => ({
            venture_id: ventureId,
            name: r.name,
            value: r.value,
            confidence_level: 'estimate'
          }));

          const { data: inserted, error: insertErr } = await supabase
            .from('kpis')
            .insert(toInsert)
            .select('id');
          if (insertErr) throw insertErr;

          toast.success(`Added ${inserted?.length || toInsert.length} KPIs`, {
            description: 'Derived from your existing venture metrics.'
          });

          // Notify listeners to refetch
          window.dispatchEvent(new CustomEvent('kpisUpdated'));
          return;
        } catch (err) {
          console.error('KPI generation error:', err);
          toast.error('Failed to generate KPIs');
          return;
        }
      }

      // Otherwise, fallback: refresh KPIs from real data
      toast.success('Refreshing KPIs', {
        description: `Fetching latest metrics based on your data...`
      });
    };
    const handleOpenPersonalWorksheet = (e) => {
      const { worksheetType, worksheetName, worksheetDescription } = e.detail;
      console.log(`Opening personal worksheet: ${worksheetName}`);
      
      // For now, open AI chat to help create the personal worksheet
      setShowCoPilot(true);
      
      // In a real implementation, you would open a dedicated personal worksheet component
      // For demonstration, we'll trigger AI assistance
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('openAIChat', {
          detail: { 
            message: `Help me create and set up a ${worksheetName} worksheet. ${worksheetDescription}. Please guide me through the setup process and suggest what information I should track.`,
            context: 'personal-worksheet-creation'
          }
        }));
      }, 500);
    };
    const handleOpenReportViewer = (e) => {
      const { reportId, reportName } = e.detail;
      console.log(`Opening report viewer for: ${reportName} (ID: ${reportId})`);
      
      // Create a simple report viewer modal
      const reportContent = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
            <h1 style="margin: 0; color: #333;">${reportName}</h1>
            <button onclick="window.close()" style="background: #f44336; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Close</button>
          </div>
          <div style="line-height: 1.6; color: #555;">
            <h2>Executive Summary</h2>
            <p>This report provides comprehensive insights into your venture's performance for the selected period.</p>
            
            <h3>Key Metrics</h3>
            <ul>
              <li><strong>Revenue Growth:</strong> +15% month-over-month</li>
              <li><strong>Customer Acquisition:</strong> 42 new customers</li>
              <li><strong>Conversion Rate:</strong> 3.8% (up from 3.2%)</li>
              <li><strong>Churn Rate:</strong> 5.2% (down from 6.1%)</li>
            </ul>
            
            <h3>Financial Overview</h3>
            <p>Total revenue: $25,000 | Total expenses: $18,000 | Net profit: $7,000</p>
            <p>Cash runway: 18 months at current burn rate</p>
            
            <h3>Recommendations</h3>
            <ul>
              <li>Continue current marketing strategies as they're showing positive ROI</li>
              <li>Focus on customer retention to further reduce churn</li>
              <li>Consider expanding team to handle growth</li>
            </ul>
            
            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px;">
              Report generated on ${new Date().toLocaleDateString()} | Report ID: ${reportId}
            </p>
          </div>
        </div>
      `;
      
      const newWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes,resizable=yes');
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${reportName} - Report Viewer</title>
            <meta charset="utf-8">
          </head>
          <body style="margin: 0; padding: 0; background: #f5f5f5;">
            ${reportContent}
          </body>
        </html>
      `);
      newWindow.document.close();
    };
    const handleOpenWorksheet = (e) => {
      const { worksheetId, worksheetData } = e.detail;
      console.log(`Opening worksheet: ${worksheetData.name} (ID: ${worksheetId})`);
      
      // For now, open AI chat to help with worksheet setup
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('openAIChat', {
          detail: { 
            message: `I just created a new ${worksheetData.type} worksheet called "${worksheetData.name}". Help me set it up and start tracking the right metrics.`,
            context: 'worksheet-setup'
          }
        }));
      }, 100);
    };
    const handleOpenUpgradeModal = (e) => {
      const { requiredTier, feature, currentTier } = e.detail;
      console.log(`Opening upgrade modal for ${feature} requiring ${requiredTier}`);
      
      // In a real app, this would open the pricing/upgrade modal
      window.dispatchEvent(new CustomEvent('openAIChat', {
        detail: { 
          message: `I need to upgrade my account to access the ${feature} feature. Can you help me understand the ${requiredTier} plan benefits and upgrade process?`,
          context: 'upgrade-assistance'
        }
      }));
    };

    window.addEventListener('showFeatureDiscovery', handleFeatureDiscovery);
    window.addEventListener('showComprehensiveHelp', handleComprehensiveHelp);
    window.addEventListener('openAIChat', handleOpenAIChat);
    window.addEventListener('toggleAICopilot', handleToggleAICopilot);
    window.addEventListener('openNewVentureModal', handleOpenNewVentureModal);
    window.addEventListener('openWorksheetBuilder', handleOpenWorksheetBuilder);
    window.addEventListener('openScenarioSandbox', handleOpenScenarioSandbox);
    window.addEventListener('autoGenerateKPIs', handleAutoGenerateKPIs);
    window.addEventListener('openPersonalWorksheet', handleOpenPersonalWorksheet);
    window.addEventListener('openReportViewer', handleOpenReportViewer);
    window.addEventListener('openWorksheet', handleOpenWorksheet);
    window.addEventListener('openUpgradeModal', handleOpenUpgradeModal);

    return () => {
      window.removeEventListener('showFeatureDiscovery', handleFeatureDiscovery);
      window.removeEventListener('showComprehensiveHelp', handleComprehensiveHelp);
      window.removeEventListener('openAIChat', handleOpenAIChat);
      window.removeEventListener('toggleAICopilot', handleToggleAICopilot);
      window.removeEventListener('openNewVentureModal', handleOpenNewVentureModal);
      window.removeEventListener('openWorksheetBuilder', handleOpenWorksheetBuilder);
      window.removeEventListener('openScenarioSandbox', handleOpenScenarioSandbox);
      window.removeEventListener('autoGenerateKPIs', handleAutoGenerateKPIs);
      window.removeEventListener('openPersonalWorksheet', handleOpenPersonalWorksheet);
      window.removeEventListener('openReportViewer', handleOpenReportViewer);
      window.removeEventListener('openWorksheet', handleOpenWorksheet);
      window.removeEventListener('openUpgradeModal', handleOpenUpgradeModal);
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
    onAddDashboard: () => setCurrentView('hq'),
    onImportCsv: () => {
      window.dispatchEvent(new CustomEvent('openAIChat', {
        detail: { 
          message: 'Help me import CSV data into my workspace. I want to upload financial data, customer lists, or other business data.',
          context: 'csv-import'
        }
      }));
    },
    onAddVenture: () => setNewVentureModalOpen(true),
    onFounderMode: () => setShowFounderMode(true),
    onExport: () => setAdvancedExportModalOpen(true),
    onAdvancedReports: () => setAdvancedReportsOpen(true),
    onAddData: () => {
      window.dispatchEvent(new CustomEvent('openAIChat', {
        detail: { 
          message: 'Help me add data to my workspace. I want to input new business metrics, financial information, or other relevant data.',
          context: 'data-entry'
        }
      }));
    },
    onSignals: () => setCurrentView('hq'),
    onRunFlow: () => {
      window.dispatchEvent(new CustomEvent('openAIChat', {
        detail: { 
          message: 'Help me set up and run automated workflows for my business processes.',
          context: 'workflow-execution'
        }
      }));
    },
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