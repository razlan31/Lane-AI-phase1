import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '../ui/dialog';
import { Button } from '../ui/button';
import { Search, FileText, Building2, Calculator, BarChart3, Settings, Users, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands = [
    {
      id: 'new-venture',
      icon: Building2,
      title: 'Create New Venture',
      description: 'Start a new business venture',
      category: 'Create',
      action: () => console.log('Create venture')
    },
    {
      id: 'new-worksheet',
      icon: Calculator,
      title: 'New Worksheet',
      description: 'Create financial model or calculator',
      category: 'Create',
      action: () => console.log('Create worksheet')
    },
    {
      id: 'new-dashboard',
      icon: BarChart3,
      title: 'New Dashboard',
      description: 'Build custom analytics dashboard',
      category: 'Create',
      action: () => console.log('Create dashboard')
    },
    {
      id: 'import-data',
      icon: FileText,
      title: 'Import Data',
      description: 'Upload CSV, Excel, or PDF files',
      category: 'Data',
      action: () => console.log('Import data')
    },
    {
      id: 'founder-mode',
      icon: Zap,
      title: 'Founder Mode',
      description: 'Strategic decision war room',
      category: 'Tools',
      action: () => console.log('Open Founder Mode')
    },
    {
      id: 'settings',
      icon: Settings,
      title: 'Settings',
      description: 'Account and app preferences',
      category: 'System',
      action: () => console.log('Open settings')
    }
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.description.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < filteredCommands.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev > 0 ? prev - 1 : filteredCommands.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        onClose();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] p-0 bg-background border-border">
        <div className="flex flex-col">
          {/* Search Input */}
          <div className="flex items-center px-4 py-3 border-b border-border">
            <Search className="h-4 w-4 text-muted-foreground mr-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search commands..."
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              autoFocus
            />
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto">
            {filteredCommands.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No commands found for "{query}"
              </div>
            ) : (
              <div className="py-2">
                {filteredCommands.map((command, index) => {
                  const Icon = command.icon;
                  return (
                    <button
                      key={command.id}
                      onClick={() => {
                        command.action();
                        onClose();
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-muted/50 transition-colors",
                        index === selectedIndex && "bg-muted"
                      )}
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{command.title}</div>
                        <div className="text-xs text-muted-foreground">{command.description}</div>
                      </div>
                      <div className="text-xs text-muted-foreground px-2 py-1 bg-muted/50 rounded">
                        {command.category}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-border bg-muted/20">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>Esc Close</span>
              </div>
              <span>Cmd+K</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommandPalette;