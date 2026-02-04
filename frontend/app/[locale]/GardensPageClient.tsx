'use client';

/**
 * PL: Komponent wyświetlający siatkę najnowszych ogrodów z dynamicznymi zdjęciami.
 * EN: Component displaying a grid of the latest gardens with dynamic images.
 */

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/icons/ui/Icon';

export type GardenType = {
  id: number;
  name: string; // Odpowiednik commonName
  owner: string; // Odpowiednik author
  plantsCount?: number; // Odpowiednik garden (string)
  styleName?: string; // Odpowiednik latinName
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

  // Logika stronicowania
  const [currentPage, setCurrentPage] = useState(1);
  /**
   * PL: Liczba ogrodów na stronie
   * EN: Number of gardens per page
   */
  const itemsPerPage = 12;

  const totalPages = Math.ceil(gardens.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentGardens = gardens.slice(startIndex, startIndex + itemsPerPage);

  // Styl przycisków nawigacji - usunięto cursor-not-allowed, stały kolor tła
  const btnStyle =
    'bg-[#186618] text-[#fff] px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest cursor-pointer disabled:opacity-50 focus:outline focus:outline-2 focus:outline-[#fff] focus:outline-offset-2 active:outline-none';

  return (
    <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      {!hideTitle && (
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-white-text overflow-hidden uppercase">
          {t('latestGardens')}
        </h1>
      )}

      {/* Siatka ogrodów - wyświetla aktualną stronę */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {currentGardens.map((garden, idx) => (
          <article
            key={garden.id}
            className="bg-secondary-beige p-4 rounded-xl shadow-lg border border-subtle-gray transition transform hover:scale-[1.02] duration-300 flex flex-col h-full cursor-pointer"
          >
            <div className="relative w-full h-48 mb-3 overflow-hidden rounded-lg">
              <Image
                src={`/images/temp/plant_${(garden.id % 5) + 1}.jpg`}
                alt={garden.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                className="object-cover"
                loading={idx === 0 ? 'eager' : 'lazy'}
                priority={idx === 0}
                decoding="async"
              />
            </div>

            <div className="space-y-1 text-sm text-neutral-900 flex-grow">
              <h2 className="text-xl font-bold text-primary-green overflow-hidden leading-tight">
                {garden.name}
              </h2>
              <p className="text-xs italic opacity-80 overflow-hidden uppercase">
                {garden.styleName || 'Community Space'}
              </p>

              <div className="pt-3 space-y-1 text-xs uppercase tracking-wider font-semibold overflow-hidden">
                <div className="flex items-center gap-1.5 text-dark-text">
                  <Icon name="user" size={14} className="text-dark-text" />
                  <span className="text-amber-900 leading-none font-bold">
                    {garden.owner}
                  </span>
                </div>

                <p className="text-dark-text whitespace-nowrap">
                  {t('plantsCountLabel') || 'Liczba roślin'}:{' '}
                  <span className="text-primary-green font-bold">
                    {garden.plantsCount}
                  </span>
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Paginacja */}
      <div className="mt-12 flex max-[520px]:grid justify-center items-center gap-2 w-fit mx-auto	">
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
    </section>
  );
};
