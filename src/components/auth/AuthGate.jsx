import React, { useEffect, useState } from "react";
import App from "../../App.jsx";
import AuthPage from "../../pages/AuthPage.jsx";
import { supabase } from "@/integrations/supabase/client";

const AuthGate = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  return <App />;
};

export default AuthGate;