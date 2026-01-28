import { getTranslations } from 'next-intl/server';
import { HomePageClient } from '../../../HomePageClient';
import NextImage from 'next/image';

interface UserGardensPageProps {
  params: Promise<{
    locale: string;
    username: string;
  }>;
}

export default async function UserGardensPage({
  params,
}: UserGardensPageProps) {
  const { username } = await params;
  const t = await getTranslations('ProfilePage');

  const fakeGardens = [
    {
      id: 201,
      author: username,
      latinName: 'COMMUNITY SPACE',
      commonName: 'Słoneczny Balkon',
      garden: '12 Plants',
    },
    {
      id: 202,
      author: username,
      latinName: 'PRIVATE ASYLUM',
      commonName: 'Miejska Dżungla',
      garden: '42 Plants',
    },
    {
      id: 203,
      author: username,
      latinName: 'OFFICE PROJECT',
      commonName: 'Biuro Open Space',
      garden: '8 Plants',
    },
  ];

  return (
    <main className="user-gardens-page min-h-screen bg-main-gradient pb-20 overflow-hidden">
      <header className="page-header max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-4 overflow-hidden">
        <div className="profile-summary-card bg-gradient-to-r from-secondary-beige/90 via-secondary-beige/80 to-header-main/60 p-6 sm:p-8 md:p-10 rounded-2xl border-b-4 border-primary-green/20 shadow-xl relative overflow-hidden flex items-center justify-between">
          <div className="profile-info-content relative z-10 flex-1">
            <h1 className="profile-title text-2xl sm:text-4xl md:text-5xl font-black tracking-tighter block whitespace-normal leading-tight overflow-hidden">
              <span className="profile-username text-primary-green uppercase inline mr-2 sm:mr-4">
                {username}
              </span>
              <span className="profile-title-suffix text-neutral-800 uppercase inline">
                <span className="profile-separator text-primary-green/30 font-light mr-2 sm:mr-4">
                  —
                </span>
                <span className="profile-stats-label inline-block whitespace-normal">
                  {t('stats.gardens') || 'Gardens'}
                </span>
              </span>
            </h1>
            <div className="profile-accent-bar h-2 w-24 bg-primary-green mt-6 rounded-full" />
            <p className="profile-description text-neutral-600 mt-4 font-bold uppercase tracking-[0.3em] text-xs block whitespace-normal overflow-wrap-anywhere">
              {t('profileDescription')}
            </p>
          </div>

          <div className="collection-visual-wrapper hidden md:block relative z-10 w-32 h-32 lg:w-40 lg:h-40 ml-4 mr-4 rounded-2xl overflow-hidden">
            <NextImage
              src="/images/other/garden.webp"
              alt="Gardens Collection"
              fill
              className="collection-thumbnail object-cover"
              sizes="(max-width: 1024px) 128px, 160px"
              priority
            />
          </div>
          <div className="collection-visual-wrapper hidden md:block relative z-10 w-32 h-32 lg:w-40 lg:h-40 ml-4 mr-4 rounded-2xl overflow-hidden">
            <NextImage
              src="/images/other/garden2.webp"
              alt="Gardens Collection"
              fill
              className="collection-thumbnail object-cover"
              sizes="(max-width: 1024px) 128px, 160px"
              priority
            />
          </div>

          <div className="decorative-bg-circle absolute top-0 right-0 w-64 h-64 bg-primary-green/5 rounded-full -mr-32 -mt-32" />
        </div>
      </header>

      <div className="gardens-grid-section overflow-hidden">
        <HomePageClient plants={fakeGardens} hideTitle />
      </div>
    </main>
  );
}
