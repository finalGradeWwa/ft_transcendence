import { getTranslations } from 'next-intl/server';
import { GardenEditForm } from '@/app/[locale]/profiles/[username]/gardens/[gardenId]/edit/GardenEditForm';
import { BackButton } from './BackButton';
import { serverFetch } from '@/lib/serverAuth';

export default async function EditGardenPage({
  params,
}: {
  params: Promise<{ username: string; gardenId: string }>;
}) {
  const { username, gardenId } = await params;
  const t = await getTranslations('GardensPage');

  let garden: any = null;
  try {
    const response = await serverFetch(`/api/garden/${gardenId}/`);
    if (response.ok) {
      garden = await response.json();
    }
  } catch (error) {
    console.error('Failed to fetch garden:', error);
  }

  if (!garden) return null;

  const isDefault =
    garden.name?.includes("'s Garden") || garden.name === 'Default Garden';

  if (isDefault) {
    return (
      <div className="min-h-screen bg-main-gradient py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-secondary-beige p-8 rounded-3xl shadow-xl text-center border-b-4 border-red-500/20">
          <h2 className="text-2xl font-black text-dark-text uppercase mb-4">
            {t('accessDenied') || 'Brak uprawnień'}
          </h2>
          <p className="text-neutral-600 mb-6 font-semibold">
            {t('cannotEditDefault') || 'Główny ogród nie może być edytowany.'}
          </p>
          <BackButton className="bg-primary-green text-white px-8 py-3 rounded-xl font-bold uppercase text-xs tracking-widest">
            {t('back') || 'Powrót'}
          </BackButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main-gradient py-12 px-4">
      <div className="max-w-2xl mx-auto bg-secondary-beige rounded-3xl shadow-2xl overflow-hidden border border-primary-green/10">
        <div className="p-8 sm:p-12">
          <h1 className="text-3xl font-black text-dark-text uppercase tracking-tighter mb-8">
            {t('manageGarden')}
          </h1>

          <GardenEditForm
            garden={garden}
            username={username}
            gardenId={gardenId}
          />
        </div>
      </div>
    </div>
  );
}
