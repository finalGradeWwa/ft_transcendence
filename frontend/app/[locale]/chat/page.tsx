import { serverFetch } from '@/lib/serverAuth';
import ChatClientPage from './ChatClientPage';

type User = {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
};

type CurrentUser = {
  id?: number;
};

export default async function ChatPage() {
  let initialCurrentUserId: number | null = null;
  let initialFriends: User[] = [];

  try {
    const [meResponse, friendsResponse] = await Promise.all([
      serverFetch('/api/auth/me/', { method: 'GET' }),
      serverFetch('/api/friends/', { method: 'GET' }),
    ]);

    if (meResponse.ok) {
      const meData = (await meResponse.json()) as CurrentUser;
      initialCurrentUserId = meData.id ?? null;
    }

    if (friendsResponse.ok) {
      const friendsData = await friendsResponse.json();
      initialFriends = Array.isArray(friendsData) ? friendsData : [];
    }
  } catch {
    initialCurrentUserId = null;
    initialFriends = [];
  }

  return (
    <ChatClientPage
      initialCurrentUserId={initialCurrentUserId}
      initialFriends={initialFriends}
    />
  );
}
