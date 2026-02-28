'use client';

/**
 * PL: Zbiór komponentów prezentacyjnych oraz interfejsów dla profilu użytkownika.
 * EN: Collection of presentational components and interfaces for the user profile.
 */

import { useState, useEffect } from 'react';
import { Heading } from '@/components/Heading';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { apiFetch } from '@/lib/auth';
import { useToast } from '@/components/ToastProvider';

/**
 * PL: Typ funkcji tłumaczącej zwracanej przez useTranslations.
 * EN: Translation function type returned by useTranslations.
 */
type TranslateFunction = ReturnType<typeof useTranslations>;

/**
 * PL: Interfejs definiujący dane profilu użytkownika przekazywane do komponentów.
 * EN: Interface defining user profile data passed to components.
 */
export interface UserProfileProps {
  user: {
    id: number;
    username: string;
    date_joined: string;
    avatar_photo?: string;
    gardens: number;
    plants: number;
    plants_count?: number;
    gardens_count?: number;
    owned_gardens?: Array<{
      id: number;
      name: string;
      owner: string;
    }>;
    joined_gardens?: Array<{
      id: number;
      name: string;
      owner: string;
    }>;
    pins: Array<{
      id: number;
      title: string;
      image: string;
    }>;
  } | null;
  currentLoggedUser: string | null;
}

/**
 * PL: Funkcja pomocnicza do budowania pełnego adresu URL awatara.
 * EN: Helper function to construct the full avatar URL.
 */
export const getAvatarUrl = (path?: string) => {
  if (!path) return '/images/favicon/fav_480.webp';
  if (path.startsWith('http')) return path;

  const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000').replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  if (cleanPath.startsWith('/media/')) {
    return `${apiUrl}${cleanPath}`;
  }

  return `${apiUrl}/media${cleanPath}`;
};

/**
 * PL: Wyświetla okrągły awatar użytkownika.
 * EN: Displays the user's circular avatar.
 */
export const UserAvatar = ({ user }: { user: UserProfileProps['user'] }) => {
  const avatarUrl = getAvatarUrl(user?.avatar_photo);
  return (
    <div className="relative w-40 h-40 sm:w-48 sm:h-48 overflow-hidden rounded-full border-4 border-secondary-beige shadow-lg flex-shrink-0">
      <Image
        src={avatarUrl}
        alt={user?.username || 'User'}
        fill
        sizes="(max-width: 640px) 160px, 192px"
        className="object-cover"
        priority
        unoptimized // PL: Wyłącza Next.js Image Optimizer dla external URLs EN: Disables Next.js Image Optimizer for external URLs
      />
    </div>
  );
};

/**
 * PL: Wyświetla datę dołączenia użytkownika do serwisu.
 * EN: Displays the user's registration date.
 */
export const UserJoinedInfo = ({
  dateJoined,
  t,
}: {
  dateJoined: string;
  t: TranslateFunction;
}) => (
  <div className="flex flex-col items-center md:items-start pt-2 flex-grow">
    <span className="text-[16px] font-black uppercase tracking-[0.04em] text-primary-green leading-none mb-1">
      {t('joinedLabel')}
    </span>
    <span className="text-sm font-bold text-neutral-700">{dateJoined}</span>
  </div>
);

/**
 * PL: Szkielet ładowania (Skeleton) dla sekcji informacji osobistych.
 * EN: Loading skeleton for the personal information section.
 */
export const PersonalInfoSkeleton = () => (
  <div className="lg:col-span-2 flex flex-col md:flex-row items-center gap-8 p-6 sm:p-10 bg-header-main/50 rounded-xl animate-pulse">
    <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-neutral-200" />
    <div className="flex-grow space-y-6 w-full">
      <div className="h-10 bg-neutral-200 rounded-md w-3/4" />
      <div className="h-6 bg-neutral-200 rounded-md w-1/2" />
    </div>
  </div>
);

/**
 * PL: Typ stanu relacji znajomości między użytkownikami.
 * EN: Type for friendship status between users.
 */
type FriendStatus = 'loading' | 'none' | 'request-sent' | 'request-received' | 'friends';

/**
 * PL: Przycisk zarządzania relacją znajomości (dodaj/usuń znajomego, anuluj/akceptuj zaproszenie).
 * EN: Friendship management button (add/remove friend, cancel/accept request).
 */
