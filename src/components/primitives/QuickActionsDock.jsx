import React from 'react';
import { Plus, Activity, Play, Download, MessageCircle, Crown } from 'lucide-react';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { cn } from '../../lib/utils';

const QuickActionsDock = ({ 
  onAddData, 
  onSignals, 
  onRunFlow, 
  onExport, 
  onChat,
  onFounderMode,
  className 
}) => {
  const actions = [
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
      icon: Download,
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

  return (
    <TooltipProvider>
      <div className={cn(
        "fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50",
        "flex items-center gap-2 p-2 bg-background/95 backdrop-blur-sm",
        "border border-border rounded-full shadow-lg",
        className
      )}>
        {actions.map((action) => (
          <Tooltip key={action.id}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={action.onClick}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 h-auto rounded-full hover:bg-accent",
                  action.isPro && "text-amber-600 hover:bg-amber-50"
                )}
              >
                <action.icon className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">{action.label}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{action.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default QuickActionsDock;