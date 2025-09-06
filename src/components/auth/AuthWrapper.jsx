import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import AuthPage from '../../pages/AuthPage';
import ResetPasswordPage from '../../pages/ResetPasswordPage';
import UpgradeModal from '../modals/UpgradeModal';
import { supabase } from '@/integrations/supabase/client';

export const AuthWrapper = ({ children }) => {
  const { user, loading } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeContext, setUpgradeContext] = useState(null);

  // Listen for upgrade modal events
  useEffect(() => {
    const handleShowUpgradeModal = (event) => {
      setUpgradeContext(event.detail);
      setShowUpgradeModal(true);
    };

    window.addEventListener('showUpgradeModal', handleShowUpgradeModal);
    return () => window.removeEventListener('showUpgradeModal', handleShowUpgradeModal);
  }, []);

  // Dev-only seeding: create founder user and auto sign-in once when no user exists
  useEffect(() => {
    const run = async () => {
      const seedKey = 'seed-founder-done';
      try {
        if (loading || user) return;
        if (localStorage.getItem(seedKey) === 'true') return;

        const email = 'razlansalim01@gmail.com';
        const password = '12345@';

        await supabase.functions.invoke('seed-founder', {
          body: { email, password, founder: true },
        });

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error) {
          localStorage.setItem(seedKey, 'true');
        } else {
          console.error('Auto sign-in error:', error);
        }
      } catch (e) {
        console.error('Seed founder error:', e);
      }
    };

    run();
  }, [loading, user]);
  
  const isResetPasswordRoute = typeof window !== 'undefined' && window.location.hash.includes('reset-password');
  if (isResetPasswordRoute) {
    return <ResetPasswordPage />;
  }

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

  if (!user) {
    return <AuthPage />;
  }

  return (
    <>
      {children}
      <UpgradeModal 
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        targetFeature={upgradeContext?.feature}
      />
    </>
  );
};

