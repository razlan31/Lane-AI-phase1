import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

const OnboardingWelcome = ({ onGetStarted, onSkip }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to LaneAI</CardTitle>
          <CardDescription>
            Your business intelligence cockpit. Let's set up your personalized dashboard in 2 minutes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={onGetStarted}
            className="w-full"
            size="lg"
          >
            Get Started
          </Button>
          <Button 
            onClick={onSkip}
            variant="outline"
            className="w-full"
          >
            Skip for Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingWelcome;