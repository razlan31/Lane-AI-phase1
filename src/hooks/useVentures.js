import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const VenturesContext = createContext();

export const VenturesProvider = ({ children }) => {
  const [ventures, setVentures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setVentures([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const abortController = new AbortController();

    const fetchVentures = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data: venturesData, error: venturesError } = await supabase
          .from('ventures')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .abortSignal(abortController.signal);
          
        if (venturesError) throw venturesError;

        const ventureIds = (venturesData ?? []).map(v => v.id);
        let kpisByVenture = {};
        
        if (ventureIds.length > 0 && !abortController.signal.aborted) {
          const { data: kpisData, error: kpisError } = await supabase
            .from('kpis')
            .select('id, venture_id, name, value, confidence, created_at')
            .in('venture_id', ventureIds)
            .abortSignal(abortController.signal);
            
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

        if (isMounted && !abortController.signal.aborted) {
          setVentures(normalized);
          setError(null);
        }
      } catch (err) {
        if (!abortController.signal.aborted && isMounted) {
          console.error('Ventures fetch error:', err);
          setError(err);
        }
      } finally {
        if (isMounted && !abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchVentures();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [user]);

  const createVenture = async (ventureData) => {
    if (!user) {
      return { success: false, error: new Error('Not authenticated') };
    }

    try {
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
      
      const newVenture = { 
        ...data, 
        status: data.stage ? 'active' : 'draft', 
        kpis: [] 
      };
      
      setVentures(prev => [newVenture, ...prev]);
      return { success: true, data: newVenture };
    } catch (error) {
      console.error('Create venture error:', error);
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
      console.error('Update venture error:', error);
      return { success: false, error };
    }
  };

  const value = {
    ventures,
    loading,
    error,
    createVenture,
    updateVenture
  };

  return (
    <VenturesContext.Provider value={value}>
      {children}
    </VenturesContext.Provider>
  );
};

export const useVentures = () => {
  const context = useContext(VenturesContext);
  if (!context) {
    throw new Error('useVentures must be used within a VenturesProvider');
  }
  return context;
};