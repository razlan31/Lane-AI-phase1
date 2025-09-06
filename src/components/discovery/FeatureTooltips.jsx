import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Info, 
  Zap, 
  X, 
  ArrowRight,
  Sparkles,
  TrendingUp,
  Shield,
  Clock
} from 'lucide-react';

const FeatureTooltips = () => {
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [dismissedTooltips, setDismissedTooltips] = useState(new Set());
  const [showNewFeatureBadge, setShowNewFeatureBadge] = useState(false);

  const tooltips = [
    {
      id: 'ai-copilot',
      selector: '[data-feature="ai-chat"]',
      title: 'AI Copilot Available',
      content: 'Get instant help with calculations, explanations, and business insights.',
      type: 'feature',
      icon: Sparkles,
      action: 'Try AI Chat',
      persistent: false
    },
    {
      id: 'quick-dock',
      selector: '[data-feature="quick-dock"]',
      title: 'Quick Actions',
      content: 'Access your most-used tools instantly. Right-click to customize.',
      type: 'tip',
      icon: Zap,
      action: 'Customize Dock',
      persistent: false
    },
    {
      id: 'new-reports',
      selector: '[data-feature="reports"]',
      title: 'New: Advanced Reports',
      content: 'Generate professional reports with AI insights and export options.',
      type: 'new',
      icon: TrendingUp,
      action: 'Explore Reports',
      persistent: true
    },
    {
      id: 'autosave',
      selector: '[data-feature="workspace"]',
      title: 'Auto-save Active',
      content: 'Your work is automatically saved every 30 seconds.',
      type: 'info',
      icon: Shield,
      action: null,
      persistent: false
    },
    {
      id: 'keyboard-shortcuts',
      selector: '[data-feature="global-orb"]',
      title: 'Keyboard Shortcuts',
      content: 'Press Ctrl+K to open the command palette for faster navigation.',
      type: 'tip',
      icon: Clock,
      action: 'View All Shortcuts',
      persistent: false
    }
  ];

  useEffect(() => {
    // Load dismissed tooltips from localStorage
    const dismissed = JSON.parse(localStorage.getItem('laneai-dismissed-tooltips') || '[]');
    setDismissedTooltips(new Set(dismissed));

    // Check for new features
    const lastVisit = localStorage.getItem('laneai-last-visit');
    const now = Date.now();
    if (!lastVisit || now - parseInt(lastVisit) > 7 * 24 * 60 * 60 * 1000) { // 7 days
      setShowNewFeatureBadge(true);
    }
    localStorage.setItem('laneai-last-visit', now.toString());

    // Show tooltips based on user interaction patterns - only show once per session
    const sessionKey = `tooltip-session-${Date.now()}`;
    const currentSession = sessionStorage.getItem('laneai-tooltip-session');
    
    if (!currentSession) {
      sessionStorage.setItem('laneai-tooltip-session', sessionKey);
      
      const showTooltipTimer = setTimeout(() => {
        const eligibleTooltips = tooltips.filter(tooltip => 
          !dismissedTooltips.has(tooltip.id) &&
          document.querySelector(tooltip.selector)
        );

        if (eligibleTooltips.length > 0) {
          // Prioritize new features, then tips, then info
          const prioritized = eligibleTooltips.sort((a, b) => {
            const order = { new: 0, tip: 1, feature: 2, info: 3 };
            return order[a.type] - order[b.type];
          });
          
          setActiveTooltip(prioritized[0]);
        }
      }, 3000); // Show after 3 seconds

      return () => clearTimeout(showTooltipTimer);
    }
  }, []);

  const dismissTooltip = (tooltipId, persistent = false) => {
    if (!persistent) {
      const newDismissed = new Set([...dismissedTooltips, tooltipId]);
      setDismissedTooltips(newDismissed);
      localStorage.setItem('laneai-dismissed-tooltips', JSON.stringify([...newDismissed]));
    }
    setActiveTooltip(null);
  };

  const handleAction = (tooltip) => {
    // Dispatch custom events for actions
    if (tooltip.action) {
      window.dispatchEvent(new CustomEvent('featureTooltipAction', {
        detail: { action: tooltip.action, tooltipId: tooltip.id }
      }));
    }
    dismissTooltip(tooltip.id);
  };

  if (!activeTooltip) return null;

  const tooltip = activeTooltip;
  const targetElement = document.querySelector(tooltip.selector);
  
  if (!targetElement) return null;

  const rect = targetElement.getBoundingClientRect();
  
  // Calculate safe positioning to ensure tooltip is fully visible
  const tooltipWidth = 320;
  const tooltipHeight = 200; // estimated height
  const margin = 16;
  
  let left = rect.left;
  let top = rect.bottom + 8;
  
  // Adjust horizontal position if tooltip would go off-screen
  if (left + tooltipWidth > window.innerWidth - margin) {
    left = window.innerWidth - tooltipWidth - margin;
  }
  if (left < margin) {
    left = margin;
  }
  
  // Adjust vertical position if tooltip would go off-screen
  if (top + tooltipHeight > window.innerHeight - margin) {
    top = rect.top - tooltipHeight - 8; // Position above the element
  }
  
  const tooltipStyle = {
    position: 'fixed',
    top: Math.max(margin, top),
    left,
    zIndex: 1000,
    maxWidth: `${tooltipWidth}px`
  };

  const getTooltipColor = (type) => {
    switch (type) {
      case 'new': return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'feature': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'tip': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      default: return 'bg-gradient-to-r from-gray-500 to-slate-500';
    }
  };

  return (
    <>
      {/* New Feature Badge */}
      {showNewFeatureBadge && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <Badge 
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => {
              setShowNewFeatureBadge(false);
              // Show new features tooltip
              const newFeatureTooltip = tooltips.find(t => t.type === 'new');
              if (newFeatureTooltip) setActiveTooltip(newFeatureTooltip);
            }}
          >
            <Sparkles className="h-3 w-3 mr-1" />
            New Features!
          </Badge>
        </div>
      )}

      {/* Active Tooltip */}
      <div style={tooltipStyle} className="animate-scale-in">
        <Card className="w-full max-w-sm shadow-xl border-0 overflow-hidden bg-background">
          {/* Header with gradient */}
          <div className={`p-3 text-white ${getTooltipColor(tooltip.type)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <tooltip.icon className="h-4 w-4" />
                <span className="font-medium text-sm">{tooltip.title}</span>
                {tooltip.type === 'new' && (
                  <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                    NEW
                  </Badge>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
                onClick={() => dismissTooltip(tooltip.id, tooltip.persistent)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-4">
              {tooltip.content}
            </p>
            
            <div className="flex items-center justify-between">
              {tooltip.action ? (
                <Button 
                  size="sm" 
                  className="text-xs"
                  onClick={() => handleAction(tooltip)}
                >
                  {tooltip.action}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              ) : (
                <div />
              )}
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-muted-foreground"
                onClick={() => dismissTooltip(tooltip.id)}
              >
                Got it
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pointer arrow */}
        <div 
          className="absolute w-3 h-3 bg-background border-l border-t rotate-45 -top-1.5"
          style={{
            left: Math.max(24, Math.min(rect.left + rect.width / 2 - tooltipStyle.left, 296))
          }}
        />
      </div>
    </>
  );
};

export default FeatureTooltips;