'use client';

/**
 * PL: Komponent formularza logowania z obsługą stanów, walidacją i integracją z API.
 * EN: Login form component with state management, validation, and API integration.
 */

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Input } from '@/components/Input';
import { Icon } from '@/components/icons/ui/Icon';
import { Button } from '@/components/Button';

type FormData = {
  email: string;
  password: string;
};

/**
 * PL: Wysyła żądanie logowania do API przy użyciu zmiennej środowiskowej dla adresu URL.
 * EN: Sends a login request to the API using an environment variable for the URL.
 */
const loginRequest = async (data: FormData): Promise<void> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const res = await fetch(`${apiUrl}/api/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: data.email,
      password: data.password,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error('LOGIN_FAILED');
  }
};

/**
 * PL: Mapuje błędy API lub połączenia na klucze tłumaczeń.
 * EN: Maps API or connection errors to translation keys.
 */
const getErrorMessage = (
  tError: (key: string) => string,
  error: unknown
): string => {
  return error instanceof Error && error.message === 'LOGIN_FAILED'
    ? tError('errors.invalidCredentials')
    : tError('errors.connectionError');
};

/**
 * PL: Komponent wyświetlający komunikat o błędzie logowania.
 * EN: Component displaying a login error message.
 */
const ErrorMessage = ({ message }: { message: string }) => (
  <div className="p-2 text-sm font-bold text-red-700 bg-white border-2 border-red-600 rounded flex items-center gap-2">
    <Icon name="close" size={16} />
    {message}
  </div>
);

/**
 * PL: Ikona oka przełączająca widoczność hasła (obsługuje dynamiczne ścieżki SVG).
 * EN: Eye icon toggling password visibility (handles dynamic SVG paths).
 */
const EyeIcon = ({ show }: { show: boolean }) => {
  const pathData = show
    ? 'M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88'
    : [
        'M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z',
        'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
      ].join(' ');

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={pathData} />
    </svg>
  );
};

interface LoginFormProps {
  t: (key: string) => string;
  tError: (key: string) => string;
  onLoginSuccess: () => void;
  usernameRef: React.Ref<HTMLInputElement>;
}

/**
 * PL: Niestandardowy hook zarządzający logiką i stanem formularza logowania.
 * EN: Custom hook managing the logic and state of the login form.
 */
const useLoginForm = (
  onLoginSuccess: () => void,
  tError: (key: string) => string
) => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = await loginRequest(formData);

      /**
       * PL: Sprawdzenie, czy backend faktycznie przysłał dane użytkownika.
       * EN: Checking if the backend actually sent user data.
       */
      if (!data || !data.user) {
        throw new Error('EMPTY_RESPONSE');
      }

      /** PL: Zapis danych do localStorage. EN: Saving data to localStorage. */
      localStorage.setItem('username', data.user.username);

      /**
       * PL: Przekierowanie na stronę główną i odświeżenie stanu aplikacji.
       * EN: Redirect to home page and refresh application state.
       */
      onLoginSuccess();
      window.location.href = '/';
    } catch (err) {
      /** PL: Wyświetlamy błąd użytkownikowi EN: Displaying error to the user */
      setError(getErrorMessage(tError, err));
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (name: keyof FormData, value: string) => {
    setError(null);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return {
    formData,
    error,
    isLoading,
    showPassword,
    setShowPassword,
    handleSubmit,
    updateFormData,
  };
};

/**
 * PL: Główny komponent widoku formularza logowania.
 * EN: Main login form view component.
 */
export const LoginForm = ({
  t,
  tError,
  onLoginSuccess,
  usernameRef,
}: LoginFormProps) => {
  const {
    formData,
    error,
    isLoading,
    showPassword,
    setShowPassword,
    handleSubmit,
    updateFormData,
  } = useLoginForm(onLoginSuccess, tError);

  const handleInputChange = ({
    target,
  }: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData(target.name as keyof FormData, target.value);
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {error && <ErrorMessage message={error} />}

      <Input
        ref={usernameRef}
        label={t('email')}
        name="email"
        type="email"
        required
        value={formData.email}
        onChange={handleInputChange}
        disabled={isLoading}
      />
      <div className="relative">
        <Input
          label={t('password')}
          type={showPassword ? 'text' : 'password'}
          name="password"
          required
          value={formData.password}
          onChange={handleInputChange}
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-9 z-10 text-primary-green hover:text-green-700 transition-colors"
        >
          <EyeIcon show={showPassword} />
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
        className="w-full uppercase font-bold"
      >
        {t('loginBtn')}
      </Button>
    </form>
  );
};
