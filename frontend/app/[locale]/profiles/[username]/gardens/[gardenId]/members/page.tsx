import { serverFetch } from '@/lib/serverAuth';
import MembersClientPage from './MembersClientPage';

type Member = {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  avatar_photo?: string | null;
};

type CurrentUser = {
  username?: string;
};

type GardenResponse = {
  owner?: string;
  owner_username?: string;
  members?: Member[];
};

export default async function MembersPage({
  params,
}: {
  params: Promise<{ username: string; gardenId: string }>;
}) {
  const { username, gardenId } = await params;

  let initialCurrentUser: string | null = null;
  let initialMembers: Member[] = [];
  let initialGardenOwner: string | null = null;

  try {
    const [meRes, gardenRes] = await Promise.all([
      serverFetch('/api/auth/me/', { method: 'GET' }),
      serverFetch(`/api/garden/${gardenId}/`, { method: 'GET' }),
    ]);

    if (meRes.ok) {
      const meData = (await meRes.json()) as CurrentUser;
      initialCurrentUser = meData.username ?? null;
    }

    if (gardenRes.ok) {
      const gardenData = (await gardenRes.json()) as GardenResponse;
      initialMembers = Array.isArray(gardenData.members)
        ? gardenData.members
        : [];
      initialGardenOwner =
        gardenData.owner ?? gardenData.owner_username ?? null;
    }
  } catch {
    initialCurrentUser = null;
    initialMembers = [];
    initialGardenOwner = null;
  }

  return (
    <MembersClientPage
      username={username}
      gardenId={gardenId}
      initialCurrentUser={initialCurrentUser}
      initialMembers={initialMembers}
      initialGardenOwner={initialGardenOwner}
    />
  );
}
