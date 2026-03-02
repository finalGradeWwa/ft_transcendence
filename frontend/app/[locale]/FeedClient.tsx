'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { PinsGallery } from './profiles/UserProfileComponents';

interface FeedClientProps {
  initialPins: any[];
  initialCurrentLoggedUser: string | null;
}

/**
 * PL: Komponent klienta wyświetlający feed pinów od znajomych na stronie głównej.
 * EN: Client component displaying the friends' pin feed on the home page.
 */
export const FeedClient = ({
  initialPins,
  initialCurrentLoggedUser,
}: FeedClientProps) => {
  const t = useTranslations('HomePage');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [pins, setPins] = useState<any[]>(initialPins);

  const currentPage = Number(searchParams.get('page')) || 1;
  const itemsPerPage = 8;
  const totalPages = Math.ceil(pins.length / itemsPerPage) || 1;

  const btnStyle =
    'bg-[#186618] text-[#fff] px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest cursor-pointer disabled:opacity-50 focus:outline focus:outline-2 focus:outline-[#fff] focus:outline-offset-2 active:outline-none';

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const handleDeletePin = (pinId: number) => {
    setPins(prev => prev.filter(p => p.id !== pinId));
  };

  return (
    <section className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-white-text">
        {t('feedTitle')}
      </h1>

      {pins.length === 0 ? (
        <div className="py-12 text-center text-white-text font-bold text-sm uppercase tracking-widest border-2 border-dashed border-white/20 rounded-xl">
          {t('emptyFeed')}
        </div>
      ) : (
        <>
          <PinsGallery
            pins={pins}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            currentLoggedUser={initialCurrentLoggedUser}
            onDeleted={handleDeletePin}
            showCreator
          />

          {totalPages > 1 && (
            <div className="mt-12 flex max-[520px]:grid justify-center items-center gap-2 w-fit mx-auto">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className={btnStyle}
              >
                {t('firstPage')}
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={btnStyle}
              >
                &lt;
              </button>

              <div className="text-white-text font-bold text-sm text-center w-full min-w-[60px] whitespace-nowrap">
                {currentPage} / {totalPages}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={btnStyle}
              >
                &gt;
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className={btnStyle}
              >
                {t('lastPage')}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};
