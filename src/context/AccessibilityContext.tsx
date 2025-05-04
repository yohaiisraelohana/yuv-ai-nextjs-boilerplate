'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type AccessibilityContextType = {
  highContrast: boolean;
  toggleHighContrast: () => void;
  fontSize: number;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [darkMode, setDarkMode] = useState(false);

  // Function to safely modify document classes
  const updateHtmlClass = (action: 'add' | 'remove', className: string) => {
    if (typeof window !== 'undefined' && window.document && window.document.documentElement) {
      if (action === 'add') {
        window.document.documentElement.classList.add(className);
      } else {
        window.document.documentElement.classList.remove(className);
      }
    }
  };

  // Load preferences from localStorage when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log("Initializing accessibility settings from localStorage");
      try {
        const savedHighContrast = localStorage.getItem('highContrast') === 'true';
        const savedFontSize = parseInt(localStorage.getItem('fontSize') || '16', 10);
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        
        console.log("Saved settings:", { savedHighContrast, savedFontSize, savedDarkMode });
        
        setHighContrast(savedHighContrast);
        setFontSize(savedFontSize);
        setDarkMode(savedDarkMode);
        
        // Apply font size to document root
        if (window.document && window.document.documentElement) {
          window.document.documentElement.style.fontSize = `${savedFontSize}px`;
        }
        
        // Apply high contrast mode
        if (savedHighContrast) {
          updateHtmlClass('add', 'high-contrast');
        }
        
        // Apply dark mode
        if (savedDarkMode) {
          console.log("Adding dark class to documentElement");
          updateHtmlClass('add', 'dark');
        } else {
          console.log("Removing dark class from documentElement");
          updateHtmlClass('remove', 'dark');
        }
      } catch (error) {
        console.error("Error initializing accessibility settings:", error);
      }
    }
  }, []);

  const toggleHighContrast = () => {
    try {
      const newValue = !highContrast;
      setHighContrast(newValue);
      localStorage.setItem('highContrast', String(newValue));
      
      if (newValue) {
        updateHtmlClass('add', 'high-contrast');
      } else {
        updateHtmlClass('remove', 'high-contrast');
      }
    } catch (error) {
      console.error("Error toggling high contrast:", error);
    }
  };

  const toggleDarkMode = () => {
    try {
      console.log("toggleDarkMode called, current value:", darkMode);
      const newValue = !darkMode;
      console.log("Setting darkMode to:", newValue);
      setDarkMode(newValue);
      localStorage.setItem('darkMode', String(newValue));
      
      if (newValue) {
        console.log("Adding dark class to documentElement");
        updateHtmlClass('add', 'dark');
      } else {
        console.log("Removing dark class from documentElement");
        updateHtmlClass('remove', 'dark');
      }
    } catch (error) {
      console.error("Error toggling dark mode:", error);
    }
  };

  const increaseFontSize = () => {
    try {
      const newSize = Math.min(fontSize + 2, 24);
      setFontSize(newSize);
      localStorage.setItem('fontSize', String(newSize));
      
      if (typeof window !== 'undefined' && window.document && window.document.documentElement) {
        window.document.documentElement.style.fontSize = `${newSize}px`;
      }
    } catch (error) {
      console.error("Error increasing font size:", error);
    }
  };

  const decreaseFontSize = () => {
    try {
      const newSize = Math.max(fontSize - 2, 12);
      setFontSize(newSize);
      localStorage.setItem('fontSize', String(newSize));
      
      if (typeof window !== 'undefined' && window.document && window.document.documentElement) {
        window.document.documentElement.style.fontSize = `${newSize}px`;
      }
    } catch (error) {
      console.error("Error decreasing font size:", error);
    }
  };

  const resetFontSize = () => {
    try {
      const defaultSize = 16;
      setFontSize(defaultSize);
      localStorage.setItem('fontSize', String(defaultSize));
      
      if (typeof window !== 'undefined' && window.document && window.document.documentElement) {
        window.document.documentElement.style.fontSize = `${defaultSize}px`;
      }
    } catch (error) {
      console.error("Error resetting font size:", error);
    }
  };

  return (
    <AccessibilityContext.Provider
      value={{
        highContrast,
        toggleHighContrast,
        fontSize,
        increaseFontSize,
        decreaseFontSize,
        resetFontSize,
        darkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}; 