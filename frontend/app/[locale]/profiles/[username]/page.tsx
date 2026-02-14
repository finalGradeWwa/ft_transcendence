/**
 * Dynamic Profile Page Component (Serwerowy komponent profilu dynamicznego)
 * * EN: This server-side component extracts the 'username' from the dynamic URL
 * route (e.g., /profiles/[username]). It wraps the client-side profile
 * interface with a consistent background and passes the URL parameter
 * down to display user-specific data.
 * * PL: Ten komponent serwerowy wyodrębnia nazwę użytkownika (username) z dynamicznej
 * ścieżki adresu URL (np. /profiles/[username]). Otacza interfejs profilu po stronie
 * klienta spójnym tłem i przekazuje parametr URL w dół, aby wyświetlić dane
 * konkretnego użytkownika.
 */

import UserProfileClient from '../UserProfileClient';
import { cookies } from 'next/headers';

async function getUserProfile(username: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/profile/${username}/`,
      { cache: 'no-store' }
    );

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    return null;
  }
}

async function getCurrentUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) return null;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me/`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      }
    );

    if (!response.ok) return null;
    const data = await response.json();
    return data.username;
  } catch (error) {
    return null;
  }
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const [user, currentLoggedUser] = await Promise.all([
    getUserProfile(username),
    getCurrentUser(),
  ]);

  return (
    <UserProfileClient user={user} currentLoggedUser={currentLoggedUser} />
  );
}
