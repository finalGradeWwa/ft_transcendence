/**
 * PL: Layout rejestracji z metadanymi SEO (Server Component).
 * EN: Register layout with SEO metadata (Server Component).
 */

import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: t('register'),
    description: t('registerDescription'),
  };
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
