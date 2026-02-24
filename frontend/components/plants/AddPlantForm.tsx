'use client';

/**
 * PL: Widok formularza dodawania rośliny zintegrowany z hookiem logiki biznesowej.
 * EN: Integrated add plant form view with business logic hook.
 */

import { useTranslations } from 'next-intl';
import { useRef, useEffect, useState } from 'react';
import { Text } from '@/components/typography/Text';
import { useAddPlantForm } from './useAddPlantForm';

interface Garden {
  garden_id: number;
  name: string;
}

interface AddPlantFormProps {
  username: string;
  firstName?: string;
  lastName?: string;
  gardens: Garden[];
  onSuccess: () => void;
  initialGardenId?: string | null;
}

const fieldCls =
  'w-full p-3 rounded bg-white border border-primary-green/20 focus:border-primary-green text-dark-text font-medium outline-none transition-all focus:outline-none focus:outline focus:outline-2 focus:outline-gray-600 focus:outline-offset-0';
const labelCls =
  'block text-primary-green font-bold mb-2 uppercase text-xs tracking-widest';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function AddPlantForm({
  username,
  firstName,
  lastName,
  gardens,
  onSuccess,
  initialGardenId,
}: AddPlantFormProps) {
  const t = useTranslations('AddPlantPage');
  const tGardens = useTranslations('GardensPage');
  const tr = useTranslations('RegisterPage');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState(false);
  const [fileSizeError, setFileSizeError] = useState(false);

  const userDisplayName =
    firstName && lastName ? `${firstName} ${lastName}` : username;

  const form = useAddPlantForm({ username, onSuccess });

  useEffect(() => {
    if (initialGardenId) {
      form.setGarden(initialGardenId);
    }
  }, [initialGardenId]);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.photo) {
      setPhotoError(true);
      return;
    }
    if (fileSizeError) return;

    setPhotoError(false);
    form.handleSubmit(e);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPhotoError(false);
    setFileSizeError(false);

    if (file && file.size > MAX_FILE_SIZE) {
      setFileSizeError(true);
      if (fileInputRef.current) fileInputRef.current.value = '';
      form.handleRemoveFile(fileInputRef);
      return;
    }

    form.handleFileChange(e);
  };

  return (
    <>
      {form.error && (
        <div
          role="alert"
          className="mb-6 p-3 font-bold text-red-700 bg-red-50 border-2 border-red-600 rounded text-center animate-pulse break-words"
        >
          {form.error}
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-6 p-2">
        <section>
          <label htmlFor="species-input" className={labelCls}>
            {t('fields.species')}
          </label>
          <input
            maxLength={25}
            id="species-input"
            required
            name="species"
            type="text"
            disabled={form.isLoading}
            className={fieldCls}
            value={form.species}
            onChange={e => form.setSpecies(e.target.value)}
          />
        </section>

        <section>
          <label htmlFor="nickname-input" className={labelCls}>
            {t('fields.nickname')}
          </label>
          <input
            maxLength={25}
            id="nickname-input"
            required
            name="nickname"
            type="text"
            disabled={form.isLoading}
            className={fieldCls}
            value={form.nickname}
            onChange={e => form.setNickname(e.target.value)}
          />
        </section>

        <section>
          <label htmlFor="garden-select" className={labelCls}>
            {t('fields.garden')}
          </label>
          <select
            id="garden-select"
            required
            name="garden"
            disabled={form.isLoading || !!initialGardenId}
            className={`w-full p-3 rounded bg-white border border-primary-green/20 focus:border-primary-green text-dark-text/80 font-bold outline-none transition-all cursor-pointer focus:outline-none focus:outline focus:outline-2 focus:outline-gray-600 focus:outline-offset-0 ${!!initialGardenId ? 'opacity-70 bg-neutral-100' : ''}`}
            value={form.garden}
            onChange={e => form.setGarden(e.target.value)}
          >
            <option
              value=""
              className="text-dark-text font-normal"
              key="placeholder"
            >
              {t('fields.selectGarden')}
            </option>
            {gardens?.map((g, index) => (
              <option
                key={g.garden_id}
                value={g.garden_id}
                className="text-dark-text font-bold"
              >
                {index === 0 &&
                (g.name === 'Home Garden' || g.name === `${username}'s Garden`)
                  ? `${userDisplayName} ${tGardens('defaultGardenName')}`
                  : g.name}
              </option>
            ))}
          </select>
        </section>

        <section className="md:col-span-2">
          <span id="plant-photo-main-label" className={labelCls}>
            {t('fields.photo')}
          </span>
          <div className="flex flex-wrap items-center gap-5">
            <div
              aria-hidden="true"
              className={`w-16 h-16 rounded-full border-2 overflow-hidden bg-neutral-100 flex items-center justify-center shrink-0 shadow-sm ${photoError || fileSizeError ? 'border-red-950' : 'border-secondary-beige'}`}
            >
              {form.previewUrl ? (
                <img
                  src={form.previewUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl text-neutral-300">🌿</span>
              )}
            </div>
            <PhotoUploadControls
              form={form}
              tr={tr}
              t={t}
              fileInputRef={fileInputRef}
              photoError={photoError}
              fileSizeError={fileSizeError}
              onFileChange={onFileChange}
            />
          </div>
        </section>

        <div className="pt-2">
          <button
            type="submit"
            disabled={form.isLoading}
            className="w-full mb-1 bg-primary-green text-white font-black py-4 rounded-xl uppercase tracking-[0.2em] shadow-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:outline focus:outline-2 focus:outline-gray-600 focus:outline-offset-[3px]"
          >
            {form.isLoading ? '...' : t('submit')}
          </button>
        </div>
      </form>
    </>
  );
}

function PhotoUploadControls({
  form,
  tr,
  t,
  fileInputRef,
  photoError,
  fileSizeError,
  onFileChange,
}: any) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4 flex-wrap">
        <label
          id="plant-photo-button-label"
          htmlFor="plant-photo-upload"
          className={`cursor-pointer font-semibold py-2 px-4 rounded-full text-sm transition-colors shadow-sm focus-within:outline focus-within:outline-2 focus-within:outline-gray-600 focus-within:outline-offset-2 ${photoError || fileSizeError ? 'bg-red-950 text-white' : 'bg-secondary-beige text-primary-green hover:bg-amber-100'}`}
        >
          {tr('chooseFile')}
          <input
            type="file"
            id="plant-photo-upload"
            name="image"
            className="sr-only"
            accept=".jpg,.jpeg,.png,.webp"
            ref={fileInputRef}
            onChange={onFileChange}
            disabled={form.isLoading}
            aria-labelledby="plant-photo-main-label plant-photo-button-label"
          />
        </label>

        {photoError && (
          <span className="text-red-950 text-[10px] font-black uppercase tracking-widest animate-pulse">
            {t('errors.photoRequired')}
          </span>
        )}

        {fileSizeError && (
          <span className="text-orange-800 text-[12px] font-bold uppercase">
            {t('errors.fileTooLarge')}
          </span>
        )}

        {form.photo && (
          <button
            type="button"
            onClick={() => form.handleRemoveFile(fileInputRef)}
            disabled={form.isLoading}
            aria-label={`${tr('removeFile')}: ${form.photo.name}`}
            className="text-red-600 text-xs font-bold hover:underline flex items-center gap-1 focus:outline-none focus:outline focus:outline-2 focus:outline-gray-600 focus:outline-offset-0 rounded-sm"
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
        {form.photo ? form.photo.name : tr('noFileSelected')}
      </Text>
    </div>
  );
}
