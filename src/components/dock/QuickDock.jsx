import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
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
    <TooltipProvider>
      <div className={`fixed bottom-20 right-6 md:bottom-6 md:right-20 z-40 ${className}`}>
        {/* Scratchpad Panel */}
        {scratchpadOpen && (
          <div className="absolute bottom-16 right-0 mb-4 max-w-[calc(100vw-3rem)]">
            <ScratchpadPanel 
              onClose={() => setScratchpadOpen(false)}
            />
          </div>
        )}

        {/* Tools Panel */}
        {toolsOpen && (
          <div className="absolute bottom-16 right-0 mb-4 max-w-[calc(100vw-3rem)]">
            <ToolsPanel 
              onClose={() => setToolsOpen(false)}
            />
          </div>
        )}

        {/* Quick action buttons */}
        <div className="flex flex-col gap-2">
          {dockItems.map((item) => {
            const Icon = item.icon;
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-10 h-10 md:w-12 md:h-12 p-0 rounded-full shadow-lg border-2 bg-background hover:bg-accent touch-manipulation"
                    onClick={item.action}
                    aria-label={item.label}
                  >
                    <Icon className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" className="hidden md:block">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default QuickDock;