'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchCurrentUser, getValidAccessToken } from '@/lib/auth';
import { useTranslations } from 'next-intl';

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale ?? 'pl';
  const t = useTranslations('AuthCallbackPage');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await getValidAccessToken();
        const user = await fetchCurrentUser();
        if (cancelled) return;
        localStorage.setItem('username', user.username);
        router.replace(`/${locale}?auth=login_success&provider=github`);
      } catch (error) {
        if (cancelled) return;
        console.error('OAuth callback failed:', error);
        router.replace(`/${locale}?showLogin=true&error=oauth_failed`);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [locale, router]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'sans-serif'
    }}>
      <p>{t('loading')}</p>
    </div>
  );
}
