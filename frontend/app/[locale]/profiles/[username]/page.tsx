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

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  /**
   * PL: Obiekt danych użytkownika (uchwyty dla backendu).
   * EN: User data object (backend handles).
   */
  const mockUser = {
    id: 1, // Dodane
    username: username,
    date_joined: '2024-05-20',
    avatar_photo: '',
    followers: 0,
    following: 0,
    gardens: 0,
    plants: 0,
    pins: [], // Dodane
  };

  // Musisz też dodać drugi wymagany prop: currentLoggedUser
  return <UserProfileClient user={mockUser} currentLoggedUser={null} />;
}
