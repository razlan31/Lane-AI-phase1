import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { sendWelcomeEmail } from '@/lib/email';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let authSubscription = null;

    const initializeAuth = async () => {
      try {
        // Check for existing session first
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }

        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (!isMounted) return;
            
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);

            // Defer any async side-effects to avoid blocking the auth callback
            if (event === 'SIGNED_IN' && session?.user) {
              setTimeout(() => {
                try {
                  const key = `welcomeEmailSent:${session.user.id}`;
                  if (!localStorage.getItem(key)) {
                    const name = session.user.user_metadata?.full_name || session.user.email;
                    // Fire-and-forget welcome email; errors are logged but won't block UX
                    sendWelcomeEmail(session.user.email, name).catch((err) => {
                      console.error('Failed to send welcome email:', err);
                    });
                    localStorage.setItem(key, '1');
                  }
                } catch (e) {
                  console.error('Welcome email side-effect error:', e);
                }
              }, 0);
            }

            // Sample data creation disabled temporarily
            // TODO: Re-enable when create_sample_data_for_user RPC is available
            /*
            if (event === 'SIGNED_IN' && session?.user) {
              setTimeout(async () => {
                try {
                  await supabase.rpc('create_sample_data_for_user', { user_id: session.user.id });
                } catch (error) {
                  console.log('Sample data already exists or error creating:', error.message);
                }
              }, 1000);
            }
            */
          }
        );
        authSubscription = subscription;
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email, password, options = {}) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          ...options,
          emailRedirectTo: redirectUrl
        }
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.error('useAuth called outside of AuthProvider! Component stack:', new Error().stack);
    throw new Error('useAuth must be used within an AuthProvider. Check that your component is wrapped with AuthProvider in index.jsx');
  }
  return context;
};