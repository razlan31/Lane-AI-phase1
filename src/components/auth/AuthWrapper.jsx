import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import AuthPage from '../../pages/AuthPage';
import UpgradeModal from '../modals/UpgradeModal';

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

