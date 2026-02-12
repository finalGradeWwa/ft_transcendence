'use client';

/**
 * PL: Kontrolki nagłówka: Język, Szukaj, Dodaj oraz Profil użytkownika.
 * EN: Header Controls: Language, Search, Add, and User Profile.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname, Link } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { Icon } from '@/components/icons/ui/Icon';
// PL: Importujemy poprawną funkcję fetchCurrentUser z Twojej biblioteki auth.
// EN: Importing the correct fetchCurrentUser function from your auth library.
import { fetchCurrentUser } from '@/lib/auth';

const BTN_S =
  'p-2 rounded-full bg-secondary-beige text-neutral-900 hover:text-primary-green shadow-md transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:focus-visible:outline-white outline-none shrink-0 flex items-center justify-center';
const LANGS = ['pl', 'en', 'de', 'ar'];

/**
 * PL: Uniwersalny przycisk z ikoną (Link lub Button).
 */
const IconButton = ({ onClick, icon, label, href }: any) => {
  const content = <Icon name={icon} size={18} aria-hidden="true" />;
  return href ? (
    <Link href={href} className={BTN_S} aria-label={label} scroll={false}>
      {content}
    </Link>
  ) : (
    <button
      type="button"
      onClick={onClick}
      className={BTN_S}
      aria-label={label}
    >
      {content}
    </button>
  );
};

/**
 * PL: Menu szybkiego dodawania rośliny lub ogrodu.
 */
const AddMenu = ({ user, tP, tG, close }: any) => (
  <div className="absolute right-0 md:right-[-48px] mt-4 w-64 bg-primary-green rounded-xl shadow-2xl overflow-hidden z-[100] py-1 flex flex-col">
    <Link
      href={`/profiles/${user}/plants/add`}
      onClick={close}
      className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-white hover:bg-black/10"
    >
      <Icon name="plus" size={14} aria-hidden="true" /> {tP('title')}
    </Link>
    <div className="border-t border-white/20 mx-2 my-1" aria-hidden="true" />
    <Link
      href={`/profiles/${user}/gardens/add`}
      onClick={close}
      className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-white hover:bg-black/10"
    >
      <Icon name="plus" size={14} aria-hidden="true" /> {tG('title')}
    </Link>
  </div>
);

/**
 * PL: Widok zalogowanego użytkownika (Avatar + Nick + Wyloguj).
 */
const ProfileArea = ({ user, logout, t }: any) => (
  <div className="flex items-center gap-2 bg-primary-green p-1 pr-4 rounded-full shadow-md border border-primary-green/20 w-fit">
    <Link
      href={`/profiles/${user}`}
      className="flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full p-1"
      aria-label={`${t('profile')}: ${user}`}
    >
      <div className="p-1.5 rounded-full bg-white/20 text-white flex items-center justify-center">
        <Icon name="user" size={18} aria-hidden="true" />
      </div>
      <span className="text-sm font-bold text-white leading-none">{user}</span>
    </Link>
    <div className="w-[1px] h-4 bg-white/30 mx-1" aria-hidden="true" />
    <button
      onClick={logout}
      className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
      aria-label={t('logout')}
    >
      <Icon name="close" size={14} aria-hidden="true" />
    </button>
  </div>
);

/**
 * PL: Hook zarządzający danymi użytkownika z localStorage.
 */
