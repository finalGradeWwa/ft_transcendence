'use client';

/**
 * PL: Komponent stopki aplikacji. Zawiera informacje o prawach autorskich oraz linki nawigacyjne.
 * EN: Application footer component. Contains copyright information and navigation links.
 */

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export function Footer() {
  /** PL: Hook do pobierania tłumaczeń z przestrzeni nazw 'HomePage'. EN: Hook for fetching translations from 'HomePage' namespace. */
  const t = useTranslations('HomePage');

  return (
    <footer className="relative z-10 py-4 border-t border-subtle-gray flex flex-col sm:flex-row justify-center items-center gap-y-2 sm:gap-y-0 sm:gap-x-8 text-sm font-bold bg-secondary-beige mt-auto rounded-t-lg">
      {/** PL: Informacja o prawach autorskich z dynamicznym rokiem. EN: Copyright notice with dynamic year. */}
      <p className="text-neutral-900 text-center">
        &copy; {new Date().getFullYear()} Plant Portal. {t('rights')}
      </p>

      {/** PL: Nawigacja stopki (Polityka prywatności, Regulamin). EN: Footer navigation (Privacy policy, Terms). */}
      <nav
        className="flex flex-col sm:flex-row gap-y-2 sm:gap-y-0 sm:gap-x-4"
        aria-label={t('aria.footerNavigation')}
      >
        <Link
          href="/privacy-policy"
          className="text-primary-green hover:underline transition duration-150 text-center focus-visible:ring-2 focus-visible:ring-header-main focus-visible:ring-offset-2 focus-visible:ring-offset-black outline-none rounded-lg break-all px-4 py-2"
        >
          {t('privacy')}
        </Link>
        <Link
          href="/terms"
          className="text-primary-green hover:underline transition duration-150 text-center focus-visible:ring-2 focus-visible:ring-header-main focus-visible:ring-offset-2 focus-visible:ring-offset-black outline-none rounded-lg break-all px-4 py-2"
        >
          {t('terms')}
        </Link>
      </nav>
    </footer>
  );
}
