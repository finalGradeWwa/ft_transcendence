'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { Languages } from 'lucide-react';

export const LanguageSwitcher = () => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLanguage = (newLocale: string) => {
    // teraz router.replace będzie wiedział, jak obsłużyć obiekt { locale: ... }
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex gap-2 items-center bg-black/20 p-1 rounded-full border border-white/10 backdrop-blur-sm">
      <div className="px-3 text-white/50">
        <Languages size={18} />
      </div>

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
