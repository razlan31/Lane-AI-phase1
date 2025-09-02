import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useScratchpad } from '@/hooks/useScratchpad';
import AICopilot from '@/components/copilot/AICopilot';
import { FileText, Plus, Search, Tag, X } from 'lucide-react';

/**
 * Scratchpad Panel - Always available floating panel for quick notes
 * First step in the Auto-Promotion Flow
 */
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
    suggestTools,
    searchNotes,
    filterByTag
  } = useScratchpad();

  const [aiSuggestions, setAiSuggestions] = useState([]);

  // Filter notes based on search and tags
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

  // Get all unique tags
  const allTags = [...new Set(notes.flatMap(note => note.tags || []))];

  const handleCreateNote = async () => {
    if (!newNote.trim()) return;
    
    const tags = newTags.split(',').map(tag => tag.trim()).filter(Boolean);
    const note = await createNote(newNote, tags);
    
    if (note) {
      // Generate AI suggestions for this note
      const suggestions = suggestTools(newNote);
      if (suggestions.length > 0) {
        setAiSuggestions([{
          message: suggestions[0].reason + ". Want me to run the calculator?",
          confidence: 85,
          actions: [
            { label: 'Run Tool', primary: true, action: 'run_tool', toolId: suggestions[0].tool },
            { label: 'Ignore', primary: false, action: 'dismiss' }
          ]
        }]);
      }
      
      setNewNote('');
      setNewTags('');
    }
  };

  const handleSuggestionAction = async (suggestion, action) => {
    if (action.action === 'run_tool') {
      // Navigate to tool or open tool modal
      console.log('Opening tool:', action.toolId);
      // This would integrate with the tools system
    }
    setAiSuggestions([]);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed right-4 top-20 w-96 max-h-[80vh] z-50 ${className}`}>
      <Card className="p-4 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Scratchpad</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* AI Copilot Suggestions */}
        {aiSuggestions.length > 0 && (
          <AICopilot
            context={{ type: 'scratchpad' }}
            suggestions={aiSuggestions}
            onSuggestionAction={handleSuggestionAction}
            className="mb-4"
          />
        )}

        {/* New Note Input */}
        <div className="space-y-3 mb-4">
          <Textarea
            placeholder="Jot down your thoughts..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="min-h-[80px]"
          />
          <div className="flex gap-2">
            <Input
              placeholder="Tags (comma separated)"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleCreateNote} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="space-y-2 mb-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <Button
                variant={selectedTag === '' ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTag('')}
                className="text-xs h-6"
              >
                All
              </Button>
              {allTags.map(tag => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                  className="text-xs h-6"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Notes List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center text-muted-foreground">Loading...</div>
          ) : filteredNotes().length === 0 ? (
            <div className="text-center text-muted-foreground">
              {searchQuery || selectedTag ? 'No notes match your filter' : 'No notes yet'}
            </div>
          ) : (
            filteredNotes().map(note => (
              <Card key={note.id} className="p-3 hover:bg-muted/50">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm flex-1">{note.text}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteNote(note.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {note.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {note.linked_context && (
                  <Badge variant="outline" className="text-xs">
                    Linked to {note.linked_context.type}
                  </Badge>
                )}
                
                <div className="text-xs text-muted-foreground">
                  {new Date(note.created_at).toLocaleString()}
                </div>
              </Card>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default ScratchpadPanel;