function useUsername() {
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    setUsername(storedUsername);
    setIsLoading(false);

    const handleStorageChange = () => {
      setUsername(localStorage.getItem('username'));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout/`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      console.error('Logout request failed', e);
    }

    localStorage.removeItem('username');
    localStorage.removeItem('token');
    sessionStorage.removeItem('accessToken'); // PL: Czyścimy też token z sessionStorage
    setUsername(null);
    window.dispatchEvent(new Event('storage'));

    window.location.href = '/';
  }, []);

  return { username, setUsername, logout, isLoading };
}

/**
 * PL: Hook zamykający menu po kliknięciu poza element.
 */
function useOutsideClose<T extends HTMLElement>(onClose: () => void) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [onClose]);
  return ref;
}

/**
 * PL: Warunkowe renderowanie logowania lub obszaru profilu.
 */
const UserSection = ({
  username,
  logout,
  pathname,
  t,
  tHome,
  isLoading,
}: any) => {
  if (isLoading) return <div className="w-10 h-10 md:w-[160px]" />;

  if (!username)
    return (
      <IconButton
        href={`${pathname}?showLogin=true`}
        icon="user"
        label={tHome('login')}
      />
    );
  return (
    <div className="basis-full md:basis-auto flex justify-center mt-2 md:mt-0">
      <ProfileArea user={username} logout={logout} t={t} />
    </div>
  );
};

export function HeaderControls({
  onSearchClick,
}: {
  onSearchClick?: () => void;
}) {
  const {
    username,
    setUsername,
    logout,
    isLoading: usernameLoading,
  } = useUsername();
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const closeMenu = useCallback(() => setIsAddMenuOpen(false), []);
  const addMenuRef = useOutsideClose<HTMLDivElement>(closeMenu);

  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tHome = useTranslations('HomePage');
  const tAria = useTranslations('HomePage.aria');
  const tP = useTranslations('AddPlantPage');
  const tG = useTranslations('GardensPage');

  /**
   * PL: Obsługa parametru auth=login_success w URL (logowanie OAuth).
   * EN: Handling auth=login_success URL parameter (OAuth login).
   */
  useEffect(() => {
    const authStatus = searchParams.get('auth');

    if (authStatus === 'login_success') {
      setIsAuthLoading(true);

      /**
       * PL: Używamy zaimportowanej funkcji fetchCurrentUser z lib/auth, która automatycznie wywoła refreshAccessToken(), pobierze nowy token Bearer i użyje go do pobrania danych użytkownika.
       * EN: We use the imported fetchCurrentUser function from lib/auth, which will automatically call refreshAccessToken(), fetch a new Bearer token, and use it to retrieve the user data.
       */
      fetchCurrentUser()
        .then(userData => {
          if (userData?.username) {
            localStorage.setItem('username', userData.username);
            setUsername(userData.username);
            window.dispatchEvent(new Event('storage'));

            const url = new URL(window.location.href);
            url.searchParams.delete('auth');
            url.searchParams.delete('provider');
            window.history.replaceState({}, '', url.toString());
          }
        })
        .catch(err => {
          console.error('Failed to fetch user after OAuth:', err);
        })
        .finally(() => {
          setIsAuthLoading(false);
        });
    }
  }, [searchParams, setUsername]);

  const isLoading = usernameLoading || isAuthLoading;

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-x-6 gap-y-4">
      <select
        value={locale}
        onChange={e => router.replace(pathname, { locale: e.target.value })}
        aria-label={tAria('selectLanguage')}
        className="bg-container-light text-neutral-900 p-1 rounded border border-secondary-beige text-sm min-w-[100px] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:focus-visible:outline-white"
      >
        {LANGS.map(v => (
          <option key={v} value={v}>
            {v.toUpperCase()}
          </option>
        ))}
      </select>

      <nav className="flex flex-wrap md:flex-nowrap items-center justify-center gap-3">
        <IconButton
          href={{ pathname, query: { showSearch: 'true' } }}
          icon="search"
          label={tAria('searchBtn')}
        />

        <div className="relative" ref={addMenuRef}>
          <IconButton
            onClick={
              username ? () => setIsAddMenuOpen(!isAddMenuOpen) : undefined
            }
            href={
              !username && !isLoading ? `${pathname}?showLogin=true` : undefined
            }
            icon="plus"
            label={tAria('add')}
          />
          {username && isAddMenuOpen && (
            <AddMenu user={username} tP={tP} tG={tG} close={closeMenu} />
          )}
        </div>

        <UserSection
          username={username}
          logout={logout}
          pathname={pathname}
          t={tAria}
          tHome={tHome}
          isLoading={isLoading}
        />
      </nav>
    </div>
  );
}
