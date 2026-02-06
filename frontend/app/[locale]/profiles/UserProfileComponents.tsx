'use client';

/**
 * PL: Zbiór komponentów prezentacyjnych oraz interfejsów dla profilu użytkownika.
 * EN: Collection of presentational components and interfaces for the user profile.
 */

import { Heading } from '@/components/Heading';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

/**
 * PL: Interfejs definiujący dane profilu użytkownika przekazywane do komponentów.
 * EN: Interface defining user profile data passed to components.
 */
export interface UserProfileProps {
  user: {
    id: number;
    username: string;
    bio?: string;
    date_joined: string;
    avatar_photo: string;
    followers: number;
    following: number;
    gardens: number;
    plants: number;
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
export const getAvatarUrl = (path?: string) =>
  !path
    ? '/images/favicon/fav_480.webp'
    : path.startsWith('http')
      ? path
      : `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '')}${path.startsWith('/media') ? '' : '/media'}${path.startsWith('/') ? path : `/${path}`}`;
/**
 * PL: Komponent przycisku "Obserwuj / Przestań obserwować".
 * EN: Follow / Unfollow button component.
 */
export const FollowButton = ({
  isFollowing,
  onFollow,
  t,
  isLoading,
}: {
  isFollowing: boolean;
  onFollow: () => void;
  t: any;
  isLoading: boolean;
}) => (
  <button
    onClick={onFollow}
    disabled={isLoading}
    className={`inline-flex items-center gap-2 px-6 py-2 rounded-lg font-black uppercase text-[10px] tracking-widest transition-all duration-500 ease-in-out shadow-sm border border-primary-green overflow-hidden whitespace-nowrap active:scale-95 disabled:opacity-50 ${
      isFollowing
        ? 'bg-transparent text-primary-green hover:bg-primary-green/10'
        : 'bg-primary-green text-white hover:bg-green-700'
    }`}
  >
    {isFollowing && !isLoading && (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 448 512"
        className="w-3.5 h-3.5 fill-current animate-in fade-in zoom-in slide-in-from-start-2 duration-500"
      >
        <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" />
      </svg>
    )}
    <span aria-live="polite">
      {isLoading ? (
        <>
          <span aria-hidden="true">...</span>
          <span className="sr-only">{t('actions.loading')}</span>{' '}
        </>
      ) : isFollowing ? (
        t('actions.unfollow')
      ) : (
        t('actions.follow')
      )}
    </span>
  </button>
);

/**
 * PL: Wyświetla okrągły awatar użytkownika.
 * EN: Displays the user's circular avatar.
 */
export const UserAvatar = ({ user }: { user: UserProfileProps['user'] }) => {
  // tymczasowy debug: pokaż co REALLY jest w user.avatar_photo i jaki URL generuje getAvatarUrl
  // usuń te logi po weryfikacji
  if (typeof window !== 'undefined') {
    console.log('DEBUG user.avatar_photo =', user?.avatar_photo);
    console.log('DEBUG getAvatarUrl(...) =', getAvatarUrl(user?.avatar_photo));
  }

  return (
    <div className="relative w-40 h-40 sm:w-48 sm:h-48 overflow-hidden rounded-full border-4 border-secondary-beige shadow-lg flex-shrink-0">
      <Image
        src={getAvatarUrl(user?.avatar_photo)}
        alt={user?.username || 'User'}
        fill
        sizes="(max-width: 640px) 160px, 192px"
        className="object-cover"
        priority
      />
    </div>
  );
};

/**
 * PL: Prezentuje statystyki obserwujących i obserwowanych.
 * EN: Presents followers and following statistics.
 */
export const UserStats = ({
  user,
  t,
  followersCount,
}: {
  user: NonNullable<UserProfileProps['user']>;
  t: any;
  followersCount: number;
}) => (
  <div
    className="md:w-full w-fit mx-auto flex flex-col items-start text-start text-xs sm:text-sm font-bold uppercase text-neutral-600"
    role="group"
    aria-label={t('summary')}
  >
    <div className="flex items-baseline gap-1.5 leading-tight">
      <span className="text-lg sm:text-xl font-black text-primary-green">
        {followersCount}
      </span>
      <span className="sr-only"> </span>
      <span>{t('stats.followers')}</span>
    </div>

    <div className="flex items-baseline gap-1.5 leading-tight -mt-1">
      <span className="text-lg sm:text-xl font-black text-primary-green">
        {user.following ?? 0}
      </span>
      <span className="sr-only"> </span>
      <span>{t('stats.following')}</span>
    </div>
  </div>
);

/**
 * PL: Wyświetla datę dołączenia użytkownika do serwisu.
 * EN: Displays the user's registration date.
 */
export const UserJoinedInfo = ({
  dateJoined,
  t,
}: {
  dateJoined: string;
  t: any;
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
 * PL: Główny kontener danych profilowych (Avatar, Nazwa, Statystyki, Akcje).
 * EN: Main profile data container (Avatar, Name, Stats, Actions).
 */
export const PersonalInfoContent = ({
  user,
  t,
  isFollowing,
  onFollow,
  isOwnProfile,
  followersCount,
  isActionLoading,
  isLoggedIn,
}: {
  user: NonNullable<UserProfileProps['user']>;
  t: any;
  isFollowing: boolean;
  onFollow: () => void;
  isOwnProfile: boolean;
  followersCount: number;
  isActionLoading: boolean;
  isLoggedIn: boolean;
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
          <UserStats user={user} t={t} followersCount={followersCount} />
        </div>
        <UserJoinedInfo dateJoined={dateJoined} t={t} />
        <div className="mt-4 h-[42px] flex items-center">
          {isLoggedIn && !isOwnProfile && (
            <FollowButton
              isFollowing={isFollowing}
              onFollow={onFollow}
              t={t}
              isLoading={isActionLoading}
            />
          )}
        </div>
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
  isFollowing,
  onFollow,
  isOwnProfile,
  followersCount,
  isActionLoading,
  isLoggedIn,
}: {
  user: UserProfileProps['user'];
  t: any;
  isFollowing: boolean;
  onFollow: () => void;
  isOwnProfile: boolean;
  followersCount: number;
  isActionLoading: boolean;
  isLoggedIn: boolean;
}) => {
  if (!user) {
    return <PersonalInfoSkeleton />;
  }

  return (
    <PersonalInfoContent
      user={user}
      t={t}
      isFollowing={isFollowing}
      onFollow={onFollow}
      isOwnProfile={isOwnProfile}
      followersCount={followersCount}
      isActionLoading={isActionLoading}
      isLoggedIn={isLoggedIn}
    />
  );
};

/**
 * PL: Karta statystyki (np. liczba ogrodów, roślin) z obsługą stanu ładowania.
 * EN: Statistic card (e.g., number of gardens, plants) with loading state support.
 */
export const StatCard = ({
  count,
  label,
  isLoading,
}: {
  count?: number;
  label: string;
  isLoading: boolean;
}) => (
  <div className="h-full bg-container-light/90 p-6 rounded-xl flex flex-col justify-center items-center text-center shadow-sm border border-subtle-gray/30">
    {isLoading ? (
      <div className="h-12 w-16 bg-neutral-200 animate-pulse rounded-md" />
    ) : (
      <span className="block text-4xl sm:text-5xl font-black text-primary-green leading-none">
        {count ?? 0}
      </span>
    )}
    <span className="uppercase font-black text-sm sm:text-base mt-2 tracking-[0.2em] text-neutral-700">
      {label}
    </span>
  </div>
);

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
  t: any;
}) => {
  const btnStyle =
    'inline-flex items-center justify-center rounded-md px-3 py-1.5 bg-primary-green text-white hover:bg-green-700 disabled:opacity-50';

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

      <span className="text-white font-bold text-[10px]" aria-current="page">
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
}: {
  pins: Array<{ id: number; title: string; image: string }>;
  currentPage: number;
  itemsPerPage: number;
}) => {
  const t = useTranslations('GardensPage');

  const currentPins = pins.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (currentPins.length === 0) {
    return (
      <div className="col-span-4 py-4 text-center text-white font-bold text-[16px] uppercase">
        {t('noPins')}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {currentPins.map(pin => (
        <div key={pin.id} className="relative aspect-square">
          <Image
            src={pin.image}
            alt={pin.title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover rounded-xl shadow-lg"
          />
        </div>
      ))}
    </div>
  );
};

/**
 * PL: Przycisk kierujący do edycji profilu (widoczny tylko dla właściciela).
 * EN: Button leading to profile editing (visible only to the owner).
 */
export const EditProfileButton = ({ t }: { t: any }) => (
  <Link
    href="/profile/edit"
    className="flex items-center gap-2 px-4 py-2 bg-primary-green/90 text-white rounded-lg font-bold uppercase text-[10px] tracking-widest transition-all hover:bg-green-700 shadow-sm w-fit"
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
        count={user?.gardens}
        label={t('stats.gardens')}
        isLoading={!user}
      />
      <StatCard
        count={user?.plants}
        label={t('stats.plants')}
        isLoading={!user}
      />
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
}: {
  isOwnProfile: boolean;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  pins: Array<{ id: number; title: string; image: string }>;
  itemsPerPage: number;
  t: any;
}) => (
  <div className="mt-8 pt-8 border-t border-white/20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
    <div className="lg:col-span-2 flex justify-center lg:justify-start">
      {isOwnProfile && <EditProfileButton t={t} />}
    </div>
    <div className="lg:col-span-10 bg-white/5 p-5 rounded-xl border border-white/5">
      <div className="flex justify-between items-center mb-4">
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          t={t}
        />
      </div>
      <PinsGallery
        pins={pins}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
      />
    </div>
  </div>
);

/**
 * PL: Główny komponent strukturalny profilu, łączący wszystkie sekcje w jedną całość.
 * EN: Main structural component of the profile, combining all sections into one whole.
 */
export const ProfileContent = ({
  user,
  isOwnProfile,
  isFollowing,
  handleFollowAction,
  currentPage,
  setCurrentPage,
  pins,
  totalPages,
  followersCount,
  isActionLoading,
  isLoggedIn,
}: {
  user: UserProfileProps['user'];
  isOwnProfile: boolean;
  isFollowing: boolean;
  handleFollowAction: () => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pins: Array<{ id: number; title: string; image: string }>;
  totalPages: number;
  followersCount: number;
  isActionLoading: boolean;
  isLoggedIn: boolean;
}) => {
  const t = useTranslations('ProfilePage');
  const itemsPerPage = 4;

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 pb-12 flex flex-col justify-center h-full flex-grow">
      <div className="bg-container-light/10 backdrop-blur-md p-6 sm:p-10 rounded-xl shadow-2xl w-full border border-primary-green/50 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <PersonalInfo
            user={user}
            t={t}
            isFollowing={isFollowing}
            onFollow={handleFollowAction}
            isOwnProfile={isOwnProfile}
            followersCount={followersCount}
            isActionLoading={isActionLoading}
            isLoggedIn={isLoggedIn}
          />
          <StatsSection user={user} />
        </div>
        <ProfileFooter
          isOwnProfile={isOwnProfile}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          pins={pins}
          itemsPerPage={itemsPerPage}
          t={t}
        />
      </div>
    </div>
  );
};
