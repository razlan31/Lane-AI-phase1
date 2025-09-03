import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Supabase-ready hook for ventures management
export const useVentures = () => {
  const [ventures, setVentures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVentures = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setVentures([]); return; }

        const { data: venturesData, error: venturesError } = await supabase
          .from('ventures')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (venturesError) throw venturesError;

        const ventureIds = (venturesData ?? []).map(v => v.id);
        let kpisByVenture = {};
        if (ventureIds.length > 0) {
          const { data: kpisData, error: kpisError } = await supabase
            .from('kpis')
            .select('id, venture_id, name, value, confidence, created_at')
            .in('venture_id', ventureIds);
          if (kpisError) throw kpisError;
          kpisByVenture = (kpisData ?? []).reduce((acc, k) => {
            acc[k.venture_id] = acc[k.venture_id] || [];
            acc[k.venture_id].push({
              title: k.name,
              value: k.value,
              unit: 'number',
              trend: 0,
              trendDirection: 'up'
            });
            return acc;
          }, {});
        }

        const normalized = (venturesData ?? []).map(v => ({
          ...v,
          status: v.stage ? 'active' : 'draft',
          kpis: kpisByVenture[v.id] || []
        }));

        setVentures(normalized);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVentures();
  }, []);

  const createVenture = async (ventureData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const insert = {
        user_id: user.id,
        name: ventureData.name,
        description: ventureData.description || null,
        type: ventureData.type || null,
        stage: ventureData.stage || null
      };
      const { data, error } = await supabase
        .from('ventures')
        .insert(insert)
        .select('*')
        .maybeSingle();
      if (error) throw error;
      const newVenture = { ...data, status: data.stage ? 'active' : 'draft', kpis: [] };
      setVentures(prev => [newVenture, ...prev]);
      return { success: true, data: newVenture };
    } catch (error) {
      return { success: false, error };
    }
  };

  const updateVenture = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('ventures')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .maybeSingle();
      if (error) throw error;
      setVentures(prev => prev.map(v => v.id === id ? { ...v, ...data } : v));
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  return { ventures, loading, createVenture, updateVenture };
};