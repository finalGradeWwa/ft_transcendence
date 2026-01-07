'use client';

import { Icon } from '@/components/icons/ui/Icon';
import { LoginForm } from './LoginForm';
import { ModalFooter } from './ModalFooter';
import { Heading } from '@/components/Heading';

export const ModalContent = ({ t, tError, onClose, usernameRef }: any) => (
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

    <LoginForm
      t={t}
      tError={tError}
      onLoginSuccess={onClose}
      usernameRef={usernameRef}
    />

    <ModalFooter t={t} onClose={onClose} />
  </div>
);
