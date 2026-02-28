'use client';

import { useTranslations } from 'next-intl';
import { AddPlantForm } from './AddPlantForm';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { apiFetch } from '@/lib/auth';

export default function AddPlantPage({
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ gardenId?: string }>;
}) {
  const t = useTranslations('AddPlantPage');
  const router = useRouter();

  const { gardenId } = use(searchParams);
  const [username, setUsername] = useState<string>('');
  const [gardens, setGardens] = useState([]);

  useEffect(() => {
    apiFetch('/api/auth/me/')
      .then(res => res.json())
      .then(data => setUsername(data.username))
      .catch(() => { });
  }, []);

  useEffect(() => {
    async function fetchGardens() {
      try {
        const response = await apiFetch('/api/garden/?owner=me');
        if (response.ok) {
          const data = await response.json();
          setGardens(data);
        }
      } catch (err) { }
    }
    fetchGardens();
  }, []);

  const handleSuccess = () => {
    router.push(`/profiles/${username}/gardens`);
  };

  return (
    <div className="min-h-screen bg-main-gradient py-12 px-4 flex justify-center items-start">
      <div className="bg-container-light p-8 rounded-xl shadow-2xl w-full max-w-2xl border border-primary-green overflow-hidden">
        <div className="flex flex-wrap items-center justify-between mb-8 pb-4 border-b border-primary-green/10 gap-4">
          <h1 className="uppercase tracking-widest !text-primary-green font-bold text-left m-0 break-words overflow-hidden">
            {t('title')}
          </h1>
          <div className="hidden min-[400px]:block relative w-16 h-16 sm:w-20 sm:h-20 shrink-0">
            <Image
              src="/images/other/add-plant.png"
              alt="Kolekcja"
              fill
              className="object-contain"
              sizes="80px"
            />
          </div>
        </div>

        <div className="w-full overflow-hidden break-words">
          <AddPlantForm
            username={username}
            gardens={gardens}
            initialGardenId={gardenId}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </div>
  );
}
