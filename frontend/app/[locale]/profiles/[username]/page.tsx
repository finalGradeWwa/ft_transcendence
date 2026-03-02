import { notFound } from 'next/navigation';
import UserProfileClient from '../UserProfileClient';
import { getTranslations } from 'next-intl/server';
import { serverFetch } from '@/lib/serverAuth';

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
).replace(/\/$/, '');

async function getUserProfile(username: string) {
  try {
    const response = await fetch(`${API_URL}/users/profile/${username}/`, {
      cache: 'no-store',
    });

    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * PL: Generuje dynamiczne metadane SEO na podstawie nazwy użytkownika.
 * EN: Generates dynamic SEO metadata based on the username.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; username: string }>;
}) {
  const { locale, username } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: t('profile', { name: username }),
    description: t('profileDescription', { name: username }),
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await getUserProfile(username);

  if (!user) notFound();

  type FriendStatus = 'none' | 'request-sent' | 'request-received' | 'friends';

  let currentLoggedUser: string | null = null;
  let currentLoggedUserId: number | null = null;
  let joinedGardens: any[] = [];
  let pins: any[] = [];
  let initialFriendStatus: FriendStatus | null = null;

  try {
    const [meResponse, joinedGardensResponse, pinsResponse] =
      await Promise.all([
        serverFetch('/api/auth/me/', { method: 'GET' }),
        serverFetch(`/api/garden/?member=${encodeURIComponent(user.username)}`),
        serverFetch(`/api/pins/?owner=${user.id}`),
      ]);

    if (meResponse.ok) {
      const meData = (await meResponse.json()) as {
        id?: number;
        username?: string;
      };
      currentLoggedUserId = meData.id ?? null;
      currentLoggedUser = meData.username ?? null;
    }

    if (joinedGardensResponse.ok) {
      const gardensData = await joinedGardensResponse.json();
      if (Array.isArray(gardensData)) {
        joinedGardens = gardensData.filter(
          (garden: any) =>
            garden.owner !== user.username && Number(garden.user_count) > 1
        );
      }
    }

    if (pinsResponse.ok) {
      const pinsData = await pinsResponse.json();
      pins = Array.isArray(pinsData) ? pinsData : [];
    }

    const shouldLoadFriendStatus =
      currentLoggedUserId !== null && currentLoggedUserId !== user.id;

    if (shouldLoadFriendStatus) {
      const [friendsRes, outgoingRes, incomingRes] = await Promise.all([
        serverFetch('/api/friends/', { method: 'GET' }),
        serverFetch('/api/friend-requests/outgoing/', { method: 'GET' }),
        serverFetch('/api/friend-requests/', { method: 'GET' }),
      ]);

      const friends = friendsRes.ok ? await friendsRes.json() : [];
      const outgoing = outgoingRes.ok ? await outgoingRes.json() : [];
      const incoming = incomingRes.ok ? await incomingRes.json() : [];

      if (Array.isArray(friends) && friends.some((u: any) => u.id === user.id)) {
        initialFriendStatus = 'friends';
      } else if (
        Array.isArray(outgoing) &&
        outgoing.some((u: any) => u.id === user.id)
      ) {
        initialFriendStatus = 'request-sent';
      } else if (
        Array.isArray(incoming) &&
        incoming.some((u: any) => u.id === user.id)
      ) {
        initialFriendStatus = 'request-received';
      } else {
        initialFriendStatus = 'none';
      }
    }
  } catch {
    currentLoggedUser = null;
    currentLoggedUserId = null;
    joinedGardens = [];
    pins = [];
    initialFriendStatus = null;
  }

  const userWithData = {
    ...user,
    joined_gardens: joinedGardens,
    pins,
  };

  return (
    <UserProfileClient
      user={userWithData}
      currentLoggedUser={currentLoggedUser}
      initialFriendStatus={initialFriendStatus}
    />
  );
}
