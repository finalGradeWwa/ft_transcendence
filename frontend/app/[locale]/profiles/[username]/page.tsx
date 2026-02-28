import { notFound } from 'next/navigation';
import UserProfileClient from '../UserProfileClient';
import { getTranslations } from 'next-intl/server';

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
  } catch (error) {
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

  const userWithPins = { ...user, pins: [] };

  return <UserProfileClient user={userWithPins} currentLoggedUser={null} />;
}
