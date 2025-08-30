import React from 'react';
import { Button } from '../ui/button';
import { Plus, FileSpreadsheet, Upload, Building2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const QuickDock = ({ onAddWorksheet, onAddDashboard, onImportCsv, onAddVenture, className }) => {
  const actions = [
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
      id: 'venture',
      icon: Building2,
      label: 'Add Venture',
      onClick: onAddVenture,
      tooltip: 'Create new venture (Pro feature)',
      isPro: true
    }
  ];

  return (
    <div className={cn(
      "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50",
      "bg-background/95 backdrop-blur-sm border border-border rounded-full",
      "px-4 py-2 shadow-lg",
      className
    )}>
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
                "h-8 px-3 text-xs",
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
    </div>
  );
};

export default QuickDock;