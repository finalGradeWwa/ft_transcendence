import { getTranslations } from 'next-intl/server';
import { RtlWrapper } from '@/components/RtlWrapper';
import { PlantType } from '../types/plantTypes';
import { LandingPage } from './LandingPage';
import { cookies } from 'next/headers';
import { serverFetch } from '@/lib/serverAuth';
import '../globals.css';

/**
 * PL: Generuje metadane SEO dla strony głównej.
 * EN: Generates SEO metadata for the home page.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: { absolute: t('home') },
    description: t('homeDescription'),
  };
}

async function getAllPlants(): Promise<PlantType[]> {
  try {
    const response = await serverFetch('/api/plant/');

    if (!response.ok) return [];
    const data = await response.json();

    return data.map((p: any) => ({
      id: p.plant_id,
      author: p.owner_username,
      latinName: p.species,
      commonName: p.nickname,
      averageRating: '0.0',
      totalReviews: 0,
      image: p.image_url,
      garden: p.garden_name,
      gardenId: p.garden_id,
    }));
  } catch (error) {
    return [];
  }
}

export default async function FinalPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const { showLogin, registered } = await searchParams;

  const cookieStore = await cookies();
  const hasSession = cookieStore.has('refresh_token');

  if (!hasSession) {
    return (
      <>
        <LandingPage locale={locale} showLogin={showLogin === 'true'} />
      </>
    );
  }

  const tGardens = await getTranslations('GardensPage');
  const plants = await getAllPlants();

  const translatedPlants = plants.map(p => ({
    ...p,
    garden:
      p.garden?.includes("'s Garden") || p.garden === 'Default Garden'
        ? tGardens('defaultGardenName')
        : p.garden,
  }));

  return (
    <RtlWrapper
      plants={translatedPlants}
      locale={locale}
      showLogin={showLogin === 'true'}
      isRegistered={registered === 'true'}
    />
  );
}
