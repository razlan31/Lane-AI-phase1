import React, { useEffect, useState } from "react";
import App from "../../App.jsx";
import AuthPage from "../../pages/AuthPage.jsx";
import { supabase } from "@/integrations/supabase/client";

const AuthGate = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [devBypass, setDevBypass] = useState(false);

  const disableLogMaster = () => {
    localStorage.removeItem('LOG_MASTER');
    setDevBypass(false);
  };

  useEffect(() => {
    console.log('AuthGate: Starting initialization');
    
    try {
      const params = new URLSearchParams(window.location.search);
      console.log('AuthGate: URL params:', params.toString());
      
      if (params.get('logmaster') === '1') {
        console.log('AuthGate: Setting LOG_MASTER from URL');
        localStorage.setItem('LOG_MASTER', '1');
        // Clean URL to avoid leaking the flag
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (e) {
      console.log('AuthGate: Error parsing URL params:', e);
    }

    const isBypass = typeof window !== 'undefined' && (
      localStorage.getItem('LOG_MASTER') === '1' || 
      window.location.hostname === 'localhost' ||
      window.location.hostname.includes('lovable.app')
    );
    console.log('AuthGate: Checking bypass:', isBypass, localStorage.getItem('LOG_MASTER'));
    
    if (isBypass) {
      console.log('AuthGate: Using development bypass');
      setDevBypass(true);
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      
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
    });

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('AuthGate: getSession result:', { session: !!session, error });
      setSession(session);
      setLoading(false);
    }).catch(err => {
      console.error('AuthGate: getSession failed:', err);
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  console.log('AuthGate: Render state - loading:', loading, 'devBypass:', devBypass, 'session:', !!session);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (devBypass) {
    return (
      <>
        <div className="fixed top-2 right-2 z-50 bg-primary/10 text-primary border border-primary/30 rounded-md px-3 py-2 text-xs shadow-sm">
          Log Master override active
          <button className="ml-2 underline" onClick={disableLogMaster}>Disable</button>
        </div>
        <App />
      </>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  return <App />;
};

export default AuthGate;