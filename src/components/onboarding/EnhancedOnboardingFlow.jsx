import React, { useState } from 'react';
import { 
  User, 
  Building2, 
  TrendingUp, 
  Brain, 
  Target, 
  DollarSign, 
  Users, 
  Zap,
  ArrowRight,
  CheckCircle,
  Lightbulb
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { cn } from '../../lib/utils';

const EnhancedOnboardingFlow = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    role: '',
    ventureType: '',
    stage: '',
    northStar: '',
    decisionStyle: '',
    moneyStyle: '',
    growthStyle: '',
    riskAppetite: '',
    defaultMode: 'copilot'
  });

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to LaneAI',
      subtitle: 'Your AI-first business cockpit',
      description: 'Let\'s set up your personalized business intelligence in just a few steps.'
    },
    {
      id: 'role',
      title: 'What\'s your role?',
      subtitle: 'This helps us tailor your experience',
      options: [
        { 
          id: 'founder', 
          label: 'Founder/Entrepreneur', 
          icon: Lightbulb, 
          description: 'Building or running a business' 
        },
        { 
          id: 'student', 
          label: 'Student/Academic', 
          icon: User, 
          description: 'Learning business or working on projects' 
        },
        { 
          id: 'freelancer', 
          label: 'Freelancer/Consultant', 
          icon: Users, 
          description: 'Independent professional services' 
        },
        { 
          id: 'employee', 
          label: 'Employee/Intrapreneur', 
          icon: Building2, 
          description: 'Working within an organization' 
        }
      ]
    },
    {
      id: 'venture',
      title: 'Tell us about your venture',
      subtitle: 'What type of business are you working on?',
      options: [
        { 
          id: 'tech_startup', 
          label: 'Tech Startup', 
          icon: Zap, 
          description: 'SaaS, app, or tech platform' 
        },
        { 
          id: 'service_business', 
          label: 'Service Business', 
          icon: Users, 
          description: 'Consulting, agency, or professional services' 
        },
        { 
          id: 'ecommerce', 
          label: 'E-commerce/Retail', 
          icon: DollarSign, 
          description: 'Online or physical product sales' 
        },
        { 
          id: 'local_business', 
          label: 'Local Business', 
          icon: Building2, 
          description: 'Restaurant, store, or local service' 
        },
        { 
          id: 'creative', 
          label: 'Creative/Content', 
          icon: Brain, 
          description: 'Design, media, or content creation' 
        },
        { 
          id: 'other', 
          label: 'Other/Multiple', 
          icon: Target, 
          description: 'Something else or exploring options' 
        }
      ]
    },
    {
      id: 'stage',
      title: 'What stage are you at?',
      subtitle: 'This helps us show relevant metrics',
      options: [
        { 
          id: 'idea', 
          label: 'Idea Stage', 
          icon: Lightbulb, 
          description: 'Validating concepts and planning' 
        },
        { 
          id: 'mvp', 
          label: 'MVP/Early', 
          icon: Zap, 
          description: 'Building or testing initial product' 
        },
        { 
          id: 'growth', 
          label: 'Growth Stage', 
          icon: TrendingUp, 
          description: 'Scaling operations and revenue' 
        },
        { 
          id: 'established', 
          label: 'Established', 
          icon: Building2, 
          description: 'Mature business with steady operations' 
        }
      ]
    },
    {
      id: 'northstar',
      title: 'What\'s your North Star goal?',
      subtitle: 'What are you working towards in the next 3-6 months?',
      isInput: true,
      placeholder: 'e.g., "Launch MVP and get 100 customers" or "Reach $10k monthly revenue"'
    },
    {
      id: 'dna',
      title: 'Founder DNA',
      subtitle: 'Help us understand your style (4 quick questions)',
      isMultiQuestion: true,
      questions: [
        {
          key: 'decisionStyle',
          question: 'How do you make decisions?',
          options: [
            { id: 'data_driven', label: 'Data-Driven', description: 'Numbers and analytics first' },
            { id: 'intuitive', label: 'Intuitive', description: 'Trust gut feelings and experience' },
            { id: 'collaborative', label: 'Collaborative', description: 'Team input and consensus' },
            { id: 'rapid_fire', label: 'Rapid Fire', description: 'Quick decisions, iterate fast' }
          ]
        },
        {
          key: 'moneyStyle',
          question: 'What\'s your money approach?',
          options: [
            { id: 'conservative', label: 'Conservative', description: 'Careful with spending and risk' },
            { id: 'aggressive', label: 'Aggressive', description: 'Big bets for big returns' },
            { id: 'balanced', label: 'Balanced', description: 'Measured risk and return' },
            { id: 'bootstrapper', label: 'Bootstrapper', description: 'Self-funded and lean' }
          ]
        },
        {
          key: 'growthStyle',
          question: 'How do you prefer to grow?',
          options: [
            { id: 'organic', label: 'Organic', description: 'Word of mouth and natural growth' },
            { id: 'viral', label: 'Viral', description: 'Product-led and viral loops' },
            { id: 'paid_growth', label: 'Paid Growth', description: 'Marketing and advertising' },
            { id: 'partnerships', label: 'Partnerships', description: 'Alliances and collaborations' }
          ]
        },
        {
          key: 'riskAppetite',
          question: 'What\'s your risk tolerance?',
          options: [
            { id: 'risk_averse', label: 'Risk Averse', description: 'Prefer safe, proven approaches' },
            { id: 'calculated', label: 'Calculated Risk', description: 'Measured risks with good upside' },
            { id: 'risk_taker', label: 'Risk Taker', description: 'Comfortable with uncertainty' },
            { id: 'all_in', label: 'All-In', description: 'Go big or go home mentality' }
          ]
        }
      ]
    },
    {
      id: 'complete',
      title: 'Setup Complete!',
      subtitle: 'Your personalized business cockpit is ready',
      description: 'We\'ve created your dashboard, KPIs, and starter worksheets based on your profile.'
    }
  ];

  const [dnaStep, setDnaStep] = useState(0);

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleOptionSelect = (optionId, fieldKey = null) => {
    const field = fieldKey || currentStepData.id;
    setFormData(prev => ({ ...prev, [field]: optionId }));
    
    if (currentStepData.isMultiQuestion) {
      if (dnaStep < currentStepData.questions.length - 1) {
        setDnaStep(dnaStep + 1);
      } else {
        handleNext();
      }
    } else {
      setTimeout(() => handleNext(), 300);
    }
  };

  const handleInputSubmit = (value) => {
    setFormData(prev => ({ ...prev, northStar: value }));
    setTimeout(() => handleNext(), 300);
  };

  const handleNext = () => {
    if (isLastStep) {
      const generatedKpis = generateKpis();
      onComplete({ ...formData, generatedKpis });
    } else {
      setCurrentStep(currentStep + 1);
      setDnaStep(0);
    }
  };

  const generateKpis = () => {
    const { role, ventureType, stage } = formData;
    const baseKpis = ['Runway', 'Monthly Cashflow', 'Obligations'];
    
    const roleKpis = {
      founder: ['Burn Rate', 'Revenue Growth', 'Customer Acquisition'],
      student: ['Project Progress', 'Learning Goals', 'Budget Tracking'],
      freelancer: ['Client Pipeline', 'Hourly Rate', 'Utilization'],
      employee: ['Goal Progress', 'Skills Development', 'Performance Metrics']
    };
    
    const stageKpis = {
      idea: ['Market Validation', 'MVP Progress'],
      mvp: ['User Adoption', 'Product-Market Fit'],
      growth: ['Customer Lifetime Value', 'Monthly Recurring Revenue'],
      established: ['Profit Margins', 'Market Share']
    };

    return [
      ...baseKpis,
      ...(roleKpis[role] || []),
      ...(stageKpis[stage] || [])
    ].slice(0, 6);
  };

  const renderStep = () => {
    switch (currentStepData.id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                LaneAI is your AI-first business cockpit. Instead of hunting through dashboards, 
                just tell our AI what you need and it builds everything for you.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-500 mb-2" />
                  <div className="font-medium">Auto-Generated Dashboards</div>
                  <div className="text-muted-foreground text-xs">Based on your business type</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-500 mb-2" />
                  <div className="font-medium">Smart Worksheets</div>
                  <div className="text-muted-foreground text-xs">Financial models that adapt</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-500 mb-2" />
                  <div className="font-medium">AI Co-Pilot</div>
                  <div className="text-muted-foreground text-xs">Always-on business assistant</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-500 mb-2" />
                  <div className="font-medium">Founder Mode</div>
                  <div className="text-muted-foreground text-xs">Strategic war room</div>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => onComplete({ skipped: true })} className="flex-1">
                Skip for Now
              </Button>
              <Button onClick={handleNext} className="flex-1">
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 'northstar':
        return (
          <NorthStarInput onSubmit={handleInputSubmit} />
        );

      case 'dna':
        const currentQuestion = currentStepData.questions[dnaStep];
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">
                Question {dnaStep + 1} of {currentStepData.questions.length}
              </div>
              <h3 className="text-lg font-medium">{currentQuestion.question}</h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options.map((option) => (
                <Card
                  key={option.id}
                  className="p-4 cursor-pointer hover:shadow-md transition-all duration-200 border-2 hover:border-primary/50"
                  onClick={() => handleOptionSelect(option.id, currentQuestion.key)}
                >
                  <div className="flex items-center gap-3">
                    <div className="font-medium">{option.label}</div>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {option.description}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Perfect! We've created your personalized business cockpit with:
              </p>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="font-medium text-green-800">✓ HQ Dashboard</div>
                  <div className="text-green-600 text-xs">With your key metrics and alerts</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="font-medium text-blue-800">✓ AI Co-Pilot</div>
                  <div className="text-blue-600 text-xs">Ready to help build anything you need</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="font-medium text-purple-800">✓ Starter Worksheets</div>
                  <div className="text-purple-600 text-xs">Financial models for your business type</div>
                </div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="font-medium text-sm mb-2">💡 Quick Start Tips:</div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Click "AI Co-Pilot" and say "I need help with [anything]"</li>
                  <li>• Check your HQ dashboard for key metrics</li>
                  <li>• Try Founder Mode for strategic planning</li>
                  <li>• Add real data to see your business come alive</li>
                </ul>
              </div>
            </div>
            <Button onClick={handleNext} className="w-full">
              Enter LaneAI
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        );

      default:
        if (currentStepData.options) {
          return (
            <div className="grid grid-cols-1 gap-4">
              {currentStepData.options.map((option) => {
                const Icon = option.icon;
                return (
                  <Card
                    key={option.id}
                    className="p-4 cursor-pointer hover:shadow-md transition-all duration-200 border-2 hover:border-primary/50"
                    onClick={() => handleOptionSelect(option.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          );
        }
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">{currentStepData.title}</h2>
          <p className="text-muted-foreground">{currentStepData.subtitle}</p>
          {currentStepData.description && (
            <p className="text-sm text-muted-foreground mt-2">{currentStepData.description}</p>
          )}
        </div>

        {renderStep()}
      </Card>
    </div>
  );
};

const NorthStarInput = ({ onSubmit }) => {
  const [value, setValue] = useState('');
  
  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value.trim());
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="e.g., 'Launch my MVP and get 100 customers' or 'Reach $10k monthly revenue' or 'Validate my business idea'"
        className="w-full h-24 p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      <Button 
        onClick={handleSubmit} 
        disabled={!value.trim()} 
        className="w-full"
      >
        Continue
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
};

export default EnhancedOnboardingFlow;