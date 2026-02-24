'use client';

/**
 * PL: Komponent wyświetlający siatkę najnowszych ogrodów z dynamicznymi zdjęciami.
 * EN: Component displaying a grid of the latest gardens with dynamic images.
 */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { GardenCard } from '@/components/gardens/GardenCard';

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
  gardens: Array<GardenType>;
  hideTitle?: boolean;
}

export const GardensPageClient = ({
  gardens,
  hideTitle,
}: GardensPageClientProps) => {
  const t = useTranslations('GardensPage');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const totalPages = Math.ceil(gardens.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentGardens = gardens.slice(startIndex, startIndex + itemsPerPage);

  const btnStyle =
    'bg-[#186618] text-[#fff] px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest cursor-pointer disabled:opacity-50 focus:outline focus:outline-2 focus:outline-[#fff] focus:outline-offset-2 active:outline-none';

  return (
    <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      {!hideTitle && (
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-white-text overfdisabled:opacitylow-hidden uppercase">
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
            Początek
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
            Koniec
          </button>
        </div>
      )}
    </section>
  );
};
