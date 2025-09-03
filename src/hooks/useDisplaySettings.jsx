import { useState, useEffect, createContext, useContext } from 'react';

const DisplaySettingsContext = createContext();

export const DisplaySettingsProvider = ({ children }) => {
  const [showPlainExplanations, setShowPlainExplanations] = useState(() => {
    const saved = localStorage.getItem('laneai-show-plain-explanations');
    return saved !== null ? JSON.parse(saved) : true; // Default to true
  });

  useEffect(() => {
    localStorage.setItem('laneai-show-plain-explanations', JSON.stringify(showPlainExplanations));
  }, [showPlainExplanations]);

  const value = {
    showPlainExplanations,
    setShowPlainExplanations
  };

  return (
    <DisplaySettingsContext.Provider value={value}>
      {children}
    </DisplaySettingsContext.Provider>
  );
};

export const useDisplaySettings = () => {
  const context = useContext(DisplaySettingsContext);
  if (!context) {
    console.error('useDisplaySettings called outside of DisplaySettingsProvider! Component stack:', new Error().stack);
    throw new Error('useDisplaySettings must be used within a DisplaySettingsProvider. Check that your component is wrapped with DisplaySettingsProvider in index.jsx');
  }
  return context;
};