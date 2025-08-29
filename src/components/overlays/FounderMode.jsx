import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Compass, List, Clock, X, Plus, ArrowUp, ArrowDown } from 'lucide-react';

const FounderModeOverlay = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('stack');

  const tabs = [
    { id: 'stack', label: 'Priority Stack', icon: List },
    { id: 'queue', label: 'Decision Queue', icon: Clock },
    { id: 'compass', label: 'Strategic Compass', icon: Compass }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[80vh] p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Founder Mode Dashboard</DialogTitle>
          <DialogDescription>Advanced founder analytics and insights</DialogDescription>
        </DialogHeader>
        <DialogHeader className="p-6 border-b border-border">
          <DialogTitle className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-primary" />
            Founder Mode
            <span className="text-sm font-normal text-muted-foreground ml-2">
              Meta-level insights for strategic decisions
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex h-full">
          {/* Sidebar Navigation */}
          <div className="w-64 border-r border-border bg-muted/30 p-4">
            <div className="space-y-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                      activeTab === tab.id
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            {activeTab === 'stack' && <PriorityStack />}
            {activeTab === 'queue' && <DecisionQueue />}
            {activeTab === 'compass' && <StrategicCompass />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const PriorityStack = () => {
  const [priorities, setPriorities] = useState([
    {
      id: 1,
      title: 'Reduce customer acquisition cost',
      impact: 'High',
      urgency: 'Medium',
      effort: 'Low',
      category: 'Growth'
    },
    {
      id: 2,
      title: 'Extend runway to 18+ months',
      impact: 'High',
      urgency: 'High',
      effort: 'Medium',
      category: 'Finance'
    },
    {
      id: 3,
      title: 'Launch enterprise features',
      impact: 'Medium',
      urgency: 'Low',
      effort: 'High',
      category: 'Product'
    }
  ]);

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'High': return 'text-success';
      case 'Medium': return 'text-warning';
      case 'Low': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Priority Stack</h3>
          <p className="text-sm text-muted-foreground">
            AI-ranked initiatives based on impact, urgency, and effort
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Priority
        </Button>
      </div>

      <div className="space-y-3">
        {priorities.map((priority, index) => (
          <div
            key={priority.id}
            className="border border-border rounded-lg p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono text-muted-foreground">
                    #{index + 1}
                  </span>
                  <span className="text-xs px-2 py-1 bg-muted rounded text-muted-foreground">
                    {priority.category}
                  </span>
                </div>
                <h4 className="font-medium mb-2">{priority.title}</h4>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Impact:</span>
                    <span className={getImpactColor(priority.impact)}>
                      {priority.impact}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Urgency:</span>
                    <span className={getImpactColor(priority.urgency)}>
                      {priority.urgency}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Effort:</span>
                    <span className={getImpactColor(priority.effort)}>
                      {priority.effort}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost">
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost">
                  <ArrowDown className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DecisionQueue = () => {
  const decisions = [
    {
      id: 1,
      title: 'Should we raise Series A now or wait 6 months?',
      deadline: '2024-02-15',
      category: 'Funding',
      stakeholders: ['CEO', 'Board'],
      status: 'pending'
    },
    {
      id: 2,
      title: 'Expand to European market this quarter?',
      deadline: '2024-01-30',
      category: 'Strategy',
      stakeholders: ['CEO', 'Head of Sales'],
      status: 'research'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Decision Queue</h3>
          <p className="text-sm text-muted-foreground">
            Important decisions requiring founder attention
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Decision
        </Button>
      </div>

      <div className="space-y-4">
        {decisions.map(decision => (
          <div
            key={decision.id}
            className="border border-border rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-medium mb-2">{decision.title}</h4>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Due: {decision.deadline}</span>
                  <span>•</span>
                  <span>{decision.category}</span>
                  <span>•</span>
                  <span>Stakeholders: {decision.stakeholders.join(', ')}</span>
                </div>
              </div>
              <span className={cn(
                "text-xs px-2 py-1 rounded capitalize",
                decision.status === 'pending' && "bg-warning/10 text-warning",
                decision.status === 'research' && "bg-info/10 text-info"
              )}>
                {decision.status}
              </span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                Research
              </Button>
              <Button size="sm" variant="outline">
                Schedule Discussion
              </Button>
              <Button size="sm">
                Make Decision
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StrategicCompass = () => {
  const metrics = [
    { label: 'Market Position', value: 7.2, target: 8.0, trend: 'up' },
    { label: 'Financial Health', value: 8.5, target: 9.0, trend: 'up' },
    { label: 'Team Strength', value: 6.8, target: 8.5, trend: 'down' },
    { label: 'Product Market Fit', value: 7.8, target: 8.5, trend: 'up' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Strategic Compass</h3>
        <p className="text-sm text-muted-foreground">
          Overall health and direction indicators
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {metrics.map(metric => (
          <div key={metric.label} className="border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">{metric.label}</h4>
              <span className={cn(
                "text-xs px-2 py-1 rounded",
                metric.trend === 'up' && "bg-success/10 text-success",
                metric.trend === 'down' && "bg-destructive/10 text-destructive"
              )}>
                {metric.trend === 'up' ? '↗' : '↘'}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current</span>
                <span className="font-medium">{metric.value}/10</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${(metric.value / 10) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Target: {metric.target}/10</span>
                <span>{Math.round(((metric.value / metric.target) * 100))}% of goal</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border border-border rounded-lg p-6">
        <h4 className="font-medium mb-4">Strategic Recommendations</h4>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2" />
            <div>
              <p className="text-sm font-medium">Focus on team expansion</p>
              <p className="text-xs text-muted-foreground">
                Team strength is below target. Consider hiring key roles.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-warning rounded-full mt-2" />
            <div>
              <p className="text-sm font-medium">Monitor cash flow closely</p>
              <p className="text-xs text-muted-foreground">
                Strong financial health but watch Q1 spending patterns.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FounderModeOverlay;