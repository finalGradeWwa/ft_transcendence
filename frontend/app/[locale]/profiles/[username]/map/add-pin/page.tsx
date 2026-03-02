import { serverFetch } from '@/lib/serverAuth';
import AddPinClientPage from './AddPinClientPage';

type Item = {
  id?: number;
  plant_id?: number;
  garden_id?: number;
  nickname?: string;
  name?: string;
  image?: string;
  image_url?: string;
  thumbnail?: string;
  photo?: string;
};

function toList(data: unknown): Item[] {
  if (Array.isArray(data)) {
    return data as Item[];
  }

  if (
    data &&
    typeof data === 'object' &&
    'results' in data &&
    Array.isArray((data as { results?: unknown }).results)
  ) {
    return (data as { results: Item[] }).results;
  }

  return [];
}

export default async function AddPinPage({
  params,
}: {
  params: Promise<{ locale: string; username: string }>;
}) {
  const { username } = await params;

  let initialPlantItems: Item[] = [];
  let initialGardenItems: Item[] = [];

  try {
    const [plantsResponse, gardensResponse] = await Promise.all([
      serverFetch(`/api/plant/?username=${encodeURIComponent(username)}`),
      serverFetch(`/api/garden/?username=${encodeURIComponent(username)}`),
    ]);

    if (plantsResponse.ok) {
      initialPlantItems = toList(await plantsResponse.json());
    }

    if (gardensResponse.ok) {
      initialGardenItems = toList(await gardensResponse.json());
    }
  } catch {
    initialPlantItems = [];
    initialGardenItems = [];
  }

  return (
    <AddPinClientPage
      username={username}
      initialPlantItems={initialPlantItems}
      initialGardenItems={initialGardenItems}
    />
  );
}
