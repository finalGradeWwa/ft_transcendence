import { getTranslations } from 'next-intl/server';
import { GardenEditForm } from '@/app/[locale]/profiles/[username]/gardens/[gardenId]/edit/GardenEditForm';

export default async function EditGardenPage({
  params,
}: {
  params: Promise<{ username: string; gardenId: string }>;
}) {
  const { username, gardenId } = await params;
  const t = await getTranslations('GardensPage');

  return (
    <div className="min-h-screen bg-main-gradient py-12 px-4">
      <div className="max-w-2xl mx-auto bg-secondary-beige rounded-3xl shadow-2xl overflow-hidden border border-primary-green/10">
        <div className="p-8 sm:p-12">
          <h1 className="text-3xl font-black text-dark-text uppercase tracking-tighter mb-8">
            {t('manageGarden')}
          </h1>

          <GardenEditForm
            garden={null}
            username={username}
            gardenId={gardenId}
          />
        </div>
      </div>
    </div>
  );
}
