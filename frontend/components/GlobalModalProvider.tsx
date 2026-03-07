'use client';

/**
 * PL: Globalny dostawca modali. Zarządza wyświetlaniem modalu logowania na podstawie parametrów URL.
 * EN: Global modal provider. Manages login modal display based on URL parameters.
 */

import { useSearchParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/navigation';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';

const LoginModal = dynamic(() => import('@/components/LoginModal'), {
  ssr: false,
});

const SearchModal = dynamic(() => import('@/components/SearchModal'), {
  ssr: false,
});

const NotificationsModal = dynamic(() => import('@/components/NotificationsModal'), {
  ssr: false,
});

/**
 * PL: Komponent zarządzający widocznością modali w skali całej aplikacji.
 * EN: Component managing modal visibility application-wide.
 */
export const GlobalModalProvider = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('HomePage');

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const token =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('accessToken')
        : null;
    setIsLoggedIn(!!token);
  }, [searchParams]);

  /**
   * PL: Reaguje na zmianę parametrów w URL i otwiera modal, jeśli showLogin=true.
   * EN: Reacts to URL parameter changes and opens the modal if showLogin=true.
   */
  const isLoginParamPresent = searchParams.get('showLogin') === 'true';
  const isLoginModalOpen = isLoginParamPresent && isLoggedIn === false;
  const isSearchModalOpen = searchParams.get('showSearch') === 'true';
  const isNotificationsModalOpen = searchParams.get('showNotifications') === 'true';

  useEffect(() => {
    if (isLoginParamPresent && isLoggedIn === true) {
      router.replace(pathname);
    }
  }, [isLoginParamPresent, isLoggedIn, pathname, router]);

  useEffect(() => {
    if (isLoginParamPresent && isLoggedIn === true) {
      router.replace(pathname);
    }
  }, [isLoginParamPresent, isLoggedIn, pathname, router]);

  /**
   * PL: Zamyka modal i czyści parametry URL przy użyciu routera Next.js.
   * EN: Closes the modal and clears URL parameters using the Next.js router.
   */
  const handleClose = () => {
    router.replace(pathname);
  };

  return (
    <>
      <LoginModal isVisible={isLoginModalOpen} onClose={handleClose} t={t} />
      <SearchModal isVisible={isSearchModalOpen} onClose={handleClose} />
      <NotificationsModal isVisible={isNotificationsModalOpen} onClose={handleClose} />
    </>
  );
};
