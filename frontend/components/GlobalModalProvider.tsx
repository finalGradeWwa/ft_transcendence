'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

const LoginModal = dynamic(() => import('@/components/LoginModal'), {
  ssr: false,
});

const SearchModal = dynamic(() => import('@/components/SearchModal'), {
  ssr: false,
});

export const GlobalModalProvider = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const t = useTranslations('HomePage');

  useEffect(() => {
    if (searchParams.get('showLogin') === 'true') {
      setIsLoginModalOpen(true);
    }

    if (searchParams.get('showSearch') === 'true') {
      setIsSearchModalOpen(true);
    }
  }, [searchParams]);

  const handleLoginClose = () => {
    setIsLoginModalOpen(false);
    const newUrl = pathname;
    window.history.replaceState({}, '', newUrl);
  };

  // Close search modal and clean up URL
  const handleSearchClose = () => {
    setIsSearchModalOpen(false);
    const newUrl = pathname;
    window.history.replaceState({}, '', newUrl);
  };

  return (
    <>
      {/* Login Modal */}
      <LoginModal isVisible={isLoginModalOpen} onClose={handleLoginClose} t={t} />

      {/* Search Modal */}
      <SearchModal isVisible={isSearchModalOpen} onClose={handleSearchClose} />
    </>
  );
};
