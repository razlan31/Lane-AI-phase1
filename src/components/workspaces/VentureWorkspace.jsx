import { useState } from 'react';
import { 
  BarChart3, 
  FileSpreadsheet, 
  Workflow, 
  FileText, 
  Activity,
  Plus
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import KpiCard from '../primitives/KpiCard';
import WorksheetRenderer from '../worksheets/WorksheetRenderer';
import ReportsList from '../reports/ReportsList';
import LockUnlockWrapper from '../primitives/LockUnlockWrapper';
import { AlertStrip } from '../notifications/AlertStrip';

const VentureWorkspace = ({ 
  ventureId = 1, 
  ventureName = "Coffee Kiosk",
  onCreateWorksheet,
  onPromoteFromScratchpad 
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Venture health KPIs for Dashboard tab
  const ventureHealthKpis = [
    {
      title: "Monthly Revenue",
      description: "Total money earned from sales this month",
      value: 8500,
      unit: "currency",
      trend: 15,
      trendDirection: "up",
      state: "live"
    },
    {
      title: "Customer Count", 
      description: "Number of people who bought from you",
      value: 342,
      unit: "number",
      trend: 23,
      trendDirection: "up",
      state: "live"
    },
    {
      title: "Avg Order Value",
      description: "Average amount customers spend per purchase", 
      value: 24.85,
      unit: "currency",
      trend: 8,
      trendDirection: "up",
      state: "live"
    },
    {
      title: "Burn Rate",
      description: "How fast you're spending money monthly",
      value: 3200,
      unit: "currency", 
      trend: 5,
      trendDirection: "up",
      state: "warning"
    }
  ];

  // Available worksheet types for this venture
  const worksheetTypes = [
    { id: 'roi', name: 'ROI Calculator', description: 'Return on investment analysis' },
    { id: 'cashflow', name: 'Cashflow Forecast', description: 'Cash in and cash out projections' },
    { id: 'balance', name: 'Balance Sheet', description: 'Assets, liabilities, and equity' },
    { id: 'breakeven', name: 'Breakeven Analysis', description: 'When you will start making profit' },
    { id: 'budget', name: 'Budget Planner', description: 'Monthly income and expense planning' }
  ];

  // Mock alerts specific to this venture
  const ventureAlerts = [
    {
      id: 1,
      type: "warning", 
      message: "Customer acquisition cost increased 15%",
      timestamp: new Date()
    }
  ];

  const handleCreateWorksheet = (type) => {
    if (onCreateWorksheet) {
      onCreateWorksheet(ventureId, type);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Venture Header */}
      <div className="border-b border-border bg-card/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{ventureName}</h1>
            <p className="text-sm text-muted-foreground">Venture #{ventureId} Workspace</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Export Data
            </Button>
            <LockUnlockWrapper feature="venture_collaboration" requiredTier="pro">
              <Button variant="outline" size="sm">
                Share Workspace
              </Button>
            </LockUnlockWrapper>
          </div>
        </div>
      </div>

      {/* Workspace Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid grid-cols-5 mx-6 mt-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="worksheets" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Worksheets
            </TabsTrigger>
            <TabsTrigger value="flows" className="flex items-center gap-2">
              <Workflow className="h-4 w-4" />
              Flows
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="signals" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Signals
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto">
            {/* Dashboard Tab - Health Snapshot */}
            <TabsContent value="dashboard" className="space-y-6 p-6">
              {/* Venture Alerts */}
              {ventureAlerts.length > 0 && (
                <AlertStrip 
                  alerts={ventureAlerts} 
                  onDismiss={(id) => console.log('Dismiss alert:', id)} 
                />
              )}

              {/* Health KPIs */}
              <div>
                <h3 className="text-lg font-medium mb-4">Venture Health</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {ventureHealthKpis.map((kpi, index) => (
                    <KpiCard
                      key={index}
                      title={kpi.title}
                      description={kpi.description}
                      value={kpi.value}
                      unit={kpi.unit}
                      trend={kpi.trend}
                      trendDirection={kpi.trendDirection}
                      state={kpi.state}
                    />
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-start gap-2"
                    onClick={() => setActiveTab('worksheets')}
                  >
                    <FileSpreadsheet className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Open Worksheets</div>
                      <div className="text-sm text-muted-foreground">View all calculators</div>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-start gap-2"
                    onClick={() => handleCreateWorksheet('cashflow')}
                  >
                    <Plus className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">New Cashflow</div>
                      <div className="text-sm text-muted-foreground">Create forecast</div>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-start gap-2"
                    onClick={() => setActiveTab('reports')}
                  >
                    <FileText className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Generate Report</div>
                      <div className="text-sm text-muted-foreground">Weekly brief</div>
                    </div>
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Worksheets Tab - All Calculators */}
            <TabsContent value="worksheets" className="space-y-6 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Worksheets</h3>
                  <p className="text-sm text-muted-foreground">All calculators and financial tools for this venture</p>
                </div>
                <LockUnlockWrapper feature="advanced_worksheets" requiredTier="pro">
                  <div className="flex items-center gap-2">
                    <select 
                      className="rounded border border-border px-3 py-1 text-sm bg-background"
                      onChange={(e) => e.target.value && handleCreateWorksheet(e.target.value)}
                      value=""
                    >
                      <option value="">+ New Worksheet</option>
                      {worksheetTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                </LockUnlockWrapper>
              </div>

              {/* Existing Worksheets */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {worksheetTypes.slice(0, 3).map((type) => (
                  <div key={type.id} className="border border-border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{type.name}</h4>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">Draft</span>
                        <Button variant="outline" size="sm">Open</Button>
                      </div>
                    </div>
                    
                    {/* Mini preview using WorksheetRenderer */}
                    <div className="h-32 bg-muted/50 rounded border border-dashed border-border flex items-center justify-center">
                      <span className="text-sm text-muted-foreground">Preview: {type.name}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty state for no worksheets */}
              {worksheetTypes.length === 0 && (
                <div className="border border-dashed border-border rounded-lg p-8 text-center">
                  <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No worksheets yet</p>
                  <Button onClick={() => handleCreateWorksheet('roi')}>
                    Create First Worksheet
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Flows Tab - Linked Workflows */}
            <TabsContent value="flows" className="space-y-6 p-6">
              <LockUnlockWrapper feature="workflow_automation" requiredTier="pro">
                <div className="border border-dashed border-border rounded-lg p-8 text-center">
                  <Workflow className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">Workflow Automation</p>
                  <p className="text-sm text-muted-foreground">Link worksheets together and automate data flows</p>
                </div>
              </LockUnlockWrapper>
            </TabsContent>

            {/* Reports Tab - Venture-scoped Reports */}
            <TabsContent value="reports" className="space-y-6 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Reports</h3>
                  <p className="text-sm text-muted-foreground">Venture-specific reports and exports</p>
                </div>
                <LockUnlockWrapper feature="reports" requiredTier="pro">
                  <Button>
                    + Generate Report
                  </Button>
                </LockUnlockWrapper>
              </div>
              <ReportsList ventureId={ventureId} />
            </TabsContent>

            {/* Signals Tab - Venture-specific KPIs */}
            <TabsContent value="signals" className="space-y-6 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Venture Signals</h3>
                  <p className="text-sm text-muted-foreground">KPIs and metrics specific to this venture</p>
                </div>
                <LockUnlockWrapper feature="advanced_signals" requiredTier="pro">
                  <Button variant="outline">
                    Configure Alerts
                  </Button>
                </LockUnlockWrapper>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ventureHealthKpis.map((signal, index) => (
                  <LockUnlockWrapper 
                    key={index}
                    feature={index > 1 ? "advanced_signals" : "basic_signals"}
                    requiredTier="pro"
                  >
                    <KpiCard
                      title={signal.title}
                      description={signal.description}
                      value={signal.value}
                      unit={signal.unit}
                      trend={signal.trend}
                      trendDirection={signal.trendDirection}
                      state={signal.state}
                    />
                  </LockUnlockWrapper>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default VentureWorkspace;
