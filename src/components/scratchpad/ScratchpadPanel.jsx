import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useScratchpad } from '@/hooks/useScratchpad';
import { useCopilotManager } from '@/hooks/useCopilotManager';
import { ScratchpadSuggestions } from './ScratchpadSuggestions';
import AICopilot from '@/components/copilot/AICopilot';
import { FileText, Plus, Search, Tag, X } from 'lucide-react';

const ScratchpadPanel = ({ isOpen, onClose, className = "" }) => {
  const [newNote, setNewNote] = useState('');
  const [newTags, setNewTags] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  
  const {
    notes,
    loading,
    createNote,
    deleteNote,
    searchNotes,
    filterByTag,
    suggestTools
  } = useScratchpad();

  const { activeSuggestion, generateSuggestion, dismissSuggestion } = useCopilotManager();

  const filteredNotes = () => {
    let filtered = notes;
    if (searchQuery) {
      filtered = searchNotes(searchQuery);
    }
    if (selectedTag) {
      filtered = filterByTag(selectedTag);
    }
    return filtered;
  };

  const allTags = [...new Set(notes.flatMap(note => note.tags || []))];

  const handleCreateNote = async () => {
    if (!newNote.trim()) return;

    const tags = newTags.split(',').map(t => t.trim()).filter(Boolean);
    const note = await createNote(newNote, tags);
    
    if (note) {
      await generateSuggestion(
        { type: 'scratchpad', sourceId: note.id },
        { text: newNote }
      );
      
      setNewNote('');
      setNewTags('');
    }
  };

  const handleSuggestionAction = async (suggestion, action) => {
    if (action.action === 'run_tool') {
      console.log('Open tools panel with tool:', action.toolId);
    }
    
    await dismissSuggestion(suggestion.id, action.action !== 'dismiss');
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-50 ${className}`}>
      <Card className="absolute left-4 top-4 bottom-4 w-80 flex flex-col max-h-screen">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Scratchpad
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* AI Suggestions based on current text */}
          {newNote && (
            <ScratchpadSuggestions text={newNote} />
          )}

          {activeSuggestion && activeSuggestion.context.type === 'scratchpad' && (
            <AICopilot
              context={activeSuggestion.context}
              suggestion={activeSuggestion}
              onSuggestionAction={handleSuggestionAction}
              layout="strip"
            />
          )}

          <div className="space-y-2">
            <Textarea
              placeholder="Quick note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex gap-2">
              <Input
                placeholder="Tags (comma-separated)"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleCreateNote} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {allTags.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                <Button
                  variant={selectedTag === '' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTag('')}
                  className="h-6 px-2 text-xs"
                >
                  All
                </Button>
                {allTags.map(tag => (
                  <Button
                    key={tag}
                    variant={selectedTag === tag ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTag(tag)}
                    className="h-6 px-2 text-xs"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-auto space-y-2">
            {loading ? (
              <div className="text-center text-muted-foreground py-8">
                Loading notes...
              </div>
            ) : filteredNotes().length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                {notes.length === 0 ? 'No notes yet' : 'No matching notes'}
              </div>
            ) : (
              filteredNotes().map(note => (
                <Card key={note.id} className="p-3">
                  <div className="space-y-2">
                    <p className="text-sm">{note.text}</p>
                    
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {note.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{new Date(note.created_at).toLocaleDateString()}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNote(note.id)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScratchpadPanel;