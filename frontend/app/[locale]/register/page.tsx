'use client';

/**
 * PL: Strona rejestracji użytkownika. Obsługuje wysyłkę danych multipart/form-data do Django.
 * EN: User registration page. Handles multipart/form-data submission to Django.
 */

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { Input } from '@/components/Input';
import { Heading } from '@/components/Heading';
import { Navigation } from '@/components/Navigation';
import { Text } from '@/components/typography/Text';
import { Button } from '@/components/Button';
import { useTranslations } from 'next-intl';

export default function RegisterPage() {
  const t = useTranslations('HomePage');
  const tr = useTranslations('RegisterPage');

  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const passwordConfirm = formData.get('password_confirm') as string;

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
      setError(tr('passwordRequirements'));
      setIsLoading(false);
      return;
    }

    if (password !== passwordConfirm) {
      setError(tr('errorPasswordMatch'));
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || tr('errorRegistrationFailed'));
      }

      alert(tr('successMessage'));
    } catch (err: any) {
      setError(
        err.name === 'TypeError' || err.message === 'Failed to fetch'
          ? tr('serverError')
          : err.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
      <Navigation />

      <main className="py-12 flex justify-center">
        <div className="bg-container-light p-8 rounded-xl shadow-2xl w-full max-w-2xl border border-primary-green">
          <Heading
            as="h1"
            className="mb-8 text-center uppercase tracking-widest !text-primary-green font-bold"
          >
            {tr('title')}
          </Heading>

          {error && (
            <Text
              variant="small"
              className="mb-6 p-2 font-bold text-red-700 bg-white border-2 border-red-600 rounded text-center"
            >
              {error}
            </Text>
          )}

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <Input
              label={tr('firstName')}
              name="firstName"
              required
              disabled={isLoading}
            />
            <Input
              label={tr('lastName')}
              name="lastName"
              required
              disabled={isLoading}
            />
            <Input
              label={tr('nick')}
              name="username"
              required
              disabled={isLoading}
            />
            <Input
              label={tr('email')}
              type="email"
              name="email"
              required
              disabled={isLoading}
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-neutral-900 mb-1">
                {tr('avatar')}
              </label>
              <div className="flex flex-wrap items-center gap-4">
                <input
                  type="file"
                  id="avatar-upload"
                  name="avatar_photo"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={e => setFileName(e.target.files?.[0]?.name || '')}
                  disabled={isLoading}
                />
                <label
                  htmlFor="avatar-upload"
                  className="cursor-pointer bg-secondary-beige text-primary-green font-semibold py-2 px-4 rounded-full text-sm hover:bg-amber-100 transition-colors shadow-sm"
                >
                  {tr('chooseFile')}
                </label>
                <Text variant="small" className="italic">
                  {fileName || tr('noFileSelected')}
                </Text>
              </div>
              <Text variant="caption" className="mt-1 px-1">
                {tr('avatarRequirements')}
              </Text>
            </div>

            <div className="flex flex-col gap-1 relative">
              <Input
                label={tr('password')}
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-primary-green hover:text-green-700 transition-colors"
                title={showPassword ? tr('hidePassword') : tr('showPassword')}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                )}
              </button>
              <Text variant="caption" className="leading-tight px-1 italic">
                {tr('passwordRequirements')}
              </Text>
            </div>

            <Input
              label={tr('confirmPassword')}
              type={showPassword ? 'text' : 'password'}
              name="password_confirm"
              required
              disabled={isLoading}
            />

            <div className="md:col-span-2 flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="terms"
                name="terms"
                required
                disabled={isLoading}
                className="w-4 h-4 accent-primary-green"
              />
              <label htmlFor="terms" className="text-sm text-neutral-900">
                {tr('acceptTerms')}{' '}
                <Link
                  href="/terms"
                  className="underline font-bold text-primary-green italic"
                >
                  {tr('termsLink')}
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="md:col-span-2 w-full py-4 uppercase tracking-widest shadow-lg"
            >
              {tr('registerBtn')}
            </Button>
          </form>

          <Text variant="small" className="mt-8 text-center">
            {tr('alreadyHaveAccount')}{' '}
            <Link
              href="/?showLogin=true"
              className="font-bold text-primary-green underline hover:text-green-800 transition-colors"
            >
              {t('login')}
            </Link>
          </Text>
        </div>
      </main>
    </div>
  );
}
