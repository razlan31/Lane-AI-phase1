import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { QuickNoteModal } from '@/components/notes/QuickNoteModal';
import { Command, Search, FileText, Plus } from 'lucide-react';

export const GlobalCommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showQuickNote, setShowQuickNote] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'n' && e.shiftKey && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setShowQuickNote(true);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const commands = [
    {
      id: 'quick-note',
      label: 'Quick Note',
      icon: FileText,
      shortcut: 'Cmd+Shift+N',
      action: () => {
        setIsOpen(false);
        setShowQuickNote(true);
      }
    },
    {
      id: 'new-venture',
      label: 'New Venture',
      icon: Plus,
      action: () => {
        setIsOpen(false);
        window.dispatchEvent(new CustomEvent('openNewVentureModal'));
      }
    }
  ];

  const filteredCommands = commands.filter(command =>
    command.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg p-0">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search commands..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none border-0 focus-visible:ring-0"
            />
            <div className="ml-2 flex items-center gap-1 text-xs text-muted-foreground">
              <Command className="h-3 w-3" />
              <span>K</span>
            </div>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto p-2">
            {filteredCommands.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                No commands found
              </div>
            ) : (
              <div className="space-y-1">
                {filteredCommands.map((command) => {
                  const Icon = command.icon;
                  return (
                    <button
                      key={command.id}
                      onClick={command.action}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1 text-left">{command.label}</span>
                      {command.shortcut && (
                        <div className="text-xs text-muted-foreground">
                          {command.shortcut}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <QuickNoteModal
        isOpen={showQuickNote}
        onClose={() => setShowQuickNote(false)}
      />
    </>
  );
};