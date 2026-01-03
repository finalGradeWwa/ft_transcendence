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

import { UserProfileClient } from '../UserProfileClient';
import { Background } from '@/components/Background';

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  return (
    <Background>
      <UserProfileClient dynamicUsername={username} />
    </Background>
  );
}
