import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { stockCalculators, defaultPersonalMetrics } from '@/utils/featureGating';
import { getCapabilities } from '@/utils/capabilities';

export const useStockData = () => {
  const [stockData, setStockData] = useState({
    calculators: stockCalculators,
    personalMetrics: defaultPersonalMetrics
  });
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
          setProfile(profileData);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

  const capabilities = profile ? getCapabilities(profile) : { worksheets_crud: false, personal_crud: false };

  const createCustomWorksheet = async (worksheetData) => {
    if (!capabilities.worksheets_crud) {
      throw new Error('Upgrade required to create custom worksheets');
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('worksheets')
        .insert({
          user_id: user.id,
          type: 'custom',
          ...worksheetData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating worksheet:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addPersonalMetric = async (metricData) => {
    if (!capabilities.personal_crud) {
      throw new Error('Upgrade required to add custom personal metrics');
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update personal table with new metrics
      const { data: existingPersonal } = await supabase
        .from('personal')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const currentMetrics = existingPersonal?.activities || [];
      const updatedMetrics = [...currentMetrics, metricData];

      const { data, error } = await supabase
        .from('personal')
        .upsert({
          user_id: user.id,
          activities: updatedMetrics
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding personal metric:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    stockData,
    loading,
    capabilities,
    createCustomWorksheet,
    addPersonalMetric
  };
};

export default useStockData;