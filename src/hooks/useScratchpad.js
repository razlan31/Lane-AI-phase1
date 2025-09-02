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

  // Enhanced AI suggestion helpers (tool_* IDs)
  const suggestTools = (noteText) => {
    const text = noteText.toLowerCase();
    const suggestions = [];

    // Finance
    if (text.includes('roi') || text.includes('return') || text.includes('investment')) {
      suggestions.push({ toolId: 'tool_roi_calc', reason: 'Calculate return on investment', confidence: 0.9 });
    }
    if (text.includes('runway') || text.includes('cash') || text.includes('burn')) {
      suggestions.push({ toolId: 'tool_runway_calc', reason: 'Analyze cash runway', confidence: 0.85 });
    }
    if (text.includes('break') && text.includes('even')) {
      suggestions.push({ toolId: 'tool_breakeven_calc', reason: 'Find break-even point', confidence: 0.82 });
    }
    if (text.includes('valuation') || text.includes('worth') || text.includes('multiple')) {
      suggestions.push({ toolId: 'tool_valuation_est', reason: 'Estimate company valuation', confidence: 0.78 });
    }

    // Marketing
    if (text.includes('cac') || (text.includes('acquisition') && text.includes('cost'))) {
      suggestions.push({ toolId: 'tool_cac_calc', reason: 'Calculate customer acquisition cost', confidence: 0.88 });
    }
    if (text.includes('ltv') || (text.includes('lifetime') && text.includes('value'))) {
      suggestions.push({ toolId: 'tool_ltv_calc', reason: 'Estimate customer lifetime value', confidence: 0.84 });
    }
    if (text.includes('funnel') || text.includes('conversion')) {
      suggestions.push({ toolId: 'tool_funnel_dropoff', reason: 'Analyze funnel drop-off', confidence: 0.8 });
    }
    if (text.includes('roas') || (text.includes('ad') && text.includes('spend'))) {
      suggestions.push({ toolId: 'tool_roas_calc', reason: 'Compute ROAS', confidence: 0.78 });
    }

    // Risk
    if (text.includes('sensitivity') || text.includes('variation') || text.includes('range')) {
      suggestions.push({ toolId: 'tool_sensitivity', reason: 'Run sensitivity analysis', confidence: 0.75 });
    }
    if (text.includes('concentration') || text.includes('herfindahl') || text.includes('distribution')) {
      suggestions.push({ toolId: 'tool_concentration_risk', reason: 'Assess concentration risk', confidence: 0.72 });
    }
    if (text.includes('portfolio') || text.includes('diversification') || text.includes('variance')) {
      suggestions.push({ toolId: 'tool_portfolio_diversification', reason: 'Measure diversification', confidence: 0.72 });
    }

    // Personal
    if ((text.includes('savings') && text.includes('expenses')) || text.includes('personal runway')) {
      suggestions.push({ toolId: 'tool_personal_runway', reason: 'Personal runway calculator', confidence: 0.8 });
    }
    if (text.includes('work hours') || text.includes('personal hours') || text.includes('balance')) {
      suggestions.push({ toolId: 'tool_workload_balance', reason: 'Assess workload balance', confidence: 0.7 });
    }
    if (text.includes('burnout') || text.includes('stress')) {
      suggestions.push({ toolId: 'tool_burnout_risk', reason: 'Estimate burnout risk', confidence: 0.72 });
    }

    // Growth
    if (text.includes('viral') || text.includes('k-factor') || text.includes('invitation')) {
      suggestions.push({ toolId: 'tool_viral_coeff', reason: 'Compute viral coefficient', confidence: 0.74 });
    }
    if (text.includes('pipeline') || text.includes('win rate') || text.includes('sales cycle')) {
      suggestions.push({ toolId: 'tool_pipeline_velocity', reason: 'Calculate pipeline velocity', confidence: 0.74 });
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