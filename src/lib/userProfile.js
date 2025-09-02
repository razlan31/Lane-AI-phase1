// User profile management with Supabase stub
import { supabase } from '@/integrations/supabase/client';

// Mock user state for prototype
let mockUser = {
  id: 'user-1',
  profile: {
    onboarded: false,
    role: null,
    venture_basics: null,
    founder_dna: null,
    default_mode: 'workspace'
  }
};

export const userProfile = {
  // Get current user profile
  async getProfile() {
    // TODO: Replace with actual Supabase call
    // const { data, error } = await supabase.from('profiles').select('*').single();
    return { data: mockUser.profile, error: null };
  },

  // Update profile
  async updateProfile(updates) {
    // TODO: Replace with actual Supabase call
    // const { data, error } = await supabase.from('profiles').update(updates).single();
    mockUser.profile = { ...mockUser.profile, ...updates };
    return { data: mockUser.profile, error: null };
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