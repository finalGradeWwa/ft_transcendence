'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

/**
 * PL: Globalny komponent stopki. Zawiera informacje o prawach autorskich oraz linki prawne.
 * * EN: Global footer component. Contains copyright information and legal links.
 */
export function Footer() {
  const t = useTranslations('HomePage');

  return (
    <footer className="relative z-10 py-4 border-t border-subtle-gray flex flex-col sm:flex-row justify-center items-center gap-y-2 sm:gap-y-0 sm:gap-x-8 text-sm font-bold bg-secondary-beige mt-auto rounded-t-lg">
      <p className="text-neutral-900 text-center">
        &copy; {new Date().getFullYear()} Plant Portal. {t('rights')}
      </p>
      <nav
        className="flex flex-col sm:flex-row gap-y-2 sm:gap-y-0 sm:gap-x-8"
        aria-label={t('aria.footerNavigation')}
      >
        <Link
          href="/documents/privacy_policy.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-green hover:underline transition duration-150 text-center focus-visible:ring-2 focus-visible:ring-primary-green outline-none rounded"
        >
          {t('privacy')}
        </Link>
        <Link
          href="/documents/terms_of_service.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-green hover:underline transition duration-150 text-center focus-visible:ring-2 focus-visible:ring-primary-green outline-none rounded"
        >
          {t('terms')}
        </Link>
      </nav>
    </footer>
  );
}
