'use client';

/**
 * PL: Kontekst językowy aplikacji. Odpowiada za zarządzanie bieżącym językiem,
 * kierunkiem tekstu (LTR/RTL) oraz synchronizację tych ustawień z ciasteczkami (dla Django) i atrybutami HTML.
 * * EN: Application language context. Responsible for managing the current language,
 * text direction (LTR/RTL), and synchronizing these settings with cookies (for Django) and HTML attributes.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

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

/**
 * PL: Funkcja pomocnicza określająca kierunek tekstu na podstawie wybranego języka.
 * EN: Helper function determining text direction based on the selected language.
 */
const getDirectionFromLanguage = (lang: Language): Direction =>
  lang === 'ar' ? 'rtl' : 'ltr';

/**
 * PL: Hook umożliwiający dostęp do stanu języka w komponentach klienckich.
 * EN: Hook providing access to language state within client components.
 */
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage musi być użyty wewnątrz LanguageProvider');
  }
  return context;
};

/**
 * PL: Dostawca kontekstu językowego. Obsługuje stan, aktualizację atrybutów dokumentu
 * oraz zapisywanie preferencji w ciasteczkach kompatybilnych z Django.
 * * EN: Language context provider. Handles state, document attribute updates,
 * and saving preferences in Django-compatible cookies.
 */
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

  /**
   * PL: Zmienia język aplikacji i zapisuje wybór w ciasteczku 'django_language'.
   * EN: Changes the application language and saves the selection in the 'django_language' cookie.
   */
  const changeLanguage = (newLang: Language) => {
    setCurrentLang(newLang);
    setDir(getDirectionFromLanguage(newLang));

    Cookies.set('django_language', newLang, { expires: 365, path: '/' });
  };

  /**
   * PL: Efekt synchronizujący atrybuty lang i dir elementu html po każdej zmianie języka.
   * EN: Effect synchronizing the lang and dir attributes of the html element upon every language change.
   */
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('lang', currentLang);
    html.setAttribute('dir', dir);
  }, [currentLang, dir]);

  const value = { currentLang, dir, changeLanguage };

  return (
    <LanguageContext.Provider value={value}>
      <div dir={dir}>{children}</div>
    </LanguageContext.Provider>
  );
}
