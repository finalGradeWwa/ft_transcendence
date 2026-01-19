'use client';

/**
 * PL: Komponent formularza logowania. Zarządza stanem uwierzytelniania,
 * walidacją po stronie serwera oraz komunikacją z API Django.
 * EN: Login form component. Manages authentication state,
 * server-side validation, and communication with the Django API.
 */

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Input } from '@/components/Input';
import { Icon } from '@/components/icons/ui/Icon';
import { Button } from '@/components/Button';

/**
 * PL: Typ danych formularza logowania.
 * EN: Login form data type.
 */
type FormData = {
  email: string;
  password: string;
};

/**
 * PL: Funkcja wysyłająca żądanie logowania do API Django.
 * EN: Function sending login request to Django API.
 */
const loginRequest = async (data: FormData): Promise<void> => {
  const res = await fetch('http://localhost:8000/api/auth/login/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: data.email,
      password: data.password,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.warn('Logowanie odrzucone:', errorData);
    throw new Error('LOGIN_FAILED');
  }
};

/**
 * PL: Pomocnik mapujący błędy logowania na przetłumaczone komunikaty.
 * EN: Helper mapping login errors to translated messages.
 */
const getErrorMessage = (
  tError: (key: string) => string,
  error: unknown
): string =>
  error instanceof Error && error.message === 'LOGIN_FAILED'
    ? tError('errors.invalidCredentials')
    : tError('errors.connectionError');

/**
 * PL: Interfejs właściwości komponentu LoginForm.
 * EN: Props interface for the LoginForm component.
 */
interface LoginFormProps {
  /** PL: Funkcja tłumacząca dla tekstów ogólnych. EN: Translation function for general texts. */
  t: (key: string) => string;
  /** PL: Funkcja tłumacząca dla komunikatów o błędach. EN: Translation function for error messages. */
  tError: (key: string) => string;
  /** PL: Callback wywoływany po pomyślnym zalogowaniu. EN: Callback triggered after successful login. */
  onLoginSuccess: () => void;
  /** PL: Referencja do pola nazwy użytkownika (autofocus). EN: Reference to the username input (autofocus). */
  usernameRef: React.Ref<HTMLInputElement>;
}

/**
 * PL: Reużywalny komponent formularza logowania zintegrowany z systemem projektowym.
 * EN: Reusable login form component integrated with the design system.
 */
export const LoginForm = ({
  t,
  tError,
  onLoginSuccess,
  usernameRef,
}: LoginFormProps) => {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });

  /** PL:
   * Stan błędów i ładowania.
   * EN: Error and loading states. */
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /**
   * PL: Obsługa wysyłania formularza.
   * EN: Form submission handling.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await loginRequest(formData);
      onLoginSuccess();
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(tError, err));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * PL: Aktualizacja stanu danych przy zmianie w polach Input.
   * EN: Updating data state on Input field changes.
   */
  const update = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setFormData(prev => ({ ...prev, [target.name]: target.value }));
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {error && (
        <div className="p-2 text-sm font-bold text-red-700 bg-white border-2 border-red-600 rounded flex items-center gap-2">
          <Icon name="close" size={16} />
          {error}
        </div>
      )}

      <Input
        ref={usernameRef}
        label={t('email') || 'E-mail'}
        name="email"
        type="email"
        id="login-email"
        required
        value={formData.email}
        onChange={update}
        disabled={isLoading}
      />

      <div className="relative flex flex-col gap-1">
        <Input
          label={t('password')}
          type={showPassword ? 'text' : 'password'}
          name="password"
          id="login-password"
          required
          value={formData.password}
          onChange={update}
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-9 z-10 text-primary-green hover:text-green-700 transition-colors"
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
      </div>

      {/* GITHUB LOGIN BUTTON START */}
      <div className="relative flex py-5 items-center">
        <div className="flex-grow border-t border-gray-400"></div>
        <span className="flex-shrink mx-4 text-gray-400">Lub</span>
        <div className="flex-grow border-t border-gray-400"></div>
      </div>
      <a
        href="http://127.0.0.1:8000/api/auth/login/github/"
        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.168 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.378.203 2.398.1 2.651.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z"
            clipRule="evenodd"
          />
        </svg>
        Zaloguj się przez GitHub
      </a>
      {/* GITHUB LOGIN BUTTON END */}

      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full py-4 uppercase font-bold text-lg tracking-widest shadow-lg focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-[3px]"
      >
        {t('loginBtn')}
      </Button>
    </form>
  );
};
