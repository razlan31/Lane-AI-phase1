import { useState, useEffect, useCallback } from 'react';

// Generic debounce hook for any value
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Specialized debounced input hook for chat
export const useDebouncedChatInput = (initialValue = '', delay = 750) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const [isTyping, setIsTyping] = useState(false);
  const debouncedValue = useDebounce(inputValue, delay);

  const handleInputChange = useCallback((value) => {
    setInputValue(value);
    setIsTyping(true);
    
    // Clear typing indicator after delay
    setTimeout(() => setIsTyping(false), delay + 100);
  }, [delay]);

  // Wrapper to handle both direct calls and event objects
  const setInputWrapper = useCallback((valueOrEvent) => {
    const value = typeof valueOrEvent === 'string' ? valueOrEvent : valueOrEvent.target?.value || '';
    handleInputChange(value);
  }, [handleInputChange]);

  const clearInput = useCallback(() => {
    setInputValue('');
    setIsTyping(false);
  }, []);

  return {
    inputValue,
    debouncedValue,
    isTyping,
    setInputValue: setInputWrapper,
    clearInput
  };
};

export default useDebounce;