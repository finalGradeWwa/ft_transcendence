import { GardensPageClient } from '../GardensPageClient';
import { getTranslations } from 'next-intl/server';

/**
 * PL: Serwerowy komponent strony globalnej listy ogrodów.
 * EN: Server-side component for the global gardens list page.
 */

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
).replace(/\/$/, '');

async function getAllGardens(t: any) {
  try {
    const response = await fetch(`${API_URL}/api/garden/`, {
      cache: 'no-store',
    });
    if (!response.ok) return [];
    const gardens = await response.json();

    const gardensWithImages = await Promise.all(
      gardens
        .filter((g: any) => g.user_count > 0)
        .map(async (garden: any) => {
          const plantsRes = await fetch(
            `${API_URL}/api/plant/?garden=${garden.garden_id}`,
            { cache: 'no-store' }
          );
          console.log(
            'plants status:',
            plantsRes.status,
            'garden:',
            garden.garden_id
          );
          const plants = plantsRes.ok ? await plantsRes.json() : [];
          console.log('plants:', plants.length, plants[0]);
          // PL: Szukamy najstarszej rośliny, priorytetyzując image_url
          const oldestPlantWithImage = plants
            .filter((p: any) => p.image_url || p.image || p.thumbnail)
            .sort((a: any, b: any) => {
              const idA = a.plant_id || 0;
              const idB = b.plant_id || 0;
              return idA - idB;
            })[0];

          let finalImage = null;

          // PL: Logika wyboru obrazka
          const rawImage = oldestPlantWithImage
            ? oldestPlantWithImage.image_url ||
              oldestPlantWithImage.image ||
              oldestPlantWithImage.thumbnail
            : garden.thumbnail;

          if (rawImage) {
            if (rawImage.startsWith('http')) {
              finalImage = rawImage;
            } else {
              // PL: Ujednolicona logika budowania adresu URL
              const baseUrl = API_URL.endsWith('/')
                ? API_URL.slice(0, -1)
                : API_URL;
              const imgPath = rawImage.startsWith('/')
                ? rawImage
                : `/${rawImage}`;
              finalImage = `${baseUrl}${imgPath}`;
            }
          }

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
            image: finalImage,
          };
        })
    );

    return gardensWithImages;
  } catch (error) {
    return [];
  }
}

export default async function GlobalGardensPage() {
  const t = await getTranslations('GardensPage');

  const gardensData = await getAllGardens(t);
  const sortedGardens = [...gardensData].reverse();

  return (
    <div className="bg-main-gradient min-h-screen">
      <GardensPageClient gardens={sortedGardens} />
    </div>
  );
}
