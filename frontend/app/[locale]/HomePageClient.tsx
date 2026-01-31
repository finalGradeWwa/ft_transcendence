'use client';

/**
 * PL: Główny komponent kliencki strony głównej. Wyświetla siatkę rekomendowanych roślin.
 * EN: Main client-side home page component. Displays a grid of recommended plants.
 */

import Image from 'next/image';
import { useTranslations } from 'next-intl';
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

  return (
    <>
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
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
