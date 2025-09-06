import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ConversationalOnboarding from './ConversationalOnboarding';
import OnboardingSteps from './OnboardingSteps';
import { MessageCircle, Clipboard } from 'lucide-react';

const OnboardingFlow = ({ onComplete }) => {
  const [onboardingMode, setOnboardingMode] = useState(null);

  if (!onboardingMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to Lane AI</h1>
          <p className="text-muted-foreground mb-6">
            How would you like to get started?
          </p>
          
          <div className="space-y-4">
            <Button
              onClick={() => setOnboardingMode('conversational')}
              className="w-full flex items-center gap-3"
              size="lg"
            >
              <MessageCircle className="h-5 w-5" />
              Chat with AI (Recommended)
            </Button>
            
            <Button
              onClick={() => setOnboardingMode('traditional')}
              variant="outline"
              className="w-full flex items-center gap-3"
              size="lg"
            >
              <Clipboard className="h-5 w-5" />
              Traditional Setup
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mt-4">
            The AI chat setup is faster and more personalized
          </p>
        </Card>
      </div>
    );
  }

  if (onboardingMode === 'conversational') {
    return <ConversationalOnboarding onComplete={onComplete} />;
  }

  return <OnboardingSteps onComplete={onComplete} />;
};

export default OnboardingFlow;