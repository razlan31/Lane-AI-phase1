import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { useNotes } from '@/hooks/useNotes';
import { useTags } from '@/hooks/useTags';

export const QuickNoteModal = ({ 
  isOpen, 
  onClose, 
  contextType = null, 
  contextId = null, 
  ventureId = null, 
  blockId = null,
  defaultContent = ''
}) => {
  const [content, setContent] = useState(defaultContent);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  
  const { createNote } = useNotes();
  const { getTagSuggestions } = useTags();

  const handleSave = async () => {
    if (!content.trim()) return;

    setSaving(true);
    try {
      const result = await createNote({
        content: content.trim(),
        context_type: contextType,
        context_id: contextId,
        venture_id: ventureId,
        block_id: blockId,
        tags
      });

      if (result.success) {
        setContent(defaultContent);
        setTags([]);
        setTagInput('');
        onClose();
      }
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave();
    } else if (e.key === 'Enter' && e.target === document.querySelector('input[placeholder="Add tags..."]')) {
      e.preventDefault();
      handleAddTag();
    }
  };

  const suggestions = getTagSuggestions(tagInput);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Quick Note</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Content */}
          <div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here..."
              className="min-h-[120px] resize-none"
              onKeyDown={handleKeyPress}
              autoFocus
            />
          </div>

          {/* Tags */}
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tags..."
                className="flex-1"
                onKeyDown={handleKeyPress}
              />
              <Button size="sm" onClick={handleAddTag} disabled={!tagInput.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Tag Suggestions */}
            {tagInput && suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="text-xs text-muted-foreground">Suggestions:</span>
                {suggestions.map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      if (!tags.includes(suggestion)) {
                        setTags([...tags, suggestion]);
                        setTagInput('');
                      }
                    }}
                    className="text-xs bg-muted hover:bg-muted/80 px-2 py-1 rounded"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              Press Cmd+Enter to save
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={!content.trim() || saving}
              >
                {saving ? 'Saving...' : 'Save Note'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};