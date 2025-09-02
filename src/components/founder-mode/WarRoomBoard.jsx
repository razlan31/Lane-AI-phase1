import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Play, ArrowRight, TrendingUp, Users, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

const WarRoomBoard = ({ venture, onPromoteToScenario, onCreateWorksheet, onAnalyzeRisk, className }) => {
  const [selectedBlocks, setSelectedBlocks] = useState([]);

  // Mock data for demonstration - would come from props in real implementation
  const criticalMetrics = [
    { name: 'Runway', value: '8 months', status: 'warning', change: '-2 months' },
    { name: 'Burn Rate', value: '$45k/mo', status: 'critical', change: '+$5k' },
    { name: 'Revenue', value: '$120k/mo', status: 'good', change: '+$15k' },
    { name: 'Cash', value: '$360k', status: 'warning', change: '-$45k' }
  ];

  const scenarios = [
    { 
      id: 'growth', 
      name: 'Growth Acceleration', 
      description: 'Scale marketing and hiring',
      impact: 'High Risk, High Reward',
      blocks: ['Marketing Funnel', 'Hiring Plan', 'Cash Flow Model']
    },
    { 
      id: 'efficiency', 
      name: 'Efficiency Mode', 
      description: 'Optimize costs and operations',
      impact: 'Low Risk, Steady Progress',
      blocks: ['Cost Analysis', 'Process Optimization', 'Team Structure']
    },
    { 
      id: 'pivot', 
      name: 'Strategic Pivot', 
      description: 'Explore new market segments',
      impact: 'Medium Risk, Potential Breakthrough',
      blocks: ['Market Research', 'Product Roadmap', 'Financial Model']
    }
  ];

  const handlePromoteScenario = async (scenario) => {
    try {
      console.log('Promoting scenario to venture:', scenario);
      
      // Create worksheet from scenario blocks
      if (onCreateWorksheet) {
        await onCreateWorksheet({
          type: 'scenario',
          name: `${scenario.name} Scenario`,
          description: scenario.description,
          blocks: scenario.blocks,
          metadata: {
            impact: scenario.impact,
            created_from: 'war_room',
            scenario_id: scenario.id
          }
        });
      }
      
      if (onPromoteToScenario) {
        onPromoteToScenario(scenario);
      }
    } catch (error) {
      console.error('Error promoting scenario:', error);
    }
  };

  const handleCreateWorksheet = async (blocks) => {
    try {
      console.log('Creating worksheet from blocks:', blocks);
      
      if (onCreateWorksheet) {
        await onCreateWorksheet({
          type: 'custom',
          name: 'War Room Analysis',
          description: 'Strategic analysis created from War Room',
          blocks: blocks,
          metadata: {
            created_from: 'war_room',
            metrics_snapshot: criticalMetrics
          }
        });
      }
    } catch (error) {
      console.error('Error creating worksheet:', error);
    }
  };

  const handleAnalyzeRisk = async () => {
    try {
      console.log('Analyzing risk for venture:', venture);
      
      if (onAnalyzeRisk) {
        await onAnalyzeRisk({
          venture_id: venture?.id,
          metrics: criticalMetrics,
          scenarios: scenarios
        });
      }
    } catch (error) {
      console.error('Error analyzing risk:', error);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Crown className="h-6 w-6 text-amber-600" />
          <div>
            <h2 className="text-2xl font-bold">War Room</h2>
            <p className="text-muted-foreground">Strategic decision command center</p>
          </div>
        </div>
        <Button onClick={handleAnalyzeRisk} className="bg-amber-600 hover:bg-amber-700">
          <TrendingUp className="h-4 w-4 mr-2" />
          Analyze Risk
        </Button>
      </div>

      {/* Critical Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {criticalMetrics.map((metric) => (
          <Card key={metric.name} className={cn(
            "border-l-4",
            metric.status === 'critical' && "border-l-red-500",
            metric.status === 'warning' && "border-l-yellow-500", 
            metric.status === 'good' && "border-l-green-500"
          )}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.name}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </div>
                <Badge variant={
                  metric.status === 'critical' ? 'destructive' : 
                  metric.status === 'warning' ? 'secondary' : 'default'
                }>
                  {metric.change}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Strategic Scenarios */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Strategic Scenarios</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scenarios.map((scenario) => (
            <Card key={scenario.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{scenario.name}</span>
                  <Play className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{scenario.description}</p>
                
                <div>
                  <p className="text-sm font-medium mb-2">Impact Assessment</p>
                  <Badge variant="outline">{scenario.impact}</Badge>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Required Blocks</p>
                  <div className="space-y-1">
                    {scenario.blocks.map((block, index) => (
                      <div key={index} className="text-xs text-muted-foreground">
                        • {block}
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={() => handlePromoteScenario(scenario)}
                  className="w-full"
                  size="sm"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Promote to Scenario
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Strategic Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              onClick={() => handleCreateWorksheet(['Financial Model', 'Cash Flow Analysis'])}
              className="h-auto p-4 flex flex-col items-center space-y-2"
            >
              <DollarSign className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Financial Deep Dive</div>
                <div className="text-xs text-muted-foreground">Generate comprehensive financial worksheet</div>
              </div>
            </Button>

            <Button 
              variant="outline"
              onClick={() => handleCreateWorksheet(['Market Analysis', 'Customer Segments'])}
              className="h-auto p-4 flex flex-col items-center space-y-2"
            >
              <Users className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Market Analysis</div>
                <div className="text-xs text-muted-foreground">Analyze market position and opportunities</div>
              </div>
            </Button>

            <Button 
              variant="outline"
              onClick={() => handleCreateWorksheet(['Risk Assessment', 'Contingency Planning'])}
              className="h-auto p-4 flex flex-col items-center space-y-2"
            >
              <TrendingUp className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Risk Assessment</div>
                <div className="text-xs text-muted-foreground">Evaluate and mitigate business risks</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WarRoomBoard;