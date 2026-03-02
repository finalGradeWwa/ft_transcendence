import { getTranslations } from 'next-intl/server';
import { LandingPage } from './LandingPage';
import { FeedClient } from './FeedClient';
import { cookies } from 'next/headers';
import { serverFetch } from '@/lib/serverAuth';
import '../globals.css';

/**
 * PL: Generuje metadane SEO dla strony głównej.
 * EN: Generates SEO metadata for the home page.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: { absolute: t('home') },
    description: t('homeDescription'),
  };
}

export default async function FinalPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const { showLogin } = await searchParams;

  const cookieStore = await cookies();
  const hasSession = cookieStore.has('refresh_token');

  if (!hasSession) {
    return (
      <>
        <LandingPage locale={locale} showLogin={showLogin === 'true'} />
      </>
    );
  }

  let initialPins: any[] = [];
  let initialCurrentLoggedUser: string | null = null;

  try {
    const [meResponse, pinsResponse] = await Promise.all([
      serverFetch('/api/auth/me/', { method: 'GET' }),
      serverFetch('/api/pins/feed/', { method: 'GET' }),
    ]);

    if (meResponse.ok) {
      const meData = (await meResponse.json()) as { username?: string };
      initialCurrentLoggedUser = meData.username ?? null;
    }

    if (pinsResponse.ok) {
      const pinsData = await pinsResponse.json();
      initialPins = Array.isArray(pinsData) ? pinsData : [];
    }
  } catch {
    initialPins = [];
    initialCurrentLoggedUser = null;
  }

  return (
    <div dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <FeedClient
        initialPins={initialPins}
        initialCurrentLoggedUser={initialCurrentLoggedUser}
      />
    </div>
  );
}
