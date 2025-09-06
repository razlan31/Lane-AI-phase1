import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Rocket, 
  Brain, 
  BarChart3, 
  Users, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  Star,
  Clock,
  Target
} from 'lucide-react';

const EnhancedOnboardingWelcome = ({ onStart, onSkip }) => {
  const [showFeatures, setShowFeatures] = useState(false);

  const benefits = [
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description: "Get intelligent recommendations for your business decisions",
      time: "30 sec setup"
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Track key metrics and KPIs that matter to your venture",
      time: "Instant value"
    },
    {
      icon: Zap,
      title: "Smart Automation",
      description: "Automate calculations and reporting with our formula engine",
      time: "Save hours"
    },
    {
      icon: Target,
      title: "Goal Tracking",
      description: "Set and monitor progress toward your business objectives",
      time: "Stay focused"
    }
  ];

  const testimonials = [
    {
      text: "LaneAI helped me understand my startup's runway and make data-driven decisions.",
      author: "Sarah K., Tech Founder",
      rating: 5
    },
    {
      text: "The financial modeling features saved me weeks of spreadsheet work.",
      author: "Mike R., Consultant", 
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center mb-4">
            <Rocket className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Welcome to LaneAI
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Your AI-powered business cockpit for smarter decisions
          </CardDescription>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              4.9/5 rating
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              10K+ users
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              2 min setup
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Quick Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="flex items-start space-x-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground">{benefit.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{benefit.description}</p>
                    <Badge variant="outline" className="mt-2 text-xs">
                      {benefit.time}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Social Proof */}
          {showFeatures && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-semibold text-center text-muted-foreground">
                Trusted by entrepreneurs worldwide
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="p-4 bg-muted/20 rounded-lg border">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">"{testimonial.text}"</p>
                    <p className="text-xs font-medium">— {testimonial.author}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Setup Progress</span>
              <span className="text-muted-foreground">0%</span>
            </div>
            <Progress value={0} className="h-2" />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              size="lg" 
              className="flex-1 h-12 text-base font-semibold group"
              onClick={onStart}
            >
              Get Started in 2 Minutes
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="lg"
                className="flex-1 sm:flex-none"
                onClick={() => setShowFeatures(!showFeatures)}
              >
                {showFeatures ? 'Hide' : 'Learn More'}
              </Button>
              <Button 
                variant="ghost" 
                size="lg"
                className="flex-1 sm:flex-none text-muted-foreground"
                onClick={onSkip}
              >
                Skip Setup
              </Button>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 text-green-500" />
              No credit card required
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Free to start
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Data encrypted
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedOnboardingWelcome;