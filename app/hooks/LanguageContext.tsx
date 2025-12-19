'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie'; // importujemy bibliotekę do ciasteczek

type Direction = 'ltr' | 'rtl';
type Language = 'pl' | 'en' | 'de' | 'ar';

interface LanguageContextProps {
  currentLang: Language;
  dir: Direction;
  changeLanguage: (newLang: Language) => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(
  undefined
);

const getDirectionFromLanguage = (lang: Language): Direction =>
  lang === 'ar' ? 'rtl' : 'ltr';

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage musi być użyty wewnątrz LanguageProvider');
  }
  return context;
};

export function LanguageProvider({
  children,
  initialLang,
}: {
  children: React.ReactNode;
  initialLang: Language;
}) {
  const [currentLang, setCurrentLang] = useState<Language>(initialLang);
  const [dir, setDir] = useState<Direction>(
    getDirectionFromLanguage(initialLang)
  );

  const changeLanguage = (newLang: Language) => {
    setCurrentLang(newLang);
    setDir(getDirectionFromLanguage(newLang));

    // zapisujemy do ciasteczka, które widzi i Next.js i Django
    // Django domyślnie szuka ciasteczka o nazwie 'django_language'
    Cookies.set('django_language', newLang, { expires: 365, path: '/' });
  };

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('lang', currentLang);
    html.setAttribute('dir', dir);
  }, [currentLang, dir]);

  const value = { currentLang, dir, changeLanguage };

  return (
    <LanguageContext.Provider value={value}>
      <div dir={dir}>
        {' '}
        {/* dodajemy dir tutaj, żeby layout reagował natychmiast */}
        {children}
      </div>
    </LanguageContext.Provider>
  );
}
