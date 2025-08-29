import React, { useState } from 'react';
import { 
  Target, 
  Briefcase, 
  Activity, 
  Gamepad2, 
  Home, 
  Building2, 
  User, 
  Wrench, 
  FileText, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

const Sidebar = ({ 
  currentMode, 
  onModeChange, 
  currentView, 
  onViewChange,
  ventures = [],
  isCollapsed, 
  onToggleCollapse,
  className 
}) => {
  const modes = [
    { id: 'goal', label: 'Goal', icon: Target, description: 'What\'s your main goal?' },
    { id: 'workspace', label: 'Workspace', icon: Briefcase, description: 'Structured by venture' },
    { id: 'stream', label: 'Stream', icon: Activity, description: 'Timeline feed' },
    { id: 'playground', label: 'Playground', icon: Gamepad2, description: 'Freeform canvas' }
  ];

  const navigationItems = [
    { id: 'hq', label: 'HQ', icon: Home, description: 'Mission Control' },
    { id: 'personal', label: 'Personal', icon: User, description: 'Your life dashboard' },
    { id: 'tools', label: 'Tools & Scratchpads', icon: Wrench, description: 'Custom worksheets' },
    { id: 'reports', label: 'Reports', icon: FileText, description: 'Global reports' },
    { id: 'settings', label: 'Settings', icon: Settings, description: 'Profile & billing' }
  ];

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

      <div className="flex-1 p-2 space-y-6">
        {/* Modes Toggle */}
        <div className="space-y-2">
          {!isCollapsed && (
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2">
              Modes
            </h3>
          )}
          <div className="space-y-1">
            {modes.map((mode) => {
              const Icon = mode.icon;
              return (
                <Button
                  key={mode.id}
                  variant={currentMode === mode.id ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isCollapsed && "px-2"
                  )}
                  onClick={() => onModeChange(mode.id)}
                  title={isCollapsed ? `${mode.label}: ${mode.description}` : undefined}
                >
                  <Icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                  {!isCollapsed && mode.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="space-y-2">
          {!isCollapsed && (
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2">
              Navigation
            </h3>
          )}
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? "secondary" : "ghost"}
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
            })}
          </div>
        </div>

        {/* Ventures List */}
        {currentMode === 'workspace' && (
          <div className="space-y-2">
            {!isCollapsed && (
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Ventures
                </h3>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            )}
            <div className="space-y-1">
              {ventures.map((venture) => (
                <Button
                  key={venture.id}
                  variant={currentView === `venture-${venture.id}` ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isCollapsed && "px-2"
                  )}
                  onClick={() => onViewChange(`venture-${venture.id}`)}
                  title={isCollapsed ? venture.name : undefined}
                >
                  <Building2 className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                  {!isCollapsed && (
                    <span className="truncate">{venture.name}</span>
                  )}
                </Button>
              ))}
              {ventures.length === 0 && !isCollapsed && (
                <div className="px-2 py-4 text-center">
                  <p className="text-sm text-muted-foreground">No ventures yet</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Venture
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;