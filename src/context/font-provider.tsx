"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Montserrat, Lato, Roboto, Open_Sans } from "next/font/google";

// 1. Define available fonts and their Next.js font loaders
const montserrat = Montserrat({ subsets: ["latin"] });
const lato = Lato({ subsets: ["latin"], weight: ['400', '700'] });
const roboto = Roboto({ subsets: ["latin"], weight: ['400', '700'] });
const openSans = Open_Sans({ subsets: ["latin"] });

export const fontMap = {
  Montserrat: montserrat,
  Lato: lato,
  Roboto: roboto,
  'Open Sans': openSans,
};

export type FontName = keyof typeof fontMap;

// 2. Define the shape of the context
interface FontContextType {
  font: FontName;
  setFont: (font: FontName) => void;
}

// 3. Create the context
const FontContext = createContext<FontContextType | undefined>(undefined);

// 4. Create the provider component that will wrap the application
export function FontProvider({ children }: { children: ReactNode }) {
  // Default to 'Montserrat', but check local storage for a saved preference
  const [font, setFontState] = useState<FontName>('Montserrat');

  useEffect(() => {
    // On initial load, try to get the font from local storage
    const savedFont = localStorage.getItem('app-font') as FontName;
    if (savedFont && fontMap[savedFont]) {
      setFontState(savedFont);
    }
  }, []);

  // Function to update the font and save it to local storage
  const setFont = (newFont: FontName) => {
    if (fontMap[newFont]) {
      localStorage.setItem('app-font', newFont);
      setFontState(newFont);
    }
  };

  return (
    <FontContext.Provider value={{ font, setFont }}>
      {children}
    </FontContext.Provider>
  );
}

// 5. Create a custom hook for easily accessing the font state
export function useFont() {
  const context = useContext(FontContext);
  if (context === undefined) {
    throw new Error('useFont must be used within a FontProvider');
  }
  return context;
}
