'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

const LoginModal = dynamic(() => import('@/components/LoginModal'), {
  ssr: false,
});

export const GlobalModalProvider = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const t = useTranslations('HomePage');

  useEffect(() => {
    if (searchParams.get('showLogin') === 'true') {
      setIsLoginModalOpen(true);
    }
  }, [searchParams]);

  const handleClose = () => {
    setIsLoginModalOpen(false);
    const newUrl = pathname;
    window.history.replaceState({}, '', newUrl);
  };

  return (
    <LoginModal isVisible={isLoginModalOpen} onClose={handleClose} t={t} />
  );
};
