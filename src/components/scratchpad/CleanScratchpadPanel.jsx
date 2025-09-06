import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useScratchpad } from '@/hooks/useScratchpad';
import { FileText, Plus, X, Sparkles, Save } from 'lucide-react';
import useAutosave from '@/hooks/useAutosave';
import { AutosaveStatus } from '@/components/autosave/AutosaveNotifications';

const CleanScratchpadPanel = ({ isOpen, onClose, className = "" }) => {
  const [newNote, setNewNote] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  
  const {
    notes,
    loading,
    aiReflectionLoading,
    createNote,
    deleteNote,
    reflectOnNote
  } = useScratchpad();

  // Get the selected note content safely
  const selectedNote = selectedNoteId ? notes.find(n => n.id === selectedNoteId) : null;
  const initialContent = selectedNote?.text || '';

  // Autosave for selected note editing
  const {
    content: editingContent,
    setContent: setEditingContent,
    saveStatus,
    lastSaved,
    commit,
    forceRetry
  } = useAutosave(selectedNoteId, 'scratchpad', initialContent);

  const handleCreateNote = async () => {
    if (!newNote.trim()) return;
    
    await createNote(newNote, []);
    setNewNote('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleCreateNote();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-50 ${className}`}>
      <div className="flex justify-center items-start pt-8 px-4 h-full">
        <Card className="w-full max-w-2xl h-[80vh] flex flex-col">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4 border-b">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Scratchpad
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-6 space-y-4 overflow-hidden">
            {/* Quick Note Input */}
            <div className="space-y-3">
              <Textarea
                placeholder="Write a quick note... (Ctrl+Enter to save)"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[100px] resize-none text-base"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                {newNote.trim() && (
                  <Button 
                    onClick={() => reflectOnNote(newNote)} 
                    variant="outline" 
                    size="sm"
                    disabled={aiReflectionLoading}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI Reflect
                  </Button>
                )}
                <Button onClick={handleCreateNote} disabled={!newNote.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Save Note
                </Button>
              </div>
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-auto space-y-3">
              <div className="text-sm font-medium text-muted-foreground border-b pb-2">
                Recent Notes ({notes.length})
              </div>
              
              {loading ? (
                <div className="text-center text-muted-foreground py-8">
                  Loading notes...
                </div>
              ) : notes.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <div className="space-y-2">
                    <p>No notes yet</p>
                    <p className="text-xs">Start by writing your first note above</p>
                  </div>
                </div>
              ) : (
                notes.map(note => (
                  <Card key={note.id} className="p-4 hover:shadow-sm transition-shadow">
                    <div className="space-y-3">
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {note.text}
                      </div>
                      
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {note.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-xs text-muted-foreground">
                          {new Date(note.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => reflectOnNote(note.text, note.id)}
                            disabled={aiReflectionLoading}
                            className="h-8 px-2 text-xs"
                          >
                            <Sparkles className="h-3 w-3 mr-1" />
                            Reflect
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNote(note.id)}
                            className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CleanScratchpadPanel;