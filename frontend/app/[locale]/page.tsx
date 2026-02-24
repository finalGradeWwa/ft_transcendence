import { getTranslations } from 'next-intl/server';
import { RtlWrapper } from '@/components/RtlWrapper';
import { PlantType } from '../types/plantTypes';
import { LandingPage } from './LandingPage';
import { cookies } from 'next/headers';
import '../globals.css';

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
).replace(/\/$/, '');

async function getAllPlants(): Promise<PlantType[]> {
  try {
    const response = await fetch(`${API_URL}/api/plant/`, {
      cache: 'no-store',
    });

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

const dummyPlants: Array<PlantType> = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  author: `user_${(i % 5) + 1}`,
  latinName: `Plantae magnificum ${i + 1}`,
  commonName: `Roslina Zwykla ${i + 1}`,
  averageRating: (((i * 0.4) % 6) + 1).toFixed(1),
  totalReviews: Math.floor(Math.random() * 50) + 1,
}));

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
      plants={translatedPlants.length > 0 ? translatedPlants : dummyPlants}
      locale={locale}
      showLogin={showLogin === 'true'}
      isRegistered={registered === 'true'}
    />
  );
}
