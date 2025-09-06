import { useState, useEffect } from 'react';
import UpgradeModal from '../modals/UpgradeModal';

const GlobalUpgradeHandler = () => {
  const [showModal, setShowModal] = useState(false);
  const [targetFeature, setTargetFeature] = useState(null);

  useEffect(() => {
    const handleShowUpgradeModal = (event) => {
      setTargetFeature(event.detail?.feature || null);
      setShowModal(true);
    };

    window.addEventListener('showUpgradeModal', handleShowUpgradeModal);
    
    return () => {
      window.removeEventListener('showUpgradeModal', handleShowUpgradeModal);
    };
  }, []);

  return (
    <UpgradeModal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      targetFeature={targetFeature}
    />
  );
};

export default GlobalUpgradeHandler;