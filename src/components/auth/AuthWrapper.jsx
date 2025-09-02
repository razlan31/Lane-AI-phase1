import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AuthPage from '../pages/AuthPage';
import App from '../App';
import { useToast } from '@/hooks/use-toast';

const AuthWrapper = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const setupAuth = async () => {
      try {
        // Set up auth state listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;
            
            setSession(session);
            setUser(session?.user ?? null);
            
            // Handle user sign-in events
            if (event === 'SIGNED_IN' && session?.user) {
              // Create profile if it doesn't exist
              setTimeout(async () => {
                try {
                  const { data: existingProfile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('id', session.user.id)
                    .maybeSingle();
                  
                  if (!existingProfile) {
                    await supabase
                      .from('profiles')
                      .insert({
                        id: session.user.id,
                        email: session.user.email,
                        full_name: session.user.user_metadata?.full_name || null
                      });
                  }
                  
                  // Create sample data only for new users
                  const { data: existingVentures } = await supabase
                    .from('ventures')
                    .select('id')
                    .eq('user_id', session.user.id)
                    .limit(1);
                  
                  if (!existingVentures || existingVentures.length === 0) {
                    await supabase.rpc('create_sample_data_for_user', { 
                      user_id: session.user.id 
                    });
                    
                    if (mounted) {
                      toast({
                        title: "Welcome to Lane AI!",
                        description: "Sample data has been created to get you started."
                      });
                    }
                  }
                } catch (error) {
                  console.error('Error setting up user data:', error);
                }
              }, 1000);
            }
            
            setLoading(false);
          }
        );

        // THEN check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }

        return () => {
          mounted = false;
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth setup error:', error);
        if (mounted) setLoading(false);
      }
    };

    setupAuth();

    return () => {
      mounted = false;
    };
  }, [toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing Lane AI...</p>
        </div>
      </div>
    );
  }

  // Show main app if authenticated
  if (session && user) {
    return <App />;
  }

  // Show auth page for unauthenticated users
  return <AuthPage />;
};

export default AuthWrapper;