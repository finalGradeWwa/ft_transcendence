'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { AddPlantForm } from './AddPlantForm';

type Garden = {
  garden_id: number;
  name: string;
};

interface CreatePlantClientPageProps {
  username: string;
  gardens: Garden[];
  initialGardenId?: string | null;
}

export function CreatePlantClientPage({
  username,
  gardens,
  initialGardenId,
}: CreatePlantClientPageProps) {
  const t = useTranslations('AddPlantPage');
  const router = useRouter();

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
            initialGardenId={initialGardenId ?? null}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </div>
  );
}
