import { useState } from 'react';
import { 
  Bot,
  Home,
  Building2,
  Activity,
  User,
  Wrench,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Gamepad2,
  Upload,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { PersonalPage } from '../../pages/PersonalPage';

const MainNavigation = ({ 
  currentView, 
  onViewChange, 
  ventures = [],
  isCollapsed, 
  onToggleCollapse,
  onAddVenture,
  className 
}) => {
  const [personalExpanded, setPersonalExpanded] = useState(false);
  // Primary navigation items in correct order per spec
  const primaryItems = [
    { 
      id: 'copilot', 
      label: 'AI Co-Pilot', 
      icon: Bot, 
      description: 'Your AI assistant for building business tools',
      isPrimary: true
    },
    { 
      id: 'hq', 
      label: 'HQ', 
      icon: Home, 
      description: 'Mission Control - Your business command center',
      isPrimary: true
    }
  ];

  const ventureItems = ventures.map(venture => ({
    id: `venture-${venture.id}`,
    label: venture.name,
    icon: Building2,
    description: venture.description || `Venture workspace for ${venture.name}`,
    isVenture: true
  }));

  const otherItems = [
    { 
      id: 'playground', 
      label: 'Playground', 
      icon: Gamepad2, 
      description: 'Experimental canvas for testing ideas' 
    },
    { 
      id: 'scratchpads', 
      label: 'Scratchpads & Tools', 
      icon: Wrench, 
      description: 'Custom worksheets and experimental tools' 
    },
    { 
      id: 'reports', 
      label: 'Reports', 
      icon: FileText, 
      description: 'Global reports and analytics' 
    },
  ];

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
              item.isPrimary && "font-medium",
              item.id === 'copilot' && "text-primary hover:text-primary border-l-2 border-l-primary/30"
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
  );

  const renderAddVentureButton = () => (
    <Button
      variant="outline"
      className="w-full justify-start border-dashed"
      onClick={onAddVenture || (() => console.log('Add venture'))}
    >
      <Plus className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
      {!isCollapsed && "Add Venture"}
    </Button>
  );

  return (
    <>
      {/* Mobile backdrop - only show when sidebar is open on mobile */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden" 
          onClick={onToggleCollapse}
          aria-hidden="true"
        />
      )}
      
      <aside className={cn(
        "flex flex-col border-r border-border bg-card/50 transition-all duration-300",
        "fixed md:relative z-30 md:z-auto h-full",
        isCollapsed 
          ? "-translate-x-full md:translate-x-0 w-16" 
          : "translate-x-0 w-80 md:w-64",
        className
      )}>
        {/* Mobile Close Button */}
        <div className="flex justify-between items-center p-2 md:justify-end">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onToggleCollapse}
            className="md:hidden"
          >
            Close
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onToggleCollapse}
            className="hidden md:block"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex-1 p-2 space-y-6 overflow-y-auto">
          {/* Primary Navigation - AI Co-Pilot first, then HQ */}
          {renderNavSection(primaryItems, "Navigation", false)}

          {/* Venture Workspaces */}
          {(ventureItems.length > 0 || !isCollapsed) && (
            <>
              <div className="border-t border-border my-4" />
              {!isCollapsed && (
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">
                  Venture Workspaces
                </h3>
              )}
              
              {ventureItems.length > 0 && (
                <div className="space-y-1">
                  {ventureItems.map((item) => {
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
                  })}
                </div>
              )}
              
              {!isCollapsed && (
                <div className="mt-2">
                  {renderAddVentureButton()}
                </div>
              )}
            </>
          )}

          {/* Other Section */}
          <div className="border-t border-border my-4" />
          {renderNavSection(otherItems, "Other")}
        </div>
      </aside>
    </>
  );
};

export default MainNavigation;
