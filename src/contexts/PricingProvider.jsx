import * as React from 'react';
import { useContext } from 'react';
import { usePricingTier } from '@/hooks/usePricingTier';

const PricingContext = React.createContext(null);

export const PricingProvider = ({ children }) => {
  try {
    const pricing = usePricingTier();
    
    return (
      <PricingContext.Provider value={pricing}>
        {children}
      </PricingContext.Provider>
    );
  } catch (error) {
    return (
      <PricingContext.Provider value={{ tier: 'free', loading: true, isFounder: false }}>
        {children}
      </PricingContext.Provider>
    );
  }
};

export const usePricing = () => {
  try {
    const ctx = useContext(PricingContext);
    
    if (ctx === null) {
      return {
        tier: 'free',
        loading: true,
        user: null,
        profile: null,
        hasFeature: () => false,
        canAccessVentures: () => false,
        isAuthenticated: false,
        isFounder: false
      };
    }
    return ctx;
  } catch (error) {
    throw error;
  }
};

export default PricingProvider;