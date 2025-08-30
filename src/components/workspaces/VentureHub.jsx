import React, { useState } from 'react';
import { LayoutDashboard, FileSpreadsheet, GitBranch, FileText, Activity, Workflow } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import KpiCard from '../primitives/KpiCard';
import WorksheetRenderer from '../worksheets/WorksheetRenderer';
import ScenariosTab from '../scenarios/ScenariosTab';
import ReportsList from '../reports/ReportsList';
import LockUnlockWrapper from '../primitives/LockUnlockWrapper';
import VentureChatPanel from '../chat/VentureChatPanel';
import { useVentureKpis } from '../../hooks/useKpiData';

const VentureHub = ({ ventureId = 1, ventureName = "Coffee Kiosk" }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatContext, setChatContext] = useState(null);

  const { kpis: ventureKpis, loading: kpisLoading } = useVentureKpis(ventureId);

  const handleExplainClick = (context) => {
    setChatContext(context);
    setIsChatOpen(true);
  };

  const mockAlerts = [
    {
      id: 1,
      type: 'warning',
      message: "Customer acquisition cost increased 15%",
      timestamp: new Date()
    },
    {
      id: 2,
      type: 'info',
      message: "New revenue stream opportunity detected",
      timestamp: new Date()
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{ventureName}</h1>
              <p className="text-sm text-muted-foreground">Venture Hub • ID: {ventureId}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Export Data
              </Button>
              <Button variant="outline" size="sm">
                Share Workspace
              </Button>
              <Button 
                size="sm"
                onClick={() => setIsChatOpen(true)}
              >
                AI Assistant
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="worksheets" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Worksheets
            </TabsTrigger>
            <TabsTrigger value="scenarios" className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Scenarios
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="signals" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Signals
            </TabsTrigger>
            <TabsTrigger value="flows" className="flex items-center gap-2">
              <Workflow className="h-4 w-4" />
              Flows
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Venture Alerts */}
            <section>
              <h3 className="text-lg font-medium mb-4">Alerts</h3>
              <div className="space-y-2">
                {mockAlerts.map(alert => (
                  <div key={alert.id} className="flex items-center gap-3 p-3 border border-border rounded-lg bg-card">
                    <div className={`w-2 h-2 rounded-full ${alert.type === 'warning' ? 'bg-warning' : 'bg-info'}`}></div>
                    <span className="text-sm">{alert.message}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {alert.timestamp.toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Venture KPIs */}
            <section>
              <h3 className="text-lg font-medium mb-4">Key Metrics</h3>
              {kpisLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {ventureKpis.map((kpi, index) => (
                    <KpiCard
                      key={index}
                      title={kpi.title}
                      description={kpi.description}
                      value={kpi.value}
                      unit={kpi.unit}
                      trend={kpi.trend}
                      trendDirection={kpi.trendDirection}
                      state={kpi.state}
                      onClick={() => handleExplainClick(`Analyzing ${kpi.title} for ${ventureName}`)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Quick Actions */}
            <section>
              <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">Create Worksheet</Button>
                <Button variant="outline" size="sm">Generate Report</Button>
                <Button variant="outline" size="sm">Export CSV</Button>
                <LockUnlockWrapper feature="ai_insights" requiredTier="pro">
                  <Button variant="outline" size="sm">AI Insights</Button>
                </LockUnlockWrapper>
              </div>
            </section>
          </TabsContent>

          {/* Worksheets Tab */}
          <TabsContent value="worksheets" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Worksheets</h3>
              <LockUnlockWrapper feature="advanced_worksheets" requiredTier="pro">
                <Button>+ New Worksheet</Button>
              </LockUnlockWrapper>
            </div>
            <WorksheetRenderer ventureId={ventureId} />
          </TabsContent>

          {/* Scenarios Tab */}
          <TabsContent value="scenarios">
            <ScenariosTab ventureId={ventureId} />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Reports</h3>
              <LockUnlockWrapper feature="reports" requiredTier="pro">
                <Button>+ Generate Report</Button>
              </LockUnlockWrapper>
            </div>
            <ReportsList ventureId={ventureId} />
          </TabsContent>

          {/* Signals Tab */}
          <TabsContent value="signals" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Pinned Signals</h3>
              <LockUnlockWrapper feature="advanced_signals" requiredTier="pro">
                <Button>Configure Alerts</Button>
              </LockUnlockWrapper>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ventureKpis.map((kpi, index) => (
                <LockUnlockWrapper 
                  key={index}
                  feature={index > 1 ? "advanced_signals" : "basic_signals"}
                  requiredTier="pro"
                >
                  <KpiCard
                    title={kpi.title}
                    description={kpi.description}
                    value={kpi.value}
                    unit={kpi.unit}
                    trend={kpi.trend}
                    trendDirection={kpi.trendDirection}
                    onClick={() => handleExplainClick(`Explain ${kpi.title} trend`)}
                  />
                </LockUnlockWrapper>
              ))}
            </div>
          </TabsContent>

          {/* Flows Tab */}
          <TabsContent value="flows">
            <LockUnlockWrapper feature="workflows" requiredTier="pro">
              <div className="border border-dashed border-border rounded-lg p-12 text-center">
                <Workflow className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Workflow Builder</h3>
                <p className="text-muted-foreground mb-4">
                  Automate your business processes with visual workflows
                </p>
                <Button>Coming Soon</Button>
              </div>
            </LockUnlockWrapper>
          </TabsContent>
        </Tabs>
      </div>

      {/* Chat Panel */}
      <VentureChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        ventureId={ventureId}
        ventureName={ventureName}
        initialContext={chatContext}
      />
    </div>
  );
};

export default VentureHub;