export const FriendRequestButton = ({
  userId,
  isOwnProfile,
  isLoggedIn,
}: {
  userId: number;
  isOwnProfile: boolean;
  isLoggedIn: boolean;
}) => {
  const t = useTranslations('ProfilePage');
  const tErrors = useTranslations('errors');
  const { showToast } = useToast();
  const [status, setStatus] = useState<FriendStatus>('loading');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOwnProfile || !isLoggedIn) return;

    const checkStatus = async () => {
      try {
        const [friendsRes, outgoingRes, incomingRes] = await Promise.all([
          apiFetch('/api/friends/'),
          apiFetch('/api/friend-requests/outgoing/'),
          apiFetch('/api/friend-requests/'),
        ]);

        const friends = friendsRes.ok ? await friendsRes.json() : [];
        const outgoing = outgoingRes.ok ? await outgoingRes.json() : [];
        const incoming = incomingRes.ok ? await incomingRes.json() : [];

        if (Array.isArray(friends) && friends.some((u: any) => u.id === userId)) {
          setStatus('friends');
        } else if (Array.isArray(outgoing) && outgoing.some((u: any) => u.id === userId)) {
          setStatus('request-sent');
        } else if (Array.isArray(incoming) && incoming.some((u: any) => u.id === userId)) {
          setStatus('request-received');
        } else {
          setStatus('none');
        }
      } catch {
        setStatus('none');
      }
    };

    checkStatus();
  }, [userId, isOwnProfile, isLoggedIn]);

  if (isOwnProfile || !isLoggedIn || status === 'loading') return null;

  const handleAction = async () => {
    setIsProcessing(true);
    try {
      switch (status) {
        case 'none': {
          const res = await apiFetch(`/users/${userId}/send-request/`, { method: 'POST' });
          if (res.ok) { setStatus('request-sent'); showToast(t('actions.addFriend'), 'success'); }
          break;
        }
        case 'request-sent': {
          const res = await apiFetch(`/users/${userId}/cancel-request/`, { method: 'POST' });
          if (res.ok) { setStatus('none'); showToast(t('actions.cancelRequest'), 'info'); }
          break;
        }
        case 'request-received': {
          const res = await apiFetch(`/users/${userId}/accept/`, { method: 'POST' });
          if (res.ok) { setStatus('friends'); showToast(t('actions.acceptRequest'), 'success'); }
          break;
        }
        case 'friends': {
          const res = await apiFetch(`/users/${userId}/unfriend/`, { method: 'POST' });
          if (res.ok) { setStatus('none'); showToast(t('actions.removeFriend'), 'info'); }
          break;
        }
      }
    } catch {
      showToast(tErrors('genericError'), 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const getButtonConfig = (): { label: string; style: string } => {
    switch (status) {
      case 'none':
        return { label: t('actions.addFriend'), style: 'bg-primary-green text-white hover:opacity-90' };
      case 'request-sent':
        return { label: t('actions.cancelRequest'), style: 'bg-yellow-600 text-white hover:bg-yellow-700' };
      case 'request-received':
        return { label: t('actions.acceptRequest'), style: 'bg-primary-green text-white hover:opacity-90' };
      case 'friends':
        return { label: t('actions.removeFriend'), style: 'bg-red-700/80 text-white hover:bg-red-800' };
      default:
        return { label: '', style: '' };
    }
  };

  const config = getButtonConfig();

  return (
    <button
      onClick={handleAction}
      disabled={isProcessing}
      className={`px-5 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-50 shadow-sm w-fit ${config.style}`}
      aria-label={config.label}
    >
      {isProcessing ? t('aria.loadingAction') : config.label}
    </button>
  );
};

/**
 * PL: Główny kontener danych profilowych (Avatar, Nazwa, Statystyki, Akcje).
 * EN: Main profile data container (Avatar, Name, Stats, Actions).
 */
export const PersonalInfoContent = ({
  user,
  t,
  isOwnProfile,
  currentLoggedUser,
}: {
  user: NonNullable<UserProfileProps['user']>;
  t: TranslateFunction;
  isOwnProfile: boolean;
  currentLoggedUser: string | null;
}) => {
  const dateJoined = user.date_joined
    ? new Date(user.date_joined).toISOString().split('T')[0]
    : t('fallback.unknown');

  return (
    <div className="lg:col-span-2 flex flex-col md:flex-row items-center md:items-start gap-8 p-6 sm:p-10 bg-container-light rounded-xl shadow-md border border-subtle-gray/30 overflow-hidden shrink-0 min-h-[320px] md:min-h-[280px]">
      <UserAvatar user={user} />
      <div className="flex-grow space-y-8 text-center md:text-start min-w-0 w-full flex flex-col h-full">
        <div className="space-y-2">
          <Heading
            as="h1"
            className="text-3xl sm:text-4xl font-black !text-primary-green uppercase tracking-tight"
          >
            {user.username}
          </Heading>
        </div>
        <UserJoinedInfo dateJoined={dateJoined} t={t} />

        <FriendRequestButton
          userId={user.id}
          isOwnProfile={isOwnProfile}
          isLoggedIn={!!currentLoggedUser}
        />
      </div>
    </div>
  );
};

/**
 * PL: Komponent pośredniczący, który decyduje o wyświetleniu Skeletonu lub właściwych danych.
 * EN: Proxy component that decides whether to display a Skeleton or actual data.
 */
export const PersonalInfo = ({
  user,
  t,
  isOwnProfile,
  currentLoggedUser,
}: {
  user: UserProfileProps['user'];
  t: TranslateFunction;
  isOwnProfile: boolean;
  currentLoggedUser: string | null;
}) => {
  if (!user) {
    return <PersonalInfoSkeleton />;
  }

  return <PersonalInfoContent user={user} t={t} isOwnProfile={isOwnProfile} currentLoggedUser={currentLoggedUser} />;
};
/**
 * PL: Karta statystyki (np. liczba ogrodów, roślin) z obsługą stanu ładowania.
 * EN: Statistic card (e.g., number of gardens, plants) with loading state support.
 */
export const StatCard = ({
  count,
  label,
  isLoading,
  href,
}: {
  count?: number;
  label: string;
  isLoading: boolean;
  href?: string;
}) => {
  const content = (
    <>
      <div className="text-5xl font-black text-primary-green">
        {isLoading ? (
          <div className="h-14 w-14 bg-neutral-200 animate-pulse rounded" />
        ) : (
          count || 0
        )}
      </div>
      <div className="text-sm font-bold uppercase tracking-widest text-neutral-600 mt-2">
        {label}
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="bg-container-light p-6 rounded-xl border-2 border-primary-green/20 shadow-sm text-center hover:shadow-md hover:bg-container-light/90 transition-all duration-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-header-main focus-visible:outline-offset-2 outline outline-2 outline-neutral-900 outline-offset-2"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="bg-container-light p-6 rounded-xl border-2 border-primary-green/20 shadow-sm text-center outline outline-2 outline-neutral-900 outline-offset-2">
      {content}
    </div>
  );
};

/**
 * PL: Kontrolki nawigacji stronicowaniem dla galerii pinów.
 * EN: Pagination navigation controls for the pins gallery.
 */
export const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  t,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  t: TranslateFunction;
}) => {
  const btnStyle =
    'inline-flex items-center justify-center rounded-md px-3 py-1.5 bg-primary-green text-white hover:opacity-85 disabled:opacity-50 transition transition-opacity duration-300';

  if (totalPages <= 1) return null;

  return (
    <div
      className="flex items-center gap-2"
      role="navigation"
      aria-label={t('aria.pagination')}
    >
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={btnStyle}
        aria-label={t('aria.previousPage')}
      >
        &lt;
      </button>

      <span
        className="text-white font-bold text-[14px] rounded-md tracking-[4px] bg-transparent text-right px-1"
        aria-current="page"
      >
        {currentPage}/{totalPages}
      </span>

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={btnStyle}
        aria-label={t('aria.nextPage')}
      >
        &gt;
      </button>
    </div>
  );
};

