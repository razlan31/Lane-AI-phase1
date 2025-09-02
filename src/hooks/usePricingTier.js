import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// Mock pricing tier hook - replace with real Supabase query
export const usePricingTier = () => {
  const [tier, setTier] = useState('free'); // 'free' | 'pro' | 'enterprise'
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          // TODO: Replace with actual Supabase query to get user's subscription
          // const { data: subscription } = await supabase
          //   .from('subscriptions')
          //   .select('tier')
          //   .eq('user_id', user.id)
          //   .single();
          
          // For now, mock the tier based on user email or default to free
          const mockTier = user.email?.includes('pro') ? 'pro' : 'free';
          setTier(mockTier);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
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
    if (tier === 'free') return count <= 1;
    return true; // Pro and Enterprise have unlimited
  };

  return {
    tier,
    loading,
    user,
    hasFeature,
    canAccessVentures,
    isAuthenticated: !!user
  };
};