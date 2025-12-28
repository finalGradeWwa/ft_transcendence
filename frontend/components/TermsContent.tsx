'use client';
/**
 * PL: Komponent klienta, hooki mogą być używane
 * EN: Client component, hooks can be used
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
