import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useNotes = (contextType = null, contextId = null, ventureId = null) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setNotes([]);
          return;
        }

        let query = supabase
          .from('notes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (contextType && contextId) {
          query = query.eq('context_type', contextType).eq('context_id', contextId);
        } else if (ventureId) {
          query = query.eq('venture_id', ventureId);
        }

        const { data, error: fetchError } = await query;
        if (fetchError) throw fetchError;

        setNotes(data || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [contextType, contextId, ventureId]);

  const createNote = async (noteData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const insert = {
        user_id: user.id,
        content: noteData.content,
        context_type: noteData.context_type || null,
        context_id: noteData.context_id || null,
        venture_id: noteData.venture_id || ventureId,
        block_id: noteData.block_id || null,
        tags: noteData.tags || []
      };

      const { data, error } = await supabase
        .from('notes')
        .insert(insert)
        .select('*')
        .single();

      if (error) throw error;

      // Update tag counts
      if (noteData.tags && noteData.tags.length > 0) {
        await updateTagCounts(noteData.tags, 'increment');
      }

      setNotes(prev => [data, ...prev]);
      return { success: true, data };
    } catch (error) {
      return { success: false, error };
    }
  };

  const updateNote = async (id, updates) => {
    try {
      const oldNote = notes.find(n => n.id === id);
      
      const { data, error } = await supabase
        .from('notes')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;

      // Update tag counts if tags changed
      if (updates.tags && oldNote) {
        const oldTags = oldNote.tags || [];
        const newTags = updates.tags || [];
        
        const removedTags = oldTags.filter(tag => !newTags.includes(tag));
        const addedTags = newTags.filter(tag => !oldTags.includes(tag));
        
        if (removedTags.length > 0) {
          await updateTagCounts(removedTags, 'decrement');
        }
        if (addedTags.length > 0) {
          await updateTagCounts(addedTags, 'increment');
        }
      }

      setNotes(prev => prev.map(note => note.id === id ? data : note));
      return { success: true, data };
    } catch (error) {
      return { success: false, error };
    }
  };

  const deleteNote = async (id) => {
    try {
      const note = notes.find(n => n.id === id);
      
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update tag counts
      if (note && note.tags && note.tags.length > 0) {
        await updateTagCounts(note.tags, 'decrement');
      }

      setNotes(prev => prev.filter(note => note.id !== id));
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const updateTagCounts = async (tags, operation) => {
    try {
      for (const tag of tags) {
        if (operation === 'increment') {
          await supabase.rpc('increment_tag_count', { tag_name: tag });
        } else {
          await supabase.rpc('decrement_tag_count', { tag_name: tag });
        }
      }
    } catch (error) {
      console.error('Error updating tag counts:', error);
    }
  };

  const getNotesGroupedByContext = () => {
    return notes.reduce((acc, note) => {
      const key = note.context_type || 'global';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(note);
      return acc;
    }, {});
  };

  const getNotesWithTag = (tag) => {
    return notes.filter(note => note.tags && note.tags.includes(tag));
  };

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    getNotesGroupedByContext,
    getNotesWithTag
  };
};