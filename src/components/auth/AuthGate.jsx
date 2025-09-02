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

    const isBypass = typeof window !== 'undefined' && localStorage.getItem('LOG_MASTER') === '1';
    console.log('AuthGate: Checking bypass:', isBypass, localStorage.getItem('LOG_MASTER'));
    
    if (isBypass) {
      console.log('AuthGate: Using log master bypass');
      setDevBypass(true);
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

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