'use client';

/**
 * PL: Hook logiczny formularza rejestracji. Separuje zarządzanie stanem,
 * walidację danych oraz komunikację z API od warstwy prezentacji (UI).
 * EN: Logical hook for the registration form. Separates state management,
 * data validation, and API communication from the presentation layer (UI).
 */

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface UseRegisterFormProps {
  onSuccess: () => void;
}

/**
 * PL: Niestandardowy hook zarządzający logiką, stanem i walidacją formularza rejestracji.
 * EN: Custom hook managing the logic, state, and validation of the registration form.
 */
export const useRegisterForm = ({ onSuccess }: UseRegisterFormProps) => {
  const t = useTranslations('HomePage');
  const tr = useTranslations('RegisterPage');
  const te = useTranslations('errors');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  /** PL: Zarządzanie pamięcią adresu URL podglądu awatara. EN: Memory management for the avatar preview URL. */
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  /** PL: Resetowanie wybranego pliku i podglądu. EN: Resetting the selected file and preview. */
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

  /** PL: Obsługa zmiany pliku i generowanie podglądu. EN: Handling file change and generating preview. */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  /** PL: Główna funkcja wysyłania formularza z walidacją i obsługą błędów. EN: Main form submission function with validation and error handling. */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const passwordConfirm = formData.get('password_confirm') as string;
    const avatarFile = formData.get('avatar_photo') as File;

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

    /** PL: Walidacja złożoności i zgodności haseł. EN: Password complexity and match validation. */
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
        headers: { Accept: 'application/json' },
      });

      const data = await response.json();

      /** PL: Przetwarzanie błędów po stronie serwera. EN: Server-side error processing. */
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
        setIsLoading(false);
        return;
      }

      onSuccess();
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  return {
    t,
    tr,
    fileName,
    previewUrl,
    isLoading,
    error,
    showPassword,
    setShowPassword,
    fileInputRef,
    handleRemoveFile,
    handleFileChange,
    handleSubmit,
  };
};
