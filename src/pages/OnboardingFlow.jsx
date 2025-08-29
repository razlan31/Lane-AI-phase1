import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import WorksheetRenderer from '../components/WorksheetRenderer';
import { Progress } from '../components/ui/progress';
import { 
  Rocket, 
  Target, 
  Zap, 
  Heart, 
  TrendingUp, 
  Users, 
  Shield, 
  Flame,
  CheckCircle2,
  ArrowRight,
  Lightbulb
} from 'lucide-react';
import { cn } from '../lib/utils';

const OnboardingFlow = ({ isOpen, onComplete, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    ventureType: '',
    stage: '',
    northStar: '',
    decisionStyle: '',
    moneyStyle: '',
    growthStyle: '',
    riskAppetite: '',
    defaultMode: 'goal'
  });
  const [showWorksheet, setShowWorksheet] = useState(false);

  const totalSteps = 5;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const ventureTypes = [
    { id: 'startup', label: 'Tech Startup', icon: Rocket, description: 'Building innovative software or tech products' },
    { id: 'service', label: 'Service Business', icon: Users, description: 'Consulting, agency, or professional services' },
    { id: 'retail', label: 'Retail/E-commerce', icon: TrendingUp, description: 'Selling physical or digital products' },
    { id: 'consulting', label: 'Consulting', icon: Target, description: 'Expert advice and specialized knowledge' }
  ];

  const stages = [
    { id: 'idea', label: 'Idea Stage', description: 'Just getting started, validating concept' },
    { id: 'mvp', label: 'MVP/Early', description: 'Building first version, getting initial feedback' },
    { id: 'growth', label: 'Growth Stage', description: 'Scaling operations, expanding market reach' },
    { id: 'established', label: 'Established', description: 'Stable operations, optimizing performance' }
  ];

  const founderDnaOptions = {
    decisionStyle: [
      { id: 'data', label: 'Data-Driven', icon: TrendingUp, description: 'I prefer numbers and analytics' },
      { id: 'intuition', label: 'Intuitive', icon: Heart, description: 'I trust my gut feeling' },
      { id: 'collaborative', label: 'Collaborative', icon: Users, description: 'I like to get team input' },
      { id: 'rapid', label: 'Rapid Fire', icon: Zap, description: 'I make quick decisions' }
    ],
    moneyStyle: [
      { id: 'conservative', label: 'Conservative', icon: Shield, description: 'Careful with spending' },
      { id: 'aggressive', label: 'Aggressive', icon: Flame, description: 'Invest heavily for growth' },
      { id: 'balanced', label: 'Balanced', icon: Target, description: 'Strategic but measured' },
      { id: 'frugal', label: 'Bootstrapper', icon: Heart, description: 'Minimal external funding' }
    ],
    growthStyle: [
      { id: 'organic', label: 'Organic', icon: TrendingUp, description: 'Steady, sustainable growth' },
      { id: 'viral', label: 'Viral', icon: Zap, description: 'Rapid expansion through networks' },
      { id: 'paid', label: 'Paid Growth', icon: Target, description: 'Marketing and advertising focus' },
      { id: 'partnership', label: 'Partnerships', icon: Users, description: 'Growth through alliances' }
    ],
    riskAppetite: [
      { id: 'low', label: 'Risk Averse', icon: Shield, description: 'Prefer safe, proven approaches' },
      { id: 'medium', label: 'Calculated Risk', icon: Target, description: 'Take smart, measured risks' },
      { id: 'high', label: 'Risk Taker', icon: Flame, description: 'Comfortable with uncertainty' },
      { id: 'extreme', label: 'All-In', icon: Rocket, description: 'Go big or go home' }
    ]
  };

  const modes = [
    { 
      id: 'goal', 
      label: 'Goal Mode', 
      icon: Target, 
      description: 'Lightweight entry point with guided suggestions',
      isDefault: true
    },
    { 
      id: 'workspace', 
      label: 'Workspace Mode', 
      icon: Users, 
      description: 'Structured by venture with detailed dashboards' 
    },
    { 
      id: 'stream', 
      label: 'Stream Mode', 
      icon: TrendingUp, 
      description: 'Timeline feed of insights and opportunities' 
    },
    { 
      id: 'playground', 
      label: 'Playground Mode', 
      icon: Zap, 
      description: 'Freeform canvas for experimentation' 
    }
  ];

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      handleComplete();
    }
  };

  const handleComplete = () => {
    // Save to Supabase profile (UI only)
    console.log('Saving onboarding data:', formData);
    
    // Show instant aha moment
    setShowWorksheet(true);
  };

  const handleWorksheetComplete = () => {
    setShowWorksheet(false);
    if (onComplete) {
      onComplete();
    }
  };

  const handleOptionSelect = (category, value) => {
    setFormData(prev => ({ ...prev, [category]: value }));
    
    // Auto-advance for single selections
    if (category === 'ventureType' || category === 'stage') {
      setTimeout(handleNext, 500);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Rocket className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">Welcome to LaneAI</h2>
              <p className="text-muted-foreground">
                Let's set up your business cockpit in just a few steps
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={handleNext} className="px-8">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={onClose}>
                Skip for now
              </Button>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">What type of venture are you building?</h2>
              <p className="text-muted-foreground">This helps us customize your experience</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ventureTypes.map(type => (
                <Card 
                  key={type.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    formData.ventureType === type.id && "ring-2 ring-primary"
                  )}
                  onClick={() => handleOptionSelect('ventureType', type.id)}
                >
                  <CardHeader className="text-center">
                    <type.icon className="h-8 w-8 mx-auto text-primary mb-2" />
                    <CardTitle className="text-lg">{type.label}</CardTitle>
                    <CardDescription>{type.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">What stage are you at?</h2>
              <p className="text-muted-foreground">This helps us suggest the right tools</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stages.map(stage => (
                <Card 
                  key={stage.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    formData.stage === stage.id && "ring-2 ring-primary"
                  )}
                  onClick={() => handleOptionSelect('stage', stage.id)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{stage.label}</CardTitle>
                    <CardDescription>{stage.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Tell us about your founder DNA</h2>
              <p className="text-muted-foreground">4 quick taps to personalize your experience</p>
            </div>
            
            <div className="space-y-8">
              {Object.entries(founderDnaOptions).map(([category, options]) => (
                <div key={category}>
                  <h3 className="font-medium mb-3 capitalize">
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {options.map(option => (
                      <Card
                        key={option.id}
                        className={cn(
                          "cursor-pointer transition-all hover:shadow-md p-3",
                          formData[category] === option.id && "ring-2 ring-primary"
                        )}
                        onClick={() => handleOptionSelect(category, option.id)}
                      >
                        <CardContent className="p-0 text-center">
                          <option.icon className="h-6 w-6 mx-auto text-primary mb-2" />
                          <p className="font-medium text-sm">{option.label}</p>
                          <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                Back
              </Button>
              <Button 
                onClick={handleNext}
                disabled={!formData.decisionStyle || !formData.moneyStyle || !formData.growthStyle || !formData.riskAppetite}
              >
                Continue
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Choose your default mode</h2>
              <p className="text-muted-foreground">You can switch between modes anytime</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modes.map(mode => (
                <Card 
                  key={mode.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    (formData.defaultMode === mode.id || mode.isDefault && !formData.defaultMode) && "ring-2 ring-primary"
                  )}
                  onClick={() => handleOptionSelect('defaultMode', mode.id)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <mode.icon className="h-6 w-6 text-primary" />
                      <div>
                        <CardTitle className="text-lg">{mode.label}</CardTitle>
                        {mode.isDefault && (
                          <span className="text-xs text-primary font-medium">Recommended</span>
                        )}
                      </div>
                    </div>
                    <CardDescription>{mode.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                Back
              </Button>
              <Button onClick={handleNext}>
                Complete Setup
                <CheckCircle2 className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (showWorksheet) {
    return (
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Instant Aha: Your First Cashflow Analysis
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Let's start with something powerful - track your money in vs money out
            </p>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                <strong>Teaching Tip:</strong> Try entering some numbers in the inputs below. 
                Watch how the results update automatically. Click "Explain" on any field to learn more!
              </p>
            </div>
            
            <WorksheetRenderer 
              worksheetId="cashflow"
              ventureId={null}
              onSave={(data) => console.log('Worksheet saved:', data)}
            />
            
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={handleWorksheetComplete}>
                I'll explore more later
              </Button>
              <Button onClick={handleWorksheetComplete}>
                Take me to my dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <div className="space-y-4">
            <Progress value={progress} className="w-full" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep + 1} of {totalSteps}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-6">
          {renderStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Note: Now using proper Progress component from ui/progress.jsx

export default OnboardingFlow;