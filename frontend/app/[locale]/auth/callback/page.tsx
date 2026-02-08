'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchCurrentUser, refreshAccessToken } from '@/lib/auth';

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale ?? 'pl';

  useEffect(() => {
    (async () => {
      try {
        const access = await refreshAccessToken();
        const user = await fetchCurrentUser(access);

        sessionStorage.setItem('accessToken', access);
        localStorage.setItem('username', user.username);

        router.replace(`/${locale}?auth=oauth_success`);
      } catch (error) {
        console.error('OAuth callback failed:', error);
        router.replace(`/${locale}?showLogin=true&error=oauth_failed`);
      }
    })();
  }, [locale, router]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'sans-serif'
    }}>
      <p>Przetwarzanie logowania, proszę czekać...</p>
    </div>
  );
}
