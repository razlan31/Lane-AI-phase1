import React, { useState } from 'react';
import { MessageCircle, Target, TrendingUp, DollarSign, Users, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { cn } from '../../lib/utils';

const GoalChatMode = ({ isOpen, onCreateVenture, onClose, className }) => {
  const [currentStep, setCurrentStep] = useState('welcome');
  const [chatData, setChatData] = useState({
    goal: null,
    timeline: null,
    revenue: null,
    useSampleData: false
  });

  const goals = [
    { id: 'grow-sales', title: 'Grow sales', icon: TrendingUp },
    { id: 'manage-cash', title: 'Manage cash flow', icon: DollarSign },
    { id: 'hire-people', title: 'Hire people', icon: Users },
    { id: 'launch-product', title: 'Launch product', icon: Zap },
    { id: 'other', title: 'Other', icon: Target }
  ];

  const handleGoalSelect = (goal) => {
    setChatData({ ...chatData, goal });
    setCurrentStep('timeline');
  };

  const handleTimelineSelect = (timeline) => {
    setChatData({ ...chatData, timeline });
    setCurrentStep('revenue');
  };

  const handleRevenueSubmit = (revenue) => {
    setChatData({ ...chatData, revenue });
    setCurrentStep('confirmation');
  };

  const handleCreateWorkspace = () => {
    // Create draft venture with starter worksheets
    const ventureData = {
      name: 'New Venture',
      goal: chatData.goal,
      timeline: chatData.timeline,
      monthlyRevenue: chatData.revenue,
      useSampleData: chatData.useSampleData,
      worksheets: ['cashflow', 'runway'],
      status: 'draft'
    };

    if (onCreateVenture) {
      onCreateVenture(ventureData);
    }
  };

  const renderChatStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">Hi! What's your main goal?</h2>
                <p className="text-muted-foreground">I'll help you create a starter workspace</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-md mx-auto">
              {goals.map((goal) => {
                const Icon = goal.icon;
                return (
                  <Button
                    key={goal.id}
                    variant="outline"
                    className="h-auto p-4 flex items-center gap-3"
                    onClick={() => handleGoalSelect(goal)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{goal.title}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        );

      case 'timeline':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold">Great! How soon do you want visibility?</h2>
            </div>
            <div className="space-y-3 max-w-xs mx-auto">
              {['30 days', '90 days', '6 months', 'Other'].map((timeline) => (
                <Button
                  key={timeline}
                  variant="outline"
                  className="w-full"
                  onClick={() => handleTimelineSelect(timeline)}
                >
                  {timeline}
                </Button>
              ))}
            </div>
          </div>
        );

      case 'revenue':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold">What's your monthly revenue?</h2>
              <p className="text-muted-foreground">Approximate is fine</p>
            </div>
            <div className="space-y-3 max-w-xs mx-auto">
              {['$0 - $1K', '$1K - $5K', '$5K - $20K', '$20K+', 'Pre-revenue'].map((revenue) => (
                <Button
                  key={revenue}
                  variant="outline"
                  className="w-full"
                  onClick={() => handleRevenueSubmit(revenue)}
                >
                  {revenue}
                </Button>
              ))}
            </div>
          </div>
        );

      case 'confirmation':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold">Perfect! I'll create a starter workspace</h2>
              <p className="text-muted-foreground">
                Cashflow Forecast + Runway widget for "{chatData.goal?.title}" focus
              </p>
            </div>
            
            <Card className="border-dashed">
              <CardHeader className="text-center pb-3">
                <CardTitle className="text-lg">Your Starter Workspace</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <strong>Goal:</strong> {chatData.goal?.title}
                </div>
                <div className="text-sm">
                  <strong>Timeline:</strong> {chatData.timeline}
                </div>
                <div className="text-sm">
                  <strong>Monthly Revenue:</strong> {chatData.revenue}
                </div>
                <div className="text-sm">
                  <strong>Includes:</strong> Cashflow worksheet, Runway calculator, KPI dashboard
                </div>
              </CardContent>
            </Card>

            <div className="text-center space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-3">Use sample data to demo or start blank?</p>
                <div className="flex gap-2 justify-center">
                  <Button 
                    onClick={() => {
                      setChatData({ ...chatData, useSampleData: true });
                      handleCreateWorkspace();
                    }}
                  >
                    Use sample data
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setChatData({ ...chatData, useSampleData: false });
                      handleCreateWorkspace();
                    }}
                  >
                    Start blank
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'created':
        return (
          <div className="space-y-6 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold">Done! I created your starter workspace</h2>
            </div>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => window.dispatchEvent(new CustomEvent('openCashflowWorksheet'))}>
                Open Cashflow worksheet
              </Button>
              <Button variant="outline" onClick={onClose}>
                View Dashboard
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Goal-Guided Builder</DialogTitle>
          <DialogDescription>
            Let's create a starter workspace based on your main goal
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-8">
          {/* Progress indicator */}
          <div className="flex justify-center">
            <div className="flex space-x-2">
              {['welcome', 'timeline', 'revenue', 'confirmation'].map((step, index) => (
                <div
                  key={step}
                  className={cn(
                    "w-3 h-3 rounded-full",
                    ['welcome', 'timeline', 'revenue', 'confirmation'].indexOf(currentStep) >= index
                      ? "bg-primary"
                      : "bg-muted"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Chat content */}
          {renderChatStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GoalChatMode;