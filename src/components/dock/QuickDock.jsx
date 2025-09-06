import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ScratchpadPanel from '@/components/scratchpad/ScratchpadPanel';
import ToolsPanel from '@/components/tools/ToolsPanel';
import { BlocksBrowser } from '@/components/blocks/BlocksBrowser';
import { FileText, Calculator, Layout, Target } from 'lucide-react';

const QuickDock = ({ className = "", onNavigate }) => {
  const [scratchpadOpen, setScratchpadOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [blocksOpen, setBlocksOpen] = useState(false);

  const dockItems = [
    {
      id: 'scratchpad',
      icon: FileText,
      label: 'Scratchpad',
      description: 'Quick notes and ideas',
      action: () => {
        console.log('Scratchpad button clicked!');
        setScratchpadOpen(true);
      },
      shortcut: 'S'
    },
    {
      id: 'tools',
      icon: Calculator,
      label: 'Tools',
      description: 'Financial calculators',
      action: () => {
        console.log('Calculator button clicked!');
        setToolsOpen(true);
      },
      shortcut: 'T'
    },
    {
      id: 'playground',
      icon: Layout,
      label: 'Playground',
      description: 'Visual builder',
      action: () => {
        console.log('Playground button clicked!');
        if (onNavigate) {
          onNavigate('playground');
        }
      },
      shortcut: 'P'
    },
    {
      id: 'blocks',
      icon: Target,
      label: 'Blocks',
      description: 'Browse all blocks',
      action: () => {
        console.log('Blocks button clicked!');
        setBlocksOpen(true);
      },
      shortcut: 'B'
    }
  ];

  return (
    <TooltipProvider>
      <div className={`fixed bottom-20 right-6 md:bottom-6 md:right-20 z-50 ${className}`}>
        {/* Scratchpad Panel */}
        <ScratchpadPanel 
          isOpen={scratchpadOpen}
          onClose={() => setScratchpadOpen(false)}
        />

        {/* Tools Panel */}
        <ToolsPanel 
          isOpen={toolsOpen}
          onClose={() => setToolsOpen(false)}
        />

        {/* Blocks Modal */}
        <Dialog open={blocksOpen} onOpenChange={setBlocksOpen}>
          <DialogContent className="max-w-6xl h-[80vh] p-0">
            <DialogHeader className="p-6 border-b">
              <DialogTitle>Browse Blocks</DialogTitle>
            </DialogHeader>
            <div className="p-6 h-full overflow-auto">
              <BlocksBrowser 
                onBlockSelect={(block) => {
                  console.log('Selected block:', block);
                  setBlocksOpen(false);
                }}
              />
            </div>
          </DialogContent>
        </Dialog>

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