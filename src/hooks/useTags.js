import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useTags = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('tags')
          .select('*')
          .order('count', { ascending: false })
          .order('name', { ascending: true });

        if (fetchError) throw fetchError;

        setTags(data || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  const createTag = async (name) => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .upsert({ name, count: 1 }, { onConflict: 'name' })
        .select('*')
        .single();

      if (error) throw error;

      setTags(prev => {
        const existing = prev.find(t => t.name === name);
        if (existing) {
          return prev.map(t => t.name === name ? { ...t, count: t.count + 1 } : t);
        } else {
          return [...prev, data];
        }
      });

      return { success: true, data };
    } catch (error) {
      return { success: false, error };
    }
  };

  const getTagSuggestions = (input) => {
    if (!input) return [];
    
    return tags
      .filter(tag => tag.name.toLowerCase().includes(input.toLowerCase()))
      .slice(0, 10)
      .map(tag => tag.name);
  };

  const getPopularTags = (limit = 20) => {
    return tags
      .filter(tag => tag.count > 0)
      .slice(0, limit)
      .map(tag => tag.name);
  };

  return {
    tags,
    loading,
    error,
    createTag,
    getTagSuggestions,
    getPopularTags
  };
};