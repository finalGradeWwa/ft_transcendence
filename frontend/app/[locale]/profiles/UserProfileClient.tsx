'use client';

/** * PL: Nowoczesny komponent profilu (7xl). Dynamicznie wyświetla dane z backendu Django i obsługuje i18n.
 * EN: Modern profile component (7xl). Dynamically displays data from Django backend and supports i18n.
 */

import { Navigation } from '@/components/Navigation';
import { Heading } from '@/components/Heading';
import { Text } from '@/components/typography/Text';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

interface UserProfileProps {
  user: {
    username: string;
    email: string;
    joined: string;
    gardens: number;
    plants: number;
    avatar_photo: string;
  } | null;
}

/** * PL: Pomocnicze funkcje formatowania.
 * EN: Helper formatting functions.
 */
const getAvatarUrl = (path?: string) => {
  if (!path) return '/images/favicon/fav_480.webp';
  return path.startsWith('http') ? path : `http://localhost:8000${path}`;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toISOString().split('T')[0];
  } catch {
    return dateString;
  }
};

/** * PL: Sub-komponent sekcji danych osobowych.
 * EN: Personal data sub-component.
 */
const PersonalInfo = ({
  user,
  t,
}: {
  user: UserProfileProps['user'];
  t: any;
}) => {
  if (!user) {
    return (
      <div className="lg:col-span-2 flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 p-6 sm:p-10 bg-header-main/50 rounded-xl shadow-md border border-subtle-gray/30 overflow-hidden">
        <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-neutral-200 animate-pulse shrink-0" />
        <div className="flex-grow space-y-6 w-full">
          <div className="h-10 bg-neutral-200 animate-pulse rounded-md w-3/4 mx-auto md:mx-0" />
          <div className="space-y-4">
            <div className="h-6 bg-neutral-200 animate-pulse rounded-md w-1/2 mx-auto md:mx-0" />
            <div className="h-6 bg-neutral-200 animate-pulse rounded-md w-1/3 mx-auto md:mx-0" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 p-6 sm:p-10 bg-container-light/70 rounded-xl shadow-md border border-subtle-gray/30 overflow-hidden">
      <div className="relative w-40 h-40 sm:w-48 sm:h-48 overflow-hidden rounded-full border-4 border-secondary-beige shadow-lg flex-shrink-0">
        <Image
          src={getAvatarUrl(user.avatar_photo)}
          alt={t('aria.avatarAlt', { name: user.username })}
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="flex-grow space-y-6 text-center md:text-left min-w-0 w-full">
        <Heading
          as="h1"
          className="text-3xl sm:text-4xl font-black !text-primary-green uppercase tracking-tight break-words whitespace-normal block"
        >
          {user.username}
        </Heading>
        <div className="space-y-4 text-neutral-900 w-full">
          <div className="flex items-center justify-center md:justify-start gap-4 min-w-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 640"
              className="w-6 h-6 sm:w-7 sm:h-7 fill-primary-green shrink-0"
              aria-hidden="true"
            >
              <path d="M112 128C85.5 128 64 149.5 64 176C64 191.1 71.1 205.3 83.2 214.4L291.2 370.4C308.3 383.2 331.7 383.2 348.8 370.4L556.8 214.4C568.9 205.3 576 191.1 576 176C576 149.5 554.5 128 528 128L112 128zM64 260L64 448C64 483.3 92.7 512 128 512L512 512C547.3 512 576 483.3 576 448L576 260L377.6 408.8C343.5 434.4 296.5 434.4 262.4 408.8L64 260z" />
            </svg>
            <Text className="text-base sm:text-lg font-medium break-all whitespace-normal">
              {user.email}
            </Text>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              className="w-6 h-6 sm:w-7 sm:h-7 fill-primary-green shrink-0"
              aria-hidden="true"
            >
              <path d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z" />
            </svg>
            <Text className="text-base sm:text-lg font-medium">
              <span className="sr-only">{t('joinedLabel')}: </span>
              {formatDate(user.joined)}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

/** * PL: Sub-komponent statystyk.
 * EN: Statistics sub-component.
 */
const StatCard = ({
  count,
  label,
  href,
  aria,
  isLoading,
}: {
  count?: number;
  label: string;
  href: string;
  aria: string;
  isLoading: boolean;
}) => (
  <Link href={href} className="group flex-1" aria-label={aria}>
    <div className="h-full bg-container-light/90 p-6 rounded-xl flex flex-col justify-center items-center text-center shadow-sm border border-subtle-gray/30 transition-all duration-300 group-hover:bg-white group-hover:border-primary-green group-hover:shadow-md">
      {isLoading ? (
        <div className="h-12 w-16 bg-neutral-200 animate-pulse rounded-md" />
      ) : (
        <span className="block text-4xl sm:text-5xl font-black text-primary-green leading-none">
          {count}
        </span>
      )}
      <span className="uppercase font-black text-sm sm:text-base mt-2 tracking-[0.2em] text-neutral-700 break-words whitespace-normal px-2">
        {label}
      </span>
    </div>
  </Link>
);

/** * PL: Główny komponent klienta.
 * EN: Main client component.
 */
export default function UserProfileClient({ user }: UserProfileProps) {
  const t = useTranslations('ProfilePage');

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
      <Navigation />
      <main className="py-12 flex justify-center">
        <div className="bg-container-light/10 backdrop-blur-md p-6 sm:p-10 rounded-xl shadow-2xl w-full border border-primary-green/50">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <PersonalInfo user={user} t={t} />

            <div className="flex flex-col gap-4">
              <StatCard
                count={user?.gardens}
                label={t('stats.gardens')}
                href="/my-gardens"
                aria={t('aria.gardensLink')}
                isLoading={!user}
              />
              <StatCard
                count={user?.plants}
                label={t('stats.plants')}
                href="/my-plants"
                aria={t('aria.plantsLink')}
                isLoading={!user}
              />
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/20">
            <Heading
              as="h3"
              className="text-xl font-black !text-white uppercase mb-6 tracking-widest drop-shadow-sm break-words whitespace-normal"
            >
              {t('settings.title')}
            </Heading>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { key: 'edit', href: '/profile/edit' },
                { key: 'notifications', href: '/profile/notifications' },
                { key: 'privacy', href: '/profile/privacy' },
              ].map(({ key, href }) => (
                <Link
                  key={key}
                  href={href}
                  className="group block p-6 sm:p-8 bg-container-light/90 rounded-xl border border-transparent shadow-sm transition-all duration-300 hover:bg-white hover:border-primary-green hover:shadow-md overflow-hidden"
                >
                  <Text className="font-black text-primary-green uppercase text-base sm:text-lg tracking-wider mb-3 break-words whitespace-normal">
                    {t(`settings.${key}.label`)}
                  </Text>
                  <Text
                    variant="small"
                    className="text-neutral-700 font-medium leading-relaxed break-words whitespace-normal"
                  >
                    {t(`settings.${key}.desc`)}
                  </Text>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
