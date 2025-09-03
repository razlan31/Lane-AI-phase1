import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import ScratchpadPanel from '@/components/scratchpad/ScratchpadPanel';
import ToolsPanel from '@/components/tools/ToolsPanel';
import { FileText, Calculator, Layout, Target } from 'lucide-react';

const QuickDock = ({ className = "" }) => {
  const [scratchpadOpen, setScratchpadOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  const dockItems = [
    {
      id: 'scratchpad',
      icon: FileText,
      label: 'Scratchpad',
      description: 'Quick notes and ideas',
      action: () => setScratchpadOpen(true),
      shortcut: 'S'
    },
    {
      id: 'tools',
      icon: Calculator,
      label: 'Tools',
      description: 'Financial calculators',
      action: () => setToolsOpen(true),
      shortcut: 'T'
    },
    {
      id: 'playground',
      icon: Layout,
      label: 'Playground',
      description: 'Visual builder',
      action: () => console.log('Open Playground'),
      shortcut: 'P'
    },
    {
      id: 'blocks',
      icon: Target,
      label: 'Blocks',
      description: 'Browse all blocks',
      action: () => console.log('Open Blocks'),
      shortcut: 'B'
    }
  ];

  return (
    <div className={`fixed bottom-4 right-4 z-40 ${className}`}>
      {/* Show scratchpad if active */}
      {showScratchpad && (
        <div className="absolute bottom-16 right-0 mb-4">
          <ScratchpadPanel 
            ventureId={ventureId}
            onClose={() => setShowScratchpad(false)}
          />
        </div>
      )}

      {/* Quick action buttons */}
      <div className="flex flex-col gap-2">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Tooltip key={action.id}>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant={action.variant || "outline"}
                  className={`w-12 h-12 p-0 rounded-full shadow-lg border-2 ${action.className || ''}`}
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
    </div>
  );
};

export default QuickDock;