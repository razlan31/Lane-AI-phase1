import { useState, useEffect } from 'react';

export const useRouter = () => {
  const [currentRoute, setCurrentRoute] = useState('/');

  useEffect(() => {
    // Listen for hash changes for simple routing
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || '/';
      setCurrentRoute(hash);
    };

    // Set initial route
    handleHashChange();
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (route) => {
    window.location.hash = route;
    setCurrentRoute(route);
  };

  return {
    currentRoute,
    navigate
  };
};