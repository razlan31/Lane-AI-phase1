import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Lightbulb, 
  Target, 
  Zap,
  BarChart3,
  MessageSquare,
  Calculator,
  FileText,
  Settings
} from 'lucide-react';

const FeatureDiscovery = ({ isOpen, onClose, targetFeature = null }) => {
  const [currentTour, setCurrentTour] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const tours = [
    {
      id: 'quick-start',
      title: 'Quick Start Tour',
      description: 'Learn the basics in 60 seconds',
      steps: [
        {
          target: '[data-feature="global-orb"]',
          title: 'Global Command Center',
          content: 'Click the orb to access all features instantly. It\'s your AI copilot for navigation.',
          icon: Target,
          position: 'bottom'
        },
        {
          target: '[data-feature="quick-dock"]',
          title: 'Quick Actions Dock',
          content: 'Fast access to your most-used tools. Customize this to match your workflow.',
          icon: Zap,
          position: 'top'
        },
        {
          target: '[data-feature="workspace"]',
          title: 'Smart Workspace',
          content: 'Your main work area adapts to your needs. Create worksheets, analyze data, and make decisions.',
          icon: BarChart3,
          position: 'right'
        },
        {
          target: '[data-feature="ai-chat"]',
          title: 'AI Assistant',
          content: 'Get instant help, explanations, and recommendations from our AI copilot.',
          icon: MessageSquare,
          position: 'left'
        }
      ]
    },
    {
      id: 'advanced-features',
      title: 'Power User Features',
      description: 'Unlock advanced capabilities',
      steps: [
        {
          target: '[data-feature="calculator"]',
          title: 'Advanced Calculators',
          content: 'Access specialized business calculators for ROI, breakeven, unit economics, and more.',
          icon: Calculator,
          position: 'bottom'
        },
        {
          target: '[data-feature="reports"]',
          title: 'Intelligent Reports',
          content: 'Generate automated reports with AI insights and export to multiple formats.',
          icon: FileText,
          position: 'top'
        },
        {
          target: '[data-feature="settings"]',
          title: 'Personalization',
          content: 'Customize your experience with themes, shortcuts, and AI preferences.',
          icon: Settings,
          position: 'left'
        }
      ]
    }
  ];

  const currentSteps = tours[currentTour]?.steps || [];
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Focus on target feature if specified
      if (targetFeature) {
        const targetTour = tours.find(tour => 
          tour.steps.some(step => step.target.includes(targetFeature))
        );
        if (targetTour) {
          setCurrentTour(tours.indexOf(targetTour));
          const stepIndex = targetTour.steps.findIndex(step => 
            step.target.includes(targetFeature)
          );
          setCurrentStep(stepIndex >= 0 ? stepIndex : 0);
        }
      }
    } else {
      setIsVisible(false);
    }
  }, [isOpen, targetFeature]);

  const nextStep = () => {
    if (currentStep < currentSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const switchTour = (tourIndex) => {
    setCurrentTour(tourIndex);
    setCurrentStep(0);
  };

  if (!isVisible) return null;

  const step = currentSteps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 z-50 animate-fade-in" onClick={onClose} />
      
      {/* Tour Selection */}
      {!step && (
        <div className="fixed inset-0 flex items-center justify-center z-51">
          <Card className="w-full max-w-md mx-4 animate-scale-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Feature Discovery</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground mb-6">
                Choose a guided tour to discover LaneAI's features
              </p>
              
              <div className="space-y-3">
                {tours.map((tour, index) => (
                  <Card 
                    key={tour.id}
                    className="cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                    onClick={() => switchTour(index)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{tour.title}</h3>
                          <p className="text-sm text-muted-foreground">{tour.description}</p>
                        </div>
                        <Badge variant="secondary">
                          {tour.steps.length} steps
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tour Step */}
      {step && (
        <div className="fixed inset-0 z-51 pointer-events-none">
          {/* Highlight target element */}
          <div 
            className="absolute border-2 border-primary rounded-lg shadow-lg pointer-events-none animate-pulse"
            style={{
              // This would need to be calculated based on the target element's position
              // For now, showing as a placeholder
              top: '50%',
              left: '50%',
              width: '200px',
              height: '40px',
              transform: 'translate(-50%, -50%)'
            }}
          />
          
          {/* Step Card */}
          <div 
            className="absolute pointer-events-auto animate-scale-in"
            style={{
              // Position based on step.position
              top: step.position === 'top' ? '20%' : step.position === 'bottom' ? '70%' : '50%',
              left: step.position === 'left' ? '10%' : step.position === 'right' ? '70%' : '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <Card className="w-80 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <step.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.content}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {currentStep + 1} of {currentSteps.length}
                    </span>
                    <div className="flex gap-1">
                      {currentSteps.map((_, index) => (
                        <div
                          key={index}
                          className={`w-1.5 h-1.5 rounded-full ${
                            index === currentStep ? 'bg-primary' : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {currentStep > 0 && (
                      <Button variant="outline" size="sm" onClick={prevStep}>
                        <ArrowLeft className="h-3 w-3 mr-1" />
                        Back
                      </Button>
                    )}
                    <Button size="sm" onClick={nextStep}>
                      {currentStep === currentSteps.length - 1 ? 'Finish' : 'Next'}
                      {currentStep < currentSteps.length - 1 && (
                        <ArrowRight className="h-3 w-3 ml-1" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
};

export default FeatureDiscovery;