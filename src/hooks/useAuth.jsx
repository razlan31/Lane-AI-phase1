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
        // Set up auth state listener FIRST to avoid missing events
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (!isMounted) return;
            
            console.log('Auth state change:', event, session?.user?.id);
            
            // Update state synchronously to prevent loops
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);

            // Handle sign-in side effects with setTimeout to avoid blocking
            if (event === 'SIGNED_IN' && session?.user) {
              setTimeout(() => {
                try {
                  const key = `welcomeEmailSent:${session.user.id}`;
                  if (!localStorage.getItem(key)) {
                    const name = session.user.user_metadata?.full_name || session.user.email;
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

            // Clear session data on sign out
            if (event === 'SIGNED_OUT') {
              localStorage.removeItem('supabase.auth.token');
              // Clear any cached user data
              setTimeout(() => {
                window.location.reload();
              }, 100);
            }
          }
        );
        authSubscription = subscription;

        // THEN check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (isMounted) {
          setSession(null);
          setUser(null);
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
  }, []); // Empty dependency array to prevent re-initialization

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
      // Clear local storage first
      localStorage.removeItem('supabase.auth.token');
      
      const { error } = await supabase.auth.signOut();
      
      // Force clear state even if there's an error
      setSession(null);
      setUser(null);
      
      return { error };
    } catch (error) {
      // Still clear local state on error
      setSession(null);
      setUser(null);
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