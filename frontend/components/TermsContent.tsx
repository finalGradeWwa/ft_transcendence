'use client';

/**
 * PL: Komponent renderujący treść regulaminu.
 * EN: Component rendering terms and conditions content.
 */

import { useTranslations } from 'next-intl';

export function TermsContent() {
  const t = useTranslations('TermsPage');

  return (
    <div className="prose prose-neutral max-w-full mx-auto whitespace-pre-line">
      <p>{t('content')}</p>
    </div>
  );
}
