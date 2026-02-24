'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { PlantModal } from '@/components/plants/PlantModal';
import { PlantCard } from '@/components/plants/PlantCard';

export type PlantType = {
  id: number;
  latinName: string;
  commonName: string;
  garden?: string;
  gardenId?: number;
  author?: string;
  averageRating?: string;
  image?: string;
  plants_count?: number;
};

export const HomePageClient = ({
  plants,
  hideTitle,
  gardenUsername,
}: {
  plants: Array<PlantType>;
  showLogin?: boolean;
  isRegistered?: boolean;
  hideTitle?: boolean;
  gardenUsername?: string;
}) => {
  const t = useTranslations('HomePage');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const authStatus = searchParams.get('auth');
  const authProvider = searchParams.get('provider');

  const currentPage = Number(searchParams.get('page')) || 1;
  const itemsPerPage = 12;

  const totalPages = Math.ceil(plants.length / itemsPerPage) || 1;
  const sortedPlants = [...plants].reverse();
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPlants = sortedPlants.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const btnStyle =
    'bg-[#186618] text-[#fff] px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest cursor-pointer disabled:opacity-50 focus:outline focus:outline-2 focus:outline-[#fff] focus:outline-offset-2 active:outline-none';

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const [showLoginSuccess, setShowLoginSuccess] = React.useState(false);
  const [isExiting, setIsExiting] = React.useState(false);
  const [loginProvider, setLoginProvider] = React.useState<string | null>(null);
  const [selectedPlantIndex, setSelectedPlantIndex] = React.useState<
    number | null
  >(null);

  React.useEffect(() => {
    if (authStatus !== 'login_success') return;

    setShowLoginSuccess(true);
    setLoginProvider(authProvider);

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
          {currentPlants.map(plant => (
            <PlantCard
              key={plant.id}
              plant={plant}
              gardenUsername={gardenUsername}
              onClick={() => setSelectedPlantIndex(sortedPlants.indexOf(plant))}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-12 flex max-[520px]:grid justify-center items-center gap-2 w-fit mx-auto">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className={btnStyle}
            >
              Początek
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={btnStyle}
            >
              &lt;
            </button>

            <div className="text-white-text font-bold text-sm text-center w-full min-w-[60px] whitespace-nowrap">
              {currentPage} / {totalPages}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={btnStyle}
            >
              &gt;
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className={btnStyle}
            >
              Koniec
            </button>
          </div>
        )}
      </section>

      {selectedPlantIndex !== null && (
        <PlantModal
          plant={sortedPlants[selectedPlantIndex]}
          onClose={() => setSelectedPlantIndex(null)}
          onPrev={
            selectedPlantIndex > 0
              ? () => setSelectedPlantIndex(selectedPlantIndex - 1)
              : undefined
          }
          onNext={
            selectedPlantIndex < sortedPlants.length - 1
              ? () => setSelectedPlantIndex(selectedPlantIndex + 1)
              : undefined
          }
        />
      )}
    </>
  );
};
