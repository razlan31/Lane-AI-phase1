import React, { useState } from 'react';
import { LayoutDashboard, FileSpreadsheet, GitBranch, FileText, Activity, Workflow } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import KpiCard from '../primitives/KpiCard';
import WorksheetRenderer from '../worksheets/WorksheetRenderer';
import ScenariosTab from '../scenarios/ScenariosTab';
import ReportsList from '../reports/ReportsList';
// import LockUnlockWrapper from '../primitives/LockUnlockWrapper';
import VentureChatPanel from '../chat/VentureChatPanel';
import NewWorksheetModal from '../modals/NewWorksheetModal';
import NewReportModal from '../modals/NewReportModal';
import TemplateChooser from '../templates/TemplateChooser';
import FounderModeOverlay from '../overlays/FounderModeOverlay';
import { useVentureKpis } from '../../hooks/useKpiData';
import { useWorksheets } from '../../hooks/useWorksheets';
import { useAlerts } from '../../hooks/useAlerts';

const VentureHub = ({ ventureId = 1, ventureName = "Coffee Kiosk" }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatContext, setChatContext] = useState(null);
  const [isNewWorksheetModalOpen, setIsNewWorksheetModalOpen] = useState(false);
  const [isNewReportModalOpen, setIsNewReportModalOpen] = useState(false);
  const [isTemplateChooserOpen, setIsTemplateChooserOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [founderModeOpen, setFounderModeOpen] = useState(false);

  // Get venture-specific data
  const { kpis: ventureKpis, loading: kpisLoading } = useVentureKpis(ventureId);
  const { worksheets, loading: worksheetsLoading, createWorksheet } = useWorksheets(ventureId);
  const { alerts, loading: alertsLoading } = useAlerts(ventureId);

  const handleExplainClick = (context) => {
    setChatContext(context);
    setIsChatOpen(true);
  };

  const handleChatBuild = () => {
    console.log('Starting chat build for new worksheet');
    // In real app: start AI chat workflow for worksheet creation
  };

  const handleChooseTemplate = () => {
    setIsTemplateChooserOpen(true);
  };

  const handleBlankWorksheet = () => {
    console.log('Creating blank worksheet');
    // In real app: create empty worksheet and open renderer
  };

  const handleGenerateReport = () => {
    setIsNewReportModalOpen(true);
  };

  const handleCreateWorksheet = () => {
    setIsNewWorksheetModalOpen(true);
  };

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    console.log('Creating worksheet from template:', template.title);
    // In real app: create worksheet from template and open renderer
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
              {alertsLoading ? (
                <div className="space-y-2">
                  {[1, 2].map(i => (
                    <div key={i} className="h-12 bg-muted animate-pulse rounded-lg"></div>
                  ))}
                </div>
              ) : alerts.length > 0 ? (
                <div className="space-y-2">
                  {alerts.map(alert => (
                    <div key={alert.id} className={`flex items-center gap-3 p-3 border rounded-lg ${
                      alert.type === 'warning' ? 'bg-amber-50 border-amber-200' : 
                      alert.type === 'alert' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        alert.type === 'warning' ? 'bg-amber-500' : 
                        alert.type === 'alert' ? 'bg-red-500' : 'bg-blue-500'
                      }`}></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{alert.title}</div>
                        <div className="text-xs text-muted-foreground">{alert.message}</div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(alert.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No alerts for this venture</div>
              )}
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
                <Button variant="outline" size="sm" onClick={handleCreateWorksheet}>Create Worksheet</Button>
                <Button variant="outline" size="sm" onClick={handleGenerateReport}>Generate Report</Button>
                <Button variant="outline" size="sm">Export CSV</Button>
                <Button variant="outline" size="sm">AI Insights</Button>
              </div>
            </section>
          </TabsContent>

          {/* Worksheets Tab */}
          <TabsContent value="worksheets" className="space-y-6">
            <div className="space-y-2 mb-8">
              <h1 className="text-2xl font-bold text-foreground">Worksheets</h1>
              <p className="text-muted-foreground">All calculators and financial tools for this venture</p>
            </div>
            
            {worksheetsLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-48 bg-muted animate-pulse rounded-lg"></div>
                ))}
              </div>
            ) : worksheets.length > 0 ? (
              <div className="space-y-6">
                {worksheets.map(worksheet => (
                  <div key={worksheet.id} className="border border-border rounded-lg bg-card p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1">
                        <h3 className="text-xl font-semibold text-foreground">{worksheet.name}</h3>
                        <p className="text-muted-foreground text-sm">
                          {worksheet.type === 'roi' && 'Return on investment analysis'}
                          {worksheet.type === 'cashflow' && 'Cash in and cash out projections'}
                          {worksheet.type === 'breakeven' && 'Break-even analysis calculator'}
                          {worksheet.type === 'personal' && 'Personal financial planning'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 text-sm rounded-md border ${
                          worksheet.status === 'live' 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {worksheet.status === 'live' ? 'Live' : 'Draft'}
                        </span>
                        <Button variant="outline" size="sm" className="px-4">
                          Open
                        </Button>
                      </div>
                    </div>
                    
                    {/* Preview Area */}
                    <div className="bg-muted/30 rounded-lg p-8 text-center border-2 border-dashed border-muted">
                      <div className="text-muted-foreground text-sm">
                        Preview: {worksheet.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-border rounded-lg p-12 text-center">
                <h4 className="text-lg font-medium mb-2">No worksheets yet</h4>
                <p className="text-muted-foreground mb-4">
                  Create your first worksheet to start tracking metrics
                </p>
              <Button onClick={handleCreateWorksheet}>
                  + Create Worksheet
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Scenarios Tab */}
          <TabsContent value="scenarios">
            <ScenariosTab ventureId={ventureId} />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Reports</h3>
              <Button onClick={handleGenerateReport}>
                + Generate Report
              </Button>
            </div>
            <ReportsList ventureId={ventureId} />
          </TabsContent>

          {/* Signals Tab */}
          <TabsContent value="signals" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Pinned Signals</h3>
              <Button>Configure Alerts</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ventureKpis.map((kpi, index) => (
                <KpiCard
                  key={index}
                  title={kpi.title}
                  description={kpi.description}
                  value={kpi.value}
                  unit={kpi.unit}
                  trend={kpi.trend}
                  trendDirection={kpi.trendDirection}
                  onClick={() => handleExplainClick(`Explain ${kpi.title} trend`)}
                />
              ))}
            </div>
          </TabsContent>

          {/* Flows Tab */}
          <TabsContent value="flows">
            <div className="border border-dashed border-border rounded-lg p-12 text-center">
              <Workflow className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Workflow Builder</h3>
              <p className="text-muted-foreground mb-4">
                Automate your business processes with visual workflows
              </p>
              <Button>Coming Soon</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <NewWorksheetModal
        isOpen={isNewWorksheetModalOpen}
        onClose={() => setIsNewWorksheetModalOpen(false)}
        onChatBuild={handleChatBuild}
        onChooseTemplate={handleChooseTemplate}
        onBlankWorksheet={handleBlankWorksheet}
      />

      <NewReportModal
        isOpen={isNewReportModalOpen}
        onClose={() => setIsNewReportModalOpen(false)}
        onGenerateReport={(reportType) => console.log('Generating report:', reportType)}
      />

      <TemplateChooser
        isOpen={isTemplateChooserOpen}
        onClose={() => setIsTemplateChooserOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* Chat Panel */}
      <VentureChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        ventureId={ventureId}
        ventureName={ventureName}
        initialContext={chatContext}
      />

      {/* Founder Mode Overlay */}
      <FounderModeOverlay 
        isOpen={founderModeOpen} 
        onClose={() => setFounderModeOpen(false)} 
      />
    </div>
  );
};

export default VentureHub;