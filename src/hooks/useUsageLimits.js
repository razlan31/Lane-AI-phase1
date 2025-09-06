import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCapabilities } from '../utils/capabilities';
import { usePricingTier } from './usePricingTier';

export const useUsageLimits = () => {
  const { profile } = usePricingTier();
  const [venturesCount, setVenturesCount] = useState(0);
  const [scratchpadCount, setScratchpadCount] = useState(0);
  const [aiMessagesUsed, setAiMessagesUsed] = useState(0);
  const [loading, setLoading] = useState(true);

  const capabilities = getCapabilities(profile);

  useEffect(() => {
    if (!profile?.id) return;
    
    const fetchUsage = async () => {
      try {
        // Get ventures count
        const { count: venturesTotal } = await supabase
          .from('ventures')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id);

        // Get scratchpad notes count
        const { count: scratchpadTotal } = await supabase
          .from('scratchpad_notes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id);

        // Get AI messages used this month (from profile)
        const aiUsed = profile.ai_requests_used || 0;

        setVenturesCount(venturesTotal || 0);
        setScratchpadCount(scratchpadTotal || 0);
        setAiMessagesUsed(aiUsed);
      } catch (error) {
        console.error('Error fetching usage:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
  }, [profile]);

  const canCreateVenture = () => {
    if (capabilities.ventures_max === -1) return true; // unlimited
    return venturesCount < capabilities.ventures_max;
  };

  const canCreateScratchpadNote = () => {
    if (capabilities.scratchpad_max_notes === -1) return true; // unlimited
    return scratchpadCount < capabilities.scratchpad_max_notes;
  };

  const canUseAI = () => {
    return aiMessagesUsed < capabilities.ai_messages_monthly_limit;
  };

  const getVenturesLimitMessage = () => {
    if (capabilities.ventures_max === -1) return null;
    return `${venturesCount}/${capabilities.ventures_max} ventures used`;
  };

  const getScratchpadLimitMessage = () => {
    if (capabilities.scratchpad_max_notes === -1) return null;
    return `${scratchpadCount}/${capabilities.scratchpad_max_notes} notes used`;
  };

  const getAILimitMessage = () => {
    return `${aiMessagesUsed}/${capabilities.ai_messages_monthly_limit} AI messages used this month`;
  };

  return {
    loading,
    venturesCount,
    scratchpadCount,
    aiMessagesUsed,
    canCreateVenture,
    canCreateScratchpadNote,
    canUseAI,
    getVenturesLimitMessage,
    getScratchpadLimitMessage,
    getAILimitMessage,
    capabilities
  };
};