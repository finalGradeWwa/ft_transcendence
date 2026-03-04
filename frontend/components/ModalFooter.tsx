'use client';

/**
 * PL: Komponent stopki modalu. Zawiera przycisk anulowania oraz link prowadzący do rejestracji.
 * EN: Modal footer component. Contains a cancel button and a link leading to registration.
 */

import { Link } from '@/i18n/navigation';

interface ModalFooterProps {
  t: any;
  onClose: () => void;
}

/**
 * PL: Główny komponent stopki modalu zarządzający akcjami pomocniczymi.
 * EN: Main modal footer component managing auxiliary actions.
 */
export const ModalFooter = ({ t, onClose }: ModalFooterProps) => {
  return (
    <div className="mt-6 flex flex-col items-center gap-4 border-t border-subtle-gray pt-4">
      {/** PL: Przycisk zamykający modal bez podejmowania akcji. EN: Button closing the modal without taking action. */}
      <button
        onClick={onClose}
        className="text-sm text-neutral-900 hover:text-red-800 transition-colors underline-offset-4 hover:underline rounded px-1 focus:outline focus:outline-2 focus:outline-gray-600 focus:outline-offset-0"
      >
        {t('cancel')}
      </button>

      {/** PL: Sekcja zachęcająca do rejestracji, jeśli użytkownik nie ma konta. EN: Section encouraging registration if the user doesn't have an account. */}
      <p className="text-sm text-neutral-900 text-center">
        {t('noAccount')}{' '}
        <Link
          href="/register"
          className="font-bold text-primary-green hover:underline decoration-2 rounded px-1 focus:outline focus:outline-2 focus:outline-gray-600 focus:outline-offset-0"
          onClick={onClose}
        >
          {t('register')}
        </Link>
      </p>
    </div>
  );
};
