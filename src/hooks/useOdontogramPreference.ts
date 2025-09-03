import { useState, useEffect } from 'react';

export type OdontogramDesignType = 'traditional' | 'anatomical' | 'interactive' | 'minimalist' | 'clinical';

export const useOdontogramPreference = () => {
  const [selectedDesign, setSelectedDesign] = useState<OdontogramDesignType>(() => {
    const saved = localStorage.getItem('odontogram-design-preference');
    console.log('Initial odontogram design from localStorage:', saved);
    return (saved as OdontogramDesignType) || 'traditional';
  });

  const updateDesignPreference = (design: OdontogramDesignType) => {
    console.log('Updating odontogram design to:', design);
    setSelectedDesign(design);
    localStorage.setItem('odontogram-design-preference', design);
  };

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'odontogram-design-preference' && e.newValue) {
        console.log('Storage change detected, new design:', e.newValue);
        setSelectedDesign(e.newValue as OdontogramDesignType);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    selectedDesign,
    updateDesignPreference
  };
};