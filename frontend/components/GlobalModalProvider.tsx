'use client';

/**
 * PL: Globalny dostawca modali. Zarządza wyświetlaniem modalu logowania na podstawie parametrów URL.
 * EN: Global modal provider. Manages login modal display based on URL parameters.
 */

import { useSearchParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/navigation';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

const LoginModal = dynamic(() => import('@/components/LoginModal'), {
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

  /**
   * PL: Reaguje na zmianę parametrów w URL i otwiera modal, jeśli showLogin=true.
   * EN: Reacts to URL parameter changes and opens the modal if showLogin=true.
   */
  const isLoginModalOpen = searchParams.get('showLogin') === 'true';

  /**
   * PL: Zamyka modal i czyści parametry URL przy użyciu routera Next.js.
   * EN: Closes the modal and clears URL parameters using the Next.js router.
   */
  const handleClose = () => {
    router.replace(pathname);
  };

  return (
    <LoginModal isVisible={isLoginModalOpen} onClose={handleClose} t={t} />
  );
};
