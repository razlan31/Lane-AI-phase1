import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useBlocks = (ventureId = null) => {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlocks = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('blocks')
          .select('*')
          .order('category', { ascending: true })
          .order('name', { ascending: true });

        if (ventureId) {
          query = query.or(`venture_id.eq.${ventureId},venture_id.is.null`);
        } else {
          query = query.is('venture_id', null);
        }

        const { data, error: fetchError } = await query;
        if (fetchError) throw fetchError;

        setBlocks(data || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlocks();
  }, [ventureId]);

  const createBlock = async (blockData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const insert = {
        venture_id: ventureId,
        category: blockData.category,
        name: blockData.name,
        description: blockData.description || null,
        status: blockData.status || 'planned',
        tags: blockData.tags || []
      };

      const { data, error } = await supabase
        .from('blocks')
        .insert(insert)
        .select('*')
        .single();

      if (error) throw error;

      setBlocks(prev => [...prev, data]);
      return { success: true, data };
    } catch (error) {
      return { success: false, error };
    }
  };

  const updateBlock = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('blocks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;

      setBlocks(prev => prev.map(block => block.id === id ? data : block));
      return { success: true, data };
    } catch (error) {
      return { success: false, error };
    }
  };

  const deleteBlock = async (id) => {
    try {
      const { error } = await supabase
        .from('blocks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBlocks(prev => prev.filter(block => block.id !== id));
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const assignBlocksToVenture = async (blockIds, targetVentureId) => {
    try {
      const { error } = await supabase
        .from('blocks')
        .update({ venture_id: targetVentureId })
        .in('id', blockIds);

      if (error) throw error;

      // Refresh blocks
      if (ventureId === targetVentureId) {
        const { data } = await supabase
          .from('blocks')
          .select('*')
          .or(`venture_id.eq.${ventureId},venture_id.is.null`)
          .order('category', { ascending: true })
          .order('name', { ascending: true });
        
        setBlocks(data || []);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const getBlocksByCategory = () => {
    return blocks.reduce((acc, block) => {
      if (!acc[block.category]) {
        acc[block.category] = [];
      }
      acc[block.category].push(block);
      return acc;
    }, {});
  };

  const getBlocksByStatus = (status) => {
    return blocks.filter(block => block.status === status);
  };

  // Enhanced Block Dependencies and Suggestions
  const getBlockDependencies = async (blockId) => {
    try {
      const { data, error } = await supabase
        .from('block_dependencies')
        .select('*')
        .or(`parent_block_id.eq.${blockId},dependent_block_id.eq.${blockId}`);

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    }
  };

  // Generate worksheet suggestions from block combinations
  const generateWorksheetFromBlocks = async (blockIds, ventureId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get the selected blocks
      const selectedBlocks = blocks.filter(block => blockIds.includes(block.id));
      
      if (selectedBlocks.length === 0) return null;

      // Determine worksheet type based on block categories
      const categories = [...new Set(selectedBlocks.map(b => b.category))];
      let worksheetType = 'custom';
      
      if (categories.includes('Financial')) {
        worksheetType = 'financial_model';
      } else if (categories.includes('Marketing')) {
        worksheetType = 'marketing_plan';
      } else if (categories.includes('Risk & Compliance')) {
        worksheetType = 'risk_assessment';
      } else if (categories.includes('Operations')) {
        worksheetType = 'operational_plan';
      }

      // Create worksheet with block references
      const worksheetData = {
        user_id: user.id,
        venture_id: ventureId,
        type: worksheetType,
        inputs: {
          blocks: selectedBlocks.map(b => ({
            id: b.id,
            name: b.name,
            category: b.category,
            status: b.status
          })),
          generated_from: 'blocks',
          block_count: selectedBlocks.length
        },
        outputs: {
          summary: `Worksheet generated from ${selectedBlocks.length} blocks: ${selectedBlocks.map(b => b.name).join(', ')}`,
          categories: categories,
          completion_estimate: Math.round((selectedBlocks.filter(b => b.status === 'complete').length / selectedBlocks.length) * 100)
        },
        confidence_level: 'draft'
      };

      const { data, error } = await supabase
        .from('worksheets')
        .insert(worksheetData)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  // Get suggested blocks based on current selection
  const getSuggestedNextBlocks = async (currentBlockIds) => {
    try {
      if (currentBlockIds.length === 0) return [];

      // Get dependencies for current blocks
      const { data, error } = await supabase
        .from('block_dependencies')
        .select('*')
        .in('parent_block_id', currentBlockIds.map(id => blocks.find(b => b.id === id)?.name))
        .order('strength', { ascending: false });

      if (error) throw error;

      // Find suggested blocks by name
      const suggestedNames = data.map(dep => dep.dependent_block_id);
      const suggested = blocks.filter(block => 
        suggestedNames.includes(block.name) && 
        !currentBlockIds.includes(block.id)
      );

      return suggested.slice(0, 5); // Top 5 suggestions
    } catch (err) {
      setError(err.message);
      return [];
    }
  };

  return {
    blocks,
    loading,
    error,
    createBlock,
    updateBlock,
    deleteBlock,
    assignBlocksToVenture,
    getBlocksByCategory,
    getBlocksByStatus,
    getBlockDependencies,
    generateWorksheetFromBlocks,
    getSuggestedNextBlocks
  };
};