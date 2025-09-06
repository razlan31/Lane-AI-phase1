import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { scratchpadAI } from '@/utils/scratchpadAI';
import { getCapabilities } from '@/utils/capabilities';
import { useToast } from '@/hooks/use-toast';

export const useScratchpad = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiReflectionLoading, setAiReflectionLoading] = useState(false);
  const { toast } = useToast();

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
    if (!noteText) return [];

    const keywords = {
      'roi': { tool: 'tool_roi_calc', confidence: 0.9, trigger: 'ROI calculation needed' },
      'return on investment': { tool: 'tool_roi_calc', confidence: 0.95, trigger: 'ROI analysis required' },
      'runway': { tool: 'tool_runway_calc', confidence: 0.9, trigger: 'Cash runway analysis' },
      'burn rate': { tool: 'tool_runway_calc', confidence: 0.85, trigger: 'Burn rate planning' },
      'cash': { tool: 'tool_cashflow_proj', confidence: 0.8, trigger: 'Cash flow planning' },
      'cashflow': { tool: 'tool_cashflow_proj', confidence: 0.95, trigger: 'Cash flow modeling' },
      'cac': { tool: 'tool_cac_calc', confidence: 0.9, trigger: 'Customer acquisition cost analysis' },
      'customer acquisition': { tool: 'tool_cac_calc', confidence: 0.85, trigger: 'CAC optimization' },
      'ltv': { tool: 'tool_ltv_calc', confidence: 0.9, trigger: 'Lifetime value calculation' },
      'lifetime value': { tool: 'tool_ltv_calc', confidence: 0.85, trigger: 'LTV analysis' },
      'retention': { tool: 'tool_ltv_calc', confidence: 0.75, trigger: 'Customer retention impact' },
      'breakeven': { tool: 'tool_breakeven_calc', confidence: 0.9, trigger: 'Break-even analysis' },
      'break even': { tool: 'tool_breakeven_calc', confidence: 0.9, trigger: 'Break-even planning' },
      'fixed costs': { tool: 'tool_breakeven_calc', confidence: 0.8, trigger: 'Cost structure analysis' },
      'valuation': { tool: 'tool_valuation_est', confidence: 0.8, trigger: 'Business valuation' },
      'pricing': { tool: 'tool_funnel_dropoff', confidence: 0.7, trigger: 'Pricing optimization' },
      'funnel': { tool: 'tool_funnel_dropoff', confidence: 0.9, trigger: 'Conversion funnel analysis' },
      'conversion': { tool: 'tool_funnel_dropoff', confidence: 0.8, trigger: 'Conversion optimization' },
      'marketing spend': { tool: 'tool_roas_calc', confidence: 0.85, trigger: 'Marketing ROI analysis' },
      'ad spend': { tool: 'tool_roas_calc', confidence: 0.9, trigger: 'Advertising effectiveness' },
      'personal expenses': { tool: 'tool_personal_runway', confidence: 0.8, trigger: 'Personal runway planning' },
      'savings': { tool: 'tool_personal_runway', confidence: 0.75, trigger: 'Personal financial planning' },
      'work hours': { tool: 'tool_workload_balance', confidence: 0.8, trigger: 'Work-life balance analysis' },
      'stress': { tool: 'tool_burnout_risk', confidence: 0.85, trigger: 'Burnout risk assessment' },
      'risk': { tool: 'tool_sensitivity', confidence: 0.7, trigger: 'Risk analysis' },
      'portfolio': { tool: 'tool_portfolio_diversification', confidence: 0.8, trigger: 'Portfolio analysis' }
    };

    const text = noteText.toLowerCase();
    const suggestions = [];

    Object.entries(keywords).forEach(([keyword, { tool, confidence, trigger }]) => {
      if (text.includes(keyword)) {
        suggestions.push({ tool, confidence, keyword, trigger });
      }
    });

    // Return top 3 suggestions sorted by confidence
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
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

  // AI Reflection capabilities for paid users
  const reflectOnNote = async (noteText, noteId = null) => {
    try {
      setAiReflectionLoading(true);
      
      // Check user capabilities
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('plan, subscription_plan, is_founder')
        .eq('id', user.id)
        .maybeSingle();

      const capabilities = getCapabilities(profile);
      
      if (!capabilities.scratchpad_reflect_ai) {
        toast({
          title: "Upgrade Required",
          description: "AI reflection is available with paid plans. Get intelligent tagging and conversion suggestions!",
          variant: "destructive"
        });
        return null;
      }

      // Get existing KPIs for context
      const { data: kpis } = await supabase
        .from('kpis')
        .select('name, id')
        .limit(20);

      const existingTags = [...new Set(notes.flatMap(note => note.tags || []))];

      const result = await scratchpadAI.reflectOnNote(noteText, kpis || [], existingTags);
      
      if (result.error) {
        throw new Error(result.error);
      }

      // Auto-apply suggested tags to the note if noteId provided
      if (noteId && result.analysis?.suggestedTags) {
        const currentNote = notes.find(n => n.id === noteId);
        if (currentNote) {
          const newTags = [...new Set([...currentNote.tags, ...result.analysis.suggestedTags])];
          await updateNote(noteId, { tags: newTags });
        }
      }

      toast({
        title: "AI Reflection Complete",
        description: "Found insights and suggestions for your note!",
      });

      return result.analysis;
    } catch (err) {
      console.error('AI reflection error:', err);
      toast({
        title: "Reflection Failed",
        description: err.message || "Could not analyze note",
        variant: "destructive"
      });
      return null;
    } finally {
      setAiReflectionLoading(false);
    }
  };

  const analyzeAllNotesForPatterns = async () => {
    try {
      setAiReflectionLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('plan, subscription_plan, is_founder')
        .eq('id', user.id)
        .maybeSingle();

      const capabilities = getCapabilities(profile);
      
      if (!capabilities.scratchpad_reflect_ai) {
        toast({
          title: "Upgrade Required", 
          description: "Pattern analysis requires a paid plan!",
          variant: "destructive"
        });
        return null;
      }

      // Get existing KPIs for context
      const { data: kpis } = await supabase
        .from('kpis')
        .select('name, id')
        .limit(20);

      const result = await scratchpadAI.analyzeNotesForPatterns(notes, kpis || []);
      
      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Pattern Analysis Complete",
        description: "Discovered patterns across your notes!",
      });

      return result.analysis;
    } catch (err) {
      console.error('Pattern analysis error:', err);
      toast({
        title: "Analysis Failed",
        description: err.message || "Could not analyze patterns",
        variant: "destructive"
      });
      return null;
    } finally {
      setAiReflectionLoading(false);
    }
  };

  const suggestConversions = async (noteText) => {
    try {
      setAiReflectionLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('plan, subscription_plan, is_founder')
        .eq('id', user.id)
        .maybeSingle();

      const capabilities = getCapabilities(profile);
      
      if (!capabilities.scratchpad_reflect_ai) {
        toast({
          title: "Upgrade Required",
          description: "Conversion suggestions require a paid plan!",
          variant: "destructive" 
        });
        return null;
      }

      const result = await scratchpadAI.suggestConversions(noteText);
      
      if (result.error) {
        throw new Error(result.error);
      }

      return result.analysis;
    } catch (err) {
      console.error('Conversion suggestions error:', err);
      toast({
        title: "Conversion Failed",
        description: err.message || "Could not suggest conversions",
        variant: "destructive"
      });
      return null;
    } finally {
      setAiReflectionLoading(false);
    }
  };

  return {
    notes,
    loading,
    error,
    aiReflectionLoading,
    createNote,
    updateNote,
    deleteNote,
    linkToContext,
    convertToVentureNote,
    suggestTools,
    searchNotes,
    filterByTag,
    // AI Reflection features (paid only)
    reflectOnNote,
    analyzeAllNotesForPatterns,
    suggestConversions
  };
};