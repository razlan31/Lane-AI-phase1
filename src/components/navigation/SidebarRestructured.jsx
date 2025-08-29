import React, { useState } from 'react';
import { 
  Home,
  Plus,
  Building2,
  Activity,
  User,
  Wrench,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

const SidebarRestructured = ({ 
  currentView, 
  onViewChange, 
  ventures = [],
  isCollapsed, 
  onToggleCollapse,
  onBuildClick,
  className 
}) => {
  // Main navigation items in correct order per spec
  const navigationItems = [
    { 
      id: 'hq', 
      label: 'HQ', 
      icon: Home, 
      description: 'Mission Control - Your business command center' 
    },
    { 
      id: 'build', 
      label: 'Build', 
      icon: Plus, 
      description: 'Create new ventures and worksheets',
      isAction: true // Special handling for build modal
    }
  ];

  const workspaceItems = ventures.map(venture => ({
    id: `venture-${venture.id}`,
    label: venture.name,
    icon: Building2,
    description: venture.description || `Venture workspace for ${venture.name}`
  }));

  const utilityItems = [
    { 
      id: 'stream', 
      label: 'Stream', 
      icon: Activity, 
      description: 'Timeline feed of insights and opportunities' 
    },
    { 
      id: 'personal', 
      label: 'Personal', 
      icon: User, 
      description: 'Your personal dashboard and life metrics' 
    },
    { 
      id: 'tools', 
      label: 'Tools & Scratchpads', 
      icon: Wrench, 
      description: 'Custom worksheets and experimental tools' 
    },
    { 
      id: 'reports', 
      label: 'Reports', 
      icon: FileText, 
      description: 'Global reports and analytics' 
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings, 
      description: 'Profile, preferences, and billing' 
    }
  ];

  const handleItemClick = (item) => {
    if (item.isAction && item.id === 'build') {
      onBuildClick();
    } else {
      onViewChange(item.id);
    }
  };

  const renderNavSection = (items, title, showTitle = true) => (
    <div className="space-y-1">
      {!isCollapsed && showTitle && (
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">
          {title}
        </h3>
      )}
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        
        return (
          <Button
            key={item.id}
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start",
              isCollapsed && "px-2",
              item.isAction && "text-primary hover:text-primary border-primary/20"
            )}
            onClick={() => handleItemClick(item)}
            title={isCollapsed ? `${item.label}: ${item.description}` : undefined}
          >
            <Icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
            {!isCollapsed && item.label}
          </Button>
        );
      })}
    </div>
  );

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

      <div className="flex-1 p-2 space-y-6 overflow-y-auto">
        {/* Main Navigation - HQ + Build */}
        {renderNavSection(navigationItems, "Navigation", false)}

        {/* Workspaces */}
        {workspaceItems.length > 0 && (
          <>
            <div className="border-t border-border my-4" />
            {renderNavSection(workspaceItems, "Workspaces")}
          </>
        )}

        {/* No Workspaces State */}
        {workspaceItems.length === 0 && !isCollapsed && (
          <div className="px-2 py-4 text-center border-t border-border">
            <p className="text-sm text-muted-foreground mb-2">No workspaces yet</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onBuildClick}
              className="text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Create First
            </Button>
          </div>
        )}

        {/* Utility Items */}
        <div className="border-t border-border my-4" />
        {renderNavSection(utilityItems, "Tools", false)}
      </div>
    </aside>
  );
};

export default SidebarRestructured;