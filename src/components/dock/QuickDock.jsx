import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ScratchpadPanel from '@/components/scratchpad/ScratchpadPanel';
import ToolsPanel from '@/components/tools/ToolsPanel';
import { BlocksBrowser } from '@/components/blocks/BlocksBrowser';
import { FileText, Calculator, Layout, Target, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/components/ui/MobileOptimized';

const QuickDock = ({ className = "", onNavigate }) => {
  const [scratchpadOpen, setScratchpadOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [blocksOpen, setBlocksOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const isMobile = useIsMobile();

  // Auto-hide dock on mobile scroll
  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > lastScrollY;
      
      setIsVisible(!isScrollingDown || currentScrollY < 50);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isMobile]);

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
    }
  ];

  return (
    <TooltipProvider>
      <div className={cn(
        "fixed z-40 transition-all duration-300",
        isMobile 
          ? `bottom-24 right-4 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}` 
          : "bottom-8 right-8",
        className
      )}>
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
              <DialogTitle className="flex items-center justify-between">
                Browse Blocks
                <Button 
                  variant="ghost" 
                  size="icon-sm"
                  onClick={() => setBlocksOpen(false)}
                  className="md:hidden"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            <div className="p-6 h-full overflow-auto">
              <BlocksBrowser 
                mode="browse"
                onBlockSelect={(block) => {
                  console.log('Selected block:', block);
                  setBlocksOpen(false);
                }}
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Quick action buttons */}
        <div className="flex flex-col gap-3" data-feature="quick-dock">
          {dockItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <Button
                    size={isMobile ? "icon" : "icon-lg"}
                    variant="default"
                    className={cn(
                      "rounded-full shadow-lg hover-lift animate-fade-in",
                      "bg-gradient-to-br from-primary to-primary/80",
                      "hover:from-primary/90 hover:to-primary/70",
                      "touch-manipulation"
                    )}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={item.action}
                    aria-label={item.label}
                  >
                    <Icon className={cn(
                      isMobile ? "h-4 w-4" : "h-5 w-5",
                      "text-primary-foreground"
                    )} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" className={cn(
                  isMobile && "hidden"
                )}>
                  <div className="text-center">
                    <p className="font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                    {item.shortcut && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">{item.shortcut}</kbd>
                      </p>
                    )}
                  </div>
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