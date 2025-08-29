import React from 'react';
import { TrendingUp, DollarSign, AlertTriangle, Activity, Users, Target } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import KpiCard from '../primitives/KpiCard';
import LockUnlockWrapper from '../primitives/LockUnlockWrapper';

const HQDashboard = () => {
  // Top strip KPIs - Critical metrics
  const topStripKpis = [
    <KpiCard
      key="runway"
      title="Runway"
      value={18}
      unit="months"
      trend={-2}
      trendDirection="down"
      state="warning"
    />,
    <KpiCard
      key="cashflow"
      title="Monthly Cashflow"
      value={-15000}
      unit="currency"
      trend={12}
      trendDirection="up"
      state="alert"
    />,
    <KpiCard
      key="obligations"
      title="Obligations"
      value={85000}
      unit="currency"
      trend={5}
      trendDirection="up"
    />
  ];

  // Signals board - 6-9 KPI Cards
  const signalsKpis = [
    {
      title: "Revenue Growth",
      value: 23.5,
      unit: "percentage",
      trend: 8.2,
      trendDirection: "up",
      icon: TrendingUp
    },
    {
      title: "Customer Acquisition",
      value: 47,
      unit: "number",
      trend: 12,
      trendDirection: "up",
      icon: Users
    },
    {
      title: "Burn Rate",
      value: 12500,
      unit: "currency",
      trend: -8,
      trendDirection: "down",
      icon: DollarSign,
      state: "warning"
    },
    {
      title: "Product-Market Fit",
      value: 7.8,
      unit: "number",
      trend: 0.5,
      trendDirection: "up",
      icon: Target
    },
    {
      title: "Market Signals",
      value: 6,
      unit: "number",
      trend: 2,
      trendDirection: "up",
      icon: Activity
    },
    {
      title: "Risk Indicators",
      value: 3,
      unit: "number",
      trend: 1,
      trendDirection: "up",
      icon: AlertTriangle,
      state: "alert"
    }
  ];

  const tabs = [
    {
      value: "overview",
      label: "Overview",
      icon: Activity,
      content: (
        <div className="space-y-8">
          {/* Signals Board */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-foreground">Signals Board</h2>
              <LockUnlockWrapper feature="advanced_signals" requiredTier="pro">
                <button className="text-sm text-primary hover:text-primary/80">
                  View All Signals →
                </button>
              </LockUnlockWrapper>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {signalsKpis.map((kpi, index) => (
                <LockUnlockWrapper 
                  key={index}
                  feature={index > 2 ? "advanced_signals" : "basic_dashboard"}
                  requiredTier="pro"
                >
                  <KpiCard
                    title={kpi.title}
                    value={kpi.value}
                    unit={kpi.unit}
                    trend={kpi.trend}
                    trendDirection={kpi.trendDirection}
                    state={kpi.state}
                    icon={kpi.icon}
                  />
                </LockUnlockWrapper>
              ))}
            </div>
          </section>

          {/* Portfolio Tiles Placeholder */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-foreground">Portfolio</h2>
              <LockUnlockWrapper feature="unlimited_ventures" requiredTier="pro">
                <button className="text-sm text-primary hover:text-primary/80">
                  Manage Ventures →
                </button>
              </LockUnlockWrapper>
            </div>
            <div className="border border-dashed border-border rounded-lg p-8 text-center">
              <p className="text-muted-foreground">Portfolio tiles coming in Phase 3</p>
            </div>
          </section>

          {/* Alerts Strip Placeholder */}
          <section>
            <div className="border border-dashed border-border rounded-lg p-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertTriangle className="h-4 w-4" />
                <span>Alert strip placeholder - Phase 3</span>
              </div>
            </div>
          </section>
        </div>
      )
    }
  ];

  const handleQuickActions = {
    onAddData: () => console.log('Add data'),
    onSignals: () => console.log('View signals'),
    onRunFlow: () => console.log('Run flow'),
    onExport: () => console.log('Export'),
    onChat: () => console.log('Open chat')
  };

  return (
    <DashboardLayout
      title="HQ Dashboard"
      subtitle="Portfolio overview and key signals"
      topStrip={topStripKpis}
      tabs={tabs}
      onQuickAction={handleQuickActions}
    />
  );
};

export default HQDashboard;