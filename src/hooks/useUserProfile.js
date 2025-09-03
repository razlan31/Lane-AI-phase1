import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let authSubscription = null;
    const abortController = new AbortController();

    const load = async () => {
      if (!isMounted) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !isMounted) { 
          setProfile(null); 
          setLoading(false);
          return; 
        }
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()
          .abortSignal(abortController.signal);
          
        if (error) throw error;
        
        if (isMounted && !abortController.signal.aborted) {
          setProfile(data ?? null);
        }
      } catch (err) {
        if (!abortController.signal.aborted && isMounted) {
          console.error('Profile load error:', err);
          setError(err);
        }
      } finally {
        if (isMounted && !abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    load();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      if (isMounted) {
        setTimeout(load, 100); // Small delay to prevent rapid calls
      }
    });
    authSubscription = subscription;

    return () => { 
      isMounted = false;
      abortController.abort();
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
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
      
      // Remove any fields that don't exist in the profiles table
      const { skipped, ...validUpdates } = updates;
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...validUpdates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .maybeSingle();
        
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return { updateProfile, loading };
};