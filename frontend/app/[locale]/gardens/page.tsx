import { GardensPageClient } from '../GardensPageClient';
import { getTranslations } from 'next-intl/server';
import { serverFetch } from '@/lib/serverAuth';

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
).replace(/\/$/, '');

/**
 * PL: Generuje metadane SEO dla strony ogrodów.
 * EN: Generates SEO metadata for the gardens page.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: t('gardens'),
    description: t('gardensDescription'),
  };
}

export default async function GlobalGardensPage() {
  const t = await getTranslations('GardensPage');
  let gardens: any[] = [];

  try {
    const response = await serverFetch('/api/garden/');
    if (response.ok) {
      const data = await response.json();

      gardens = data.map((garden: any) => {
        const envMap: Record<string, string> = {
          i: 'indoor',
          o: 'outdoor',
          g: 'greenhouse',
        };
        const rawEnv = String(garden.environment || '')
          .toLowerCase()
          .charAt(0);
        const envKey = envMap[rawEnv] || 'indoor';

        const rawImage = garden.thumbnail;
        let finalImage = '/images/garden/garden-placeholder.webp';
        if (rawImage) {
          finalImage = rawImage.startsWith('http')
            ? rawImage
            : `${API_URL}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
        }

        return {
          id: garden.garden_id,
          name:
            garden.name?.includes("'s Garden") ||
              garden.name === 'Default Garden'
              ? t('defaultGardenName')
              : garden.name,
          owner: garden.owner || t('unknownOwner'),
          plantsCount: garden.plant_count || 0,
          styleName: t(`environments.${envKey}`),
          image: finalImage,
        };
      }).reverse();
    }
  } catch (error) {
    console.error('Failed to fetch gardens:', error);
  }

  return (
    <div className="bg-main-gradient min-h-screen">
      <GardensPageClient gardens={gardens} />
    </div>
  );
}
