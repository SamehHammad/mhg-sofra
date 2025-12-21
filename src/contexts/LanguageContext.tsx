'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, getTranslation, getDirection, TranslationKey } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKey;
  direction: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar'); // Arabic is default
  const [t, setT] = useState<TranslationKey>(getTranslation('ar'));
  const [direction, setDirection] = useState<'rtl' | 'ltr'>('rtl');

  useEffect(() => {
    // Load language from localStorage if available
    const saved = localStorage.getItem('language');
    if (saved === 'ar' || saved === 'en') {
      setLanguageState(saved);
      setT(getTranslation(saved));
      setDirection(getDirection(saved));
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setT(getTranslation(lang));
    setDirection(getDirection(lang));
    localStorage.setItem('language', lang);
    
    // Update document direction
    document.documentElement.setAttribute('dir', getDirection(lang));
    document.documentElement.setAttribute('lang', lang);
  };

  useEffect(() => {
    // Set initial direction
    document.documentElement.setAttribute('dir', direction);
    document.documentElement.setAttribute('lang', language);
  }, [direction, language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, direction }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}


