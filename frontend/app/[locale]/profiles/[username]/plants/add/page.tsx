import { serverFetch } from '@/lib/serverAuth';
import { ProfileAddPlantClientPage } from './ProfileAddPlantClientPage';

type Garden = {
  garden_id: number;
  name: string;
};

/**
 * PL: Strona dodawania nowej rośliny.
 * EN: Add new plant page.
 */
export default async function AddPlantPage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ gardenId?: string }>;
}) {
  const { username } = await params;
  const { gardenId } = await searchParams;

  let gardens: Garden[] = [];

  try {
    const response = await serverFetch('/api/garden/?owner=me', {
      method: 'GET',
    });
    if (response.ok) {
      const data = await response.json();
      gardens = Array.isArray(data) ? data : [];
    }
  } catch {
    gardens = [];
  }

  return (
    <ProfileAddPlantClientPage
      username={username}
      gardens={gardens}
      initialGardenId={gardenId ?? null}
    />
  );
}
