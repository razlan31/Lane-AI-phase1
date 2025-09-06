import { useState, useEffect } from 'react';
import { Bot, Zap, Search, Command, ChevronUp, Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCopilotManager } from '@/hooks/useCopilotManager';
import AICopilot from '@/components/copilot/AICopilot';
import { cn } from '@/lib/utils';
import { useIsMobile, SwipeHandler } from '@/components/ui/MobileOptimized';

export const GlobalOrb = ({ context, ventureId, className }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { activeSuggestion } = useCopilotManager();
  const isMobile = useIsMobile();

  // Auto-hide orb on mobile scroll
  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > lastScrollY;
      
      setIsVisible(!isScrollingDown || currentScrollY < 50);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isMobile]);

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
    high: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
    medium: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800', 
    low: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'
  };

  return (
    <div className={cn(
      "fixed z-50 transition-all duration-300",
      isMobile 
        ? `bottom-6 left-4 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}` 
        : "bottom-6 left-6",
      className
    )}>
      {/* Expanded Panel */}
      {isExpanded && (
        <SwipeHandler onSwipeDown={() => setIsExpanded(false)}>
          <Card className={cn(
            "absolute shadow-xl border bg-background/95 backdrop-blur-sm animate-slide-in-left",
            isMobile 
              ? "bottom-16 left-0 w-80 max-w-[calc(100vw-2rem)]" 
              : "bottom-16 left-0 w-80",
            "p-4"
          )}>
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="font-semibold flex items-center gap-2">
                  <Bot className="h-4 w-4 text-primary" />
                  AI Assistant
                </h2>
                {isMobile && (
                  <Button 
                    variant="ghost" 
                    size="icon-sm"
                    onClick={() => setIsExpanded(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* AI Suggestion */}
              {activeSuggestion && (
                <div className="space-y-2 animate-fade-in">
                  <h3 className="font-medium flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    Smart Suggestion
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
                  <Command className="h-4 w-4 text-blue-500" />
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleQuickAction('command-palette')}
                    className="justify-start hover-lift"
                  >
                    <Command className="h-3 w-3 mr-2" />
                    Commands
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleQuickAction('search')}
                    className="justify-start hover-lift"
                  >
                    <Search className="h-3 w-3 mr-2" />
                    Search
                  </Button>
                </div>
              </div>

              {/* Notifications */}
              <div className="space-y-2">
                <h3 className="font-medium flex items-center gap-2">
                  <Bell className="h-4 w-4 text-green-500" />
                  Recent Activity
                  {notifications.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {notifications.length}
                    </Badge>
                  )}
                </h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {notifications.map((notification, index) => (
                    <div 
                      key={notification.id}
                      className={cn(
                        "p-3 rounded-lg border text-xs transition-all duration-200 hover:shadow-sm animate-fade-in",
                        priorityColors[notification.priority]
                      )}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="flex-1 leading-relaxed">{notification.message}</span>
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {notification.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Close Button */}
              {!isMobile && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsExpanded(false)}
                  className="w-full"
                >
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Collapse
                </Button>
              )}
            </div>
          </Card>
        </SwipeHandler>
      )}

      {/* Main Orb */}
      <Button
        onClick={handleOrbClick}
        className={cn(
          "rounded-full shadow-lg transition-all duration-300 touch-manipulation relative overflow-hidden",
          isMobile ? "h-12 w-12" : "h-14 w-14",
          isExpanded ? 'scale-110 shadow-xl' : 'hover:scale-105',
          "bg-gradient-to-br from-primary via-primary to-primary/80",
          "hover:from-primary/90 hover:via-primary/85 hover:to-primary/70",
          "border-2 border-primary-foreground/20"
        )}
        size="icon"
      >
        {/* Background pulse for active suggestion */}
        {activeSuggestion && !isExpanded && (
          <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping"></div>
        )}
        
        <div className="relative z-10">
          <Bot className={cn(
            "text-primary-foreground transition-transform",
            isMobile ? "h-5 w-5" : "h-6 w-6",
            isExpanded && "rotate-12"
          )} />
          
          {/* Notification Badge */}
          {notifications.length > 0 && !isExpanded && (
            <div className="absolute -top-2 -right-2 h-5 w-5 bg-destructive rounded-full flex items-center justify-center animate-bounce-subtle">
              <span className="text-xs text-destructive-foreground font-bold">
                {notifications.length > 9 ? '9+' : notifications.length}
              </span>
            </div>
          )}
        </div>
      </Button>
    </div>
  );
};

export default GlobalOrb;