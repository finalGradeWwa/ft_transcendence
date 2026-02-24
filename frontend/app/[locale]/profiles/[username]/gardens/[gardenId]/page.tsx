// /frontend/app/[locale]/profiles/[username]/gardens/[gardenId]/page.tsx

import { HomePageClient } from '../../../../HomePageClient';
import { getTranslations } from 'next-intl/server';
import { GardenActions } from '@/components/gardens/GardenActions';

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
).replace(/\/$/, '');

async function getGardenPlants(gardenId: string) {
  try {
    const response = await fetch(
      `${API_URL}/api/plant/?garden=${encodeURIComponent(gardenId)}`,
      { cache: 'no-store' }
    );
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

async function getGarden(gardenId: string) {
  try {
    const response = await fetch(`${API_URL}/api/garden/${gardenId}/`, {
      cache: 'no-store',
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export default async function GardenPage({
  params,
}: {
  params: Promise<{ username: string; gardenId: string }>;
}) {
  const { username, gardenId } = await params;
  const tGardens = await getTranslations('GardensPage');

  const [plantsData, garden] = await Promise.all([
    getGardenPlants(gardenId),
    getGarden(gardenId),
  ]);

  if (!garden) {
    return (
      <div className="min-h-screen bg-main-gradient flex items-center justify-center">
        <div className="bg-secondary-beige p-8 rounded-xl shadow-xl border-2 border-primary-green outline outline-2 outline-neutral-900 outline-offset-2">
          <p className="text-primary-green font-black uppercase tracking-widest text-xl">
            Garden Not Found
          </p>
        </div>
      </div>
    );
  }

  const isDefault =
    garden.name?.includes("'s Garden") || garden.name === 'Default Garden';
  const gardenDisplayName = isDefault
    ? tGardens('defaultGardenName')
    : garden.name || gardenId;

  const plants = (Array.isArray(plantsData) ? plantsData : []).map((p: any) => {
    const rawImage = p.image_url || p.image || p.thumbnail;
    let finalImage = '/images/garden/garden-placeholder.webp';

    if (rawImage) {
      if (rawImage.startsWith('http')) {
        finalImage = rawImage;
      } else {
        const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
        const imgPath = rawImage.startsWith('/') ? rawImage : `/${rawImage}`;
        finalImage = `${baseUrl}${imgPath}`;
      }
    }

    return {
      id: p.plant_id,
      commonName: p.nickname,
      latinName: p.species || '',
      author: p.owner_username || p.owner || username,
      garden: gardenDisplayName,
      gardenId: parseInt(gardenId),
      image: finalImage,
    };
  });

  return (
    <div className="min-h-screen bg-main-gradient pb-20 overflow-hidden">
      <header className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 pt-12 pb-4">
        <div className="bg-gradient-to-r from-secondary-beige/90 via-secondary-beige/80 to-header-main/60 p-6 sm:p-8 md:p-10 rounded-2xl border-b-4 border-primary-green/20 shadow-xl relative overflow-hidden mx-4 sm:mx-0 outline outline-2 outline-neutral-900 outline-offset-2">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tighter">
            <span className="text-primary-green uppercase mr-4">
              {garden.owner_username || garden.owner || username}
            </span>
            <span className="text-primary-green/30 font-light mr-4">—</span>
            <span className="text-neutral-800 uppercase">
              {gardenDisplayName}
            </span>
          </h1>
          <div className="h-2 w-24 bg-primary-green mt-6 rounded-full" />
          {(() => {
            const envMap: Record<string, string> = {
              i: 'indoor',
              o: 'outdoor',
              g: 'greenhouse',
            };
            const envKey = envMap[garden.environment?.toLowerCase() || ''];
            return envKey ? (
              <p className="text-neutral-600 mt-4 font-bold uppercase tracking-[0.3em] text-xs">
                {tGardens(`environments.${envKey}` as any)}
              </p>
            ) : null;
          })()}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <GardenActions
          gardenId={gardenId}
          username={username}
          isDefault={isDefault}
          members={garden.members || []}
          owner={garden.owner || ''}
          tAddPlant={tGardens('addPlant')}
          tAddGardener={tGardens('addGardener')}
          tManageGarden={tGardens('manageGarden')}
        />
      </div>

      <div className="overflow-hidden px-0 sm:px-4">
        <HomePageClient plants={plants} hideTitle />
      </div>
    </div>
  );
}
