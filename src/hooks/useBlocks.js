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

  return {
    blocks,
    loading,
    error,
    createBlock,
    updateBlock,
    deleteBlock,
    assignBlocksToVenture,
    getBlocksByCategory,
    getBlocksByStatus
  };
};