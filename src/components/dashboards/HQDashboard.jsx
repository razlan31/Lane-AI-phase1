import React from 'react';
import { TrendingUp, DollarSign, AlertTriangle, Activity, Users, Target } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import KpiCard from '../primitives/KpiCard';
import LockUnlockWrapper from '../primitives/LockUnlockWrapper';
import PortfolioTiles from '../portfolio/PortfolioTiles';
import AlertsStrip from '../alerts/AlertsStrip';
import FounderModeOverlay from '../overlays/FounderModeOverlay';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useRoleBasedKpis } from '../../hooks/useRoleBasedKpis';
import { useAlerts } from '../../hooks/useAlerts';

const HQDashboard = () => {
  // Get user profile to determine role-based KPIs
  const { profile, loading: profileLoading } = useUserProfile();
  const [founderModeOpen, setFounderModeOpen] = React.useState(false);

  // Generate role-based KPIs based on user profile
  const { kpis: roleBasedKpis, loading: kpisLoading } = useRoleBasedKpis(
    profile?.role || 'entrepreneur',
    profile?.venture_type || 'startup'
  );

  // Get global alerts
  const { alerts, loading: alertsLoading } = useAlerts();

  // Top strip KPIs - Always show these 3 critical metrics
  const topStripKpis = [
    <KpiCard
      key="runway"
      title="Runway"
      description="How long your money will last with current spending"
      value={18}
      unit="months"
      trend={-2}
      trendDirection="down"
      state="warning"
    />,
    <KpiCard
      key="cashflow"
      title="Monthly Cashflow"
      description="Money coming in minus money going out each month"
      value={-15000}
      unit="currency"
      trend={12}
      trendDirection="up"
      state="alert"
    />,
    <KpiCard
      key="obligations"
      title="Obligations"
      description="Total amount you owe to others"
      value={85000}
      unit="currency"
      trend={5}
      trendDirection="up"
    />
  ];

  // Signals board - 6-9 KPI Cards
  const tabs = [
    {
      value: "overview",
      label: "Overview",
      icon: Activity,
      content: (
        <div className="space-y-8">
          {/* AI Timeline Strip */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-foreground">AI Insights</h2>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 border border-amber-200 rounded-lg bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-amber-800">⚠️ Alert: Your expenses grew 25% faster this month</span>
                <span className="text-xs text-amber-600 ml-auto">2 hours ago</span>
              </div>
              <div className="flex items-center gap-3 p-3 border border-blue-200 rounded-lg bg-blue-50">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800">📈 Revenue trend shows 15% growth potential next quarter</span>
                <span className="text-xs text-blue-600 ml-auto">1 day ago</span>
              </div>
            </div>
          </section>

          {/* Signals Board */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-foreground">Signals Board</h2>
              <LockUnlockWrapper feature="advanced_signals" requiredTier="pro">
                <button className="text-sm text-primary hover:text-primary/80">
                  Auto-Generate KPIs →
                </button>
              </LockUnlockWrapper>
            </div>
            {kpisLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roleBasedKpis.map((kpi, index) => (
                  <LockUnlockWrapper 
                    key={index}
                    feature={index > 2 ? "advanced_signals" : "basic_dashboard"}
                    requiredTier="pro"
                  >
                    <KpiCard
                      title={kpi.title}
                      description={kpi.description}
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
            )}
          </section>

          {/* Portfolio Tiles */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-foreground">Portfolio</h2>
              <LockUnlockWrapper feature="unlimited_ventures" requiredTier="pro">
                <button className="text-sm text-primary hover:text-primary/80">
                  + Add Venture
                </button>
              </LockUnlockWrapper>
            </div>
            <PortfolioTiles 
              onVentureClick={(ventureId) => console.log('Navigate to venture:', ventureId)}
            />
          </section>

          {/* Alerts Strip */}
          <section>
            <AlertsStrip alerts={alerts} loading={alertsLoading} />
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
    onChat: () => console.log('Open chat'),
    onFounderMode: () => setFounderModeOpen(true)
  };

  return (
    <>
      <DashboardLayout
        title="HQ Dashboard"
        subtitle="Portfolio overview and key signals"
        topStrip={topStripKpis}
        tabs={tabs}
        onQuickAction={handleQuickActions}
      />
      <FounderModeOverlay 
        isOpen={founderModeOpen} 
        onClose={() => setFounderModeOpen(false)} 
      />
    </>
  );
};

export default HQDashboard;