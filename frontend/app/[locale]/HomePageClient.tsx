'use client';

/**
 * PL: Główny komponent kliencki strony głównej. Wyświetla siatkę rekomendowanych roślin.
 * EN: Main client-side home page component. Displays a grid of recommended plants.
 */

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@/components/icons/ui/Icon';

export type PlantType = {
  id: number;
  latinName: string;
  commonName: string;
  garden?: string;
  author?: string;
  averageRating?: string;
};

export const HomePageClient = ({
  plants,
  hideTitle,
}: {
  plants: Array<PlantType>;
  showLogin?: boolean;
  isRegistered?: boolean;
  hideTitle?: boolean;
}) => {
  const t = useTranslations('HomePage');
  const searchParams = useSearchParams();
  const router = useRouter();
  const authStatus = searchParams.get('auth');
  const authProvider = searchParams.get('provider');

  // Keep a local flag so the banner stays visible after we clean the URL.
  const [showLoginSuccess, setShowLoginSuccess] = React.useState(false);
  const [isExiting, setIsExiting] = React.useState(false);
  const [loginProvider, setLoginProvider] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (authStatus !== 'login_success') return;

    setShowLoginSuccess(true);
    setLoginProvider(authProvider);

    // Clean the URL so the message doesn't reappear on refresh.
    // Delay the replace slightly so the user actually sees the banner.
    const timeout = window.setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.delete('auth');
      url.searchParams.delete('provider');
      url.searchParams.delete('showLogin');
      url.searchParams.delete('error');

      router.replace(url.pathname + url.search);
    }, 800);

    return () => window.clearTimeout(timeout);
  }, [authProvider, authStatus, router]);

  React.useEffect(() => {
    if (!showLoginSuccess) return;

    const startExitTimeout = window.setTimeout(() => {
      setIsExiting(true);
    }, 4000);

    const finalRemoveTimeout = window.setTimeout(() => {
      setShowLoginSuccess(false);
      setIsExiting(false);
    }, 4500);

    return () => {
      window.clearTimeout(startExitTimeout);
      window.clearTimeout(finalRemoveTimeout);
    };
  }, [showLoginSuccess]);

  return (
    <>
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {showLoginSuccess && (
          <div
            className={`rounded-lg border border-primary-green bg-secondary-beige px-4 text-md font-bold text-primary-green text-center overflow-hidden
        transition-all duration-500
        ${isExiting ? 'animate-fade-out py-0 mb-0' : 'animate-fade-in py-3 mb-6'}
      `}
          >
            {loginProvider === 'github'
              ? t('oauthLoginSuccess')
              : t('loginSuccess')}
          </div>
        )}

        {!hideTitle && (
          <h1 className="text-2xl md:text-3xl font-bold mb-6 text-white-text overflow-hidden">
            {t('recommended')}
          </h1>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plants.map((plant, idx) => (
            <article
              key={plant.id}
              className="bg-secondary-beige p-4 rounded-xl shadow-lg border border-subtle-gray transition transform hover:scale-[1.02] duration-300 flex flex-col h-full"
            >
              <div className="relative w-full h-48 mb-3 overflow-hidden rounded-lg">
                <Image
                  src={`/images/temp/plant_${(plant.id % 5) + 1}.jpg`}
                  alt={plant.commonName || plant.latinName || 'Roślina'}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                  className="object-cover"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  priority={idx === 0}
                  decoding="async"
                />
              </div>

              <div className="space-y-1 text-sm text-neutral-900 flex-grow">
                <h2 className="text-xl font-bold text-primary-green overflow-hidden">
                  {plant.commonName}
                </h2>
                <p className="text-xs italic opacity-80 overflow-hidden">
                  {plant.latinName}
                </p>

                <div className="pt-3 space-y-1 text-xs uppercase tracking-wider font-semibold overflow-hidden">
                  <div className="flex items-center gap-1.5 text-dark-text">
                    <Icon name="user" size={14} className="text-dark-text" />
                    <span className="text-amber-900 leading-none font-bold">
                      {plant.author || 'Anonim'}
                    </span>
                  </div>
                  <p className="text-dark-text">
                    Ogród:{' '}
                    <span className="text-primary-green font-bold">
                      {plant.garden || 'Brak ogrodu'}
                    </span>
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
};
