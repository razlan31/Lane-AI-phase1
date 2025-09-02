import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Minimize2, Lightbulb, Zap, Search, FileText, Bell } from 'lucide-react';
import { toast } from 'sonner';

export const GlobalOrbFixed = ({ context = 'general', ventureId = null }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'suggestion',
      message: 'ROI calculation ready for review',
      priority: 'high',
      timestamp: new Date()
    },
    {
      id: 2,
      type: 'achievement',
      message: 'First worksheet completed!',
      priority: 'medium',
      timestamp: new Date()
    }
  ]);

  const [activeSuggestion] = useState({
    id: 'demo-suggestion',
    title: 'Smart Suggestion',
    description: 'Based on your recent activity, consider running the CAC Calculator to analyze your customer acquisition costs.',
    confidence: 0.92,
    actions: [
      { label: 'Run Tool', primary: true, action: 'run_tool' },
      { label: 'Maybe Later', primary: false, action: 'dismiss' }
    ]
  });

  useEffect(() => {
    // Hide orb in VentureHub
    const currentPath = window.location.pathname;
    const isInVentureHub = currentPath.includes('venture-') || 
                          window.location.hash.includes('venture-') ||
                          document.title.includes('Venture');
    
    setIsVisible(!isInVentureHub);
  }, []);

  const handleOrbClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleQuickAction = (action) => {
    console.log('Quick action:', action);
    toast.info(`Opening ${action}...`);
    setIsExpanded(false);
  };

  const handleSuggestionAction = (action) => {
    if (action.action === 'run_tool') {
      toast.success('Opening CAC Calculator...');
    } else {
      toast.info('Suggestion dismissed');
    }
    setIsExpanded(false);
  };

  const priorityColors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {/* Expanded Panel */}
      {isExpanded && (
        <Card className="mb-4 w-80 shadow-xl border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                AI Assistant
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="h-8 w-8 p-0"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* AI Suggestion */}
            {activeSuggestion && (
              <div className="border border-primary/20 rounded-lg p-3 bg-primary/5">
                <div className="flex items-start gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-primary mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{activeSuggestion.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {activeSuggestion.description}
                    </div>
                    <div className="text-xs text-primary mt-1">
                      Confidence: {Math.round(activeSuggestion.confidence * 100)}%
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  {activeSuggestion.actions.map((action, index) => (
                    <Button
                      key={index}
                      variant={action.primary ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSuggestionAction(action)}
                      className="text-xs h-7"
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div>
              <div className="text-sm font-medium mb-2">Quick Actions</div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('Commands')}
                  className="h-8 text-xs"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Commands
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('Search')}
                  className="h-8 text-xs"
                >
                  <Search className="h-3 w-3 mr-1" />
                  Search
                </Button>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <div className="text-sm font-medium mb-2">Recent Activity</div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-start gap-2 text-xs">
                    <Bell className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{notification.message}</div>
                      <div className="text-muted-foreground">
                        {notification.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs px-1 py-0 ${priorityColors[notification.priority] || ''}`}
                    >
                      {notification.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Orb */}
      <Button
        onClick={handleOrbClick}
        className={`h-14 w-14 rounded-full shadow-lg transition-all duration-200 ${
          isExpanded 
            ? 'bg-primary/90 scale-110' 
            : 'bg-primary hover:bg-primary/90 hover:scale-105'
        }`}
        style={{
          background: isExpanded 
            ? 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)/0.8))'
            : undefined
        }}
      >
        <Bot className="h-6 w-6" />
        
        {/* Notification Badge */}
        {!isExpanded && notifications.length > 0 && (
          <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
            {notifications.length}
          </Badge>
        )}
        
        {/* Suggestion Pulse */}
        {!isExpanded && activeSuggestion && (
          <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-pulse" />
        )}
      </Button>
    </div>
  );
};