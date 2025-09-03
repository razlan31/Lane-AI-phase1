import React, { createContext, useContext } from 'react';
import { useAICopilotStore as useZustandStore } from './useAICopilotStore.js';

const AICopilotContext = createContext();

export const AICopilotProvider = ({ children }) => {
  // Zustand store doesn't need a provider, but we create this wrapper for consistency
  const store = useZustandStore();
  
  return (
    <AICopilotContext.Provider value={store}>
      {children}
    </AICopilotContext.Provider>
  );
};

export const useAICopilotStore = () => {
  const context = useContext(AICopilotContext);
  if (!context) {
    console.error('useAICopilotStore called outside of AICopilotProvider! Component stack:', new Error().stack);
    throw new Error('useAICopilotStore must be used within an AICopilotProvider. Check that your component is wrapped with AICopilotProvider in index.jsx');
  }
  return context;
};