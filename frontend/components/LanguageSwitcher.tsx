/**
 * PL: Komponent przełącznika języków (LanguageSwitcher). Pozwala na dynamiczną zmianę
 * lokalizacji aplikacji przy użyciu nawigacji next-intl, zachowując bieżącą ścieżkę.
 * * EN: Language switcher component (LanguageSwitcher). Allows for dynamic
 * application locale changes using next-intl navigation while preserving the current path.
 */

'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { Languages } from 'lucide-react';

export const LanguageSwitcher = () => {
  /**
   * PL: Pobranie aktualnego języka oraz narzędzi do nawigacji z i18n.
   * EN: Fetching current locale and i18n navigation utilities.
   */
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  /**
   * PL: Funkcja zmieniająca język i aktualizująca adres URL bez przeładowania strony.
   * EN: Function to change the language and update the URL without page reload.
   */
  const toggleLanguage = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex gap-2 items-center bg-black/20 p-1 rounded-full border border-white/10 backdrop-blur-sm">
      <div className="px-3 text-white/50">
        <Languages size={18} />
      </div>

      {/**
       * PL: Renderowanie przycisków dla każdego dostępnego języka.
       * EN: Rendering buttons for each available language.
       */}
      {['pl', 'en', 'de', 'ar'].map(lang => (
        <button
          key={lang}
          onClick={() => toggleLanguage(lang)}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
            locale === lang
              ? 'bg-green-500 text-black'
              : 'text-white hover:bg-white/10'
          }`}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
};
