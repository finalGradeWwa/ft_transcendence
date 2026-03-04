'use client';

/**
 * PL: Strona edycji profilu użytkownika. Obsługuje aktualizację danych osobowych,
 * zmianę awatara oraz resetowanie hasła z walidacją danych.
 * EN: User profile edit page. Handles updating personal information,
 * avatar changes, and password resets with data validation.
 */

import { useState, useRef, useEffect, use } from 'react';
import { Link } from '@/i18n/navigation';
import { Input } from '@/components/Input';
import { Text } from '@/components/typography/Text';
import { Button } from '@/components/Button';
import { Heading } from '@/components/Heading';
import { useTranslations } from 'next-intl';
import { getApiUrl, apiFetch } from '@/lib/auth';

export default function EditProfilePage({
  params,
}: {
  params: Promise<{ locale: string; username: string }>;
}) {
  /** PL: Unwrapping parametrów ścieżki (język i nazwa użytkownika). EN: Unwrapping path params (locale and username). */
  const { locale, username: initialUsername } = use(params);

  const tr = useTranslations('RegisterPage');
  const te = useTranslations('errors');

  /** PL: Referencje i stany dla obsługi wgrywania zdjęć. EN: Refs and states for handling image uploads. */
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  /** PL: Stany interfejsu użytkownika (ładowanie, błędy, widoczność haseł). EN: UI states (loading, errors, password visibility). */
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  /** PL: Stan przechowujący aktualne dane użytkownika z API. EN: State holding current user data from API. */
  const [userData, setUserData] = useState({
    first_name: '',
    last_name: '',
    username: initialUsername,
    email: '',
    avatar_photo: '',
  });

  /**
   * PL: Formatuje pełny adres URL awatara, obsługując media z backendu oraz obiekty typu blob.
   * EN: Formats the full avatar URL, handling backend media and blob objects.
   */
  const getFullAvatarUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('blob:')) return path;
    const apiUrl = getApiUrl();
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return cleanPath.startsWith('/media/')
      ? `${apiUrl}${cleanPath}`
      : `${apiUrl}/media${cleanPath}`;
  };

  /**
   * PL: Pobieranie aktualnych danych użytkownika przy inicjalizacji strony.
   * EN: Fetching current user data upon page initialization.
   */
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiFetch('/api/auth/me/');

        if (response.ok) {
          const data = await response.json();
          setUserData({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            username: data.username || initialUsername,
            email: data.email || '',
            avatar_photo: data.avatar_photo || '',
          });
          if (data.avatar_photo) {
            setPreviewUrl(getFullAvatarUrl(data.avatar_photo));
          }
        }
      } catch (err) {
        console.error('Failed to fetch user data', err);
      }
    };
    fetchUserData();
  }, [initialUsername]);

  /** PL: Czyszczenie pamięci po podglądzie zdjęcia (zapobieganie wyciekom pamięci). EN: Cleaning up memory after image preview (preventing memory leaks). */
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:'))
        URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  /** PL: Obsługa zmiany pliku graficznego i tworzenie tymczasowego podglądu. EN: Handling image file change and creating a temporary preview. */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  /** PL: Przywracanie poprzedniego awatara i resetowanie wyboru pliku. EN: Restoring previous avatar and resetting file selection. */
  const handleRemoveFile = () => {
    setFileName('');
    if (previewUrl && previewUrl.startsWith('blob:'))
      URL.revokeObjectURL(previewUrl);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setPreviewUrl(getFullAvatarUrl(userData.avatar_photo));
    setError(null);
  };

  /**
   * PL: Główna funkcja wysyłająca zaktualizowane dane do API (metoda PATCH).
   * EN: Main function sending updated data to the API (PATCH method).
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const oldPassword = formData.get('old_password') as string;
    const password = formData.get('password') as string;
    const passwordConfirm = formData.get('password_confirm') as string;
    const avatarFile = formData.get('avatar_photo') as File;

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&./()|{}\[\]#^_-]).{8,}$/;

    /** PL: Podstawowa walidacja haseł przed wysyłką. EN: Basic password validation before submission. */
    if (!oldPassword) {
      setError(te('currentPasswordRequired'));
      setIsLoading(false);
      return;
    }

    if (password) {
      if (password !== passwordConfirm) {
        setError(tr('errorPasswordMatch'));
        setIsLoading(false);
        return;
      }
      if (!passwordRegex.test(password)) {
        setError(tr('passwordRequirements'));
        setIsLoading(false);
        return;
      }
    }

    // PL: Usuwanie pustych pól, aby nie nadpisywać danych na serwerze. EN: Removing empty fields to avoid overwriting data on the server.
    if (!password) {
      formData.delete('password');
      formData.delete('password_confirm');
    }

    if (!avatarFile || avatarFile.size === 0) {
      formData.delete('avatar_photo');
    }

    const emailInForm = formData.get('email');
    if (!emailInForm || emailInForm === '') {
      if (userData.email) {
        formData.set('email', userData.email);
      } else {
        formData.delete('email');
      }
    }

    try {
      const response = await apiFetch('/api/auth/me/', {
        method: 'PATCH',
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (data?.old_password) throw new Error(te('invalidCurrentPassword'));
        if (data?.username) throw new Error(te('usernameTaken'));
        if (data?.email) throw new Error(te('invalidEmail'));
        throw new Error(te('updateFailed'));
      }

      /** PL: Aktualizacja localStorage jeśli zmieniono nick. EN: Updating localStorage if the username was changed. */
      if (data?.username) {
        localStorage.setItem('username', data.username);
        window.dispatchEvent(new Event('user-updated'));
      }

      window.location.href = `/${locale}/profiles/${data?.username || userData.username}`;
    } catch (err: any) {
      const message =
        !err.message || err.message.trim() === ''
          ? te('serverError500')
          : err.message;
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
      <div className="py-12 flex justify-center">
        <div className="bg-container-light p-8 rounded-xl shadow-2xl w-full max-w-2xl border border-primary-green">
          <Heading
            as="h1"
            className="mb-8 text-center uppercase tracking-widest !text-primary-green font-bold"
          >
            {tr('editTitle')}
          </Heading>

          {/* PL: Wyświetlanie komunikatów o błędach. EN: Displaying error messages. */}
          {error && (
            <div
              role="alert"
              className="mb-6 p-3 font-bold text-red-700 bg-red-50 border-2 border-red-600 rounded text-center"
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <Input
              key={`fn-${userData.first_name}`}
              id="edit-first-name"
              label={tr('firstName')}
              name="first_name"
              defaultValue={userData.first_name}
              required
              disabled={isLoading}
            />
            <Input
              key={`ln-${userData.last_name}`}
              id="edit-last-name"
              label={tr('lastName')}
              name="last_name"
              defaultValue={userData.last_name}
              required
              disabled={isLoading}
            />
            <Input
              key={`un-${userData.username}`}
              id="edit-username"
              label={tr('nick')}
              name="username"
              defaultValue={userData.username}
              required
              disabled={isLoading}
            />

            {/* PL: Sekcja zarządzania awatarem z podglądem. EN: Avatar management section with preview. */}
            <div className="md:col-span-2">
              <label
                id="avatar-label"
                className="block text-sm font-bold text-neutral-900 mb-1"
              >
                {tr('avatar')}
              </label>
              <div className="flex flex-wrap items-center gap-5">
                <div className="w-16 h-16 rounded-full border-2 border-secondary-beige overflow-hidden bg-neutral-100 flex items-center justify-center shrink-0 shadow-sm">
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
                    />
                    <label
                      htmlFor="avatar-upload"
                      tabIndex={0}
                      onKeyDown={e => {
                        (e.key === 'Enter' || e.key === ' ') &&
                          fileInputRef.current?.click();
                      }}
                      className="cursor-pointer bg-secondary-beige text-primary-green font-semibold py-2 px-4 rounded-full text-sm hover:bg-amber-100 transition-colors shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-600 focus-visible:outline-offset-2"
                    >
                      {tr('chooseFile')}
                    </label>
                    {fileName && (
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="text-red-600 text-xs font-bold hover:underline flex items-center gap-1 focus:outline-none focus:outline focus:outline-2 focus:outline-gray-600 focus:outline-offset-0 rounded-sm"
                      >
                        {tr('removeFile')}
                      </button>
                    )}
                  </div>
                  <Text
                    variant="small"
                    className="italic max-w-[200px] truncate text-neutral-500"
                  >
                    {fileName || tr('noFileSelected')}
                  </Text>
                </div>
              </div>
            </div>

            {/* PL: Pola zmiany hasła z obsługą widoczności (ikonka oka). EN: Password change fields with visibility toggle (eye icon). */}
            <div className="flex flex-col gap-1 relative">
              <Input
                id="old-password"
                label={tr('currentPassword')}
                type={showOldPassword ? 'text' : 'password'}
                name="old_password"
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-1 top-6 p-3 text-primary-green hover:text-green-700 transition-colors focus:outline-none focus:outline focus:outline-2 focus:outline-gray-600 focus:outline-offset-0 rounded-md"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  {showOldPassword ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  ) : (
                    <>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </>
                  )}
                </svg>
              </button>
            </div>
            <div className="hidden md:block" aria-hidden="true" />

            <div className="md:col-span-2 mt-2">
              <Text className="font-bold uppercase tracking-wider text-primary-green border-b border-secondary-beige pb-1">
                {tr('changePasswordLabel')}
              </Text>
            </div>

            <div className="flex flex-col gap-1 relative">
              <Input
                id="reg-password"
                label={tr('password')}
                type={showNewPassword ? 'text' : 'password'}
                name="password"
                disabled={isLoading}
                autoComplete="new-password"
              />
              <p className="text-[10px] text-neutral-500 mt-1 px-1">
                {tr('passwordRequirements')}
              </p>
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-1 top-6 p-3 text-primary-green hover:text-green-700 transition-colors focus:outline-none focus:outline focus:outline-2 focus:outline-gray-600 focus:outline-offset-0 rounded-md"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  {showNewPassword ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  ) : (
                    <>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </>
                  )}
                </svg>
              </button>
            </div>

            <Input
              id="reg-password-confirm"
              label={tr('confirmPassword')}
              type={showNewPassword ? 'text' : 'password'}
              name="password_confirm"
              disabled={isLoading}
              autoComplete="new-password"
            />

            <Button
              type="submit"
              isLoading={isLoading}
              className="md:col-span-2 w-full py-4 uppercase tracking-widest shadow-lg focus:outline focus:outline-2 focus:outline-gray-600 focus:outline-offset-[3px]"
            >
              {tr('saveBtn')}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <Link
              href={`/profiles/${userData.username}`}
              className="font-bold text-primary-green underline hover:text-green-800 transition-colors text-sm rounded px-1 focus:outline-none focus:outline focus:outline-2 focus:outline-gray-600 focus:outline-offset-0"
            >
              {tr('backToProfile')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
