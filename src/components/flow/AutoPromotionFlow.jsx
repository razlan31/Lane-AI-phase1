import React, { useState, useEffect } from 'react';
import { ArrowRight, FileText, Calculator, Building, Rocket, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useCopilotManager } from '@/hooks/useCopilotManager';
import { AICopilot } from '@/components/copilot/AICopilot';

const flowSteps = [
  {
    id: 'scratchpad',
    title: 'Scratchpad',
    icon: FileText,
    description: 'Capture ideas and notes',
    color: 'blue'
  },
  {
    id: 'tools',
    title: 'Tools',
    icon: Calculator,
    description: 'Run calculations',
    color: 'green'
  },
  {
    id: 'blocks',
    title: 'Blocks',
    icon: Building,
    description: 'Structure components',
    color: 'purple'
  },
  {
    id: 'playground',
    title: 'Playground',
    icon: Building,
    description: 'Experiment and combine',
    color: 'orange'
  },
  {
    id: 'venture',
    title: 'Venture',
    icon: Rocket,
    description: 'Launch business',
    color: 'red'
  }
];

export const AutoPromotionFlow = ({ currentStep = 'scratchpad', onStepClick, showSuggestions = true }) => {
  const [completedSteps, setCompletedSteps] = useState(['scratchpad']);
  const [flowProgress, setFlowProgress] = useState(20);
  const { activeSuggestion, generateSuggestion } = useCopilotManager();

  useEffect(() => {
    const currentIndex = flowSteps.findIndex(step => step.id === currentStep);
    const progress = ((currentIndex + 1) / flowSteps.length) * 100;
    setFlowProgress(progress);
    
    const completed = flowSteps.slice(0, currentIndex + 1).map(step => step.id);
    setCompletedSteps(completed);
  }, [currentStep]);

  const handleStepClick = (stepId) => {
    onStepClick?.(stepId);
  };

  const handleSuggestionAction = (action) => {
    // Handle AI suggestion actions
    console.log('Auto-promotion suggestion action:', action);
  };

  const getStepStatus = (stepId) => {
    if (completedSteps.includes(stepId)) {
      return currentStep === stepId ? 'current' : 'completed';
    }
    return 'upcoming';
  };

  const renderStep = (step, index) => {
    const StepIcon = step.icon;
    const status = getStepStatus(step.id);
    const isLast = index === flowSteps.length - 1;

    return (
      <div key={step.id} className="flex items-center">
        <div className="flex flex-col items-center">
          <Card 
            className={`
              p-3 cursor-pointer transition-all hover:shadow-md
              ${status === 'current' ? `ring-2 ring-${step.color}-500 bg-${step.color}-50` : ''}
              ${status === 'completed' ? `bg-${step.color}-100` : ''}
              ${status === 'upcoming' ? 'bg-muted border-dashed' : ''}
            `}
            onClick={() => handleStepClick(step.id)}
          >
            <div className="flex flex-col items-center space-y-2">
              <div className={`
                relative p-2 rounded-full
                ${status === 'current' ? `bg-${step.color}-500 text-white` : ''}
                ${status === 'completed' ? `bg-${step.color}-600 text-white` : ''}
                ${status === 'upcoming' ? 'bg-muted-foreground/20 text-muted-foreground' : ''}
              `}>
                {status === 'completed' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <StepIcon className="h-4 w-4" />
                )}
              </div>
              
              <div className="text-center">
                <h3 className="font-medium text-sm">{step.title}</h3>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
              
              {status === 'current' && (
                <Badge variant="default" className="text-xs">
                  Active
                </Badge>
              )}
            </div>
          </Card>
        </div>
        
        {!isLast && (
          <div className="flex items-center mx-4">
            <ArrowRight className={`
              h-4 w-4 transition-colors
              ${status === 'completed' ? 'text-green-500' : 'text-muted-foreground'}
            `} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Auto-Promotion Flow</span>
          <span className="text-muted-foreground">{Math.round(flowProgress)}% Complete</span>
        </div>
        <Progress value={flowProgress} className="h-2" />
      </div>

      {/* Flow Steps */}
      <div className="flex items-center justify-center overflow-x-auto pb-4">
        {flowSteps.map(renderStep)}
      </div>

      {/* AI Suggestions */}
      {showSuggestions && activeSuggestion && activeSuggestion.context?.includes('flow') && (
        <Card className="p-4">
          <h3 className="font-medium mb-3">AI Flow Suggestion</h3>
          <AICopilot
            suggestion={activeSuggestion}
            layout="strip"
            onSuggestionAction={handleSuggestionAction}
          />
        </Card>
      )}

      {/* Flow Description */}
      <Card className="p-4 bg-muted/20">
        <h3 className="font-medium mb-2">How the Auto-Promotion Flow Works</h3>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>1. Scratchpad:</strong> Start with rough ideas and notes. AI detects patterns and suggests relevant tools.
          </p>
          <p>
            <strong>2. Tools:</strong> Run calculations and analysis. Results suggest relevant business blocks to structure.
          </p>
          <p>
            <strong>3. Blocks:</strong> Organize business components. Multiple blocks can be combined into worksheets.
          </p>
          <p>
            <strong>4. Playground:</strong> Experiment with block combinations and visualize your business model.
          </p>
          <p>
            <strong>5. Venture:</strong> Promote your structured model into a full venture workspace with tracking.
          </p>
        </div>
      </Card>
    </div>
  );
};