'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/auth';

export function GardenEditForm({ garden, username, gardenId }: any) {
  const router = useRouter();
  const t = useTranslations('GardensPage');

  const [name, setName] = useState(garden.name);
  const [environment, setEnvironment] = useState(garden.environment);
  const [loading, setLoading] = useState(false);

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
        router.refresh();
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-2">
      <div>
        <label
          htmlFor="edit-garden-name"
          className="block text-xs font-bold uppercase tracking-widest text-primary-green mb-2"
        >
          {t('fields.name') || 'Nazwa ogrodu'}
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
          {t('fields.environment') || 'Środowisko'}
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
          {loading ? '...' : t('saveChanges') || 'Zapisz zmiany'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 bg-orange-800 text-white font-bold uppercase text-xs tracking-widest border border-primary-green/20 rounded-xl hover:bg-orange-800/90 transition focus:outline focus:outline-2 focus:outline-gray-600 focus:outline-offset-[3px]"
        >
          {t('cancel') || 'Anuluj'}
        </button>
      </div>
    </form>
  );
}
