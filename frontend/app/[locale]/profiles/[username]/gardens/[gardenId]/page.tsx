'use client';

import { useState, use } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

const BackLink = ({ href, label }: { href: string; label: string }) => (
  <div className="mb-6 flex">
    <Link
      href={href}
      className="bg-primary-green text-header-main font-black uppercase text-[10px] tracking-widest px-6 py-2.5 rounded-full shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 outline-none"
    >
      <span className="text-sm">←</span>
      <span>{label}</span>
    </Link>
  </div>
);

const GardenForm = ({
  onSubmit,
  value,
  onChange,
  t,
}: {
  onSubmit: (e: React.FormEvent) => void;
  value: string;
  onChange: (val: string) => void;
  t: any;
}) => (
  <form onSubmit={onSubmit} className="space-y-6">
    <div>
      <label
        htmlFor="gardenName"
        className="block text-dark-text font-bold uppercase text-[10px] tracking-[0.3em] mb-2"
      >
        {t('gardenNameLabel')}
      </label>
      <input
        id="gardenName"
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        required
        className="w-full bg-white/50 border-2 border-primary-green/20 rounded-xl px-4 py-3 text-dark-text focus:border-primary-green focus:outline-none transition-all font-medium"
      />
    </div>
    <button
      type="submit"
      className="w-full bg-primary-green text-header-main font-black uppercase text-sm tracking-widest py-4 rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98] focus:outline focus:outline-2 focus:outline-gray-600 focus:outline-offset-2"
    >
      {t('submit')}
    </button>
  </form>
);

interface AddGardenPageProps {
  params: Promise<{ username: string }>;
}

export default function AddGardenPage({ params }: AddGardenPageProps) {
  const { username } = use(params);
  const t = useTranslations('GardensPage');
  const [gardenName, setGardenName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Zapisywanie ogrodu:', gardenName);
  };

  return (
    <div className="bg-main-gradient min-h-screen pb-20 pt-12 px-4">
      <div className="max-w-2xl mx-auto">
        <BackLink
          href={`/profiles/${username}/gardens`}
          label={t('backToList')}
        />

        <div className="bg-secondary-beige rounded-3xl shadow-2xl overflow-hidden border border-primary-green/10 p-8 sm:p-10">
          <header className="mb-8">
            <h1 className="text-3xl font-black text-dark-text uppercase tracking-tight">
              {t('title')}
            </h1>
          </header>

          <GardenForm
            onSubmit={handleSubmit}
            value={gardenName}
            onChange={setGardenName}
            t={t}
          />
        </div>
      </div>
    </div>
  );
}