/**
 * PL: Siatka wyświetlająca piny (zdjęcia) przypisane do użytkownika.
 * EN: Grid displaying pins (images) assigned to the user.
 */
export const PinsGallery = ({
  pins,
  currentPage,
  itemsPerPage,
  currentLoggedUser,
  onDeleted,
}: {
  pins: any[];
  currentPage: number;
  itemsPerPage: number;
  currentLoggedUser?: string | null;
  onDeleted?: (pinId: number) => void;
}) => {
  const t = useTranslations('ProfilePage');
  const tGardens = useTranslations('GardensPage');

  const getGardenName = (name: string | null) => {
    if (!name) return '';
    if (name.includes("'s Garden") || name === 'Default Garden') {
      return tGardens('defaultGardenName');
    }
    return name;
  };
  const currentPins = pins.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (currentPins.length === 0) {
    return (
      <div className="py-12 text-center text-header-main font-bold text-[14px] uppercase tracking-widest border-2 border-dashed border-black/10 rounded-xl">
        {t('noPins')}
      </div>
    );
  }

  const getImageUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const base = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000').replace(/\/$/, '');
    return `${base}${url}`;
  };

  return (
    <div className="grid grid-cols-1 gap-6 w-full max-w-[95%] sm:w-4/5 mx-auto">
      {currentPins.map((pin: any) => (
        <div
          key={pin.id}
          className="p-6 bg-secondary-beige border border-primary-green/10 rounded-xl shadow-lg flex flex-col min-h-[140px] w-full outline outline-2 outline-neutral-900 outline-offset-2"
        >
          {(pin.plant_image || pin.garden_image) && (
            <div className="relative w-full h-64 sm:h-96 mb-4 overflow-hidden rounded-lg">
              <img
                src={
                  getImageUrl(pin.plant_image) ||
                  getImageUrl(pin.garden_image) ||
                  ''
                }
                alt={pin.plant_name || pin.garden_name || 'Pin'}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <p className="text-black font-semibold text-lg flex-grow leading-snug">
            {pin.content || pin.note}
          </p>
          <div className="mt-4 pt-3 border-t-2 border-black/5 flex flex-wrap items-center justify-between gap-y-4 text-[10px] font-black uppercase tracking-tighter">
            {pin.plant_id && pin.plant_owner ? (
              <Link
                href={`/profiles/${pin.plant_owner}/plants`}
                className="text-primary-green font-bold text-[14px] hover:underline rounded-md p-2 focus-visible focus-visible:ring-2 focus-visible:ring-header-main focus-visible:ring-offset-2 focus-visible:ring-offset-black outline-none"
              >
                {pin.plant_name}
              </Link>
            ) : pin.garden_id && pin.garden_owner ? (
              <Link
                href={`/profiles/${pin.garden_owner}/gardens/${pin.garden_id}`}
                className="text-primary-green font-bold text-[14px] hover:underline rounded-md p-2 focus-visible focus-visible:ring-2 focus-visible:ring-header-main focus-visible:ring-offset-2 focus-visible:ring-offset-black outline-none"
              >
                {getGardenName(pin.garden_name)}
              </Link>
            ) : (
              <span className="text-primary-green">
                {pin.plant_name || pin.garden_name || ''}
              </span>
            )}
            <span className="flex flex-wrap items-center justify-end flex-grow gap-4 text-dark-text/70 font-mono text-base sm:text-lg font-normal">
              <span className="whitespace-nowrap">
                {pin.created_at
                  ? new Date(pin.created_at).toLocaleDateString()
                  : ''}
              </span>
              {currentLoggedUser === pin.creator && (
                <button
                  onClick={async () => {
                    if (!confirm(t('confirmDeletePin'))) return;
                    const res = await apiFetch(`/api/pins/${pin.id}/`, {
                      method: 'DELETE',
                    });
                    if (res.ok || res.status === 204) {
                      onDeleted?.(pin.id);
                    }
                  }}
                  className="aspect-square w-8 flex items-center justify-center text-orange-700 hover:text-orange-600 font-bold text-2xl rounded-md transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-dark-text focus-visible:outline-offset-4"
                >
                  ✕
                </button>
              )}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * PL: Przycisk kierujący do edycji profilu (widoczny tylko dla właściciela).
 * EN: Button leading to profile editing (visible only to the owner).
 */
export const EditProfileButton = ({
  t,
  username,
}: {
  t: TranslateFunction;
  username?: string;
}) => (
  <Link
    href={`/profiles/${username}/edit`}
    className="flex items-center whitespace-nowrap gap-2 px-4 py-2 bg-primary-green/90 text-white rounded-lg font-bold uppercase text-[10px] tracking-widest transition-opacity hover:opacity-90 shadow-sm w-fit leading-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-header-main focus-visible:outline-offset-4"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className="w-3.5 h-3.5 fill-white"
      aria-hidden="true"
    >
      <path d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z" />
    </svg>
    {t('settings.edit.label')}
  </Link>
);

/**
 * PL: Sekcja zawierająca karty statystyk ogrodów i roślin.
 * EN: Section containing garden and plant statistics cards.
 */
export const StatsSection = ({ user }: { user: UserProfileProps['user'] }) => {
  const t = useTranslations('ProfilePage');

  return (
    <div className="flex flex-col gap-4">
      <StatCard
        count={user?.gardens_count}
        label={t('stats.gardens')}
        isLoading={!user}
        href={`/profiles/${user?.username}/gardens`}
      />
      <StatCard
        count={user?.plants_count}
        label={t('stats.plants')}
        isLoading={!user}
        href={`/profiles/${user?.username}/plants`}
      />
    </div>
  );
};

export const JoinedGardensSection = ({
  gardens,
}: {
  gardens: any[] | undefined;
}) => {
  const tProfile = useTranslations('ProfilePage');
  const tGardens = useTranslations('GardensPage');

  if (!gardens || gardens.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t-2 border-black/10 w-full">
      <h2 className="text-[14px] font-header-main font-bold uppercase tracking-[0.1em] mb-6 text-center md:text-left">
        {tProfile('sections.joinedGardens')}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {gardens.map(garden => {
          const isMainGarden =
            garden.name.includes("'s Garden") ||
            garden.name === 'Default Garden' ||
            garden.is_default;
          const displayName = isMainGarden
            ? tGardens('defaultGardenName')
            : garden.name;

          return (
            <Link
              key={garden.garden_id || garden.id}
              href={`/profiles/${garden.owner}/gardens/${garden.garden_id || garden.id}`}
              className="flex items-center bg-container-light gap-4 px-4 py-2 rounded-xl border-2 border-black hover:opacity-90 transition-opacity duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-header-main focus-visible:outline-offset-1"
            >
              <div className="w-8 h-8 bg-secondary-beige rounded-md flex items-center justify-center overflow-hidden shrink-0 border border-black/10">
                {garden.thumbnail ? (
                  <img
                    src={garden.thumbnail}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm">🌿</span>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-black text-black text-sm truncate uppercase tracking-tight">
                  {displayName}
                </span>
                <span className="text-[10px] font-bold text-primary-green uppercase mt-0.5 truncate whitespace-nowrap">
                  {tGardens('owner')}: {garden.owner}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

/**
 * PL: Dolna część profilu zawierająca przycisk edycji oraz galerię pinów ze stronicowaniem.
 * EN: Footer part of the profile containing the edit button and pins gallery with pagination.
 */
export const ProfileFooter = ({
  isOwnProfile,
  currentPage,
  totalPages,
  setCurrentPage,
  pins,
  itemsPerPage,
  t,
  username,
  currentLoggedUser,
  onDeletedPin,
  pinsRef,
}: {
  isOwnProfile: boolean;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  pins: Array<{ id: number; title: string; image: string }>;
  itemsPerPage: number;
  t: TranslateFunction;
  username?: string;
  currentLoggedUser?: string | null;
  onDeletedPin?: (pinId: number) => void;
  pinsRef?: React.RefObject<HTMLDivElement | null>;
}) => (
  <div
    ref={pinsRef}
    className="mt-8 pt-8 border-t border-white/20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
  >
    <div className="lg:col-span-2 flex justify-center lg:justify-start">
      {isOwnProfile && <EditProfileButton t={t} username={username} />}
    </div>
    <div className="lg:col-span-10 bg-white/5 py-5 px-0 sm:px-5 ml-0 sm:ml-4 rounded-xl border border-white/5">
      <PinsGallery
        pins={pins}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        currentLoggedUser={currentLoggedUser}
        onDeleted={onDeletedPin}
      />
      <div className="flex justify-between items-center mb-4 mt-6">
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          t={t}
        />
      </div>
    </div>
  </div>
);

/**
 * PL: Główny komponent strukturalny profilu, łączący wszystkie sekcje w jedną całość.
 * EN: Main structural component of the profile, combining all sections into one whole.
 */
/**
 * PL: Główny komponent strukturalny profilu, łączący wszystkie sekcje w jedną całość.
 * EN: Main structural component of the profile, combining all sections into one whole.
 */
export const ProfileContent = ({
  user,
  isOwnProfile,
  currentPage,
  setCurrentPage,
  pins,
  totalPages,
  currentLoggedUser,
  onDeletedPin,
  pinsRef,
}: {
  user: UserProfileProps['user'];
  isOwnProfile: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pins: Array<{ id: number; title: string; image: string }>;
  totalPages: number;
  currentLoggedUser?: string | null;
  onDeletedPin?: (pinId: number) => void;
  pinsRef?: React.RefObject<HTMLDivElement | null>;
}) => {
  const t = useTranslations('ProfilePage');
  const itemsPerPage = 4;

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 pb-12 flex flex-col justify-center h-full flex-grow">
      <div className="bg-container-light/10 backdrop-blur-md py-6 px-0 sm:p-10 rounded-xl shadow-2xl w-full mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <PersonalInfo user={user} t={t} isOwnProfile={isOwnProfile} currentLoggedUser={currentLoggedUser ?? null} />
          <StatsSection user={user} />
        </div>

        <JoinedGardensSection gardens={user?.joined_gardens} />

        <ProfileFooter
          isOwnProfile={isOwnProfile}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          pins={pins}
          itemsPerPage={itemsPerPage}
          t={t}
          username={user?.username}
          currentLoggedUser={currentLoggedUser}
          onDeletedPin={onDeletedPin}
          pinsRef={pinsRef}
        />
      </div>
    </div>
  );
};
