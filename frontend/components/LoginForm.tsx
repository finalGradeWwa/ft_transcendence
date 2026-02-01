'use client';

/**
 * PL: Komponent formularza logowania. Zarządza stanem uwierzytelniania i komunikacją z API.
 * EN: Login form component. Manages authentication state and API communication.
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
  const res = await fetch('http://localhost:8000/api/auth/login/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    /** PL: Zezwolenie na obsługę ciasteczek HttpOnly. EN: Allowing HttpOnly cookies. */
    credentials: 'include',
  });

  if (!res.ok) throw new Error('LOGIN_FAILED');
  return res.json();
};

export const LoginForm = ({ t, tError, onLoginSuccess, usernameRef }: any) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /**
   * PL: Automatyczne zamknięcie, jeśli użytkownik jest już w sesji.
   * EN: Auto-close if user is already in session.
   */
  useEffect(() => {
    if (localStorage.getItem('username')) {
      onLoginSuccess();
    }
  }, [onLoginSuccess]);

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
      setError(tError('errors.invalidCredentials'));

      /** PL: Logujemy szczegóły dla dewelopera EN: Logging details for the developer */
      console.error('--- LOGIN ERROR ---');
      console.error('Details:', err);
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
