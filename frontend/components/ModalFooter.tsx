'use client';

import { Link } from '@/i18n/navigation';

interface ModalFooterProps {
  t: any;
  onClose: () => void;
}

export const ModalFooter = ({ t, onClose }: ModalFooterProps) => {
  return (
    <div className="mt-6 flex flex-col items-center gap-4 border-t border-subtle-gray pt-4">
      <button
        onClick={onClose}
        className="text-sm text-neutral-900 hover:text-red-800 transition-colors underline-offset-4 hover:underline"
      >
        {t('cancel')}
      </button>
      <p className="text-sm text-neutral-900 text-center">
        {t('noAccount')}{' '}
        <Link
          href="/register"
          className="font-bold text-primary-green hover:underline decoration-2"
          onClick={onClose}
        >
          {t('register')}
        </Link>
      </p>
    </div>
  );
};
