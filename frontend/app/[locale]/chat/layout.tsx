/**
 * PL: Layout czatu z metadanymi SEO (Server Component).
 * EN: Chat layout with SEO metadata (Server Component).
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
    title: t('chat'),
    description: t('chatDescription'),
  };
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
