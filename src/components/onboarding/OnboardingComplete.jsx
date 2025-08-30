import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { CheckCircle, TrendingUp, DollarSign, Clock } from 'lucide-react';

const OnboardingComplete = ({ profileData, onContinue }) => {
  const { role, generatedKpis } = profileData;

  const getWelcomeMessage = (role) => {
    const messages = {
      student: "Your personal finance dashboard is ready!",
      freelancer: "Your freelance business cockpit is ready!",
      entrepreneur: "Your startup command center is ready!",
      business_owner: "Your business intelligence dashboard is ready!",
      dropshipper: "Your e-commerce dashboard is ready!",
      other: "Your business dashboard is ready!"
    };
    return messages[role] || messages.other;
  };

  const getKpiIcon = (kpi) => {
    if (kpi.toLowerCase().includes('revenue') || kpi.toLowerCase().includes('sales')) return DollarSign;
    if (kpi.toLowerCase().includes('runway') || kpi.toLowerCase().includes('time')) return Clock;
    return TrendingUp;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold">All Set!</CardTitle>
          <CardDescription className="text-lg">
            {getWelcomeMessage(role)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Your personalized KPIs:</h3>
            <div className="grid grid-cols-1 gap-2">
              {generatedKpis.map((kpi, index) => {
                const Icon = getKpiIcon(kpi);
                return (
                  <div key={index} className="flex items-center p-2 bg-muted rounded-lg">
                    <Icon className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm font-medium">{kpi}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            You can customize these anytime in Settings → Profile
          </div>

          <Button 
            onClick={onContinue}
            className="w-full"
            size="lg"
          >
            Enter Mission Control
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingComplete;