'use client';

import { useTranslations } from 'next-intl';
import NextImage from 'next/image';
import Link from 'next/link';
import { use } from 'react';

// --- Komponenty pomocnicze (Sub-components) ---

const BackLink = ({ href, label }: { href: string; label: string }) => (
  <div className="mb-6 flex">
    <Link
      href={href}
      className="bg-primary-green text-header-main font-black uppercase text-[10px] tracking-widest px-6 py-2.5 rounded-full shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-header-main focus-visible:outline-offset-[3px] focus:transition-none active:outline-none text-center max-w-full overflow-hidden"
    >
      <span className="text-sm shrink-0 relative z-10">←</span>
      <span className="leading-tight break-words py-0.5 relative z-10">
        {label}
      </span>
    </Link>
  </div>
);

const PlantImage = ({
  photoUrl,
  alt,
  fallback,
}: {
  photoUrl: string | null;
  alt: string;
  fallback: string;
}) => (
  <div className="relative w-full md:w-48 h-56 md:h-48 shrink-0 rounded-2xl overflow-hidden bg-dark-text/10 border border-header-main flex items-center justify-center shadow-sm">
    {photoUrl ? (
      <NextImage
        src={photoUrl}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 192px"
        priority
      />
    ) : (
      <div
        className="flex flex-col items-center opacity-70 select-none"
        aria-hidden="true"
      >
        <span className="text-5xl mb-2">{fallback}</span>
      </div>
    )}
  </div>
);

// --- Komponent Główny ---

interface PlantDetailsPageProps {
  params: Promise<{ username: string; plantId: string }>;
}

export default function PlantDetailsPage({ params }: PlantDetailsPageProps) {
  const { username, plantId } = use(params);
  const t = useTranslations('AddPlantPage');
  const tr = useTranslations('RegisterPage');

  const plant = {
    nickname: 'Fikus Stefan',
    species: 'Ficus Lyrata',
    photoUrl: null,
    garden: 'Salon Południowy',
  };

  return (
    <div className="bg-main-gradient pb-20 pt-12 px-4">
      <div className="max-w-2xl mx-auto">
        <BackLink
          href={`/profiles/${username}/plants`}
          label={tr('backToList')}
        />

        <div className="bg-secondary-beige rounded-3xl shadow-2xl overflow-hidden border border-primary-green/10">
          <div className="flex flex-col md:flex-row gap-8 p-8 sm:p-10">
            <PlantImage
              photoUrl={plant.photoUrl}
              alt={`${t('fields.species')}: ${plant.nickname}`}
              fallback="🌿"
            />

            <div className="flex flex-col justify-center">
              <h2 className="text-3xl sm:text-4xl font-black text-dark-text uppercase tracking-tight break-words mb-4 leading-none">
                {plant.nickname}
              </h2>
              <span className="text-dark-text font-bold uppercase text-[10px] tracking-[0.3em] mb-1">
                {t('fields.species')}
              </span>
              <p className="text-primary-green font-bold uppercase text-base tracking-wide">
                {plant.species}
              </p>
            </div>
          </div>

          <div className="bg-secondary-beige p-8 sm:p-10 border-t border-border-gray/50">
            <h3 className="text-dark-text font-bold uppercase text-[12px] tracking-[0.1em] mb-4">
              {t('fields.garden_belong')}
            </h3>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/profiles/${username}/plants/${plantId}`}
                className="bg-primary-green text-header-main font-bold text-xs px-4 py-2 rounded-lg shadow-sm hover:opacity-90 transition-all focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-dark-text focus-visible:outline-offset-[2px] focus:transition-none active:outline-none"
              >
                {plant.garden}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
