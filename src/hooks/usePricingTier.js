import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Mock pricing tier hook - replace with real Supabase query
export const usePricingTier = () => {
  const [tier, setTier] = useState('free'); // 'free' | 'pro' | 'enterprise'
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          // Fetch user profile to check founder status and subscription
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
          
          setProfile(profileData);
          
          // Set tier based on profile.plan if available, else subscription_plan
          const plan = profileData?.plan || profileData?.subscription_plan || 'free';
          setTier(plan);
          
          // Auto-refresh subscription status
          setTimeout(() => {
            refreshSubscriptionStatus();
          }, 0);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    const refreshSubscriptionStatus = async () => {
      try {
        await supabase.functions.invoke('check-subscription');
        // Refetch profile after subscription check
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
          setProfile(profileData);
          setTier(profileData?.subscription_plan || 'free');
        }
      } catch (error) {
        console.error('Error refreshing subscription:', error);
      }
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const hasFeature = (featureName) => {
    // Founder accounts have access to all features
    if (profile?.is_founder) {
      return true;
    }

    const features = {
      free: ['basic_dashboard', 'single_venture', 'core_worksheets'],
      pro: [
        'basic_dashboard', 'single_venture', 'core_worksheets',
        'unlimited_ventures', 'advanced_worksheets', 'ai_chat', 'reports', 'founder_mode'
      ],
      enterprise: [
        'basic_dashboard', 'single_venture', 'core_worksheets',
        'unlimited_ventures', 'advanced_worksheets', 'ai_chat', 'reports', 'founder_mode',
        'collaboration', 'admin_roles', 'custom_integrations'
      ]
    };

    return features[tier]?.includes(featureName) || false;
  };

  const canAccessVentures = (count) => {
    // Founder accounts have unlimited access
    if (profile?.is_founder) {
      return true;
    }
    
    if (tier === 'free') return count <= 1;
    return true; // Pro and Enterprise have unlimited
  };

  return {
    tier,
    loading,
    user,
    profile,
    hasFeature,
    canAccessVentures,
    isAuthenticated: !!user,
    isFounder: profile?.is_founder || false
  };
};