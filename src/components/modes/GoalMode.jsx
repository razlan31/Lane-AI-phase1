import React, { useState } from 'react';
import { Target, TrendingUp, DollarSign, Users, Zap, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../../lib/utils';

const GoalMode = ({ onSuggestedPath, className }) => {
  const [selectedGoal, setSelectedGoal] = useState(null);

  const mainGoals = [
    {
      id: 'grow-sales',
      title: 'Grow Sales',
      description: 'Increase revenue and customer acquisition',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      nextSteps: [
        'Customer Acquisition Worksheet',
        'Sales Funnel Dashboard',
        'Revenue Tracking Setup'
      ]
    },
    {
      id: 'manage-cash',
      title: 'Manage Cash Flow',
      description: 'Track money in vs money out',
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      nextSteps: [
        'Cash Flow Worksheet',
        'Runway Calculator',
        'Expense Tracking Dashboard'
      ]
    },
    {
      id: 'build-team',
      title: 'Build Team',
      description: 'Hire and manage your people',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      nextSteps: [
        'Hiring Budget Worksheet',
        'Team Growth Dashboard',
        'Compensation Planning'
      ]
    },
    {
      id: 'launch-product',
      title: 'Launch Product',
      description: 'Bring your idea to market',
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      nextSteps: [
        'Launch Budget Worksheet',
        'Product Metrics Dashboard',
        'Go-to-Market Planning'
      ]
    }
  ];

  const handleGoalSelect = (goal) => {
    setSelectedGoal(goal);
  };

  const handleStartPath = () => {
    if (selectedGoal && onSuggestedPath) {
      onSuggestedPath(selectedGoal);
    }
  };

  return (
    <div className={cn("space-y-8", className)}>
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Target className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">What's your main goal?</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Choose your focus and we'll suggest the best starting point
          </p>
        </div>
      </div>

      {/* Goal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {mainGoals.map((goal) => {
          const Icon = goal.icon;
          const isSelected = selectedGoal?.id === goal.id;
          
          return (
            <Card
              key={goal.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md",
                isSelected && "ring-2 ring-primary shadow-md"
              )}
              onClick={() => handleGoalSelect(goal)}
            >
              <CardHeader className="text-center">
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3",
                  goal.bgColor
                )}>
                  <Icon className={cn("h-6 w-6", goal.color)} />
                </div>
                <CardTitle className="text-xl">{goal.title}</CardTitle>
                <CardDescription>{goal.description}</CardDescription>
              </CardHeader>
              {isSelected && (
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-foreground">Suggested next steps:</p>
                    <ul className="space-y-2">
                      {goal.nextSteps.map((step, index) => (
                        <li key={index} className="flex items-center text-sm text-muted-foreground">
                          <ArrowRight className="h-3 w-3 mr-2 text-primary" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Action Button */}
      {selectedGoal && (
        <div className="text-center">
          <Button 
            size="lg" 
            onClick={handleStartPath}
            className="min-w-[200px]"
          >
            Get Started with {selectedGoal.title}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Skip Option */}
      <div className="text-center">
        <Button 
          variant="ghost" 
          onClick={() => onSuggestedPath && onSuggestedPath(null)}
        >
          Skip and explore on my own
        </Button>
      </div>
    </div>
  );
};

export default GoalMode;