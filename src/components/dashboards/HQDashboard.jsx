import { useState } from 'react';
import { TrendingUp, DollarSign, AlertTriangle, Activity, Users, Target, Plus, ArrowRight } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import KpiCard from '../primitives/KpiCard';
// import LockUnlockWrapper from '../primitives/LockUnlockWrapper';
import PortfolioTiles from '../portfolio/PortfolioTiles';
import AlertsStrip from '../alerts/AlertsStrip';
import FounderModeOverlay from '../overlays/FounderModeOverlay';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useRoleBasedKpis } from '../../hooks/useRoleBasedKpis';
import { useAlerts } from '../../hooks/useAlerts';
import { MetricCard, ActionCard, StatusCard } from '../ui/EnhancedCard';
import { ResponsiveContainer, ResponsiveGrid } from '../ui/ResponsiveContainer';
import { LoadingSpinner, LoadingCard } from '../ui/LoadingSpinner';
import { EmptyState } from '../ui/ErrorStates';

const HQDashboard = () => {
  // Get user profile to determine role-based KPIs
  const { profile, loading: profileLoading } = useUserProfile();
  const [founderModeOpen, setFounderModeOpen] = useState(false);

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
              <button 
                className="text-sm text-primary hover:text-primary/80 font-medium"
                onClick={() => {
                  // Auto-generate KPIs directly without opening chat
                  window.dispatchEvent(new CustomEvent('autoGenerateKPIs', {
                    detail: { 
                      type: 'auto-generate',
                      count: 5
                    }
                  }));
                }}
              >
                Auto-Generate KPIs →
              </button>
            </div>
            {kpisLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"></div>
                ))}
              </div>
            ) : roleBasedKpis.length > 0 ? (
              <ResponsiveGrid cols={{ xs: 1, sm: 2, lg: 3 }} gap="default">
                {roleBasedKpis.map((kpi, index) => (
                  <MetricCard
                    key={index}
                    title={kpi.title}
                    description={kpi.description}
                    value={kpi.value}
                    trend={kpi.trend}
                    trendDirection={kpi.trendDirection}
                    icon={kpi.icon}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  />
                ))}
                <ActionCard
                  title="Generate More KPIs"
                  description="Let AI create custom metrics for your business"
                  icon={Plus}
                  action={() => {
                    // Auto-generate additional KPIs directly
                    window.dispatchEvent(new CustomEvent('autoGenerateKPIs', {
                      detail: { 
                        type: 'generate-more',
                        count: 3
                      }
                    }));
                  }}
                  actionLabel="Generate"
                />
              </ResponsiveGrid>
            ) : (
              <EmptyState
                title="No signals yet"
                description="Generate KPIs to start tracking your business metrics"
                action={() => {
                  window.dispatchEvent(new CustomEvent('autoGenerateKPIs', {
                    detail: { 
                      type: 'initial-generate',
                      count: 5
                    }
                  }));
                }}
                actionLabel="Generate KPIs"
                icon={Target}
              />
            )}
          </section>

          {/* Portfolio Tiles */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-foreground">Portfolio</h2>
              <button 
                className="text-sm text-primary hover:text-primary/80 font-medium"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('openNewVentureModal'));
                }}
              >
                + Add Venture
              </button>
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
    onAddData: () => {
      window.dispatchEvent(new CustomEvent('openAIChat', {
        detail: { 
          message: 'Help me add new data to my dashboard. I want to input business metrics, financial information, or other relevant data.',
          context: 'hq-data-entry'
        }
      }));
    },
    onSignals: () => setCurrentView('hq'),
    onRunFlow: () => {
      window.dispatchEvent(new CustomEvent('openAIChat', {
        detail: { 
          message: 'Help me create and run automated workflows for my business processes.',
          context: 'hq-workflow'
        }
      }));
    },
    onExport: () => setAdvancedExportModalOpen(true),
    onChat: () => setShowCoPilot(true),
    onFounderMode: () => setFounderModeOpen(true)
  };

  return (
    <ResponsiveContainer maxWidth="7xl" padding="lg">
      <div className="space-y-8 animate-fade-in">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">HQ Dashboard</h1>
            <p className="text-muted-foreground mt-1">Portfolio overview and key signals</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusCard
              status="success"
              title="System Online"
              message="All services operational"
              className="w-auto"
            />
          </div>
        </div>

        {/* Top KPIs Strip */}
        <section>
          <ResponsiveGrid cols={{ xs: 1, sm: 3 }} gap="default">
            {topStripKpis}
          </ResponsiveGrid>
        </section>

        {tabs[0].content}
      </div>
      
      <FounderModeOverlay 
        isOpen={founderModeOpen} 
        onClose={() => setFounderModeOpen(false)} 
      />
    </ResponsiveContainer>
  );
};

export default HQDashboard;