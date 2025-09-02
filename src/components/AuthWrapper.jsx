import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AuthPage from './AuthPage';
import App from './App';

const AuthWrapper = () => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Create sample data for new users
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(async () => {
            try {
              // Check if user already has data
              const { data: existingVentures } = await supabase
                .from('ventures')
                .select('id')
                .eq('user_id', session.user.id)
                .limit(1);
              
              // If no ventures exist, create sample data
              if (!existingVentures || existingVentures.length === 0) {
                await supabase.rpc('create_sample_data_for_user', { 
                  user_id: session.user.id 
                });
              }
            } catch (error) {
              console.error('Error creating sample data:', error);
            }
          }, 1000);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check for demo mode or log master bypass
  const isLogMaster = typeof window !== 'undefined' && localStorage.getItem('LOG_MASTER') === '1';
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Lane AI...</p>
        </div>
      </div>
    );
  }

  // Show main app if authenticated or in bypass mode
  if (session || isLogMaster) {
    return <App />;
  }

  // Show auth page
  return <AuthPage />;
};

export default AuthWrapper;