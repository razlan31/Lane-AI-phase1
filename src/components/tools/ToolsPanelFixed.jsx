import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, TrendingUp, DollarSign, Users, Target, Play } from 'lucide-react';
import { toast } from 'sonner';

const ToolsPanelFixed = ({ isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [runningTool, setRunningTool] = useState(null);

  const toolCategories = [
    { id: 'all', name: 'All Tools', icon: Calculator },
    { id: 'financial', name: 'Financial', icon: DollarSign },
    { id: 'marketing', name: 'Marketing', icon: TrendingUp },
    { id: 'operations', name: 'Operations', icon: Target },
    { id: 'growth', name: 'Growth', icon: Users }
  ];

  const tools = [
    {
      id: 'roi_calc',
      name: 'ROI Calculator',
      description: 'Calculate return on investment for projects and campaigns',
      category: 'financial',
      icon: DollarSign,
      inputs: ['initial_investment', 'expected_return', 'time_period']
    },
    {
      id: 'cac_calc',
      name: 'CAC Calculator',
      description: 'Calculate customer acquisition cost across channels',
      category: 'marketing',
      icon: TrendingUp,
      inputs: ['marketing_spend', 'new_customers', 'time_period']
    },
    {
      id: 'ltv_calc',
      name: 'LTV Calculator',
      description: 'Calculate customer lifetime value',
      category: 'financial',
      icon: DollarSign,
      inputs: ['avg_revenue_per_customer', 'retention_rate', 'profit_margin']
    },
    {
      id: 'runway_calc',
      name: 'Runway Calculator',
      description: 'Calculate how long your cash will last',
      category: 'financial',
      icon: DollarSign,
      inputs: ['current_cash', 'monthly_burn_rate', 'revenue_growth']
    },
    {
      id: 'funnel_analysis',
      name: 'Funnel Analysis',
      description: 'Analyze conversion funnels and identify drop-off points',
      category: 'marketing',
      icon: TrendingUp,
      inputs: ['funnel_stages', 'conversion_rates', 'traffic_volume']
    },
    {
      id: 'breakeven_calc',
      name: 'Break-even Calculator',
      description: 'Calculate break-even point for products or services',
      category: 'financial',
      icon: DollarSign,
      inputs: ['fixed_costs', 'variable_cost_per_unit', 'price_per_unit']
    }
  ];

  const filteredTools = selectedCategory === 'all' 
    ? tools 
    : tools.filter(tool => tool.category === selectedCategory);

  const handleRunTool = async (tool) => {
    setRunningTool(tool.id);
    toast.info(`Running ${tool.name}...`);
    
    // Simulate tool execution
    setTimeout(() => {
      setRunningTool(null);
      toast.success(`${tool.name} completed! Results available in dashboard.`);
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Tools Catalog
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Categories */}
          <div className="w-48 space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground mb-3">Categories</h3>
            {toolCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "secondary" : "ghost"}
                  onClick={() => setSelectedCategory(category.id)}
                  className="w-full justify-start h-auto p-3"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium text-xs">{category.name}</div>
                  </div>
                </Button>
              );
            })}
          </div>

          {/* Tools Grid */}
          <div className="flex-1 overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTools.map((tool) => {
                const Icon = tool.icon;
                const isRunning = runningTool === tool.id;
                
                return (
                  <Card key={tool.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-sm">{tool.name}</CardTitle>
                      </div>
                      <CardDescription className="text-xs">
                        {tool.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-3">
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          Required Inputs:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {tool.inputs.map((input, index) => (
                            <span key={index} className="text-xs bg-muted px-2 py-1 rounded">
                              {input.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => handleRunTool(tool)}
                        disabled={isRunning}
                        className="w-full"
                        size="sm"
                      >
                        {isRunning ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-foreground mr-2"></div>
                            Running...
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3 mr-2" />
                            Run Tool
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredTools.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No tools found in this category
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ToolsPanelFixed;