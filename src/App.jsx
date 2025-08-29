import React, { useState, useEffect } from 'react';
import { TooltipProvider } from './components/ui/tooltip';
import HQDashboard from './pages/HQDashboard';
import VentureDashboard from './components/dashboards/VentureDashboard';
import VentureWorkspace from './components/workspaces/VentureWorkspace';
import ToolsScratchpads from './components/tools/ToolsScratchpads';
import PricingPage from './components/billing/PricingPage';
import BillingTab from './components/billing/BillingTab';
import { AIChatShell, CommandBar } from './components/chat/AIChat';
import AlertStrip, { useAlerts } from './components/notifications/AlertStrip';
import OnboardingFlow from './pages/OnboardingFlow';
import FounderModeOverlay from './components/overlays/FounderMode';
import UpgradeModal from './components/modals/UpgradeModal';
import { AutosaveStatus, useAutosaveNotifications } from './components/notifications/AutosaveNotifications';
import DisplaySettings from './components/settings/DisplaySettings';
import { DisplaySettingsProvider } from './hooks/useDisplaySettings.jsx';
import TopBar from './components/navigation/TopBar';
import Sidebar from './components/navigation/Sidebar';
import GoalChatMode from './components/modes/GoalChatMode';
import StreamMode from './components/modes/StreamMode';
import PlaygroundMode from './components/modes/PlaygroundMode';
import ActivityLog from './components/activity/ActivityLog';
import AdminUsageDashboard from './components/admin/AdminUsageDashboard';
import userProfile from './lib/userProfile';
import HQEmptyState from './components/states/HQEmptyState';
import CsvUploadModal from './components/csv/CsvUploadModal';
import CsvMappingModal from './components/csv/CsvMappingModal';
import TemplatesGallery from './components/templates/TemplatesGallery';

