'use client';

/**
 * PL: Hook logiki biznesowej dla formularza dodawania rośliny.
 * EN: Business logic hook for the add plant form.
 */

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface UseAddPlantFormProps {
  username: string;
  onSuccess: () => void;
}

export const useAddPlantForm = ({
  username,
  onSuccess,
}: UseAddPlantFormProps) => {
  const t = useTranslations('Plants');

  const [species, setSpecies] = useState('');
  const [nickname, setNickname] = useState('');
  const [garden, setGarden] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * PL: Obsługuje zmianę pliku i generuje tymczasowy adres URL do podglądu.
   * EN: Handles file change and generates a temporary URL for preview.
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  /**
   * PL: Usuwa wybrany plik i czyści podgląd oraz referencję inputu.
   * EN: Removes the selected file and clears the preview and input reference.
   */
  const handleRemoveFile = (
    fileInputRef: React.RefObject<HTMLInputElement | null>
  ) => {
    setPhoto(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * PL: Zarządza procesem wysyłki: walidacja, budowa FormData i komunikacja z serwerem.
   * EN: Manages the submission process: validation, FormData construction, and server communication.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!species.trim() || !nickname.trim() || !garden || !photo) {
      setError(t('errors.fillAllFields'));
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('species', species);
    formData.append('nickname', nickname);
    formData.append('garden', garden);
    formData.append('owner', username);
    formData.append('image', photo);

    try {
      /**
       * PL: Pobranie adresu z zmiennych środowiskowych
       * EN: Fetching address from environment variables
       */
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(`${apiUrl}/api/plants/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(t('errors.addPlantFailed'));
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || t('errors.unexpectedError'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    species,
    setSpecies,
    nickname,
    setNickname,
    garden,
    setGarden,
    photo,
    previewUrl,
    isLoading,
    error,
    handleFileChange,
    handleRemoveFile,
    handleSubmit,
  };
};
