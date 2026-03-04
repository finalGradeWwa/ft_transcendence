'use client';

/**
 * PL: Strona powitalna dla niezalogowanych użytkowników.
 * EN: Landing page for unauthenticated users.
 */

import { Link } from '@/i18n/navigation';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

export function LandingPage({
  locale,
  showLogin,
}: {
  locale: string;
  showLogin?: boolean;
}) {
  const t = useTranslations('LandingPage');
  const router = useRouter();
  useEffect(() => {
    if (showLogin) {
      window.dispatchEvent(new CustomEvent('open-login-modal'));
    }
  }, [showLogin]);

  return (
    <div className="flex flex-col items-center justify-start px-4 pt-20 text-center">
      <div className="max-w-2xl mx-auto bg-secondary-beige/90 rounded-3xl shadow-2xl p-10 border border-primary-green/20">
        <div className="text-6xl mb-6">🌿</div>
        <h1 className="text-3xl sm:text-5xl font-black text-primary-green uppercase tracking-tighter mb-4">
          Plant Portal
        </h1>
        <p className="text-neutral-600 font-semibold mb-8 text-sm sm:text-base leading-relaxed">
          {t('description')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push(`/?showLogin=true`)}
            className="bg-primary-green text-white font-black uppercase text-xs tracking-widest px-8 py-4 rounded-xl shadow-lg hover:opacity-90 transition"
          >
            {t('login')}
          </button>
          <Link
            href="/register"
            className="bg-secondary-beige text-primary-green border-2 border-primary-green font-black uppercase text-xs tracking-widest px-8 py-4 rounded-xl hover:bg-amber-100 transition"
          >
            {t('register')}
          </Link>
        </div>
      </div>
    </div>
  );
}