function App() {
  const [currentMode, setCurrentMode] = useState('workspace');
  const [currentView, setCurrentView] = useState('hq');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showCommandBar, setShowCommandBar] = useState(false);
  const [showFounderMode, setShowFounderMode] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeTargetFeature, setUpgradeTargetFeature] = useState(null);
  
  // Flow state
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [showGoalChat, setShowGoalChat] = useState(false);
  const [showCsvUpload, setShowCsvUpload] = useState(false);
  const [showCsvMapping, setShowCsvMapping] = useState(false);
  const [showTemplatesGallery, setShowTemplatesGallery] = useState(false);
  const [csvData, setCsvData] = useState(null);

  // Mock ventures data - add sample ventures to demonstrate the workspace structure
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

  const { alerts, addAlert, removeAlert } = useAlerts();
  const { saveStatus, lastSaved } = useAutosaveNotifications();

  // Check onboarding status and setup global listeners
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const onboarded = await userProfile.isOnboarded();
      setIsOnboarded(onboarded);
      
      // Show onboarding for new users
      if (!onboarded) {
        setShowOnboarding(true);
      }
    };

    checkOnboardingStatus();

    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandBar(true);
      }
    };
    
    const handleUpgradeModal = (e) => {
      setUpgradeTargetFeature(e.detail.feature);
      setShowUpgradeModal(true);
    };
    
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('showUpgradeModal', handleUpgradeModal);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('showUpgradeModal', handleUpgradeModal);
    };
  }, []);

  const handleModeChange = (mode) => {
    setCurrentMode(mode);
    // Set appropriate default view for each mode
    if (mode === 'goal') {
      setShowGoalChat(true);
    } else if (mode === 'workspace') {
      setCurrentView('hq');
    } else if (mode === 'stream') {
      setCurrentView('stream');
    } else if (mode === 'playground') {
      setCurrentView('playground');
    }
  };

  const handleOnboardingComplete = async (profileData) => {
    await userProfile.completeOnboarding(profileData);
    setIsOnboarded(true);
    setShowOnboarding(false);
    
    // Create a starter venture if onboarding includes it
    if (profileData.createStarterVenture) {
      const newVenture = {
        id: Date.now(),
        name: profileData.ventureName || 'My Venture',
        status: 'draft'
      };
      setVentures([newVenture]);
    }
  };

  // Build flow handlers
  const handleStartChat = () => {
    setShowGoalChat(true);
  };

  const handleImportCSV = () => {
    setShowCsvUpload(true);
  };

  const handleOpenPlayground = () => {
    setCurrentMode('playground');
    setCurrentView('playground');
  };

  const handleGoalChatComplete = (ventureData) => {
    // Create venture from chat flow
    const newVenture = {
      id: Date.now(),
      name: ventureData.name,
      goal: ventureData.goal,
      status: 'draft'
    };
    setVentures([...ventures, newVenture]);
    setShowGoalChat(false);
    setCurrentView('hq');
    
    // TODO: Create worksheets based on ventureData
    console.log('Created venture from chat:', ventureData);
  };

  const handleCsvUploaded = (csvData) => {
    setCsvData(csvData);
    setShowCsvUpload(false);
    setShowCsvMapping(true);
  };

  const handleCsvMappingComplete = (worksheetData) => {
    // Create venture from CSV import
    const newVenture = {
      id: Date.now(),
      name: worksheetData.name,
      source: 'csv_import',
      status: 'draft'
    };
    setVentures([...ventures, newVenture]);
    setShowCsvMapping(false);
    setCsvData(null);
    setCurrentView('hq');
    
    // TODO: Create worksheet based on worksheetData
    console.log('Created venture from CSV:', worksheetData);
  };

  const handleTemplateSelected = (templateData) => {
    // Create venture from template
    const newVenture = {
      id: Date.now(),
      name: `${templateData.template.title} Workspace`,
      template: templateData.template.id,
      status: 'draft'
    };
    setVentures([...ventures, newVenture]);
    setShowTemplatesGallery(false);
    setCurrentView('hq');
    
    // TODO: Create worksheets based on template
    console.log('Created venture from template:', templateData);
  };

  const handlePromoteToWorkspace = (canvasBlocks) => {
    // Handle promotion of playground canvas to workspace
    const newVenture = {
      id: Date.now(),
      name: 'Playground Workspace',
      source: 'playground',
      blocks: canvasBlocks,
      status: 'draft'
    };
    setVentures([...ventures, newVenture]);
    setCurrentMode('workspace');
    setCurrentView('hq');
    
    console.log('Promoted playground to workspace:', canvasBlocks);
  };

  const renderCurrentView = () => {
    // Mode-specific views
    if (currentMode === 'stream') {
      return <StreamMode />;
    }
    if (currentMode === 'playground') {
      return <PlaygroundMode onPromoteToWorkspace={handlePromoteToWorkspace} />;
    }

    // Workspace mode views
    switch (currentView) {
      case 'venture-1':
        return <VentureWorkspace ventureId={1} ventureName="Coffee Kiosk" />;
      case 'venture-2':
        return <VentureWorkspace ventureId={2} ventureName="Tech Startup" />;
      case 'personal':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Personal Dashboard</h1>
            <p className="text-muted-foreground">Your personal finance and life dashboard</p>
          </div>
        );
      case 'tools':
        return <ToolsScratchpads ventures={ventures} />;
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
        // Show empty state if no ventures, otherwise show HQ dashboard
        if (ventures.length === 0) {
          return (
            <HQEmptyState 
              onStartChat={handleStartChat}
              onImportCSV={handleImportCSV}
              onOpenPlayground={handleOpenPlayground}
            />
          );
        }
        return <HQDashboard ventures={ventures} />;
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
          
          {/* Flow Components */}
          <OnboardingFlow 
            isOpen={showOnboarding} 
            onComplete={handleOnboardingComplete} 
            onClose={() => setShowOnboarding(false)} 
          />
          <GoalChatMode 
            isOpen={showGoalChat}
            onCreateVenture={handleGoalChatComplete}
            onClose={() => setShowGoalChat(false)}
          />
          <CsvUploadModal 
            isOpen={showCsvUpload}
            onClose={() => setShowCsvUpload(false)}
            onFileUploaded={handleCsvUploaded}
          />
          <CsvMappingModal 
            isOpen={showCsvMapping}
            csvData={csvData}
            onClose={() => setShowCsvMapping(false)}
            onMappingComplete={handleCsvMappingComplete}
          />
          <TemplatesGallery 
            isOpen={showTemplatesGallery}
            onClose={() => setShowTemplatesGallery(false)}
            onTemplateSelected={handleTemplateSelected}
          />
          <UpgradeModal 
            isOpen={showUpgradeModal} 
            onClose={() => setShowUpgradeModal(false)} 
            targetFeature={upgradeTargetFeature} 
          />
        </div>
      </TooltipProvider>
    </DisplaySettingsProvider>
  );
}

export default App;
