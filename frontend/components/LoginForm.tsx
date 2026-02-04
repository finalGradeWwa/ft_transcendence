'use client';

/**
 * PL: Komponent formularza logowania z obsługą stanów, walidacją i integracją z API.
 * EN: Login form component with state management, validation, and API integration.
 */

import { useState } from 'react';
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
  const isLoginFailed =
    error instanceof Error && error.message === 'LOGIN_FAILED';
  return isLoginFailed
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
      await loginRequest(formData);
      onLoginSuccess();
      router.refresh();
    } catch (err) {
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
        label={t('email') || 'E-mail'}
        name="email"
        type="email"
        id="login-email"
        required
        value={formData.email}
        onChange={handleInputChange}
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
