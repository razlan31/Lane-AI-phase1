import { useState } from 'react';
import { LayoutDashboard, FileSpreadsheet, GitBranch, FileText, Activity, Workflow } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import KpiCard from '../primitives/KpiCard';
import WorksheetRenderer from '../worksheets/WorksheetRenderer';
import { AutoWorksheetGenerator } from '../worksheets/AutoWorksheetGenerator';
import ScenariosTab from '../scenarios/ScenariosTab';
import ReportsList from '../reports/ReportsList';
// import LockUnlockWrapper from '../primitives/LockUnlockWrapper';
import VentureChatPanel from '../chat/VentureChatPanel';
import NewWorksheetModal from '../modals/NewWorksheetModal';
import NewReportModal from '../modals/NewReportModal';
import TemplateChooser from '../templates/TemplateChooser';
import FounderModeOverlay from '../overlays/FounderModeOverlay';
import WorksheetBuilder from '../modals/WorksheetBuilder';
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
  const [isWorksheetBuilderOpen, setIsWorksheetBuilderOpen] = useState(false);

  // Get venture-specific data
  const { kpis: ventureKpis, loading: kpisLoading } = useVentureKpis(ventureId);
  const { worksheets, loading: worksheetsLoading, createWorksheet } = useWorksheets(ventureId);
  const { alerts, loading: alertsLoading } = useAlerts(ventureId);

  console.log('🏢 VentureHub state:', { 
    ventureId, 
    ventureName,
    worksheetsCount: worksheets?.length || 0, 
    worksheetsLoading,
    worksheets: worksheets?.map(w => ({ id: w.id, type: w.type })) || []
  });

  const handleExplainClick = (context) => {
    setChatContext(context);
    setIsChatOpen(true);
  };

  const handleChatBuild = () => {
    console.log('handleChatBuild called');
    setIsNewWorksheetModalOpen(false);
    window.dispatchEvent(new CustomEvent('openAIChat', {
      detail: { 
        message: `I want to create a new worksheet for ${ventureName}. Please guide me through the process step by step. I need help deciding what metrics to track and how to structure the calculations.`,
        context: 'worksheet-creation'
      }
    }));
  };

  const handleChooseTemplate = () => {
    console.log('handleChooseTemplate called');
    setIsNewWorksheetModalOpen(false);
    setIsTemplateChooserOpen(true);
  };

  const handleBlankWorksheet = () => {
    console.log('handleBlankWorksheet called');
    setIsNewWorksheetModalOpen(false);
    setIsWorksheetBuilderOpen(true);
  };

  const handleGenerateReport = () => {
    console.log('handleGenerateReport called');
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
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const csvData = "Name,Value,Date\nRevenue,25000,2024-01-01\nExpenses,18000,2024-01-01";
                  const blob = new Blob([csvData], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${ventureName.toLowerCase().replace(/\s+/g, '-')}-data-${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                }}
              >
                Export Data
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  // TODO: Add toast notification
                  console.log('Workspace link copied to clipboard');
                }}
              >
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
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // Generate more comprehensive CSV export
                    const today = new Date().toISOString().split('T')[0];
                    const csvData = `Metric,Value,Date,Type
Revenue,25000,${today},Financial
Expenses,18000,${today},Financial
Customer Count,342,${today},Operations
Avg Order Value,24.85,${today},Operations
Monthly Growth Rate,15%,${today},Growth
Customer Acquisition Cost,125,${today},Marketing
Churn Rate,5%,${today},Retention`;
                    
                    const blob = new Blob([csvData], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${ventureName.toLowerCase().replace(/\s+/g, '-')}-metrics-${today}.csv`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    
                    // Show success feedback
                    console.log('Venture data exported successfully');
                  }}
                >
                  Export CSV
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('openAIChat', {
                      detail: { 
                        message: `Generate detailed AI insights and strategic recommendations for ${ventureName}. Analyze current performance metrics, identify growth opportunities, potential risks, and provide actionable recommendations for improvement based on industry best practices and market trends.`,
                        context: 'ai-insights'
                      }
                    }));
                  }}
                >
                  AI Insights
                </Button>
              </div>
            </section>
          </TabsContent>

          {/* Worksheets Tab */}
          <TabsContent value="worksheets" className="space-y-6">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">Worksheets</h1>
                <p className="text-muted-foreground">All calculators and financial tools for this venture</p>
              </div>
              <Button onClick={handleCreateWorksheet}>
                + Create Worksheet
              </Button>
            </div>
            
            {/* Use AutoWorksheetGenerator instead of manual worksheet display */}
            <AutoWorksheetGenerator 
              ventureId={ventureId} 
              ventureName={ventureName} 
              ventureType="general" 
            />
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
              <Button onClick={() => {
                window.dispatchEvent(new CustomEvent('openAIChat', {
                  detail: { 
                    message: 'Help me configure smart alerts for my venture KPIs and metrics. I want to set up automated notifications when key metrics change significantly, reach certain thresholds, or show concerning trends.',
                    context: 'alerts-configuration'
                  }
                }));
              }}>Configure Alerts</Button>
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
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Workflow Automation</h3>
                  <p className="text-sm text-muted-foreground">Create automated workflows for your business processes</p>
                </div>
                <Button onClick={() => {
                  window.dispatchEvent(new CustomEvent('openAIChat', {
                    detail: { 
                      message: 'Help me design automated workflows for my venture. I want to streamline repetitive tasks and create efficient business processes.',
                      context: 'workflow-design'
                    }
                  }));
                }}>
                  <Workflow className="h-4 w-4 mr-2" />
                  Create Workflow
                </Button>
              </div>
              
              {/* Sample Workflow Templates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    name: 'Customer Onboarding',
                    description: 'Automate new customer welcome emails and setup tasks',
                    triggers: 'New customer signup',
                    actions: '3 automated steps'
                  },
                  {
                    name: 'Monthly Reporting',
                    description: 'Generate and send monthly performance reports',
                    triggers: 'Monthly schedule',
                    actions: '5 automated steps'
                  },
                  {
                    name: 'Lead Qualification',
                    description: 'Score and route leads based on criteria',
                    triggers: 'New lead form',
                    actions: '4 automated steps'
                  },
                  {
                    name: 'Invoice Reminders',
                    description: 'Send payment reminders for overdue invoices',
                    triggers: 'Overdue invoice',
                    actions: '3 automated steps'
                  }
                ].map((workflow) => (
                  <Card key={workflow.name} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Workflow className="h-5 w-5 text-primary" />
                        {workflow.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{workflow.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between text-xs text-muted-foreground mb-3">
                        <span>Trigger: {workflow.triggers}</span>
                        <span>{workflow.actions}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('openAIChat', {
                            detail: { 
                              message: `Set up a ${workflow.name} workflow. ${workflow.description}. Help me configure the triggers and actions.`,
                              context: 'workflow-setup'
                            }
                          }));
                        }}
                      >
                        Set Up Workflow
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
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

      {/* Worksheet Builder */}
      <WorksheetBuilder
        isOpen={isWorksheetBuilderOpen}
        onClose={() => setIsWorksheetBuilderOpen(false)}
        onCreateWorksheet={(worksheetData) => {
          console.log('Creating worksheet:', worksheetData);
          // TODO: Integrate with createWorksheet hook
        }}
      />
    </div>
  );
};

export default VentureHub;