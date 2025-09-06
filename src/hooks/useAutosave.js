import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from './useDebounce';
import { toast } from '@/hooks/use-toast';

export const useAutosave = (parentId, parentType, initialContent = {}) => {
  const [content, setContent] = useState(initialContent);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saving', 'saved', 'error'
  const [lastSaved, setLastSaved] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const debouncedContent = useDebounce(content, 2500); // 2.5 second debounce
  const saveInProgress = useRef(false);
  const lastSavedContent = useRef(initialContent);

  // Fetch existing versions on mount
  useEffect(() => {
    if (parentId) {
      fetchVersions();
    }
  }, [parentId]);

  const fetchVersions = async () => {
    if (!parentId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('versions')
        .select('*')
        .eq('parent_id', parentId)
        .eq('parent_type', parentType)
        .order('version_number', { ascending: false });

      if (error) throw error;
      setVersions(data || []);
      
      // Set last saved time from latest version
      if (data?.length > 0) {
        setLastSaved(new Date(data[0].updated_at));
        lastSavedContent.current = data[0].content;
      }
    } catch (error) {
      console.error('Error fetching versions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Autosave when content changes (debounced)
  useEffect(() => {
    if (!parentId || !debouncedContent) return;
    
    // Don't save if content hasn't actually changed
    const hasChanged = JSON.stringify(debouncedContent) !== JSON.stringify(lastSavedContent.current);
    if (!hasChanged) return;

    autosave();
  }, [debouncedContent, parentId]);

  const autosave = async () => {
    if (saveInProgress.current || !parentId || !content) return;

    try {
      setSaveStatus('saving');
      saveInProgress.current = true;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if a draft already exists
      const { data: existingDraft } = await supabase
        .from('versions')
        .select('*')
        .eq('parent_id', parentId)
        .eq('parent_type', parentType)
        .eq('status', 'draft')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (existingDraft) {
        // Update existing draft
        const { error } = await supabase
          .from('versions')
          .update({
            content: content,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingDraft.id);

        if (error) throw error;
      } else {
        // Create new draft
        const { error } = await supabase
          .from('versions')
          .insert({
            parent_id: parentId,
            parent_type: parentType,
            user_id: user.id,
            content: content,
            status: 'draft'
          });

        if (error) throw error;
      }

      setSaveStatus('saved');
      setLastSaved(new Date());
      lastSavedContent.current = content;
      
    } catch (error) {
      console.error('Autosave error:', error);
      setSaveStatus('error');
      toast({
        title: "Save Failed",
        description: "Failed to save changes. Click to retry.",
        variant: "destructive",
        action: {
          label: "Retry",
          onClick: () => autosave()
        }
      });
    } finally {
      saveInProgress.current = false;
    }
  };

  const commit = async (commitMessage = '') => {
    if (!parentId || !content) return { success: false, error: 'No content to commit' };

    try {
      setSaveStatus('saving');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create committed version
      const { data, error } = await supabase
        .from('versions')
        .insert({
          parent_id: parentId,
          parent_type: parentType,
          user_id: user.id,
          content: {
            ...content,
            commit_message: commitMessage
          },
          status: 'committed'
        })
        .select()
        .single();

      if (error) throw error;

      // Delete any existing drafts
      await supabase
        .from('versions')
        .delete()
        .eq('parent_id', parentId)
        .eq('parent_type', parentType)
        .eq('status', 'draft')
        .eq('user_id', user.id);

      setSaveStatus('saved');
      setLastSaved(new Date());
      await fetchVersions(); // Refresh versions list
      
      toast({
        title: "Changes Committed",
        description: `Version ${data.version_number} saved successfully.`
      });

      return { success: true, data };
    } catch (error) {
      console.error('Commit error:', error);
      setSaveStatus('error');
      return { success: false, error: error.message };
    }
  };

  const revertToVersion = async (versionId) => {
    try {
      const version = versions.find(v => v.id === versionId);
      if (!version) throw new Error('Version not found');

      setContent(version.content);
      await autosave();
      
      toast({
        title: "Reverted",
        description: `Reverted to version ${version.version_number}.`
      });

      return { success: true };
    } catch (error) {
      console.error('Revert error:', error);
      return { success: false, error: error.message };
    }
  };

  const updateContent = useCallback((newContent) => {
    if (typeof newContent === 'function') {
      setContent(prevContent => newContent(prevContent));
    } else {
      setContent(newContent);
    }
  }, []);

  const forceRetry = useCallback(() => {
    if (saveStatus === 'error') {
      autosave();
    }
  }, [saveStatus]);

  return {
    content,
    setContent: updateContent,
    saveStatus,
    lastSaved,
    versions,
    loading,
    commit,
    revertToVersion,
    forceRetry,
    hasUnsavedChanges: saveStatus === 'saving' || JSON.stringify(content) !== JSON.stringify(lastSavedContent.current)
  };
};

// Save status component for consistent UI
export const SaveStatusIndicator = ({ saveStatus, lastSaved, onRetry, className = "" }) => {
  const getStatusDisplay = () => {
    switch (saveStatus) {
      case 'saving':
        return { text: 'Saving...', icon: '⏳', color: 'text-yellow-600' };
      case 'saved':
        return { 
          text: lastSaved ? `Saved ${formatLastSaved(lastSaved)}` : 'Saved', 
          icon: '✓', 
          color: 'text-green-600' 
        };
      case 'error':
        return { text: 'Save failed', icon: '⚠️', color: 'text-red-600' };
      default:
        return { text: '', icon: '', color: '' };
    }
  };

  const formatLastSaved = (date) => {
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const status = getStatusDisplay();

  if (!status.text) return null;

  return (
    <div className={`flex items-center gap-2 text-sm ${status.color} ${className}`}>
      <span>{status.icon}</span>
      <span>{status.text}</span>
      {saveStatus === 'error' && onRetry && (
        <button 
          onClick={onRetry}
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default useAutosave;