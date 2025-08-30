import React, { useState } from 'react';
import { 
  Home,
  Building2,
  MessageSquare,
  Activity,
  Wrench,
  FileText,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  Palette,
  StickyNote
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';

const MainSidebar = ({ 
  currentView, 
  onViewChange, 
  ventures = [],
  isCollapsed, 
  onToggleCollapse,
  className 
}) => {
  const navigationItems = [
    { 
      id: 'hq', 
      label: 'HQ Dashboard', 
      icon: Home, 
      description: 'Mission Control - Your business command center' 
    },
    { 
      id: 'workspace', 
      label: 'Workspace', 
      icon: Building2, 
      description: 'Multi-venture management hub',
      showVentures: true
    },
    { 
      id: 'chat-build', 
      label: 'Chat Build', 
      icon: MessageSquare, 
      description: 'AI-guided dashboard and worksheet builder'
    },
    { 
      id: 'stream', 
      label: 'Stream', 
      icon: Activity, 
      description: 'Timeline of insights, risks, and opportunities' 
    }
  ];

  const utilityItems = [
    { 
      id: 'playground', 
      label: 'Playground', 
      icon: Palette, 
      description: 'Freeform canvas for building dashboards' 
    },
    { 
      id: 'scratchpads', 
      label: 'Scratchpads', 
      icon: StickyNote, 
      description: 'Notes, calculators, scenario planning' 
    },
    { 
      id: 'reports', 
      label: 'Reports', 
      icon: FileText, 
      description: 'Global reports and analytics' 
    },
    { 
      id: 'personal', 
      label: 'Personal', 
      icon: User, 
      description: 'Personal dashboard and life metrics' 
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings, 
      description: 'Profile, preferences, and billing' 
    }
  ];

  const renderNavItem = (item) => {
    const Icon = item.icon;
    const isActive = currentView === item.id;
    
    return (
      <Button
        key={item.id}
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start",
          isCollapsed && "px-2"
        )}
        onClick={() => onViewChange(item.id)}
        title={isCollapsed ? `${item.label}: ${item.description}` : undefined}
      >
        <Icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
        {!isCollapsed && item.label}
      </Button>
    );
  };

  const renderVenturePreview = (venture) => {
    if (isCollapsed) return null;
    
    return (
      <Card key={venture.id} className="mb-2">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-sm">{venture.name}</h4>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onViewChange(`venture-${venture.id}`)}
            >
              Open
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="font-medium text-green-600">${venture.revenue || 0}</div>
              <div className="text-muted-foreground">Revenue</div>
            </div>
            <div className="text-center">
              <div className={cn(
                "font-medium",
                (venture.cashflow || 0) >= 0 ? "text-green-600" : "text-red-600"
              )}>
                ${venture.cashflow || 0}
              </div>
              <div className="text-muted-foreground">Cashflow</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-blue-600">{venture.runway || 0}m</div>
              <div className="text-muted-foreground">Runway</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <aside className={cn(
      "flex flex-col border-r border-border bg-card/50 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Collapse Toggle */}
      <div className="flex justify-end p-2">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onToggleCollapse}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex-1 p-2 space-y-4 overflow-y-auto">
        {/* Main Navigation */}
        <div className="space-y-1">
          {navigationItems.map((item) => {
            if (item.showVentures) {
              return (
                <div key={item.id}>
                  {renderNavItem(item)}
                  {currentView === 'workspace' && !isCollapsed && (
                    <div className="ml-4 mt-2 space-y-2">
                      {ventures.length > 0 ? (
                        ventures.map(renderVenturePreview)
                      ) : (
                        <div className="text-sm text-muted-foreground text-center py-4">
                          No ventures yet. Create your first workspace!
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }
            return renderNavItem(item);
          })}
        </div>

        {/* Separator */}
        <div className="border-t border-border" />

        {/* Utility Items */}
        <div className="space-y-1">
          {utilityItems.map(renderNavItem)}
        </div>
      </div>
    </aside>
  );
};

export default MainSidebar;