import React from 'react';
import { cn } from '../../lib/utils';
import TabContainer from '../primitives/TabContainer';
import QuickActionsDock from '../primitives/QuickActionsDock';
import TopBar from '../navigation/TopBar';

const DashboardLayout = ({ 
  title,
  subtitle,
  topStrip,
  tabs,
  onQuickAction,
  children,
  className 
}) => {
  return (
    <div className={cn("min-h-screen bg-background", className)}>

      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Top Strip - KPI Cards */}
      {topStrip && (
        <section className="border-b border-border bg-card/50">
          <div className="container mx-auto px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topStrip}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6 flex-1">
        {tabs ? (
          <TabContainer
            tabs={tabs}
            className="space-y-6"
          />
        ) : (
          children
        )}
      </main>

      {/* Quick Actions Dock */}
      <QuickActionsDock
        onAddData={onQuickAction?.onAddData}
        onSignals={onQuickAction?.onSignals}
        onRunFlow={onQuickAction?.onRunFlow}
        onExport={onQuickAction?.onExport}
        onChat={onQuickAction?.onChat}
        onFounderMode={onQuickAction?.onFounderMode}
      />
    </div>
  );
};

export default DashboardLayout;