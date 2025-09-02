import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setProfile(null); return; }
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        if (error) throw error;
        setProfile(data ?? null);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      setTimeout(load, 0);
    });

    return () => { cancelled = true; subscription.unsubscribe(); };
  }, []);

  return { profile, loading, error, setProfile };
};

export const useUpdateProfile = () => {
  const [loading, setLoading] = useState(false);

  const updateProfile = async (updates) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .maybeSingle();
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return { updateProfile, loading };
};