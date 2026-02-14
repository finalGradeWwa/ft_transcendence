'use client';

import { useState, use, useEffect } from 'react';
import { Heading } from '@/components/Heading';
import { useTranslations } from 'next-intl';
import NextImage from 'next/image';
import { apiFetch } from '@/lib/auth';
import { useRouter } from '@/i18n/navigation';

const fieldCls =
  'w-full p-3 rounded bg-white border border-primary-green/20 focus:border-primary-green text-dark-text font-medium outline-none transition-all';
const labelCls =
  'block text-primary-green font-bold mb-2 uppercase text-xs tracking-widest';

export default function AddGardenPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const t = useTranslations('GardensPage');
  const router = useRouter();

  const [name, setName] = useState('');
  const [environment, setEnvironment] = useState('I');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError(t('errors.fillName'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch('/api/garden/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          environment,
        }),
      });

      if (!response.ok) {
        throw new Error(t('errors.addFailed'));
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push(`/profiles/${username}/gardens`);
      }, 2000);
    } catch (err: any) {
      setError(err.message || t('errors.unexpected'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="py-12 flex justify-center">
          <div className="bg-container-light p-8 rounded-xl shadow-2xl w-full max-w-2xl border border-primary-green text-center">
            <div className="text-6xl mb-4">🌱</div>
            <Heading as="h2" className="!text-primary-green mb-4">
              {t('success.title')}
            </Heading>
            <p className="text-neutral-700">{t('success.message')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
      <div className="py-12 flex justify-center">
        <div className="bg-container-light p-8 rounded-xl shadow-2xl w-full max-w-2xl border border-primary-green">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-primary-green/10">
            <Heading as="h1" className="!text-primary-green">
              {t('title')}
            </Heading>
            <div className="relative w-16 h-16">
              <NextImage
                src="/images/other/garden.webp"
                alt="Garden"
                fill
                className="object-contain"
                sizes="64px"
              />
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3 font-bold text-red-700 bg-red-50 border-2 border-red-600 rounded text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <section>
              <label className={labelCls}>{t('gardenNameLabel')}</label>
              <input
                required
                type="text"
                disabled={isLoading}
                className={fieldCls}
                placeholder={t('gardenNamePlaceholder')}
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </section>

            <section>
              <label className={labelCls}>{t('environmentLabel')}</label>
              <select
                required
                disabled={isLoading}
                className={fieldCls}
                value={environment}
                onChange={e => setEnvironment(e.target.value)}
              >
                <option value="I">{t('environments.indoor')}</option>
                <option value="O">{t('environments.outdoor')}</option>
                <option value="G">{t('environments.greenhouse')}</option>
              </select>
            </section>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-green text-white font-black py-4 rounded-xl uppercase tracking-[0.2em] shadow-xl hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isLoading ? '...' : t('submit')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
