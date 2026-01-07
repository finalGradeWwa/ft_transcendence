'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/icons/ui/Icon';
import { Navigation } from '@/components/Navigation';
import { useSearchParams } from 'next/navigation';

// Dynamiczny import modalu logowania
const LoginModal = dynamic(() => import('@/components/LoginModal'), {
  ssr: false,
});

type PlantType = {
  id: number;
  author: string;
  latinName: string;
  commonName: string;
  averageRating: string;
};

export const HomePageClient = ({ plants }: { plants: Array<PlantType> }) => {
  const t = useTranslations('HomePage');
  const searchParams = useSearchParams();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('showLogin') === 'true') {
      setIsLoginModalOpen(true);
      const url = new URL(window.location.href);
      url.searchParams.delete('showLogin');
      window.history.replaceState({}, '', url.pathname);
    }
  }, [searchParams]);

  return (
    <>
      <div
        className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8"
        // Teraz inert blokuje tylko treść strony, a nie modal
        {...(isLoginModalOpen ? { 'aria-hidden': true, inert: true } : {})}
      >
        <Navigation
          onLoginClick={() => setIsLoginModalOpen(true)}
          onSearchClick={() => setIsSearchOpen(true)}
        />

        <main className="py-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white-text">
            {t('recommended')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {plants.map((plant, idx) => (
              <article
                key={plant.id}
                className="bg-secondary-beige p-4 rounded-xl shadow-lg border border-subtle-gray transition transform hover:scale-[1.02] duration-300 flex flex-col h-full"
              >
                <div className="relative w-full h-48 mb-3 overflow-hidden rounded-lg">
                  <Image
                    src={`/images/temp/plant_${(plant.id % 5) + 1}.jpg`}
                    alt={plant.commonName}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    className="object-cover"
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    priority={idx === 0}
                    decoding="async"
                  />
                </div>
                <div className="space-y-1 text-sm text-neutral-900 flex-grow">
                  <h3 className="text-xl font-bold text-primary-green">
                    {plant.commonName}
                  </h3>
                  <p className="text-xs italic opacity-80">{plant.latinName}</p>
                  <p className="font-medium">
                    {t('author')}{' '}
                    <span className="font-bold text-amber-900">
                      {plant.author}
                    </span>
                  </p>
                </div>
                <div className="flex items-center pt-4 mt-auto border-t border-subtle-gray/30">
                  <span
                    className="font-bold text-lg text-red-800"
                    aria-label={`${t('rating')}: ${plant.averageRating}`}
                  >
                    {t('rating')} {plant.averageRating}
                  </span>
                  <Icon
                    name="user"
                    size={14}
                    className="ms-2 text-neutral-500"
                  />
                </div>
              </article>
            ))}
          </div>
        </main>
      </div>

      {/* Modal jest TUTAJ - poza zablokowanym kontenerem */}
      <LoginModal
        isVisible={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        t={t}
      />
    </>
  );
};
