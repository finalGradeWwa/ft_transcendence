'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/auth';
import { GardenCard } from '@/components/gardens/GardenCard';
import { GardenType } from '@/app/[locale]/GardensPageClient';

interface UserGardensClientProps {
  gardens?: GardenType[];
  initialCurrentUser: string | null;
  profileUsername: string;
}

export const UserGardensClient = ({
  gardens: initialGardens,
  initialCurrentUser,
  profileUsername,
}: UserGardensClientProps) => {
  const t = useTranslations('GardensPage');

  const [gardens, setGardens] = useState<GardenType[]>(initialGardens ?? []);
  const [currentUser, setCurrentUser] = useState<string | null>(initialCurrentUser);
  const [loading, setLoading] = useState(!initialGardens || initialGardens.length === 0);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    apiFetch('/api/auth/me/')
      .then(res => res.json())
      .then(data => setCurrentUser(data.username))
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (initialGardens && initialGardens.length > 0) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await apiFetch(`/api/garden/?username=${encodeURIComponent(profileUsername)}`, { skipRedirect: true });
        if (!res.ok) {
          if (!cancelled) setLoading(false);
          return;
        }

        const data = await res.json();

        const mapped = data.map((g: any) => {
          const ownerFromTitle = g.name.includes("'s")
            ? g.name.split("'s")[0]
            : profileUsername;

          const isDefault =
            g.name.includes("'s Garden") || g.name === 'Default Garden';
          const displayName = isDefault ? t('defaultGardenName') : g.name;

          const envMap: Record<string, string> = {
            i: 'indoor',
            o: 'outdoor',
            g: 'greenhouse',
          };

          const rawValue = String(g.environment || '')
            .toLowerCase()
            .charAt(0);
          const envKey = envMap[rawValue] || 'indoor';
          const translatedEnv = t(`environments.${envKey}` as any);

          const rawImage = g.thumbnail || g.image_url || g.image;
          let finalImage = '/images/garden/garden-placeholder.webp';

          if (rawImage) {
            if (rawImage.startsWith('http')) {
              try {
                const u = new URL(rawImage);
                finalImage = u.pathname.startsWith('/media/') ? u.pathname : rawImage;
              } catch {
                finalImage = rawImage;
              }
            } else {
              finalImage = rawImage.startsWith('/') ? rawImage : `/${rawImage}`;
            }
          }

          return {
            id: g.garden_id,
            name: displayName,
            owner: ownerFromTitle,
            plantsCount: g.plant_count || 0,
            styleName: translatedEnv,
            image: finalImage,
            isDefault: isDefault,
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
  }, [initialGardens, profileUsername, t]);

  const totalPages = Math.ceil(gardens.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentGardens = gardens.slice(startIndex, startIndex + itemsPerPage);

  const btnStyle =
    'bg-[#186618] text-[#fff] px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest cursor-pointer disabled:opacity-50 focus:outline focus:outline-2 focus:outline-[#fff] focus:outline-offset-2 active:outline-none';

  const handleDelete = async (gardenId: number) => {
    if (!confirm(t('confirmDelete'))) return;
    try {
      const res = await apiFetch(`/api/garden/${gardenId}/`, {
        method: 'DELETE',
      });
      if (res.ok || res.status === 204) {
        setGardens(prev => prev.filter(g => g.id !== gardenId));
      }
    } catch { }
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
    <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {currentGardens.map((garden, idx) => (
          <GardenCard
            key={garden.id}
            garden={garden}
            priority={idx < 4}
            canDelete={currentUser === profileUsername && !garden.isDefault}
            onDelete={() => handleDelete(garden.id)}
          />
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
            onClick={() => setCurrentPage(p => p - 1)}
            disabled={currentPage === 1}
            className={btnStyle}
          >
            &lt;
          </button>
          <div className="text-white-text font-bold text-sm text-center w-full min-w-[60px] whitespace-nowrap">
            {currentPage} / {totalPages}
          </div>
          <button
            onClick={() => setCurrentPage(p => p + 1)}
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
