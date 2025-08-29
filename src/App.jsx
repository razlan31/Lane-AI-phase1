import React, { useState, useEffect } from 'react';
import { TooltipProvider } from './components/ui/tooltip';
import HQDashboard from './pages/HQDashboard';
import VentureWorkspace from './components/workspaces/VentureWorkspace';
import ToolsScratchpads from './components/tools/ToolsScratchpads';
import BillingTab from './components/billing/BillingTab';
import { AIChatShell, CommandBar } from './components/chat/AIChat';
import AlertStrip, { useAlerts } from './components/notifications/AlertStrip';
import OnboardingFlow from './pages/OnboardingFlow';
import FounderModeOverlay from './components/overlays/FounderMode';
import UpgradeModal from './components/modals/UpgradeModal';
import { AutosaveStatus, useAutosaveNotifications } from './components/notifications/AutosaveNotifications';
import DisplaySettings from './components/settings/DisplaySettings';
import { DisplaySettingsProvider } from './hooks/useDisplaySettings.jsx';
import SidebarRestructured from './components/navigation/SidebarRestructured';
import BuildModal from './components/modals/BuildModal';
import StreamMode from './components/modes/StreamMode';
import ActivityLog from './components/activity/ActivityLog';
import AdminUsageDashboard from './components/admin/AdminUsageDashboard';
import userProfile from './lib/userProfile';
import CsvUploadModal from './components/csv/CsvUploadModal';
import CsvMappingModal from './components/csv/CsvMappingModal';

function App() {
  const [currentView, setCurrentView] = useState('hq'); // Always start at HQ after onboarding
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showCommandBar, setShowCommandBar] = useState(false);
  const [showFounderMode, setShowFounderMode] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeTargetFeature, setUpgradeTargetFeature] = useState(null);
  
  // New Build Modal state
  const [showBuildModal, setShowBuildModal] = useState(false);
  
  // Flow state
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [showCsvUpload, setShowCsvUpload] = useState(false);
  const [showCsvMapping, setShowCsvMapping] = useState(false);
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
      
      // Show onboarding ONLY for new users, NEVER again after completion
      if (!onboarded) {
        setShowOnboarding(true);
        setCurrentView('onboarding'); // Dedicated onboarding view
      } else {
        setCurrentView('hq'); // Always land on HQ after onboarding
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

  // Handle onboarding completion - set flag and redirect to HQ
  const handleOnboardingComplete = async () => {
    await userProfile.setOnboarded(true);
    setIsOnboarded(true);
    setShowOnboarding(false);
    setCurrentView('hq'); // Always go to HQ after onboarding
    
    // Add welcome message
    addAlert({
      type: 'success',
      message: 'Welcome to LaneAI! Your workspace is ready.',
      duration: 5000
    });
  };

  // Build Modal Handlers
  const handleBuildClick = () => {
    setShowBuildModal(true);
  };

  const handleCreateVenture = (ventureData) => {
    console.log('Creating venture:', ventureData);
    // Add new venture to the list
    const newVenture = {
      id: ventures.length + 1,
      name: ventureData.name || `New Venture ${ventures.length + 1}`,
      description: ventureData.description || "Created via chat build",
      ...ventureData
    };
    setVentures([...ventures, newVenture]);
    setCurrentView(`venture-${newVenture.id}`);
  };

  const handleSelectTemplate = (template) => {
    console.log('Selected template:', template);
    handleCreateVenture({ 
      name: template.name, 
      description: `Created from ${template.name} template` 
    });
  };

  const handlePromoteFromPlayground = (canvasData) => {
    console.log('Promoting from playground:', canvasData);
    handleCreateVenture({ 
      name: 'Playground Venture', 
      description: 'Created from playground canvas' 
    });
  };

  // CSV Upload handlers
  const handleCsvUpload = () => {
    setShowBuildModal(false); // Close build modal first
    setShowCsvUpload(true);
  };

  const handleCsvUploaded = (csvData) => {
    setCsvData(csvData);
    setShowCsvUpload(false);
    setShowCsvMapping(true);
  };

  const handleCsvMappingComplete = (worksheetData) => {
    // Create venture from CSV import
    const newVenture = {
      id: ventures.length + 1,
      name: worksheetData.name || 'CSV Import Venture',
      description: 'Created from CSV import',
      source: 'csv_import'
    };
    setVentures([...ventures, newVenture]);
    setShowCsvMapping(false);
    setCsvData(null);
    setCurrentView(`venture-${newVenture.id}`);
    
    console.log('Created venture from CSV:', worksheetData);
  };

  // Render main content based on current view
  const renderMainContent = () => {
    // Handle onboarding separately - never mix with other views
    if (!isOnboarded && showOnboarding) {
      return (
        <OnboardingFlow 
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingComplete}
        />
      );
    }

    // Main app views - only show after onboarding is complete
    switch (currentView) {
      case 'hq':
        return <HQDashboard ventures={ventures} />;
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
      case 'stream':
        return <StreamMode />;
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
      default:
        return <HQDashboard ventures={ventures} />;
    }
  };

  // Don't render main app UI during onboarding - keep it clean and focused
  if (!isOnboarded && showOnboarding) {
    return (
      <DisplaySettingsProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-background">
            {renderMainContent()}
          </div>
        </TooltipProvider>
      </DisplaySettingsProvider>
    );
  }

  // Main App Layout - only show after onboarding complete
  return (
    <DisplaySettingsProvider>
      <TooltipProvider>
        <div className="min-h-screen bg-background w-full">
          {/* Alert Strip */}
          <AlertStrip alerts={alerts} onDismiss={removeAlert} />

          <div className="flex h-screen overflow-hidden">
            {/* Restructured Sidebar */}
            <SidebarRestructured
              currentView={currentView}
              onViewChange={setCurrentView}
              ventures={ventures}
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
              onBuildClick={handleBuildClick}
            />

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
              {renderMainContent()}
            </main>
          </div>

          {/* Build Modal - 3 tabs for different build approaches */}
          <BuildModal
            isOpen={showBuildModal}
            onClose={() => setShowBuildModal(false)}
            onCreateVenture={handleCreateVenture}
            onImportCsv={handleCsvUpload}
            onSelectTemplate={handleSelectTemplate}
            onPromoteFromPlayground={handlePromoteFromPlayground}
          />

          {/* AutoSave Status */}
          <div className="fixed bottom-4 right-4 z-50">
            <AutosaveStatus status={saveStatus} lastSaved={lastSaved} />
          </div>

          {/* AI Chat Shell */}
          <AIChatShell isOpen={showAIChat} onToggle={() => setShowAIChat(!showAIChat)} />
          <CommandBar isOpen={showCommandBar} onClose={() => setShowCommandBar(false)} />
          <FounderModeOverlay isOpen={showFounderMode} onClose={() => setShowFounderMode(false)} />
          
          {/* CSV Flow Components */}
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
