import React, { useState, useEffect } from 'react';
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

  // Enhanced AI suggestion helpers
  const suggestTools = (noteText) => {
    // Enhanced pattern detection for tool suggestions
    const text = noteText.toLowerCase();
    const suggestions = [];

    // Financial patterns
    if (text.includes('roi') || text.includes('return') || text.includes('investment')) {
      suggestions.push({ toolId: 'roi_calculator', reason: 'Calculate return on investment', confidence: 0.9 });
    }
    if (text.includes('runway') || text.includes('cash') || text.includes('burn')) {
      suggestions.push({ toolId: 'runway_calculator', reason: 'Analyze cash runway', confidence: 0.85 });
    }
    if (text.includes('break') && text.includes('even')) {
      suggestions.push({ toolId: 'breakeven_calculator', reason: 'Calculate break-even point', confidence: 0.8 });
    }
    if (text.includes('valuation') || text.includes('value') || text.includes('worth')) {
      suggestions.push({ toolId: 'valuation_calculator', reason: 'Calculate company valuation', confidence: 0.75 });
    }

    // Marketing patterns  
    if (text.includes('customer') && (text.includes('acquisition') || text.includes('cost') || text.includes('cac'))) {
      suggestions.push({ toolId: 'cac_calculator', reason: 'Calculate customer acquisition cost', confidence: 0.9 });
    }
    if (text.includes('lifetime') && text.includes('value') || text.includes('ltv')) {
      suggestions.push({ toolId: 'ltv_calculator', reason: 'Calculate customer lifetime value', confidence: 0.85 });
    }
    if (text.includes('conversion') || text.includes('funnel')) {
      suggestions.push({ toolId: 'conversion_optimizer', reason: 'Optimize conversion rates', confidence: 0.8 });
    }
    if (text.includes('market') && text.includes('size') || text.includes('tam') || text.includes('sam')) {
      suggestions.push({ toolId: 'market_sizer', reason: 'Calculate market size', confidence: 0.8 });
    }

    // Operations patterns
    if (text.includes('capacity') || text.includes('scale') || text.includes('growth')) {
      suggestions.push({ toolId: 'capacity_planner', reason: 'Plan operational capacity', confidence: 0.7 });
    }
    if (text.includes('inventory') || text.includes('stock')) {
      suggestions.push({ toolId: 'inventory_optimizer', reason: 'Optimize inventory levels', confidence: 0.75 });
    }
    if (text.includes('process') || text.includes('efficiency')) {
      suggestions.push({ toolId: 'process_optimizer', reason: 'Analyze process efficiency', confidence: 0.7 });
    }
    if (text.includes('risk') || text.includes('threat')) {
      suggestions.push({ toolId: 'risk_assessor', reason: 'Assess business risks', confidence: 0.75 });
    }

    // Strategy patterns
    if (text.includes('scenario') || text.includes('planning')) {
      suggestions.push({ toolId: 'scenario_planner', reason: 'Model business scenarios', confidence: 0.7 });
    }
    if (text.includes('competitor') || text.includes('competition')) {
      suggestions.push({ toolId: 'competitive_analyzer', reason: 'Analyze competitive landscape', confidence: 0.8 });
    }
    if (text.includes('swot') || text.includes('strength') || text.includes('weakness')) {
      suggestions.push({ toolId: 'swot_analyzer', reason: 'Conduct SWOT analysis', confidence: 0.85 });
    }
    if (text.includes('goal') || text.includes('objective') || text.includes('kpi')) {
      suggestions.push({ toolId: 'goal_tracker', reason: 'Track strategic goals', confidence: 0.75 });
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
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