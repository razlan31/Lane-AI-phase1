import React, { useState, useEffect } from 'react';
import { TooltipProvider } from './components/ui/tooltip';
import HQDashboard from './pages/HQDashboard';
import VentureWorkspace from './components/workspaces/VentureWorkspace';
import ToolsScratchpads from './components/tools/ToolsScratchpads';
import { DisplaySettingsProvider } from './hooks/useDisplaySettings.jsx';
import userProfile from './lib/userProfile';

function App() {
  const [currentView, setCurrentView] = useState('hq');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(true); // Start with true for now

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

  // Simple sidebar component
  const SimpleSidebar = () => (
    <aside className="w-64 border-r border-border bg-card/50 p-4">
      <h2 className="text-lg font-semibold mb-4">Navigation</h2>
      <div className="space-y-2">
        <button 
          onClick={() => setCurrentView('hq')}
          className={`w-full text-left px-3 py-2 rounded ${currentView === 'hq' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
        >
          🏠 HQ
        </button>
        <button 
          onClick={() => setCurrentView('venture-1')}
          className={`w-full text-left px-3 py-2 rounded ${currentView === 'venture-1' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
        >
          ☕ Coffee Kiosk
        </button>
        <button 
          onClick={() => setCurrentView('venture-2')}
          className={`w-full text-left px-3 py-2 rounded ${currentView === 'venture-2' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
        >
          💻 Tech Startup
        </button>
        <button 
          onClick={() => setCurrentView('tools')}
          className={`w-full text-left px-3 py-2 rounded ${currentView === 'tools' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
        >
          🔧 Tools
        </button>
      </div>
    </aside>
  );

  // Render main content
  const renderMainContent = () => {
    switch (currentView) {
      case 'hq':
        return <HQDashboard ventures={ventures} />;
      case 'venture-1':
        return <VentureWorkspace ventureId={1} ventureName="Coffee Kiosk" />;
      case 'venture-2':
        return <VentureWorkspace ventureId={2} ventureName="Tech Startup" />;
      case 'tools':
        return <ToolsScratchpads ventures={ventures} />;
      default:
        return <HQDashboard ventures={ventures} />;
    }
  };

  return (
    <DisplaySettingsProvider>
      <TooltipProvider>
        <div className="min-h-screen bg-background w-full">
          <div className="flex h-screen overflow-hidden">
            {/* Simple Sidebar */}
            <SimpleSidebar />

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
              {renderMainContent()}
            </main>
          </div>
        </div>
      </TooltipProvider>
    </DisplaySettingsProvider>
  );
}

export default App;