'use client';

import { Icon } from '@/components/icons/ui/Icon';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { GardenType } from '@/app/[locale]/GardensPageClient';
import NextImage from 'next/image';

interface GardenCardProps {
  garden: GardenType;
  priority?: boolean;
  canDelete?: boolean;
  onDelete?: () => void;
}

export const GardenCard = ({
  garden,
  priority = false,
  canDelete,
  onDelete,
}: GardenCardProps) => {
  const t = useTranslations('GardensPage');

  return (
    <Link
      href={`/profiles/${garden.owner}/gardens/${garden.id}`}
      className="block"
    >
      <article className="relative bg-secondary-beige p-4 rounded-xl shadow-lg border border-subtle-gray transition transform hover:scale-[1.02] duration-300 flex flex-col h-full cursor-pointer">
        {canDelete && (
          <button
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              onDelete?.();
            }}
            className="absolute top-2 right-2 z-10 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 transition"
            title="Usuń ogród"
          >
            <Icon name="trash" size={14} />
          </button>
        )}

        <div className="relative w-full h-48 mb-3 overflow-hidden rounded-lg bg-neutral-200">
          <NextImage
            src={garden.image || '/images/garden/garden-placeholder.webp'}
            alt={garden.image ? garden.name : 'Garden placeholder'}
            fill
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className={`object-cover${!garden.image ? ' opacity-80' : ''}`}
          />
        </div>

        <div className="space-y-1 text-sm text-neutral-900 flex-grow">
          <h2 className="text-xl font-bold text-primary-green overflow-hidden leading-tight line-clamp-1">
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
              {t('plantsCountLabel')}:{' '}
              <span className="text-primary-green font-bold">
                {garden.plantsCount}
              </span>
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
};
