import { useState, useEffect, useMemo } from 'react';
import { Search, Calculator, Building, FileText, Users, Settings, Zap, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useBlocks } from '@/hooks/useBlocks';
import { useTools } from '@/hooks/useTools';
import { useVentures } from '@/hooks/useVentures.jsx';

const commandCategories = {
  tools: { label: 'Tools', icon: Calculator, color: 'blue' },
  blocks: { label: 'Blocks', icon: Building, color: 'green' },
  ventures: { label: 'Ventures', icon: FileText, color: 'purple' },
  actions: { label: 'Actions', icon: Zap, color: 'orange' }
};

export const GlobalCommandPalette = ({ isOpen, onClose, onExecute }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const { blocks } = useBlocks();
  const { tools } = useTools();
  const { ventures } = useVentures();

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const commands = useMemo(() => {
    const allCommands = [];

    // Tool commands
    tools.forEach(tool => {
      allCommands.push({
        id: `tool-${tool.id}`,
        title: tool.name,
        subtitle: tool.description,
        category: 'tools',
        action: () => onExecute?.('open-tool', tool),
        keywords: [tool.name, tool.description, tool.category].join(' ').toLowerCase()
      });
    });

    // Block commands
    blocks.forEach(block => {
      allCommands.push({
        id: `block-${block.id}`,
        title: block.name,
        subtitle: block.description,
        category: 'blocks',
        action: () => onExecute?.('open-block', block),
        keywords: [block.name, block.description, block.category, ...(block.tags || [])].join(' ').toLowerCase()
      });
    });

    // Venture commands
    ventures.forEach(venture => {
      allCommands.push({
        id: `venture-${venture.id}`,
        title: venture.name,
        subtitle: venture.description || 'Open venture workspace',
        category: 'ventures',
        action: () => onExecute?.('open-venture', venture),
        keywords: [venture.name, venture.description || '', venture.type || ''].join(' ').toLowerCase()
      });
    });

    // Action commands
    const actionCommands = [
      {
        id: 'action-new-venture',
        title: 'Create New Venture',
        subtitle: 'Start a new business venture',
        category: 'actions',
        action: () => onExecute?.('create-venture'),
        keywords: 'create new venture business startup'
      },
      {
        id: 'action-playground',
        title: 'Open Playground',
        subtitle: 'Experiment with blocks and ideas',
        category: 'actions',
        action: () => onExecute?.('open-playground'),
        keywords: 'playground experiment canvas blocks'
      },
      {
        id: 'action-scratchpad',
        title: 'Open Scratchpad',
        subtitle: 'Quick notes and ideas',
        category: 'actions',
        action: () => onExecute?.('open-scratchpad'),
        keywords: 'scratchpad notes ideas quick'
      },
      {
        id: 'action-tools',
        title: 'Browse Tools',
        subtitle: 'Access business calculation tools',
        category: 'actions',
        action: () => onExecute?.('browse-tools'),
        keywords: 'tools calculator browse financial marketing'
      },
      {
        id: 'action-blocks',
        title: 'Browse Blocks',
        subtitle: 'Explore business building blocks',
        category: 'actions',
        action: () => onExecute?.('browse-blocks'),
        keywords: 'blocks browse business building explore'
      }
    ];

    allCommands.push(...actionCommands);

    return allCommands;
  }, [tools, blocks, ventures, onExecute]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) {
      return commands.slice(0, 10); // Show recent/popular commands
    }

    const queryLower = query.toLowerCase();
    return commands
      .filter(cmd => cmd.keywords.includes(queryLower) || cmd.title.toLowerCase().includes(queryLower))
      .sort((a, b) => {
        // Prioritize title matches
        const aTitle = a.title.toLowerCase().includes(queryLower);
        const bTitle = b.title.toLowerCase().includes(queryLower);
        if (aTitle && !bTitle) return -1;
        if (!aTitle && bTitle) return 1;
        return 0;
      })
      .slice(0, 8);
  }, [commands, query]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            onClose();
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  // Reset selected index when filtered commands change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands]);

  const handleCommandClick = (command) => {
    command.action();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        {/* Search Input */}
        <div className="flex items-center border-b px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground mr-3" />
          <Input
            placeholder="Search tools, blocks, ventures, or actions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 p-0 text-base"
            autoFocus
          />
        </div>

        {/* Commands List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground">
              {query ? `No commands found for "${query}"` : 'Start typing to search...'}
            </div>
          ) : (
            <div className="py-2">
              {filteredCommands.map((command, index) => {
                const categoryConfig = commandCategories[command.category];
                const CategoryIcon = categoryConfig.icon;
                
                return (
                  <div
                    key={command.id}
                    className={`
                      px-4 py-3 cursor-pointer flex items-center gap-3 
                      ${index === selectedIndex ? 'bg-muted' : 'hover:bg-muted/50'}
                    `}
                    onClick={() => handleCommandClick(command)}
                  >
                    <div className={`p-2 rounded-md bg-${categoryConfig.color}-100`}>
                      <CategoryIcon className={`h-4 w-4 text-${categoryConfig.color}-600`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{command.title}</span>
                        <Badge variant="secondary" className="text-xs">
                          {categoryConfig.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {command.subtitle}
                      </p>
                    </div>
                    
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t bg-muted/20">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Use ↑↓ to navigate, Enter to select, Esc to close</span>
            <span>{filteredCommands.length} results</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};