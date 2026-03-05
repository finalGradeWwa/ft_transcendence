'use client';

/**
 * PL: Komponent wyświetlający siatkę najnowszych ogrodów z dynamicznymi zdjęciami.
 * EN: Component displaying a grid of the latest gardens with dynamic images.
 */

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { GardenCard } from '@/components/gardens/GardenCard';
import { apiFetch } from '@/lib/auth';
import { buildImageUrl } from '@/lib/imageUrl';

export type GardenType = {
  id: number;
  name: string;
  owner: string;
  plantsCount?: number;
  styleName?: string;
  image?: string;
  isDefault?: boolean;
};

interface GardensPageClientProps {
  gardens?: Array<GardenType>;
  hideTitle?: boolean;
}

export const GardensPageClient = ({
  gardens: initialGardens,
  hideTitle,
}: GardensPageClientProps) => {
  const t = useTranslations('GardensPage');

  const [gardens, setGardens] = useState<GardenType[]>(initialGardens ?? []);
  const [loading, setLoading] = useState(!initialGardens || initialGardens.length === 0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    if (initialGardens && initialGardens.length > 0) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await apiFetch('/api/garden/', { skipRedirect: true });
        if (!res.ok) { if (!cancelled) setLoading(false); return; }
        const allGardens = await res.json();

        const mapped = allGardens
          .filter((g: any) => g.user_count > 0)
          .map((garden: any) => {
            const envMap: Record<string, string> = {
              i: 'indoor',
              o: 'outdoor',
              g: 'greenhouse',
            };
            const rawEnv = String(garden.environment || '')
              .toLowerCase()
              .charAt(0);
            const envKey = envMap[rawEnv] || 'indoor';

            return {
              id: garden.garden_id,
              name:
                garden.name.includes("'s Garden") ||
                  garden.name === 'Default Garden'
                  ? t('defaultGardenName')
                  : garden.name,
              owner: garden.owner || t('unknownOwner'),
              plantsCount: garden.plant_count || 0,
              styleName: t(`environments.${envKey}`),
              image: buildImageUrl(garden.thumbnail),
            };
          });

        if (!cancelled) {
          setGardens([...mapped].reverse());
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [initialGardens, t]);

  const totalPages = Math.ceil(gardens.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentGardens = gardens.slice(startIndex, startIndex + itemsPerPage);

  const btnStyle =
    'bg-[#186618] text-[#fff] px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest cursor-pointer disabled:opacity-50 focus:outline focus:outline-2 focus:outline-[#fff] focus:outline-offset-2 active:outline-none';

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
    <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      {!hideTitle && (
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-white-text overflow-hidden uppercase">
          {t('latestGardens')}
        </h1>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {currentGardens.map((garden, idx) => (
          <GardenCard key={garden.id} garden={garden} priority={idx < 4} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-12 flex max-[520px]:grid justify-center items-center gap-2 w-fit mx-auto">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className={btnStyle}
          >
            {t('firstPage')}
          </button>
          <button
            onClick={() => setCurrentPage(prev => prev - 1)}
            disabled={currentPage === 1}
            className={btnStyle}
          >
            &lt;
          </button>

          <div className="text-white-text font-bold text-sm text-center w-full min-w-[60px] whitespace-nowrap">
            {currentPage} / {totalPages}
          </div>

          <button
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={currentPage === totalPages}
            className={btnStyle}
          >
            &gt;
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className={btnStyle}
          >
            {t('lastPage')}
          </button>
        </div>
      )}
    </section>
  );
};
