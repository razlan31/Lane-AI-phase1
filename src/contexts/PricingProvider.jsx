import * as React from 'react';
import { usePricingTier } from '@/hooks/usePricingTier';

const PricingContext = React.createContext(null);

export const PricingProvider = ({ children }) => {
  // This calls the hook in a stable provider—no direct calls from modal components.
  const pricing = usePricingTier();

  return (
    <PricingContext.Provider value={pricing}>
      {children}
    </PricingContext.Provider>
  );
};

export const usePricing = () => {
  const ctx = React.useContext(PricingContext);
  if (ctx === null) {
    // Provide a clear error for debugging if used outside provider
    throw new Error('usePricing must be used within a <PricingProvider/>');
  }
  return ctx;
};

export default PricingProvider;