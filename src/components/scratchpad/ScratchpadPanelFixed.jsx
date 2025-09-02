import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Plus, Search, Tag, X, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

const ScratchpadPanelFixed = ({ isOpen, onClose }) => {
  const [notes, setNotes] = useState([
    {
      id: 1,
      text: "Need to calculate ROI for new marketing campaign",
      tags: ["marketing", "roi"],
      created_at: new Date()
    },
    {
      id: 2,
      text: "Customer acquisition cost seems high - analyze funnel",
      tags: ["cac", "funnel"],
      created_at: new Date()
    }
  ]);
  const [newNote, setNewNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    const note = {
      id: Date.now(),
      text: newNote,
      tags: [],
      created_at: new Date()
    };
    
    setNotes(prev => [note, ...prev]);
    setNewNote('');
    toast.success('Note added to scratchpad');
  };

  const handleDeleteNote = (noteId) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    toast.success('Note deleted');
  };

  const getSuggestedTools = (noteText) => {
    const suggestions = [];
    const text = noteText.toLowerCase();
    
    if (text.includes('roi')) {
      suggestions.push({ tool: 'ROI Calculator', confidence: 0.9 });
    }
    if (text.includes('cac') || text.includes('acquisition')) {
      suggestions.push({ tool: 'CAC Calculator', confidence: 0.85 });
    }
    if (text.includes('funnel')) {
      suggestions.push({ tool: 'Funnel Analysis', confidence: 0.8 });
    }
    
    return suggestions;
  };

  const filteredNotes = notes.filter(note =>
    note.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Scratchpad
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
          {/* Add Note */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
              placeholder="Add a quick note or idea..."
              className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button onClick={handleAddNote}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-10 pr-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-auto space-y-3">
            {filteredNotes.map((note) => {
              const suggestions = getSuggestedTools(note.text);
              
              return (
                <Card key={note.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm flex-1">{note.text}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNote(note.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {note.tags.length > 0 && (
                      <div className="flex items-center gap-1 mb-2">
                        <Tag className="h-3 w-3 text-muted-foreground" />
                        {note.tags.map((tag, index) => (
                          <span key={index} className="text-xs bg-muted px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {suggestions.length > 0 && (
                      <div className="border-t pt-2 mt-2">
                        <div className="flex items-center gap-1 mb-2">
                          <Lightbulb className="h-3 w-3 text-primary" />
                          <span className="text-xs font-medium text-primary">Suggested Tools:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {suggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => toast.info(`Opening ${suggestion.tool}...`)}
                              className="text-xs h-6"
                            >
                              {suggestion.tool}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground mt-2">
                      {note.created_at.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {filteredNotes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? 'No notes match your search' : 'No notes yet. Add your first idea!'}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScratchpadPanelFixed;