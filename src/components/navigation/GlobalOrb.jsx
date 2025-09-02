import React, { useState, useEffect } from 'react';
import { Bot, Zap, Search, Command, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCopilotManager } from '@/hooks/useCopilotManager';
import AICopilot from '@/components/copilot/AICopilot';

export const GlobalOrb = ({ context, ventureId }) => {
  console.log('GlobalOrb: Starting component, React:', typeof useState);
  const [isExpanded, setIsExpanded] = useState(false);
  const [notifications, setNotifications] = useState([]);
  // Temporarily disable custom hook
  const activeSuggestion = null;

  // Mock notifications for demo
  useEffect(() => {
    setNotifications([
      { id: 1, type: 'suggestion', message: 'ROI Calculator ready for your pricing strategy', priority: 'high' },
      { id: 2, type: 'insight', message: '3 blocks ready to combine into worksheet', priority: 'medium' },
      { id: 3, type: 'update', message: 'Cash flow model updated', priority: 'low' }
    ]);
  }, []);

  const handleOrbClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleQuickAction = (action) => {
    console.log('Quick action:', action);
    setIsExpanded(false);
  };

  const priorityColors = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200', 
    low: 'bg-blue-100 text-blue-700 border-blue-200'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Expanded Panel */}
      {isExpanded && (
        <Card className="absolute bottom-16 right-0 w-80 p-4 shadow-xl border">
          <div className="space-y-4">
            {/* AI Suggestion */}
            {activeSuggestion && (
              <div className="space-y-2">
                <h3 className="font-medium flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  AI Suggestion
                </h3>
                <AICopilot
                  suggestion={activeSuggestion}
                  layout="card"
                  onSuggestionAction={(action) => {
                    console.log('AI suggestion action:', action);
                    setIsExpanded(false);
                  }}
                />
              </div>
            )}

            {/* Quick Actions */}
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleQuickAction('command-palette')}
                  className="justify-start"
                >
                  <Command className="h-3 w-3 mr-2" />
                  Commands
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleQuickAction('search')}
                  className="justify-start"
                >
                  <Search className="h-3 w-3 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            {/* Notifications */}
            <div className="space-y-2">
              <h3 className="font-medium">Recent Activity</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-2 rounded-lg border text-xs ${priorityColors[notification.priority]}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex-1">{notification.message}</span>
                      <Badge variant="outline" className="text-xs ml-2">
                        {notification.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Close Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsExpanded(false)}
              className="w-full"
            >
              <ChevronUp className="h-4 w-4 mr-2" />
              Collapse
            </Button>
          </div>
        </Card>
      )}

      {/* Main Orb */}
      <Button
        onClick={handleOrbClick}
        className={`
          h-14 w-14 rounded-full shadow-lg transition-all duration-300 
          ${isExpanded ? 'scale-110' : 'hover:scale-105'}
          bg-gradient-to-br from-primary to-primary/80
          hover:from-primary/90 hover:to-primary/70
        `}
        size="icon"
      >
        <div className="relative">
          <Bot className="h-6 w-6 text-white" />
          
          {/* Notification Badge */}
          {notifications.length > 0 && !isExpanded && (
            <div className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">
                {notifications.length}
              </span>
            </div>
          )}
          
          {/* Active Suggestion Pulse */}
          {activeSuggestion && !isExpanded && (
            <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping"></div>
          )}
        </div>
      </Button>
    </div>
  );
};

export default GlobalOrb;