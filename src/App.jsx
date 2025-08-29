import React from 'react';
import { TooltipProvider } from './components/ui/tooltip';
import KpiCard from './components/primitives/KpiCard';
import DataTable from './components/primitives/DataTable';
import TabContainer from './components/primitives/TabContainer';
import QuickActionsDock from './components/primitives/QuickActionsDock';
import LockUnlockWrapper from './components/primitives/LockUnlockWrapper';
import { Activity, TrendingUp, DollarSign, Target } from 'lucide-react';

function App() {
  // Sample data for demonstrating primitives
  const sampleKpis = [
    {
      title: "Monthly Revenue",
      value: 45000,
      trend: 12.5,
      trendDirection: "up",
      state: "live",
      unit: "currency"
    },
    {
      title: "Burn Rate",
      value: 8500,
      trend: -5.2,
      trendDirection: "down",
      state: "warning",
      unit: "currency"
    },
    {
      title: "Runway",
      value: 18,
      state: "draft",
      unit: "number"
    },
    {
      title: "Growth Rate",
      value: 15.8,
      trend: 3.2,
      trendDirection: "up",
      state: "live",
      unit: "percentage"
    }
  ];

  const sampleTableData = [
    { expense: "Marketing", amount: 5000, category: "Growth", status: "Active" },
    { expense: "Engineering", amount: 15000, category: "Core", status: "Active" },
    { expense: "Office Rent", amount: 3000, category: "Operations", status: "Active" }
  ];

  const tableColumns = [
    { key: 'expense', header: 'Expense', editable: true },
    { key: 'amount', header: 'Amount', editable: true, type: 'number', render: (val) => `$${val?.toLocaleString()}` },
    { key: 'category', header: 'Category', editable: true },
    { key: 'status', header: 'Status' }
  ];

  const tabs = [
    {
      value: 'overview',
      label: 'Overview',
      icon: Activity,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sampleKpis.map((kpi, index) => (
            <KpiCard key={index} {...kpi} />
          ))}
        </div>
      )
    },
    {
      value: 'expenses',
      label: 'Expenses',
      icon: DollarSign,
      badge: 3,
      content: (
        <DataTable 
          data={sampleTableData}
          columns={tableColumns}
          editable={true}
          mode="draft"
          onSave={(rowIndex, data) => console.log('Save:', rowIndex, data)}
        />
      )
    },
    {
      value: 'forecasts',
      label: 'Forecasts',
      icon: TrendingUp,
      content: (
        <LockUnlockWrapper feature="advanced_worksheets" requiredTier="pro">
          <div className="p-8 border border-dashed border-border rounded-lg text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Advanced Forecasting</h3>
            <p className="text-muted-foreground">
              Build sophisticated financial models with scenario planning and Monte Carlo simulations.
            </p>
          </div>
        </LockUnlockWrapper>
      )
    }
  ];

  const handleQuickAction = (action) => {
    console.log(`Quick action: ${action}`);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 pb-24">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">LaneAI</h1>
            <p className="text-muted-foreground">
              Phase 1 - Core Primitives & Billing Foundation
            </p>
          </div>

          <TabContainer 
            tabs={tabs}
            defaultValue="overview"
            className="space-y-6"
          />
        </div>

        <QuickActionsDock
          onAddData={() => handleQuickAction('add-data')}
          onSignals={() => handleQuickAction('signals')}
          onRunFlow={() => handleQuickAction('run-flow')}
          onExport={() => handleQuickAction('export')}
          onChat={() => handleQuickAction('chat')}
        />
      </div>
    </TooltipProvider>
  );
}

export default App;
