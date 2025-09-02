import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { User, Building2, TrendingUp, Target, Brain, DollarSign, Zap, Shield } from 'lucide-react';

const OnboardingSteps = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    role: '',
    ventureType: '',
    stage: '',
    northStar: '',
    decisionStyle: '',
    moneyStyle: '',
    growthStyle: '',
    riskAppetite: ''
  });

  const steps = [
    {
      id: 'role',
      title: 'Which best describes you?',
      description: 'This helps us show the most relevant metrics',
      options: [
        { value: 'student', label: 'Student', icon: User },
        { value: 'freelancer', label: 'Freelancer', icon: User },
        { value: 'entrepreneur', label: 'Entrepreneur', icon: TrendingUp },
        { value: 'business_owner', label: 'Business Owner', icon: Building2 },
        { value: 'dropshipper', label: 'Dropshipper', icon: Target },
        { value: 'other', label: 'Other', icon: User }
      ]
    },
    {
      id: 'ventureType',
      title: 'What type of venture?',
      description: 'Tell us about your main focus',
      options: [
        { value: 'small_business', label: 'Small Business', icon: Building2 },
        { value: 'startup', label: 'Startup', icon: TrendingUp },
        { value: 'side_project', label: 'Side Project', icon: Target }
      ]
    },
    {
      id: 'stage',
      title: 'What stage are you in?',
      description: 'This helps us prioritize the right metrics',
      options: [
        { value: 'idea', label: 'Idea Stage', icon: Brain },
        { value: 'growing', label: 'Growing', icon: TrendingUp },
        { value: 'scaling', label: 'Scaling', icon: Zap }
      ]
    },
    {
      id: 'dna',
      title: 'Founder DNA (4 quick questions)',
      description: 'Help us understand your style',
      isMultiQuestion: true
    }
  ];

  const dnaQuestions = [
    {
      key: 'decisionStyle',
      question: 'Decision Style',
      options: [
        { value: 'fast', label: 'Fast & Intuitive', icon: Zap },
        { value: 'careful', label: 'Careful & Analytical', icon: Brain }
      ]
    },
    {
      key: 'moneyStyle',
      question: 'Money Style',
      options: [
        { value: 'saver', label: 'Careful Saver', icon: Shield },
        { value: 'spender', label: 'Strategic Spender', icon: DollarSign }
      ]
    },
    {
      key: 'growthStyle',
      question: 'Growth Style',
      options: [
        { value: 'steady', label: 'Steady & Sustainable', icon: TrendingUp },
        { value: 'aggressive', label: 'Fast & Aggressive', icon: Zap }
      ]
    },
    {
      key: 'riskAppetite',
      question: 'Risk Appetite',
      options: [
        { value: 'low', label: 'Risk Averse', icon: Shield },
        { value: 'high', label: 'Risk Taker', icon: Target }
      ]
    }
  ];

  const [dnaStep, setDnaStep] = useState(0);

  const handleOptionSelect = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (steps[currentStep].isMultiQuestion) {
      if (dnaStep < dnaQuestions.length - 1) {
        setDnaStep(dnaStep + 1);
      } else {
        // DNA questions complete
        handleNext();
      }
    } else {
      // Single question step
      setTimeout(() => handleNext(), 200);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setDnaStep(0);
    } else {
      // Generate KPIs based on role and complete onboarding
      const generatedKpis = generateKpis(formData.role);
      onComplete({ ...formData, generatedKpis });
    }
  };

  const generateKpis = (role) => {
    const kpiMap = {
      student: ['Budget Remaining', 'Monthly Expenses', 'Savings Goal'],
      freelancer: ['Monthly Revenue', 'Active Projects', 'Cash Balance'],
      entrepreneur: ['Runway', 'Cashflow', 'Growth Rate', 'Obligations'],
      business_owner: ['Revenue', 'Profit Margin', 'Customer Count', 'Expenses'],
      dropshipper: ['Sales', 'Orders', 'Profit Margin', 'Inventory Turnover'],
      other: ['Runway', 'Cashflow', 'Obligations']
    };
    
    return kpiMap[role] || kpiMap.other;
  };

  const renderStep = () => {
    const step = steps[currentStep];
    
    if (step.isMultiQuestion) {
      const question = dnaQuestions[dnaStep];
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">{question.question}</h3>
            <p className="text-sm text-muted-foreground">Question {dnaStep + 1} of 4</p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {question.options.map((option) => {
              const Icon = option.icon;
              return (
                <Card 
                  key={option.value}
                  className="cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                  onClick={() => handleOptionSelect(question.key, option.value)}
                >
                  <CardContent className="flex items-center p-4">
                    <Icon className="h-5 w-5 mr-3 text-primary" />
                    <span className="font-medium">{option.label}</span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-3">
          {step.options.map((option) => {
            const Icon = option.icon;
            return (
              <Card 
                key={option.value}
                className="cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                onClick={() => handleOptionSelect(step.id, option.value)}
              >
                <CardContent className="flex items-center p-4">
                  <Icon className="h-5 w-5 mr-3 text-primary" />
                  <span className="font-medium">{option.label}</span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const progress = ((currentStep + (steps[currentStep]?.isMultiQuestion ? (dnaStep + 1) / 4 : 1)) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </div>
            <div className="text-sm text-muted-foreground">
              {Math.round(progress)}%
            </div>
          </div>
          <Progress value={progress} className="mb-4" />
          <CardTitle className="text-xl">{steps[currentStep].title}</CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderStep()}
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingSteps;