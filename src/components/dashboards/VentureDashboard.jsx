// No React import needed
import { FileSpreadsheet, Workflow, Activity, FileText } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { AutoWorksheetGenerator } from '../worksheets/AutoWorksheetGenerator';
import ReportsList from '../reports/ReportsList';
import LockUnlockWrapper from '../primitives/LockUnlockWrapper';
import KpiCard from '../primitives/KpiCard';

const VentureDashboard = ({ ventureId = 1, ventureName = "Coffee Kiosk" }) => {
  // Venture-specific signals
  const ventureSignals = [
    {
      title: "Monthly Revenue",
      description: "Total money earned from sales this month",
      value: 8500,
      unit: "currency",
      trend: 15,
      trendDirection: "up"
    },
    {
      title: "Customer Count",
      description: "Number of people who bought from you",
      value: 342,
      unit: "number",
      trend: 23,
      trendDirection: "up"
    },
    {
      title: "Avg Order Value",
      description: "Average amount customers spend per purchase",
      value: 24.85,
      unit: "currency",
      trend: 8,
      trendDirection: "up"
    }
  ];

  const tabs = [
    {
      value: "worksheets",
      label: "Worksheets",
      icon: FileSpreadsheet,
      content: (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Active Worksheets</h3>
            <LockUnlockWrapper feature="advanced_worksheets" requiredTier="pro">
              <button className="text-sm text-primary hover:text-primary/80">
                + New Worksheet
              </button>
            </LockUnlockWrapper>
          </div>
          <AutoWorksheetGenerator ventureId={ventureId} ventureName={ventureName} ventureType="general" />
        </div>
      )
    },
    {
      value: "flows",
      label: "Flows",
      icon: Workflow,
      content: (
        <LockUnlockWrapper feature="advanced_worksheets" requiredTier="pro">
          <div className="border border-dashed border-border rounded-lg p-8 text-center">
            <Workflow className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Workflow automation coming soon</p>
          </div>
        </LockUnlockWrapper>
      )
    },
    {
      value: "signals",
      label: "Signals",
      icon: Activity,
      content: (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Venture Signals</h3>
            <LockUnlockWrapper feature="advanced_signals" requiredTier="pro">
              <button 
                className="text-sm text-primary hover:text-primary/80"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('openAIChat', {
                    detail: { 
                      message: 'Help me configure smart alerts for my venture KPIs and metrics',
                      context: 'alerts-configuration'
                    }
                  }));
                }}
              >
                Configure Alerts
              </button>
            </LockUnlockWrapper>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ventureSignals.map((signal, index) => (
              <LockUnlockWrapper 
                key={index}
                feature={index > 0 ? "advanced_signals" : "basic_dashboard"}
                requiredTier="pro"
              >
                <KpiCard
                  title={signal.title}
                  description={signal.description}
                  value={signal.value}
                  unit={signal.unit}
                  trend={signal.trend}
                  trendDirection={signal.trendDirection}
                />
              </LockUnlockWrapper>
            ))}
          </div>
        </div>
      )
    },
    {
      value: "reports",
      label: "Reports",
      icon: FileText,
      content: (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Generated Reports</h3>
            <LockUnlockWrapper feature="reports" requiredTier="pro">
              <button className="text-sm text-primary hover:text-primary/80">
                + Generate Report
              </button>
            </LockUnlockWrapper>
          </div>
          <ReportsList ventureId={ventureId} />
        </div>
      )
    }
  ];

  const handleQuickActions = {
    onAddData: () => {
      window.dispatchEvent(new CustomEvent('openAIChat', {
        detail: { 
          message: `Help me add new data to ${ventureName}. I want to input venture-specific metrics, financial information, or track progress.`,
          context: 'venture-data-entry'
        }
      }));
    },
    onSignals: () => {
      window.dispatchEvent(new CustomEvent('openAIChat', {
        detail: { 
          message: `Show me the key signals and alerts for ${ventureName}. I want to monitor important metrics and trends.`,
          context: 'venture-signals'
        }
      }));
    },
    onRunFlow: () => {
      window.dispatchEvent(new CustomEvent('openAIChat', {
        detail: { 
          message: `Help me set up automated workflows for ${ventureName} to streamline business processes.`,
          context: 'venture-workflow'
        }
      }));
    },
    onExport: () => {
      const today = new Date().toISOString().split('T')[0];
      const csvData = `Metric,Value,Date\nRevenue,25000,${today}\nExpenses,18000,${today}\nCustomers,342,${today}`;
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${ventureName.toLowerCase().replace(/\s+/g, '-')}-data-${today}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    },
    onChat: () => {
      window.dispatchEvent(new CustomEvent('openAIChat', {
        detail: { 
          message: `I want to discuss ${ventureName} and get insights about my venture performance and strategy.`,
          context: 'venture-chat'
        }
      }));
    }
  };

  return (
    <DashboardLayout
      title={ventureName}
      subtitle={`Venture #${ventureId} Dashboard`}
      tabs={tabs}
      onQuickAction={handleQuickActions}
    />
  );
};

export default VentureDashboard;