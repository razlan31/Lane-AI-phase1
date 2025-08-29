import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Dialog, DialogContent } from '../ui/dialog';
import { Check, ArrowRight, Building, User, Users, Lightbulb } from 'lucide-react';

const OnboardingFlow = ({ isOpen, onComplete, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    role: '',
    ventureType: '',
    venterName: '',
    initialExpense: ''
  });

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to LaneAI',
      subtitle: 'Your intelligent venture management platform'
    },
    {
      id: 'role',
      title: 'What\'s your role?',
      subtitle: 'This helps us customize your experience'
    },
    {
      id: 'venture',
      title: 'Set up your first venture',
      subtitle: 'Let\'s get your company data organized'
    },
    {
      id: 'aha',
      title: 'See the magic happen',
      subtitle: 'Add an expense and watch your runway update in real-time'
    }
  ];

  const roles = [
    { id: 'founder', label: 'Founder/CEO', icon: User, description: 'Leading the vision' },
    { id: 'cfo', label: 'CFO/Finance', icon: Building, description: 'Managing finances' },
    { id: 'operations', label: 'Operations', icon: Users, description: 'Running day-to-day' },
    { id: 'advisor', label: 'Advisor/Investor', icon: Lightbulb, description: 'Providing guidance' }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(formData);
    }
  };

  const handleRoleSelect = (roleId) => {
    setFormData(prev => ({ ...prev, role: roleId }));
    setTimeout(handleNext, 300);
  };

  const handleExpenseAdd = () => {
    // Simulate the "aha moment" of runway calculation
    setFormData(prev => ({ ...prev, initialExpense: '5000' }));
    setTimeout(() => {
      onComplete(formData);
    }, 2000);
  };

  const renderStep = () => {
    switch (steps[currentStep].id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Lightbulb className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">{steps[currentStep].title}</h2>
              <p className="text-muted-foreground">{steps[currentStep].subtitle}</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Check className="h-4 w-4 text-success" />
                <span>Real-time financial insights</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Check className="h-4 w-4 text-success" />
                <span>AI-powered recommendations</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Check className="h-4 w-4 text-success" />
                <span>Automated reporting</span>
              </div>
            </div>
            <Button onClick={handleNext} className="w-full">
              Get Started
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        );

      case 'role':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">{steps[currentStep].title}</h2>
              <p className="text-muted-foreground">{steps[currentStep].subtitle}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {roles.map(role => {
                const Icon = role.icon;
                return (
                  <div
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className={cn(
                      "p-4 border border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all",
                      formData.role === role.id && "border-primary bg-primary/5"
                    )}
                  >
                    <Icon className="h-6 w-6 mb-3 text-primary" />
                    <div className="font-medium text-sm mb-1">{role.label}</div>
                    <div className="text-xs text-muted-foreground">{role.description}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'venture':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">{steps[currentStep].title}</h2>
              <p className="text-muted-foreground">{steps[currentStep].subtitle}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Company Name</label>
                <input
                  type="text"
                  value={formData.venterName}
                  onChange={(e) => setFormData(prev => ({ ...prev, venterName: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder="e.g., Acme Inc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Industry</label>
                <select
                  value={formData.ventureType}
                  onChange={(e) => setFormData(prev => ({ ...prev, ventureType: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">Select industry</option>
                  <option value="saas">SaaS</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="fintech">Fintech</option>
                  <option value="healthtech">Healthtech</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <Button 
              onClick={handleNext} 
              className="w-full"
              disabled={!formData.venterName || !formData.ventureType}
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        );

      case 'aha':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">{steps[currentStep].title}</h2>
              <p className="text-muted-foreground">{steps[currentStep].subtitle}</p>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Current Runway</span>
                <span className="text-lg font-bold text-primary">
                  {formData.initialExpense ? '22 months' : '24 months'}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Based on current burn rate and cash balance
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Add an expense</label>
                <input
                  type="number"
                  placeholder="5000"
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>
              <Button onClick={handleExpenseAdd} className="w-full">
                Add Expense & See Impact
              </Button>
            </div>

            {formData.initialExpense && (
              <div className="text-center text-sm text-success animate-fade-in">
                ✨ Runway updated! Your new projection: 22 months
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                index <= currentStep ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>

        {renderStep()}
      </DialogContent>
    </Dialog>
  );
};

// Teaching Tooltip Component
const TeachingTooltip = ({ children, content, position = 'top', isVisible, onNext, onSkip }) => {
  if (!isVisible) return children;

  return (
    <div className="relative">
      {children}
      <div className={cn(
        "absolute z-50 bg-popover border border-border rounded-lg p-4 shadow-lg max-w-sm",
        position === 'top' && "bottom-full mb-2",
        position === 'bottom' && "top-full mt-2",
        position === 'left' && "right-full mr-2",
        position === 'right' && "left-full ml-2"
      )}>
        <div className="text-sm mb-3">{content}</div>
        <div className="flex gap-2">
          <Button size="sm" onClick={onNext}>
            Got it
          </Button>
          <Button size="sm" variant="ghost" onClick={onSkip}>
            Skip tour
          </Button>
        </div>
      </div>
    </div>
  );
};

export { OnboardingFlow, TeachingTooltip };