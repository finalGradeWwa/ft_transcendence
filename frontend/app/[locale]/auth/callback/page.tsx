'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');

    if (accessToken && refreshToken) {
      localStorage.setItem('accessToken', accessToken);
      window.location.href = '/pl';
    } else {
      console.error("OAuth callback error: Tokens not found in URL.");
      router.push('/pl/login?error=oauth_failed');
    }

  }, [searchParams, router]);

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
