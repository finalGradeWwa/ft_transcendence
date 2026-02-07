'use client';

/**
 * PL: Komponent formularza logowania. Zarządza stanem uwierzytelniania i komunikacją z API.
 * EN: Login form component. Manages authentication state and API communication.
 */

import { useState, useEffect } from 'react';

import { Input } from '@/components/Input';
import { Icon } from '@/components/icons/ui/Icon';
import { Button } from '@/components/Button';

type FormData = {
  email: string;
  password: string;
};

interface LoginResponse {
  user: {
    username: string;
    email: string;
  };
  /** PL: Tokeny są teraz obsługiwane przez HttpOnly Cookies. EN: Tokens are now handled via HttpOnly Cookies. */
}

/**
 * PL: Funkcja żądania logowania.
 * EN: Login request function.
 */
const loginRequest = async (data: FormData): Promise<LoginResponse> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login/`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      /** PL: Zezwolenie na obsługę ciasteczek HttpOnly. EN: Allowing HttpOnly cookies. */
      credentials: 'include',
    }
  );

  if (!res.ok) {
    if (res.status === 400 || res.status === 401)
      throw new Error('INVALID_CREDENTIALS');
    if (res.status === 403) throw new Error('CSRF_ERROR');
    if (res.status === 429) throw new Error('TOO_MANY_REQUESTS');
    throw new Error('LOGIN_FAILED');
  }
  return res.json();
};

export const LoginForm = ({ t, tError, onLoginSuccess, usernameRef }: any) => {
  /**
   * PL: Sprawdzamy, czy użytkownik jest już zalogowany, aby uniknąć ponownego renderowania formularza.
   * EN: Checking if the user is already logged in to avoid re-rendering the form.
   */
  const isAlreadyLoggedIn =
    typeof window !== 'undefined' && !!localStorage.getItem('username');

  useEffect(() => {
    if (isAlreadyLoggedIn) {
      onLoginSuccess();
    }
  }, [isAlreadyLoggedIn, onLoginSuccess]);

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
      if (err instanceof TypeError) {
        /** PL: Błąd sieci lub serwer nie odpowiada. EN: Network error or server is unreachable. */
        setError(tError('errors.connectionError'));
      } else if (err instanceof Error) {
        switch (err.message) {
          case 'INVALID_CREDENTIALS':
          case 'EMPTY_RESPONSE':
            /** PL: Błędny login/hasło lub brak danych użytkownika. EN: Invalid login/password or missing user data. */
            setError(tError('errors.invalidCredentials'));
            break;
          case 'TOO_MANY_REQUESTS':
            /** PL: Zbyt wiele prób logowania (blokada czasowa). EN: Too many login attempts (rate limited). */
            setError(tError('errors.tooManyRequests'));
            break;
          case 'ACCOUNT_DISABLED':
            /** PL: Konto jest nieaktywne lub zablokowane. EN: Account is inactive or disabled. */
            setError(tError('errors.accountDisabled'));
            break;
          case 'CSRF_ERROR':
            /** PL: Błąd bezpieczeństwa (sesja wygasła). EN: Security error (session expired). */
            setError(tError('errors.sessionExpired'));
            break;
          default:
            /** PL: Nieoczekiwany błąd serwera (np. 500). EN: Unexpected server error (e.g., 500). */
            setError(tError('errors.genericError'));
        }
      } else {
        /** PL: Inny nieznany typ błędu. EN: Other unknown error type. */
        setError(tError('errors.genericError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const update = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
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
        label={t('email')}
        name="email"
        type="email"
        required
        onChange={update}
        disabled={isLoading}
      />
      <div className="relative">
        <Input
          label={t('password')}
          type={showPassword ? 'text' : 'password'}
          name="password"
          required
          onChange={update}
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-9 text-primary-green"
        >
          {/* Ikona oka */}
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
        </button>
      </div>
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
