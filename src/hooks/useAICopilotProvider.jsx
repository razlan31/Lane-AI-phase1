import { createContext, useContext } from 'react';

// Zustand store doesn't need a React provider - it manages its own state
// This is just a pass-through component for consistency with other providers
const AICopilotContext = createContext(true);

export const AICopilotProvider = ({ children }) => {
  return (
    <AICopilotContext.Provider value={true}>
      {children}
    </AICopilotContext.Provider>
  );
};

// Re-export the actual Zustand store hook
export { useAICopilotStore } from './useAICopilotStore.js';