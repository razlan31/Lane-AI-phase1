import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useScratchpad = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch scratchpad notes
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setNotes([]);
          return;
        }

        const { data, error } = await supabase
          .from('scratchpad_notes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setNotes(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  // Create new scratchpad note
  const createNote = async (text, tags = []) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('scratchpad_notes')
        .insert({
          user_id: user.id,
          text,
          tags
        })
        .select()
        .single();

      if (error) throw error;

      setNotes(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  // Update note
  const updateNote = async (noteId, updates) => {
    try {
      const { data, error } = await supabase
        .from('scratchpad_notes')
        .update(updates)
        .eq('id', noteId)
        .select()
        .single();

      if (error) throw error;

      setNotes(prev => prev.map(note => 
        note.id === noteId ? data : note
      ));
      
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  // Delete note
  const deleteNote = async (noteId) => {
    try {
      const { error } = await supabase
        .from('scratchpad_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      setNotes(prev => prev.filter(note => note.id !== noteId));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Link note to context (block, kpi, worksheet, etc.)
  const linkToContext = async (noteId, contextType, contextId) => {
    try {
      const linkedContext = { type: contextType, id: contextId };
      return await updateNote(noteId, { linked_context: linkedContext });
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  // Convert note to formal venture note
  const convertToVentureNote = async (noteId, ventureId, blockId = null) => {
    try {
      const note = notes.find(n => n.id === noteId);
      if (!note) throw new Error('Note not found');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create formal note in notes table
      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          venture_id: ventureId,
          block_id: blockId,
          content: note.text,
          tags: note.tags,
          context_type: 'venture',
          context_id: ventureId
        })
        .select()
        .single();

      if (error) throw error;

      // Update scratchpad note to show it's been converted
      await linkToContext(noteId, 'note', data.id);
      
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  // AI suggestion helpers
  const suggestTools = (noteText) => {
    const suggestions = [];
    
    // Simple keyword matching for AI suggestions
    if (noteText.toLowerCase().includes('spend') && noteText.toLowerCase().includes('customer')) {
      suggestions.push({ tool: 'cac_calculator', reason: 'Looks like CAC calculation' });
    }
    
    if (noteText.toLowerCase().includes('runway') || noteText.toLowerCase().includes('burn')) {
      suggestions.push({ tool: 'runway_calculator', reason: 'Looks like runway calculation' });
    }
    
    if (noteText.toLowerCase().includes('roi') || noteText.toLowerCase().includes('return')) {
      suggestions.push({ tool: 'roi_calculator', reason: 'Looks like ROI calculation' });
    }
    
    return suggestions;
  };

  // Search and filter
  const searchNotes = (query) => {
    return notes.filter(note => 
      note.text.toLowerCase().includes(query.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
  };

  const filterByTag = (tag) => {
    return notes.filter(note => note.tags.includes(tag));
  };

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    linkToContext,
    convertToVentureNote,
    suggestTools,
    searchNotes,
    filterByTag
  };
};