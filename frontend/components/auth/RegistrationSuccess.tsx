'use client';

import { Link } from '@/i18n/navigation';
import { Heading } from '@/components/Heading';
import { Text } from '@/components/typography/Text';
import { Button } from '@/components/Button';
import { useTranslations } from 'next-intl';

export const RegistrationSuccess = () => {
  const t = useTranslations('RegisterPage');

  return (
    <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
      <div className="flex justify-center mb-6">
        <div className="bg-green-100 p-4 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-12 h-12 text-green-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>
      </div>

      <Heading
        as="h2"
        className="mt-8 mb-4 !text-primary-green uppercase font-black text-2xl"
      >
        {t('successMessage')}
      </Heading>

      <Text className="mb-8 text-neutral-900 font-medium px-4">
        {t('registrationSuccessDescription')}
      </Text>

      <Link href="/?showLogin=true">
        <Button className="w-full py-4 uppercase tracking-widest shadow-lg">
          {t('goToLogin')}
        </Button>
      </Link>
    </div>
  );
};
