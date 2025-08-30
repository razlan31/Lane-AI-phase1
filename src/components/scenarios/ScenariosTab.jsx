import React, { useState } from 'react';
import { Copy, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import LockUnlockWrapper from '../primitives/LockUnlockWrapper';

const ScenariosTab = ({ ventureId }) => {
  const [scenarios] = useState([
    {
      id: 1,
      name: "Base Case",
      type: "base",
      description: "Current projections with existing data",
      icon: Target,
      worksheets: 3,
      lastUpdated: "2 days ago"
    },
    {
      id: 2,
      name: "Optimistic Growth",
      type: "optimistic",
      description: "20% higher revenue, same costs",
      icon: TrendingUp,
      worksheets: 3,
      lastUpdated: "1 week ago"
    },
    {
      id: 3,
      name: "Market Downturn",
      type: "pessimistic",
      description: "30% revenue drop, increased costs",
      icon: TrendingDown,
      worksheets: 2,
      lastUpdated: "3 days ago"
    }
  ]);

  const getScenarioColor = (type) => {
    switch (type) {
      case 'optimistic':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pessimistic':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Scenarios</h3>
          <p className="text-sm text-muted-foreground">
            Compare different what-if situations for your venture
          </p>
        </div>
        <LockUnlockWrapper feature="scenarios" requiredTier="pro">
          <Button>
            <Copy className="h-4 w-4 mr-2" />
            Create Scenario
          </Button>
        </LockUnlockWrapper>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((scenario) => {
          const IconComponent = scenario.icon;
          return (
            <LockUnlockWrapper 
              key={scenario.id}
              feature={scenario.type !== 'base' ? "scenarios" : "basic_worksheets"}
              requiredTier="pro"
            >
              <Card className={`cursor-pointer hover:shadow-md transition-all ${getScenarioColor(scenario.type)}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <IconComponent className="h-5 w-5" />
                    {scenario.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{scenario.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{scenario.worksheets} worksheets</span>
                    <span>Updated {scenario.lastUpdated}</span>
                  </div>
                </CardContent>
              </Card>
            </LockUnlockWrapper>
          );
        })}
      </div>

      {/* AI Suggestions for Scenarios */}
      <LockUnlockWrapper feature="ai_scenarios" requiredTier="pro">
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center">
              <h4 className="font-medium mb-2">AI Scenario Suggestions</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Let AI suggest what-if scenarios based on your data
              </p>
              <Button variant="outline">
                Generate AI Scenarios
              </Button>
            </div>
          </CardContent>
        </Card>
      </LockUnlockWrapper>
    </div>
  );
};

export default ScenariosTab;