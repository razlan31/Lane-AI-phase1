import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ScratchpadPanel from '@/components/scratchpad/ScratchpadPanel';
import ToolsPanel from '@/components/tools/ToolsPanel';
import { FileText, Calculator, Layout, Target } from 'lucide-react';

/**
 * Quick Dock - Always visible floating dock for accessing key tools
 * Entry point to the Auto-Promotion Flow
 */
const QuickDock = ({ className = "" }) => {
  const [scratchpadOpen, setScratchpadOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  const dockItems = [
    {
      id: 'scratchpad',
      icon: FileText,
      label: 'Scratchpad',
      description: 'Quick notes & ideas',
      onClick: () => setScratchpadOpen(!scratchpadOpen),
      active: scratchpadOpen
    },
    {
      id: 'tools',
      icon: Calculator,
      label: 'Tools',
      description: 'Calculators & utilities',
      onClick: () => setToolsOpen(!toolsOpen),
      active: toolsOpen
    },
    {
      id: 'playground',
      icon: Layout,
      label: 'Playground',
      description: 'Experiment with ideas',
      onClick: () => {
        // Navigate to playground
        console.log('Opening playground');
      }
    },
    {
      id: 'blocks',
      icon: Target,
      label: 'Blocks',
      description: 'Browse all blocks',
      onClick: () => {
        // Navigate to blocks view
        console.log('Opening blocks view');
      }
    }
  ];

  return (
    <TooltipProvider>
      <div className={`fixed bottom-6 right-6 z-40 ${className}`}>
        {/* Quick Dock */}
        <div className="flex flex-col gap-2 p-2 bg-white/90 backdrop-blur-sm border rounded-lg shadow-lg">
          {dockItems.map((item) => {
            const Icon = item.icon;
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={item.active ? "default" : "ghost"}
                    size="sm"
                    onClick={item.onClick}
                    className="w-10 h-10 p-0"
                  >
                    <Icon className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <div className="text-center">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Panels */}
        <ScratchpadPanel 
          isOpen={scratchpadOpen} 
          onClose={() => setScratchpadOpen(false)} 
        />
        <ToolsPanel 
          isOpen={toolsOpen} 
          onClose={() => setToolsOpen(false)} 
        />
      </div>
    </TooltipProvider>
  );
};

export default QuickDock;