import { serverFetch } from '@/lib/serverAuth';
import { CreatePlantClientPage } from './CreatePlantClientPage';

type Garden = {
  garden_id: number;
  name: string;
};

type CurrentUser = {
  username?: string;
};

export default async function AddPlantPage({
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ gardenId?: string }>;
}) {
  const { gardenId } = await searchParams;

  let username = '';
  let gardens: Garden[] = [];

  try {
    const [meResponse, gardensResponse] = await Promise.all([
      serverFetch('/api/auth/me/', { method: 'GET' }),
      serverFetch('/api/garden/?owner=me', { method: 'GET' }),
    ]);

    if (meResponse.ok) {
      const meData = (await meResponse.json()) as CurrentUser;
      username = meData.username ?? '';
    }

    if (gardensResponse.ok) {
      const gardensData = await gardensResponse.json();
      gardens = Array.isArray(gardensData) ? gardensData : [];
    }
  } catch {
    username = '';
    gardens = [];
  }

  return (
    <CreatePlantClientPage
      username={username}
      gardens={gardens}
      initialGardenId={gardenId ?? null}
    />
  );
}
