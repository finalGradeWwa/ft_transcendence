import UserProfileClient from '../UserProfileClient';
import { cookies } from 'next/headers';

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
).replace(/\/$/, '');

async function getUserProfile(username: string) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    const response = await fetch(`${API_URL}/users/profile/${username}/`, {
      cache: 'no-store',
      headers: refreshToken ? { Cookie: `refresh_token=${refreshToken}` } : {},
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    return null;
  }
}

async function getUserGardens(username: string) {
  try {
    const response = await fetch(`${API_URL}/api/garden/?member=${username}`, {
      cache: 'no-store',
    });
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await getUserProfile(username);

  if (!user) return null;

  const allGardens = await getUserGardens(username);

  if (Array.isArray(allGardens)) {
    user.owned_gardens = allGardens.filter((g: any) => g.owner === username);
    user.joined_gardens = allGardens.filter(
      (g: any) => g.owner !== username && g.user_count > 1
    );
    user.gardens_count = user.owned_gardens.length;
  }

  user.pins = [];

  return <UserProfileClient user={user} currentLoggedUser={null} />;
}
