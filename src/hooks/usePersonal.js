import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePersonal = () => {
  const [personal, setPersonal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPersonal = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setPersonal(null);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('personal')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError;
        }

        setPersonal(data || null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonal();
  }, []);

  const createOrUpdatePersonal = async (personalData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const upsertData = {
        user_id: user.id,
        ...personalData,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('personal')
        .upsert(upsertData)
        .select('*')
        .single();

      if (error) throw error;

      setPersonal(data);
      return { success: true, data };
    } catch (error) {
      return { success: false, error };
    }
  };

  const generatePersonalKPIs = () => {
    if (!personal) return [];

    const kpis = [
      {
        title: 'Personal Savings',
        value: personal.savings || 0,
        unit: 'currency',
        trend: 0,
        trendDirection: 'neutral',
        confidence: 'real'
      },
      {
        title: 'Monthly Burn',
        value: personal.monthly_burn || 0,
        unit: 'currency',
        trend: 0,
        trendDirection: 'down',
        confidence: 'real'
      },
      {
        title: 'Available Hours',
        value: personal.work_hours || 40,
        unit: 'hours',
        trend: 0,
        trendDirection: 'neutral',
        confidence: 'real'
      },
      {
        title: 'Work-Life Balance',
        value: calculateWorkLifeBalance(personal),
        unit: 'score',
        trend: 0,
        trendDirection: 'neutral',
        confidence: 'estimate'
      },
      {
        title: 'Commitments Count',
        value: personal.commitments?.length || 0,
        unit: 'count',
        trend: 0,
        trendDirection: 'neutral',
        confidence: 'real'
      },
      {
        title: 'Personal Runway',
        value: calculatePersonalRunway(personal),
        unit: 'months',
        trend: 0,
        trendDirection: 'neutral',
        confidence: 'estimate'
      }
    ];

    return kpis;
  };

  const calculateWorkLifeBalance = (personalData) => {
    if (!personalData.work_hours) return 50;
    
    const totalHours = 168; // Hours in a week
    const workRatio = personalData.work_hours / totalHours;
    const balance = Math.max(0, Math.min(100, (1 - workRatio) * 100));
    
    return Math.round(balance);
  };

  const calculatePersonalRunway = (personalData) => {
    if (!personalData.savings || !personalData.monthly_burn) return 0;
    
    return Math.round(personalData.savings / personalData.monthly_burn);
  };

  return {
    personal,
    loading,
    error,
    createOrUpdatePersonal,
    generatePersonalKPIs
  };
};