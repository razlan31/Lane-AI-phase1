import React, { useState, useEffect } from 'react';
import { TooltipProvider } from '../components/ui/tooltip';
import HQDashboard from '../components/dashboards/HQDashboard';
import MainNavigation from '../components/navigation/MainNavigation';
import TopBar from '../components/navigation/TopBar';
import QuickDock from '../components/dock/QuickDock';
import { DisplaySettingsProvider } from '../hooks/useDisplaySettings.jsx';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ExternalLink, ArrowLeft } from 'lucide-react';

const DemoPage = () => {
  const [currentView, setCurrentView] = useState('hq');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Demo data
  const demoVentures = [
    { 
      id: 'demo-1', 
      name: "Coffee Kiosk Demo", 
      description: "Sample local coffee shop business",
      runway: 8, 
      cashflow: -2400, 
      revenue: 8500, 
      burnRate: 3200 
    },
    { 
      id: 'demo-2', 
      name: "SaaS Startup Demo", 
      description: "Sample SaaS platform for small businesses",
      runway: 15, 
      cashflow: 1200, 
      revenue: 12000, 
      burnRate: 5500 
    }
  ];

  const demoProfile = {
    full_name: "Demo User",
    role: "founder",
    ventureType: "startup",
    demo: true
  };

  // Demo banner component
  const DemoBanner = () => (
    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 rounded-full p-2">
            <span className="text-sm font-bold">DEMO</span>
          </div>
          <div>
            <h3 className="font-semibold">Exploring Lane AI Demo</h3>
            <p className="text-sm opacity-90">Try all features with sample data • No account required</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white border-white/30 hover:bg-white/10"
            onClick={() => window.location.href = '/'}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Button>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => window.location.href = '/'}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Sign Up
          </Button>
        </div>
      </div>
    </div>
  );

  const renderMainContent = () => {
    switch (currentView) {
      case 'hq':
        return <HQDashboard ventures={demoVentures} userProfile={demoProfile} />;
      case 'workspace':
        return (
          <div className="min-h-screen bg-background p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground">Demo Workspace</h1>
              <p className="text-muted-foreground mt-2">Explore venture management features</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {demoVentures.map(venture => (
                <Card key={venture.id} className="p-6 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold">{venture.name}</h2>
                      <p className="text-sm text-muted-foreground">{venture.description}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-muted-foreground">Demo</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">${venture.revenue.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Monthly Revenue</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{venture.runway}m</div>
                      <div className="text-xs text-muted-foreground">Runway</div>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    Explore Demo Venture →
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Demo: {currentView}</h1>
            <Card className="p-6">
              <p className="text-muted-foreground">
                This is a demo version of the {currentView} section. 
                Sign up to access full functionality with your own data.
              </p>
              <Button className="mt-4" onClick={() => window.location.href = '/'}>
                Sign Up Now
              </Button>
            </Card>
          </div>
        );
    }
  };

  return (
    <DisplaySettingsProvider>
      <TooltipProvider>
        <div className="min-h-screen bg-background w-full">
          {/* Demo Banner */}
          <DemoBanner />
          
          <div className="flex h-screen overflow-hidden">
            {/* Main Navigation */}
            <MainNavigation 
              currentView={currentView}
              onViewChange={setCurrentView}
              ventures={demoVentures}
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
              onAddVenture={() => {}} // Disabled in demo
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* TopBar */}
              <TopBar 
                onSearchClick={() => {}}
                onProfileClick={() => {}}
                onFounderMode={() => {}}
                onHomeClick={() => setCurrentView('hq')}
                onToggleCoPilot={() => {}}
              />

              {/* Main Content */}
              <main className="flex-1 overflow-auto">
                {renderMainContent()}
              </main>
            </div>
          </div>

          {/* QuickDock */}
          <QuickDock />
        </div>
      </TooltipProvider>
    </DisplaySettingsProvider>
  );
};

export default DemoPage;