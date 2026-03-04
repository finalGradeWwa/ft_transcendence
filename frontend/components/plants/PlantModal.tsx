'use client';

/**
 * PL: Modal szczegółów rośliny. Wyświetla duże zdjęcie, nazwę, gatunek i ogród.
 * EN: Plant details modal. Displays large image, name, species and garden.
 */

import { useEffect, useRef } from 'react';
import { Icon } from '@/components/icons/ui/Icon';
import { PlantType } from '@/app/[locale]/HomePageClient';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

interface PlantModalProps {
  plant: PlantType;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export function PlantModal({
  plant,
  onClose,
  onPrev,
  onNext,
}: PlantModalProps) {
  const t = useTranslations('HomePage');
  const modalRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        onPrev?.();
      } else if (e.key === 'ArrowRight') {
        onNext?.();
      } else if (e.key === 'Tab') {
        const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKey);

    // PL: Focus na kontenerze modalu tylko przy pierwszym zamontowaniu
    // EN: Focus on the modal container only on first mount
    if (isFirstRender.current) {
      modalRef.current?.focus();
      isFirstRender.current = false;
    }

    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, onPrev, onNext]);

  return (
    <div
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-secondary-beige rounded-3xl shadow-2xl w-[95%] sm:max-w-[80vw] lg:max-w-[50vw] min-w-0 sm:min-w-[30vw] overflow-hidden border border-primary-green/20 max-h-[90vh] overflow-y-auto outline-none outline outline-2 outline-neutral-900 outline-offset-2"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative w-full h-[64vh]">
          {plant.image ? (
            <img
              src={plant.image}
              alt={plant.commonName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-200 text-6xl">
              🌿
            </div>
          )}
          <button
            onClick={onClose}
            aria-label={t('aria.close')}
            className="absolute top-3 right-3 bg-dark-bg/60 hover:bg-dark-bg/80 text-white p-2 rounded-full shadow transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
          >
            <Icon name="close" size={18} />
          </button>
          {onPrev && (
            <button
              onClick={e => {
                e.stopPropagation();
                onPrev();
              }}
              aria-label={t('aria.previousSlide')}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-dark-bg/60 hover:bg-dark-bg/80 text-white p-2 rounded-full shadow transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
            >
              <Icon name="chevron-left" size={18} />
            </button>
          )}
          {onNext && (
            <button
              onClick={e => {
                e.stopPropagation();
                onNext();
              }}
              aria-label={t('aria.nextSlide')}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-dark-bg/60 hover:bg-dark-bg/80 text-white p-2 rounded-full shadow transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
            >
              <Icon name="chevron-right" size={18} />
            </button>
          )}
        </div>

        <div className="p-6 space-y-2 text-center">
          <h2 className="text-2xl font-black text-primary-green uppercase tracking-tighter">
            {plant.commonName}
          </h2>
          {plant.latinName && (
            <p className="text-sm italic text-dark-text">{plant.latinName}</p>
          )}
          <div className="pt-2 space-y-1 text-xs uppercase tracking-wider font-semibold flex flex-col items-center">
            {plant.author && (
              <div className="flex items-center gap-1.5 text-dark-text">
                <Icon name="user" size={14} />
                <Link
                  href={`/profiles/${plant.author}`}
                  className="text-amber-900 font-bold hover:underline rounded-md p-[2px] focus-visible:ring-2 focus-visible:ring-header-main focus-visible:ring-offset-2 focus-visible:ring-offset-black outline-none"
                  onClick={onClose}
                >
                  {plant.author}
                </Link>
              </div>
            )}

            {plant.garden && (
              <p className="text-dark-text">
                🪴{' '}
                {plant.gardenId && plant.author ? (
                  <Link
                    href={`/profiles/${plant.author}/gardens/${plant.gardenId}`}
                    className="text-primary-green font-bold hover:underline rounded-md p-[2px] focus-visible:ring-2 focus-visible:ring-header-main focus-visible:ring-offset-2 focus-visible:ring-offset-black outline-none"
                    onClick={onClose}
                  >
                    {plant.garden}
                  </Link>
                ) : (
                  <span className="text-primary-green font-bold">
                    {plant.garden}
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
