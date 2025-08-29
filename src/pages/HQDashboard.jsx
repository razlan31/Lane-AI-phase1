import React from 'react';
import KpiCard from '../components/primitives/KpiCard';
import { AlertStrip } from '../components/notifications/AlertStrip';
import PortfolioTiles from '../components/portfolio/PortfolioTiles';
import QuickActionsDock from '../components/primitives/QuickActionsDock';
import { DollarSign, TrendingUp, Clock, Users, Zap, Target } from 'lucide-react';

const HQDashboard = () => {
  // Top KPI Strip Data
  const topStripKpis = [
    {
      title: "Runway",
      description: "Time left with current money",
      value: 12,
      unit: "number",
      trend: 8.2,
      trendDirection: "down",
      state: "warning"
    },
    {
      title: "Cashflow",
      description: "Money in vs money out",
      value: -5400,
      unit: "currency",
      trend: 15.3,
      trendDirection: "down",
      state: "alert"
    },
    {
      title: "Obligations",
      description: "Bills & commitments",
      value: 12850,
      unit: "currency",
      trend: 3.1,
      trendDirection: "up",
      state: "live"
    }
  ];

  // Signals Board KPIs
  const signalsKpis = [
    {
      title: "Revenue Growth",
      description: "How fast your income is growing",
      value: 23.5,
      unit: "percentage",
      trend: 12.1,
      trendDirection: "up",
      state: "live",
      icon: TrendingUp
    },
    {
      title: "Customer Acquisition",
      description: "New customers per month",
      value: 142,
      unit: "number",
      trend: 18.7,
      trendDirection: "up",
      state: "live",
      icon: Users
    },
    {
      title: "Burn Rate",
      description: "How fast you're spending money",
      value: 8750,
      unit: "currency",
      trend: 5.2,
      trendDirection: "up",
      state: "warning",
      icon: DollarSign
    },
    {
      title: "Time to Break-even",
      description: "When you'll start making profit",
      value: 8,
      unit: "number",
      trend: 2.1,
      trendDirection: "down",
      state: "draft",
      icon: Clock
    },
    {
      title: "Product Velocity",
      description: "How fast you're shipping features",
      value: 12,
      unit: "number",
      trend: 25.0,
      trendDirection: "up",
      state: "live",
      icon: Zap
    },
    {
      title: "Market Penetration",
      description: "Your share of the target market",
      value: 3.2,
      unit: "percentage",
      trend: 8.5,
      trendDirection: "up",
      state: "draft",
      icon: Target
    }
  ];

  // Mock alerts data
  const alerts = [
    {
      id: 1,
      type: "warning",
      message: "Spending up 20% this month",
      timestamp: new Date()
    },
    {
      id: 2,
      type: "alert",
      message: "Cash under 3 months runway",
      timestamp: new Date()
    }
  ];

  // Mock ventures for portfolio
  const ventures = [
    {
      id: 1,
      name: "Coffee Kiosk",
      description: "Local coffee shop expansion",
      status: "live",
      runway: 8,
      cashflow: -2800,
      revenue: 12500,
      burnRate: 3200
    },
    {
      id: 2,
      name: "Tech Startup",
      description: "B2B SaaS platform",
      status: "draft",
      runway: 18,
      cashflow: -8500,
      revenue: 4200,
      burnRate: 12300
    }
  ];

  const handleQuickActions = {
    onAddData: () => console.log('Add Data clicked'),
    onSignals: () => console.log('Signals clicked'),
    onRunFlow: () => console.log('Run Flow clicked'),
    onExport: () => console.log('Export clicked'),
    onChat: () => console.log('Chat clicked')
  };

  const handleVentureClick = (venture) => {
    console.log('Open venture:', venture.name);
  };

  const handleCreateVenture = () => {
    console.log('Create new venture');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Mission Control</h1>
              <p className="text-sm text-muted-foreground mt-1">Your business command center</p>
            </div>
          </div>
        </div>
      </header>

      {/* Top Strip - KPI Cards */}
      <section className="border-b border-border bg-card/50">
        <div className="container mx-auto px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topStripKpis.map((kpi, index) => (
              <KpiCard
                key={index}
                title={kpi.title}
                description={kpi.description}
                value={kpi.value}
                unit={kpi.unit}
                trend={kpi.trend}
                trendDirection={kpi.trendDirection}
                state={kpi.state}
                size="default"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6 space-y-8">
        {/* Alerts Strip */}
        {alerts.length > 0 && (
          <section>
            <AlertStrip alerts={alerts} onDismiss={(id) => console.log('Dismiss alert:', id)} />
          </section>
        )}

        {/* Signals Board */}
        <section>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">Signals Board</h2>
            <p className="text-sm text-muted-foreground">Key performance indicators across your ventures</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {signalsKpis.map((kpi, index) => (
              <KpiCard
                key={index}
                title={kpi.title}
                description={kpi.description}
                value={kpi.value}
                unit={kpi.unit}
                trend={kpi.trend}
                trendDirection={kpi.trendDirection}
                state={kpi.state}
                size="default"
                showModal={true}
                modalContent={
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {kpi.description}
                    </p>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm">
                        Current Value: <span className="font-semibold">{kpi.value}{kpi.unit === 'percentage' ? '%' : kpi.unit === 'currency' ? ' USD' : ''}</span>
                      </p>
                      <p className="text-sm">
                        Trend: <span className={`font-semibold ${kpi.trendDirection === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                          {kpi.trendDirection === 'up' ? '+' : ''}{kpi.trend}% from last period
                        </span>
                      </p>
                    </div>
                  </div>
                }
              />
            ))}
          </div>
        </section>

        {/* Portfolio Tiles */}
        <section>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">Portfolio</h2>
            <p className="text-sm text-muted-foreground">Your ventures at a glance</p>
          </div>
          <PortfolioTiles 
            ventures={ventures}
            onVentureClick={handleVentureClick}
            onCreateVenture={handleCreateVenture}
          />
        </section>
      </main>

      {/* Quick Actions Dock */}
      <QuickActionsDock
        onAddData={handleQuickActions.onAddData}
        onSignals={handleQuickActions.onSignals}
        onRunFlow={handleQuickActions.onRunFlow}
        onExport={handleQuickActions.onExport}
        onChat={handleQuickActions.onChat}
      />
    </div>
  );
};

export default HQDashboard;