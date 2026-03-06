'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/auth';

export function GardenEditForm({ garden: initialGarden, username, gardenId }: any) {
  const router = useRouter();
  const t = useTranslations('GardensPage');
  const tCommon = useTranslations();

  const [garden, setGarden] = useState<any>(initialGarden);
  const [name, setName] = useState(initialGarden?.name || '');
  const [environment, setEnvironment] = useState(initialGarden?.environment || 'I');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!initialGarden);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialGarden) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await apiFetch(`/api/garden/${gardenId}/`, { skipRedirect: true });

        if (!res.ok) {
          if (!cancelled) {
            if (res.status === 401 || res.status === 403) {
              setError('You do not have permission to edit this garden');
            } else if (res.status === 404) {
              setError('Garden not found');
            } else {
              setError('Failed to load garden');
            }
            setInitialLoading(false);
          }
          return;
        }

        const data = await res.json();
        if (!cancelled) {
          setGarden(data);
          setName(data.name || '');
          setEnvironment(data.environment || 'I');
          setInitialLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load garden');
          setInitialLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [gardenId, initialGarden]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiFetch(`/api/garden/${gardenId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, environment }),
      });

      if (response.ok) {
        router.push(`/profiles/${username}/gardens/${gardenId}`);
        router.refresh(); // optionally, you may not need this if entirely CSR
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-dark-text font-bold text-sm uppercase tracking-widest animate-pulse">
          {tCommon('ProfilePage.aria.loadingAction')}
        </div>
      </div>
    );
  }

  if (error || !garden) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 font-bold">{error || 'Garden not found'}</p>
        <button
          onClick={() => router.back()}
          className="mt-6 bg-primary-green text-white px-8 py-3 rounded-xl font-bold uppercase text-xs tracking-widest"
        >
          {t('back')}
        </button>
      </div>
    );
  }

  const isDefault = garden.name?.includes("'s Garden") || garden.name === 'Default Garden';

  if (isDefault) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-black text-red-600 uppercase mb-4">
          {t('accessDenied')}
        </h2>
        <p className="text-neutral-600 mb-6 font-semibold">
          {t('cannotEditDefault')}
        </p>
        <button
          onClick={() => router.back()}
          className="bg-primary-green text-white px-8 py-3 rounded-xl font-bold uppercase text-xs tracking-widest"
        >
          {t('back')}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-2">
      <div>
        <label
          htmlFor="edit-garden-name"
          className="block text-xs font-bold uppercase tracking-widest text-primary-green mb-2"
        >
          {t('fields.name')}
        </label>
        <input
          maxLength={25}
          id="edit-garden-name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full bg-white border border-primary-green/20 rounded-xl px-4 py-3 text-dark-text font-semibold outline-none transition-all focus:outline focus:outline-2 focus:outline-gray-600 focus:outline-offset-0"
          required
        />
      </div>

      <div>
        <label
          htmlFor="edit-garden-environment"
          className="block text-xs font-bold uppercase tracking-widest text-primary-green mb-2"
        >
          {t('fields.environment')}
        </label>
        <select
          id="edit-garden-environment"
          value={environment}
          onChange={e => setEnvironment(e.target.value)}
          className="w-full bg-white border border-primary-green/20 rounded-xl px-4 py-3 text-dark-text font-semibold appearance-none outline-none transition-all focus:outline focus:outline-2 focus:outline-gray-600 focus:outline-offset-0"
        >
          <option value="I">{t('environments.indoor')}</option>
          <option value="O">{t('environments.outdoor')}</option>
          <option value="G">{t('environments.greenhouse')}</option>
        </select>
      </div>

      <div className="pt-4 flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-primary-green text-white font-bold uppercase text-xs tracking-widest py-4 rounded-xl hover:bg-primary-green/90 transition disabled:opacity-50 shadow-lg shadow-primary-green/20 focus:outline focus:outline-2 focus:outline-gray-600 focus:outline-offset-[3px]"
        >
          {loading ? '...' : t('saveChanges')}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 bg-orange-800 text-white font-bold uppercase text-xs tracking-widest border border-primary-green/20 rounded-xl hover:bg-orange-800/90 transition focus:outline focus:outline-2 focus:outline-gray-600 focus:outline-offset-[3px]"
        >
          {t('cancel')}
        </button>
      </div>
    </form>
  );
}
