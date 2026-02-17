'use client';

import { useState, useRef, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { Input } from '@/components/Input';
import { Text } from '@/components/typography/Text';
import { Button } from '@/components/Button';
import { useTranslations } from 'next-intl';
import { getApiUrl } from '@/lib/auth'; // Poprawka kolegi

interface RegisterFormProps {
  onSuccess: () => void;
}

export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const [isMounted, setIsMounted] = useState(false);

  /**
   * PL: Sprawdzamy, czy użytkownik jest już zalogowany, aby uniknąć renderowania formularza rejestracji.
   * EN: Checking if the user is already logged in to avoid rendering the registration form.
   */
  const isAlreadyLoggedIn =
    typeof window !== 'undefined' && !!localStorage.getItem('username');

  useEffect(() => {
    setIsMounted(true);
    if (isAlreadyLoggedIn) {
      onSuccess();
    }
  }, [isAlreadyLoggedIn, onSuccess]);

  const t = useTranslations('HomePage');
  const tr = useTranslations('RegisterPage');
  const te = useTranslations('errors');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  /** PL: Zarządzanie pamięcią URL podglądu
   *  EN: Managing preview URL memory
   **/
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleRemoveFile = () => {
    setFileName('');
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const password = (formData.get('password') as string) || '';
    const passwordConfirm = (formData.get('password_confirm') as string) || '';
    const avatarEntry = formData.get('avatar_photo');
    const avatarFile = avatarEntry instanceof File ? avatarEntry : null;

    /** PL: Walidacja formatu zdjęcia. EN: Image format validation. */
    if (avatarFile && avatarFile.size > 0) {
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/jpg',
      ];
      if (!allowedTypes.includes(avatarFile.type)) {
        setError(te('invalidImage'));
        setIsLoading(false);
        return;
      }
    }

    /** PL: Walidacja hasła. EN: Password validation. */
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&./\\()|{}[\]#^_-]).{8,}$/;

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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/register/`,
        {
          method: 'POST',
          body: formData,
          headers: {
            Accept: 'application/json',
          },
        }
      );

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        let serverErrorMessage = tr('errorRegistrationFailed');
        if (data && typeof data === 'object') {
          if (data.username) serverErrorMessage = tr('usernameExists');
          else if (data.email) serverErrorMessage = tr('emailExists');
          else if (data.avatar_photo) serverErrorMessage = te('invalidImage');
          else {
            const fieldErrors = Object.values(data).flat();
            if (fieldErrors.length > 0 && typeof fieldErrors[0] === 'string') {
              serverErrorMessage = fieldErrors[0];
            } else if (data.detail) {
              serverErrorMessage = data.detail;
            }
          }
        }
        setError(serverErrorMessage);
        return;
      }

      onSuccess();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Błąd podczas rejestracji:', err);
      setError(
        err.name === 'TypeError' || err.message === 'Failed to fetch'
          ? tr('serverError')
          : err.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted || isAlreadyLoggedIn) return null;

  return (
    <>
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-6 p-3 font-bold text-red-700 bg-red-50 border-2 border-red-600 rounded text-center animate-pulse"
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <Input
          id="reg-first-name"
          label={tr('firstName')}
          name="first_name"
          required
          disabled={isLoading}
          autoComplete="given-name"
        />
        <Input
          id="reg-last-name"
          label={tr('lastName')}
          name="last_name"
          required
          disabled={isLoading}
          autoComplete="family-name"
        />
        <Input
          id="reg-username"
          label={tr('nick')}
          name="username"
          required
          disabled={isLoading}
          autoComplete="username"
        />
        <Input
          id="reg-email"
          label={tr('email')}
          type="email"
          name="email"
          required
          disabled={isLoading}
          autoComplete="email"
        />

        <div className="md:col-span-2">
          <label
            id="avatar-label"
            className="block text-sm font-bold text-neutral-900 mb-1"
          >
            {tr('avatar')}
          </label>
          <div className="flex flex-wrap items-center gap-5">
            <div
              aria-hidden="true"
              className="w-16 h-16 rounded-full border-2 border-secondary-beige overflow-hidden bg-neutral-100 flex items-center justify-center shrink-0 shadow-sm"
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  className="w-8 h-8 text-neutral-300"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  id="avatar-upload"
                  name="avatar_photo"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.webp"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  disabled={isLoading}
                  aria-labelledby="avatar-label"
                />
                <label
                  htmlFor="avatar-upload"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  className="cursor-pointer bg-secondary-beige text-primary-green font-semibold py-2 px-4 rounded-full text-sm hover:bg-amber-100 transition-colors shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-600 focus-visible:outline-offset-2"
                >
                  {tr('chooseFile')}
                </label>

                {fileName && (
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    aria-label={`${tr('removeFile')}: ${fileName}`}
                    className="text-red-600 text-xs font-bold hover:underline flex items-center gap-1 focus:outline-none focus:outline focus:outline-2 focus:outline-gray-600 focus:outline-offset-0 rounded-sm"
                    disabled={isLoading}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-3 h-3"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    {tr('removeFile')}
                  </button>
                )}
              </div>
              <Text
                variant="small"
                className="italic max-w-[200px] truncate text-neutral-500"
                aria-live="polite"
              >
                {fileName || tr('noFileSelected')}
              </Text>
            </div>
          </div>
          <Text variant="caption" className="mt-1 px-1">
            {tr('avatarRequirements')}
          </Text>
        </div>

        <div className="flex flex-col gap-1 relative">
          <Input
            id="reg-password"
            label={tr('password')}
            type={showPassword ? 'text' : 'password'}
            name="password"
            required
            disabled={isLoading}
            autoComplete="new-password"
            aria-describedby="password-reqs"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={tr('password')}
            aria-pressed={showPassword}
            className="absolute right-1 top-6 p-3 text-primary-green hover:text-green-700 transition-colors focus:outline-none focus:outline focus:outline-2 focus:outline-gray-600 focus:outline-offset-0 rounded-md"
          >
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              {showPassword ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                />
              ) : (
                <>
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
                </>
              )}
            </svg>
          </button>
          <Text
            id="password-reqs"
            variant="caption"
            className="leading-tight px-1 italic opacity-70"
          >
            {tr('passwordRequirements')}
          </Text>
        </div>

        <Input
          id="reg-password-confirm"
          label={tr('confirmPassword')}
          type={showPassword ? 'text' : 'password'}
          name="password_confirm"
          required
          disabled={isLoading}
          autoComplete="new-password"
        />

        <div className="md:col-span-2 flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            id="terms"
            name="terms"
            required
            disabled={isLoading}
            className="w-4 h-4 accent-primary-green focus:outline focus:outline-2 focus:outline-gray-600 focus:outline-offset-2"
          />
          <label htmlFor="terms" className="text-sm text-neutral-900">
            {tr('acceptTerms')}{' '}
            <Link
              href="/terms"
              className="underline font-bold text-primary-green italic rounded px-1 focus:outline-none focus:outline focus:outline-2 focus:outline-gray-600 focus:outline-offset-0"
            >
              {tr('termsLink')}
            </Link>
          </label>
        </div>

        <Button
          type="submit"
          isLoading={isLoading}
          className="md:col-span-2 w-full py-4 uppercase tracking-widest shadow-lg focus:outline focus:outline-2 focus:outline-gray-600 focus:outline-offset-[3px]"
        >
          {tr('registerBtn')}
        </Button>
      </form>

      <Text variant="small" className="mt-8 text-center">
        {tr('alreadyHaveAccount')}{' '}
        <Link
          href="/?showLogin=true"
          className="font-bold text-primary-green underline hover:text-green-800 transition-colors rounded px-1 focus:outline focus:outline-2 focus:outline-gray-600 focus:outline-offset-0"
        >
          {t('login')}
        </Link>
      </Text>
    </>
  );
};
