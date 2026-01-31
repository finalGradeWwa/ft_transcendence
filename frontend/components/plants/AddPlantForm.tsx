'use client';

/**
 * PL: Widok formularza dodawania rośliny zintegrowany z hookiem logiki biznesowej.
 * EN: Plant addition form view integrated with the business logic hook.
 */

import { useTranslations } from 'next-intl';
import { useRef } from 'react';
import { Text } from '@/components/typography/Text';
import { useAddPlantForm } from './useAddPlantForm';

interface Garden {
  id: string;
  name: string;
}
interface AddPlantFormProps {
  username: string;
  gardens: Garden[];
  onSuccess: () => void;
}

const fieldCls =
  'w-full p-3 rounded bg-white border border-primary-green/20 focus:border-primary-green text-dark-text font-medium outline-none transition-all focus:outline-none focus:outline focus:outline-2 focus:outline-gray-600 focus:outline-offset-0';
const labelCls =
  'block text-primary-green font-bold mb-2 uppercase text-xs tracking-widest';

export function AddPlantForm({
  username,
  gardens,
  onSuccess,
}: AddPlantFormProps) {
  const t = useTranslations('AddPlantPage');
  const tr = useTranslations('RegisterPage');
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * PL: Wykorzystanie analogicznego podejścia do RegisterForm poprzez dedykowany hook.
   * EN: Using an approach analogous to RegisterForm via a dedicated hook.
   */
  const form = useAddPlantForm({ username, onSuccess });

  return (
    <>
      {/** PL: Sekcja wyświetlania błędów API. EN: API error display section. */}
      {form.error && (
        <div
          role="alert"
          className="mb-6 p-3 font-bold text-red-700 bg-red-50 border-2 border-red-600 rounded text-center animate-pulse break-words"
        >
          {form.error}
        </div>
      )}

      <form onSubmit={form.handleSubmit} className="space-y-6 p-1">
        {/** PL: Pole Gatunek. EN: Species field. */}
        <section>
          <label className={labelCls}>{t('fields.species')}</label>
          <input
            required
            name="species"
            type="text"
            disabled={form.isLoading}
            className={fieldCls}
            value={form.species}
            onChange={e => form.setSpecies(e.target.value)}
          />
        </section>

        {/** PL: Pole Nazwa własna. EN: Nickname field. */}
        <section>
          <label className={labelCls}>{t('fields.nickname')}</label>
          <input
            required
            name="nickname"
            type="text"
            disabled={form.isLoading}
            className={fieldCls}
            value={form.nickname}
            onChange={e => form.setNickname(e.target.value)}
          />
        </section>

        {/** PL: Wybór ogrodu. EN: Garden selection. */}
        <section>
          <label className={labelCls}>{t('fields.garden')}</label>
          <select
            required
            name="garden"
            disabled={form.isLoading}
            className="w-full p-3 rounded bg-white border border-primary-green/20 focus:border-primary-green text-gray-green-text font-bold outline-none transition-all cursor-pointer focus:outline-none focus:outline focus:outline-2 focus:outline-gray-600 focus:outline-offset-0"
            value={form.garden}
            onChange={e => form.setGarden(e.target.value)}
          >
            <option value="" className="text-dark-text font-normal">
              {t('fields.selectGarden')}
            </option>
            {gardens?.map(g => (
              <option
                key={g.id}
                value={g.id}
                className="text-dark-text font-bold"
              >
                {g.name}
              </option>
            ))}
          </select>
        </section>

        {/** PL: Obowiązkowe zdjęcie rośliny. EN: Mandatory plant photo. */}
        <section className="md:col-span-2">
          <label className={labelCls}>{t('fields.photo')}</label>
          <div className="flex flex-wrap items-center gap-5">
            <div
              aria-hidden="true"
              className="w-16 h-16 rounded-full border-2 border-secondary-beige overflow-hidden bg-neutral-100 flex items-center justify-center shrink-0 shadow-sm"
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
              fileInputRef={fileInputRef}
            />
          </div>
        </section>

        {/** PL: Przycisk wysyłania ze stanem ładowania. EN: Submit button with loading state. */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={form.isLoading}
            className="w-full mb-1 bg-primary-green text-white font-black py-4 rounded-xl uppercase tracking-[0.2em] shadow-xl hover:opacity-90 hover:translate-y-[-1px] transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:outline focus:outline-2 focus:outline-gray-600 focus:outline-offset-[3px]"
          >
            {form.isLoading ? '...' : t('submit')}
          </button>
        </div>
      </form>
    </>
  );
}

/**
 * PL: Wydzielony sub-komponent dla kontrolek uploadu zdjęcia.
 * EN: Separated sub-component for photo upload controls.
 */
function PhotoUploadControls({ form, tr, fileInputRef }: any) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4 flex-wrap">
        {/** PL: Ukryty input typu file. EN: Hidden file input. */}
        <input
          required
          type="file"
          id="plant-photo-upload"
          name="photo_url"
          className="hidden"
          accept=".jpg,.jpeg,.png,.webp"
          ref={fileInputRef}
          onChange={form.handleFileChange}
          disabled={form.isLoading}
        />
        {/** PL: Stylizowana etykieta pełniąca rolę przycisku wyboru. EN: Styled label acting as a select button. */}
        <label
          htmlFor="plant-photo-upload"
          tabIndex={0}
          onKeyDown={e =>
            (e.key === 'Enter' || e.key === ' ') &&
            (e.preventDefault(), fileInputRef.current?.click())
          }
          className="cursor-pointer bg-secondary-beige text-primary-green font-semibold py-2 px-4 rounded-full text-sm hover:bg-amber-100 transition-colors shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-600 focus-visible:outline-offset-2"
        >
          {tr('chooseFile')}
        </label>

        {/** PL: Przycisk usuwania aktualnie wybranego pliku. EN: Button for removing the currently selected file. */}
        {form.photo && (
          <button
            type="button"
            onClick={() => form.handleRemoveFile(fileInputRef)}
            disabled={form.isLoading}
            className="text-red-600 text-xs font-bold hover:underline flex items-center gap-1 focus:outline-none focus:outline focus:outline-2 focus:outline-gray-600 focus:outline-offset-0 rounded-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-3 h-3"
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
      {/** PL: Wyświetlanie nazwy pliku lub komunikatu o braku wyboru. EN: Displaying filename or no-selection message. */}
      <Text
        variant="small"
        className="italic max-w-[200px] truncate text-neutral-500"
      >
        {form.photo ? form.photo.name : tr('noFileSelected')}
      </Text>
    </div>
  );
}
