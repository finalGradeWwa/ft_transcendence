'use client';

/**
 * PL: Strona rejestracji użytkownika. Obsługuje wysyłkę danych multipart/form-data do Django.
 * EN: User registration page. Handles multipart/form-data submission to Django.
 */

import { useState } from 'react';
import { Heading } from '@/components/Heading';
import { useTranslations } from 'next-intl';
import { RegistrationSuccess } from '@/components/auth/RegistrationSuccess';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  const tr = useTranslations('RegisterPage');
  const [isSuccess, setIsSuccess] = useState(false);

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
      <div className="py-12 flex justify-center">
        <div className="bg-container-light p-8 rounded-xl shadow-2xl w-full max-w-2xl border border-primary-green">
          {isSuccess ? (
            <RegistrationSuccess />
          ) : (
            <>
              <Heading
                as="h1"
                className="mb-8 text-center uppercase tracking-widest !text-primary-green font-bold"
              >
                {tr('title')}
              </Heading>

              <RegisterForm onSuccess={() => setIsSuccess(true)} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
