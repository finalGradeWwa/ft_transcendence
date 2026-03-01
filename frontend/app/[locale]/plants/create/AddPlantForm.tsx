'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/auth';
import { Text } from '@/components/typography/Text';

interface Garden {
  garden_id: number;
  name: string;
}

interface AddPlantFormProps {
  username: string;
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
  gardens,
  onSuccess,
  initialGardenId,
}: AddPlantFormProps) {
  const router = useRouter();
  const t = useTranslations('AddPlantPage');
  const tr = useTranslations('RegisterPage');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nickname, setNickname] = useState('');
  const [species, setSpecies] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const [fileSizeError, setFileSizeError] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const selectedGarden = gardens.find(
    g => String(g.garden_id) === String(initialGardenId)
  );

  useEffect(() => {
    if (!initialGardenId) return;
  }, [initialGardenId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPhotoError(false);
    setFileSizeError(false);

    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setFileSizeError(true);
        setPhoto(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      setPhoto(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!photo) {
      if (!fileSizeError) setPhotoError(true);
      return;
    }

    if (fileSizeError) return;

    if (!initialGardenId) {
      setServerError('addPlantFailed');
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append('nickname', nickname);
    data.append('species', species);
    data.append('garden', initialGardenId);
    data.append('image', photo);

    try {
      const response = await apiFetch(
        `/api/garden/${initialGardenId}/add_plant/`,
        {
          method: 'POST',
          body: data,
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (result.nickname) {
          setServerError('nicknameExists');
        } else {
          setServerError('addPlantFailed');
        }
        setLoading(false);
        return;
      }

      if (typeof onSuccess === 'function') {
        onSuccess();
      }

      router.refresh();
      router.push(`/profiles/${username}/gardens/${initialGardenId}`);
    } catch {
      setServerError('unexpectedError');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-2">
      <section>
        <label htmlFor="species-input" className={labelCls}>
          {t('fields.species')}
        </label>
        <input
          maxLength={25}
          id="species-input"
          required
          type="text"
          disabled={loading}
          className={fieldCls}
          value={species}
          onChange={e => setSpecies(e.target.value)}
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
          type="text"
          disabled={loading}
          className={fieldCls}
          value={nickname}
          onChange={e => setNickname(e.target.value)}
        />
      </section>

      <section>
        <label className={labelCls}>{t('fields.garden')}</label>
        <div className={`${fieldCls} bg-neutral-100 opacity-70 font-bold`}>
          {selectedGarden?.name}
        </div>
      </section>

      <section className="md:col-span-2">
        <span id="plant-photo-label" className={labelCls}>
          {t('fields.photo')}
        </span>

        <div className="flex flex-wrap items-center gap-5">
          <div
            aria-hidden="true"
            className={`w-16 h-16 rounded-full border-2 overflow-hidden bg-neutral-100 flex items-center justify-center shrink-0 shadow-sm ${
              photoError || fileSizeError
                ? 'border-red-950'
                : 'border-secondary-beige'
            }`}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl text-neutral-300">🌿</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4 flex-wrap">
              {' '}
              <label
                id="plant-photo-button-label"
                htmlFor="plant-photo-upload"
                className={`cursor-pointer font-semibold py-2 px-4 rounded-full text-sm transition-colors shadow-sm focus-within:outline focus-within:outline-2 focus-within:outline-gray-600 focus-within:outline-offset-2 ${
                  photoError || fileSizeError
                    ? 'bg-red-950 text-white'
                    : 'bg-secondary-beige text-primary-green hover:bg-amber-100'
                }`}
              >
                {tr('chooseFile')}
                <input
                  type="file"
                  id="plant-photo-upload"
                  className="sr-only"
                  accept=".jpg,.jpeg,.png,.webp"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  disabled={loading}
                  aria-labelledby="plant-photo-label plant-photo-button-label"
                />
              </label>
              {photoError && (
                <span className="text-red-950 text-[10px] font-black uppercase tracking-widest animate-pulse">
                  {t('errors.photoRequired')}
                </span>
              )}
              {fileSizeError && (
                <span className="text-orange-800 text-[12px] font-bold uppercase animate-pulse">
                  {t('errors.fileTooLarge')}
                </span>
              )}
            </div>

            <Text
              variant="small"
              className="italic max-w-[200px] truncate text-neutral-500"
              aria-live="polite"
            >
              {photo ? photo.name : tr('noFileSelected')}
            </Text>
          </div>
        </div>
      </section>

      {serverError && (
        <p className="text-red-600 text-[10px] font-black uppercase tracking-widest text-center">
          {t(`errors.${serverError}`)}
        </p>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading || !initialGardenId}
          className="w-full mb-1 bg-primary-green text-white font-black py-4 rounded-xl uppercase tracking-[0.2em] shadow-xl hover:opacity-90  transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline focus:outline-2 focus:outline-gray-600 focus:outline-offset-[3px]"
        >
          {loading ? '...' : t('submit')}
        </button>
      </div>
    </form>
  );
}
