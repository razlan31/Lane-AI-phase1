import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ScratchpadPanelFixed from '@/components/scratchpad/ScratchpadPanelFixed';
import ToolsPanelFixed from '@/components/tools/ToolsPanelFixed';
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
      <div className={`fixed bottom-4 right-4 z-40 ${className}`}>
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-full p-2 shadow-lg">
          {dockItems.map((item) => {
            const Icon = item.icon;
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={item.action}
                    className="h-10 w-10 rounded-full hover:bg-primary/10"
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" className="flex items-center gap-2">
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        <ScratchpadPanelFixed 
          isOpen={scratchpadOpen} 
          onClose={() => setScratchpadOpen(false)} 
        />
        <ToolsPanelFixed 
          isOpen={toolsOpen} 
          onClose={() => setToolsOpen(false)} 
        />
      </div>
    </TooltipProvider>
  );
};

export default QuickDock;