import { useState } from 'react';
import { Button } from '../ui/button';
import { Plus, FileSpreadsheet, Upload, Building2, Crown, ChevronUp, ChevronDown, Activity, Play, MessageCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

const QuickDock = ({ 
  onAddWorksheet, 
  onAddDashboard, 
  onImportCsv, 
  onAddVenture, 
  onFounderMode,
  onAddData,
  onSignals, 
  onRunFlow,
  onExport,
  onChat,
  currentView,
  className 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Context-aware actions based on current view
  const getActions = () => {
    // HQ Dashboard actions
    if (currentView === 'hq') {
      return [
        {
          id: 'add-data',
          icon: Plus,
          label: '+Data',
          onClick: onAddData,
          tooltip: 'Add new data or worksheet'
        },
        {
          id: 'signals',
          icon: Activity,
          label: 'Signals',
          onClick: onSignals,
          tooltip: 'View insights and alerts'
        },
        {
          id: 'run-flow',
          icon: Play,
          label: 'Run Flow',
          onClick: onRunFlow,
          tooltip: 'Execute workflow'
        },
        {
          id: 'export',
          icon: Upload,
          label: 'Export',
          onClick: onExport,
          tooltip: 'Export data and reports'
        },
        {
          id: 'chat',
          icon: MessageCircle,
          label: 'Chat',
          onClick: onChat,
          tooltip: 'Open AI assistant'
        },
        {
          id: 'founder-mode',
          icon: Crown,
          label: 'Founder',
          onClick: onFounderMode,
          tooltip: 'Strategic decision cockpit',
          isPro: true
        }
      ];
    }
    
    // Venture-specific actions
    if (currentView?.startsWith('venture-')) {
      return [
        {
          id: 'worksheet',
          icon: Plus,
          label: '+Worksheet',
          onClick: onAddWorksheet,
          tooltip: 'Create new worksheet'
        },
        {
          id: 'dashboard',
          icon: FileSpreadsheet,
          label: '+Dashboard',
          onClick: onAddDashboard,
          tooltip: 'Create new dashboard'
        },
        {
          id: 'import',
          icon: Upload,
          label: 'Import CSV',
          onClick: onImportCsv,
          tooltip: 'Import data from CSV'
        },
        {
          id: 'export',
          icon: Upload,
          label: 'Export',
          onClick: onExport,
          tooltip: 'Export data and reports'
        },
        {
          id: 'founder-mode',
          icon: Crown,
          label: 'Founder',
          onClick: onFounderMode,
          tooltip: 'Strategic decision cockpit',
          isPro: true
        }
      ];
    }
    
    // Default actions for other views
    return [
      {
        id: 'venture',
        icon: Building2,
        label: 'Add Venture',
        onClick: onAddVenture,
        tooltip: 'Create new venture (Pro feature)',
        isPro: true
      },
      {
        id: 'founder-mode',
        icon: Crown,
        label: 'Founder Mode',
        onClick: onFounderMode,
        tooltip: 'Strategic decision cockpit',
        isPro: true
      }
    ];
  };

  const actions = getActions();

  return (
    <div className={cn(
      "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300",
      "bg-background/95 backdrop-blur-sm border border-border rounded-full shadow-lg",
      isCollapsed ? "px-3 py-2" : "px-4 py-2",
      className
    )}>
      {/* Collapse/Expand Toggle */}
      <div className="flex items-center justify-center mb-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-6 w-6 p-0 hover:bg-muted/50"
        >
          {isCollapsed ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </Button>
      </div>

      {/* Actions */}
      {!isCollapsed && (
        <div className="flex items-center space-x-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="ghost"
                size="sm"
                onClick={action.onClick}
                className={cn(
                  "h-8 px-3 text-xs transition-colors",
                  action.isPro && "text-amber-600 border-amber-200 hover:bg-amber-50"
                )}
                title={action.tooltip}
              >
                <Icon className="h-3 w-3 mr-1" />
                {action.label}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuickDock;