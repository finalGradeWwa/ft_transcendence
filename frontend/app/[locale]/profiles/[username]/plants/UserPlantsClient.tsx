'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { apiFetch } from '@/lib/auth';
import { PlantCard } from '@/components/plants/PlantCard';
import { PlantModal } from '@/components/plants/PlantModal';
import { PlantType } from '@/app/[locale]/HomePageClient';

interface UserPlantsClientProps {
  plants?: PlantType[];
  profileUsername: string;
}

export const UserPlantsClient = ({
  plants: initialPlants,
  profileUsername,
}: UserPlantsClientProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [plants, setPlants] = useState<PlantType[]>(initialPlants ?? []);
  const [loading, setLoading] = useState(!initialPlants || initialPlants.length === 0);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [selectedPlantIndex, setSelectedPlantIndex] = useState<number | null>(null);

  const currentPage = Number(searchParams.get('page')) || 1;
  const itemsPerPage = 12;
  const tGardens = useTranslations('GardensPage');

  useEffect(() => {
    apiFetch('/api/auth/me/')
      .then(res => res.json())
      .then(data => setCurrentUser(data.username))
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (initialPlants && initialPlants.length > 0) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await apiFetch(`/api/plant/?username=${encodeURIComponent(profileUsername)}`, { skipRedirect: true });

        if (!res.ok) {
          if (!cancelled) setLoading(false);
          return;
        }

        const data = await res.json();
        const mapped = data.map((p: any) => {
          const isDefaultGarden =
            p.garden_name.includes("'s Garden") || p.garden_name === 'Home Garden';

          let imageUrl = p.image;
          if (imageUrl) {
            if (imageUrl.startsWith('http')) {
              try {
                const u = new URL(imageUrl);
                if (u.pathname.startsWith('/media/')) imageUrl = u.pathname;
              } catch { /* ignore */ }
            } else {
              imageUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
            }
          }

          return {
            id: p.plant_id,
            commonName: p.nickname,
            latinName: p.species || '',
            author: p.owner_username,
            garden: isDefaultGarden ? tGardens('defaultGardenName') : p.garden_name,
            gardenId: p.garden_id,
            image: imageUrl,
          };
        });

        if (!cancelled) {
          setPlants(mapped);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [initialPlants, profileUsername, tGardens]);

  const sortedPlants = [...plants].reverse();
  const totalPages = Math.ceil(plants.length / itemsPerPage) || 1;
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

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-white-text font-bold text-sm uppercase tracking-widest animate-pulse">
          Loading...
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentPlants.map(plant => (
            <PlantCard
              key={plant.id}
              plant={plant}
              currentUser={currentUser}
              onClick={() => setSelectedPlantIndex(sortedPlants.indexOf(plant))}
              onDeleted={id => setPlants(prev => prev.filter(p => p.id !== id))}
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
              {tGardens('firstPage')}
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
              {tGardens('lastPage')}
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
