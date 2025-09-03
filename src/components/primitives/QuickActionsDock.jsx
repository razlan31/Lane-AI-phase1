// No React import needed
import { Plus, Activity, Play, Download, MessageCircle, Crown } from 'lucide-react';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
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
    <div className={cn(
      "fixed bottom-4 right-4 z-40 flex flex-col gap-2",
      className
    )}>
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Tooltip key={action.id}>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant={action.variant || "outline"}
                className={cn(
                  "w-12 h-12 p-0 rounded-full shadow-lg border-2",
                  action.className
                )}
                onClick={action.action}
              >
                <Icon className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{action.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
};

export default QuickActionsDock;