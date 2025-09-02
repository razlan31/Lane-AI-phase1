// No React import needed
import { MessageCircle, Upload, Gamepad2, Target } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

const HQEmptyState = ({ onStartChat, onImportCSV, onOpenPlayground }) => {
  const buildPaths = [
    {
      id: 'chat',
      title: 'Start with Chat',
      description: 'Chat-guided workspace builder',
      icon: MessageCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      action: onStartChat,
      primary: true
    },
    {
      id: 'import',
      title: 'Import CSV / Use Template',
      description: 'Upload data or choose from templates',
      icon: Upload,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      action: onImportCSV
    },
    {
      id: 'playground',
      title: 'Open Playground',
      description: 'Blank canvas for custom building',
      icon: Gamepad2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      action: onOpenPlayground
    }
  ];

  return (
    <div className="max-w-4xl mx-auto text-center space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Target className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Ready to build your first workspace?</h2>
          <p className="text-muted-foreground mt-2">
            Choose how you'd like to get started
          </p>
        </div>
      </div>

      {/* Build path options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {buildPaths.map((path) => {
          const Icon = path.icon;
          return (
            <Card
              key={path.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                path.primary ? 'ring-2 ring-primary/20' : ''
              }`}
              onClick={path.action}
            >
              <CardHeader className="text-center pb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${path.bgColor}`}>
                  <Icon className={`h-6 w-6 ${path.color}`} />
                </div>
                <CardTitle className="text-lg">{path.title}</CardTitle>
                <CardDescription className="text-sm">{path.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  className="w-full" 
                  variant={path.primary ? "default" : "outline"}
                  onClick={(e) => {
                    e.stopPropagation();
                    path.action();
                  }}
                >
                  {path.primary ? 'Get Started' : 'Choose'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Learn more link */}
      <div className="pt-4">
        <Button variant="ghost" className="text-sm">
          Learn about LaneAI features →
        </Button>
      </div>
    </div>
  );
};

export default HQEmptyState;