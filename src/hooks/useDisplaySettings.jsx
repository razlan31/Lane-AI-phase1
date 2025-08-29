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
    throw new Error('useDisplaySettings must be used within a DisplaySettingsProvider');
  }
  return context;
};