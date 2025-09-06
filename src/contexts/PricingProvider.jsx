import * as React from 'react';
import { useContext } from 'react';
import { usePricingTier } from '@/hooks/usePricingTier';

console.log('🔍 PricingProvider loading - React context available?', { 
  createContext: !!React.createContext, 
  useContext: !!useContext,
  timestamp: new Date().toISOString()
});

const PricingContext = React.createContext(null);

export const PricingProvider = ({ children }) => {
  console.log('🔍 PricingProvider rendering - about to call usePricingTier');
  
  try {
    // This calls the hook in a stable provider—no direct calls from modal components.
    const pricing = usePricingTier();
    
    console.log('🔍 PricingProvider - usePricingTier success, pricing:', !!pricing);
    
    return (
      <PricingContext.Provider value={pricing}>
        {children}
      </PricingContext.Provider>
    );
  } catch (error) {
    console.error('🔍 PricingProvider - ERROR calling usePricingTier:', error);
    
    // Fallback: provide null pricing to prevent crashes
    return (
      <PricingContext.Provider value={null}>
        {children}
      </PricingContext.Provider>
    );
  }

};

export const usePricing = () => {
  console.log('🔍 usePricing called - checking context');
  
  try {
    const ctx = useContext(PricingContext);
    console.log('🔍 usePricing - context value:', !!ctx);
    
    if (ctx === null) {
      // Return safe fallback instead of throwing during startup
      console.warn('🔍 usePricing - no context available, returning fallback');
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
    console.error('🔍 usePricing - ERROR:', error);
    throw error;
  }
};

export default PricingProvider;