import React from 'react';
import { TrendingUp, DollarSign, AlertTriangle, Activity, Users, Target } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import KpiCard from '../primitives/KpiCard';
import LockUnlockWrapper from '../primitives/LockUnlockWrapper';
import PortfolioTiles from '../portfolio/PortfolioTiles';
import AlertsStrip from '../alerts/AlertsStrip';
import { useRoleBasedKpis } from '../../hooks/useKpiData';
import userProfile from '../../lib/userProfile';

const HQDashboard = () => {
  // Get user profile to determine role-based KPIs
  const [userRole, setUserRole] = React.useState('entrepreneur');
  const [ventureType, setVentureType] = React.useState('startup');

  React.useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await userProfile.getProfile();
      if (data?.role) setUserRole(data.role);
      if (data?.venture_basics?.type) setVentureType(data.venture_basics.type);
    };
    fetchProfile();
  }, []);

  // Generate role-based KPIs
  const { kpis: roleBasedKpis, loading: kpisLoading } = useRoleBasedKpis(userRole, ventureType);

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
  const signalsKpis = [
    {
      title: "Revenue Growth",
      description: "How fast your income is increasing over time",
      value: 23.5,
      unit: "percentage",
      trend: 8.2,
      trendDirection: "up",
      icon: TrendingUp
    },
    {
      title: "Customer Acquisition",
      description: "Number of new customers gained this period",
      value: 47,
      unit: "number",
      trend: 12,
      trendDirection: "up",
      icon: Users
    },
    {
      title: "Burn Rate",
      description: "How much money you're spending each month",
      value: 12500,
      unit: "currency",
      trend: -8,
      trendDirection: "down",
      icon: DollarSign,
      state: "warning"
    },
    {
      title: "Product-Market Fit",
      description: "How well your product meets customer needs",
      value: 7.8,
      unit: "number",
      trend: 0.5,
      trendDirection: "up",
      icon: Target
    },
    {
      title: "Market Signals",
      description: "Important trends happening in your industry",
      value: 6,
      unit: "number",
      trend: 2,
      trendDirection: "up",
      icon: Activity
    },
    {
      title: "Risk Indicators",
      description: "Warning signs that need your attention",
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
            <AlertsStrip />
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