'use client';

import { useState, use } from 'react';
import { Heading } from '@/components/Heading';
import { useTranslations } from 'next-intl';
import { AddPlantForm } from '@/components/plants/AddPlantForm';
import { AddPlantSuccess } from '@/components/plants/AddPlantSuccess';
import NextImage from 'next/image';

/**
 * PL: Strona dodawania nowej rośliny.
 * EN: Add new plant page.
 */
export default function AddPlantPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);

  const tr = useTranslations('AddPlantPage');
  const [isSuccess, setIsSuccess] = useState(false);
  const [gardens, setGardens] = useState([]);

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="py-12 flex justify-center">
        <div className="bg-container-light p-8 rounded-xl shadow-2xl w-full max-w-2xl border border-primary-green overflow-hidden">
          {isSuccess ? (
            <AddPlantSuccess username={username} />
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between mb-8 pb-4 border-b border-primary-green/10 gap-4">
                <Heading
                  as="h1"
                  className="uppercase tracking-widest !text-primary-green font-bold text-left m-0 break-words overflow-hidden"
                >
                  {tr('title')}
                </Heading>

                <div className="hidden min-[400px]:block relative w-16 h-16 sm:w-20 sm:h-20 shrink-0">
                  <NextImage
                    src="/images/other/add-plant.png"
                    alt="Kolekcja"
                    fill
                    className="object-contain"
                    sizes="80px"
                    priority
                  />
                </div>
              </div>
              <div className="w-full overflow-hidden break-words">
                <AddPlantForm
                  username={username}
                  gardens={gardens}
                  onSuccess={() => setIsSuccess(true)}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
