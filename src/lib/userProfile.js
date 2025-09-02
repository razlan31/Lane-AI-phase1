import { supabase } from '@/integrations/supabase/client';

export const userProfile = {
  // Get current user profile
  async getProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update profile
  async updateProfile(updates) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Not authenticated' };

      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .maybeSingle();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Mark user as onboarded
  async completeOnboarding(profileData) {
    const updates = {
      ...profileData,
      onboarded: true
    };
    return this.updateProfile(updates);
  },

  // Check if user is onboarded
  async isOnboarded() {
    const { data } = await this.getProfile();
    return data?.onboarded || false;
  }
};

export default userProfile;