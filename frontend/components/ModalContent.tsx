'use client';

/**
 * PL: Komponent zawartości modalu logowania. Obsługuje wyświetlanie formularza,
 * stopki oraz komunikatów o sukcesie (np. po rejestracji).
 * EN: Login modal content component. Handles form display, footer,
 * and success messages (e.g., after registration).
 */

import { useSearchParams } from 'next/navigation';
import { Icon } from '@/components/icons/ui/Icon';
import { LoginForm } from './LoginForm';
import { ModalFooter } from './ModalFooter';
import { Heading } from '@/components/Heading';
import { Text } from '@/components/typography/Text';

export const ModalContent = ({
  t,
  tError,
  onClose,
  usernameRef,
  isRegistered,
}: any) => {
  return (
    <div
      className="bg-container-light p-6 rounded-lg shadow-2xl w-full max-sm:mx-4 max-w-sm border border-primary-green relative"
      onClick={e => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="absolute top-3 end-3 p-2 text-black hover:text-red-800 transition-colors"
        aria-label={t('aria.close')}
      >
        <Icon name="close" size={20} />
      </button>

      <Heading as="h2" className="mb-4 text-neutral-900">
        {t('login')}
      </Heading>

      {/**
       * * PL: Komunikat wyświetlany tylko po pomyślnej rejestracji.
       * EN: Message displayed only after successful registration.
       */}
      {isRegistered && (
        <div className="mb-6 p-3 bg-green-50 border border-green-500 rounded-lg">
          <Text className="text-green-800 font-bold text-sm text-center">
            TEST: REJESTRACJA OK
          </Text>
        </div>
      )}

      <LoginForm
        t={t}
        tError={tError}
        onLoginSuccess={onClose}
        usernameRef={usernameRef}
      />

      <ModalFooter t={t} onClose={onClose} />
    </div>
  );
};
