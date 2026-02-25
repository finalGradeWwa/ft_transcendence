'use client';

import { Icon } from '@/components/icons/ui/Icon';
import { Link } from '@/i18n/navigation';
import { PlantType } from '@/app/[locale]/HomePageClient';
import { apiFetch } from '@/lib/auth';
import { useTranslations } from 'next-intl';

interface PlantCardProps {
  plant: PlantType;
  onClick?: () => void;
  gardenUsername?: string;
  currentUser?: string | null;
  onDeleted?: (plantId: number) => void;
}

export const PlantCard = ({
  plant,
  onClick,
  gardenUsername,
  currentUser,
  onDeleted,
}: PlantCardProps) => {
  const href = gardenUsername
    ? `/profiles/${gardenUsername}/gardens/${plant.id}`
    : null;

  const isOwner = currentUser && plant.author === currentUser;
  const t = useTranslations('PlantCard');

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!confirm(t('deleteConfirm'))) return;

    try {
      const res = await apiFetch(`/api/plant/${plant.id}/`, {
        method: 'DELETE',
      });
      if (res.ok || res.status === 204) {
        onDeleted?.(plant.id);
      }
    } catch (error) {}
  };

  const content = (
    <article className="relative bg-secondary-beige p-4 rounded-xl shadow-lg border border-subtle-gray transition transform hover:scale-[1.02] duration-300 flex flex-col h-full">
      {isOwner && (
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 z-10 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
          title="Usuń roślinę"
        >
          <Icon name="trash" size={14} />
        </button>
      )}

      <div className="relative w-full h-48 mb-3 overflow-hidden rounded-lg bg-neutral-100">
        {plant.image ? (
          <img
            src={plant.image}
            alt={plant.commonName || 'Plant'}
            className={`w-full h-full object-cover${plant.image?.includes('garden-placeholder') ? ' opacity-80' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-neutral-200">
            🌿
          </div>
        )}
      </div>

      <div className="space-y-1 text-sm text-neutral-900 flex-grow">
        <h2 className="text-xl font-bold text-primary-green overflow-hidden line-clamp-1">
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
          {plant.garden && (
            <p className="text-dark-text">
              🪴{' '}
              {plant.gardenId && plant.author ? (
                <Link
                  href={`/profiles/${plant.author}/gardens/${plant.gardenId}`}
                  className="text-primary-green font-bold hover:underline"
                  onClick={e => e.stopPropagation()}
                >
                  {plant.garden}
                </Link>
              ) : (
                <span className="text-primary-green font-bold">
                  {plant.garden}
                </span>
              )}
            </p>
          )}
        </div>
      </div>
    </article>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return (
    <div onClick={onClick} className="cursor-pointer">
      {content}
    </div>
  );
};
