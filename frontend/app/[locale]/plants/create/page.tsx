'use client';

import { useTranslations } from 'next-intl';
import { AddPlantForm } from './AddPlantForm';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
).replace(/\/$/, '');

export default function AddPlantPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; username: string }>;
  searchParams: Promise<{ gardenId?: string }>;
}) {
  const t = useTranslations('AddPlantPage');
  const router = useRouter();

  // Unwrap params using use() hook
  const { gardenId } = use(searchParams);
  const username = 'csw471';

  const [gardens, setGardens] = useState([]);

  useEffect(() => {
    async function fetchGardens() {
      try {
        const response = await fetch(`${API_URL}/api/garden/`);
        if (response.ok) {
          const data = await response.json();
          setGardens(data);
        }
      } catch (err) {}
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

        {/* PL: Formularz En: Form */}
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
