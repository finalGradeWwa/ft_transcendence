import { getTranslations } from 'next-intl/server';
import { HomePageClient } from '../../../HomePageClient';
import NextImage from 'next/image';

interface UserPlantsPageProps {
  params: Promise<{
    locale: string;
    username: string;
  }>;
}

export default async function UserPlantsPage({ params }: UserPlantsPageProps) {
  const { username } = await params;
  const t = await getTranslations('ProfilePage');

  const fakePlants = [
    {
      id: 101,
      author: username,
      latinName: 'Monstera Deliciosa',
      commonName: 'Mój Wielkolud',
      garden: 'Salon Południowy',
    },
    {
      id: 102,
      author: username,
      latinName: 'Ficus Lyrata',
      commonName: 'Fikus Stefan',
      garden: 'Sypialnia',
    },
    {
      id: 103,
      author: username,
      latinName: 'Sansevieria Trifasciata',
      commonName: 'Język Teściowej',
      garden: 'Biuro',
    },
    {
      id: 104,
      author: username,
      latinName: 'Crassula Ovata',
      commonName: 'Drzewko Szczęścia',
      garden: 'Taras',
    },
  ];

  return (
    <div className="user-plants-page min-h-screen bg-main-gradient pb-20 overflow-hidden">
      <header className="user-plants-header max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-4 overflow-hidden">
        <div className="user-profile-card bg-gradient-to-r from-secondary-beige/90 via-secondary-beige/80 to-header-main/60 p-6 sm:p-8 md:p-10 rounded-2xl border-b-4 border-primary-green/20 shadow-xl relative overflow-hidden flex items-center justify-between">
          <div className="user-info-container relative z-10 flex-1">
            <h1 className="user-title text-2xl sm:text-4xl md:text-5xl font-black tracking-tighter block whitespace-normal leading-tight overflow-hidden">
              <span className="username text-primary-green uppercase inline mr-2 sm:mr-4">
                {username}
              </span>
              <span className="title-suffix text-neutral-800 uppercase inline">
                <span className="separator text-primary-green/30 font-light mr-2 sm:mr-4">
                  —
                </span>
                <span className="stats-label inline-block whitespace-normal">
                  {t('stats.plants')}
                </span>
              </span>
            </h1>
            <div className="accent-bar h-2 w-24 bg-primary-green mt-6 rounded-full" />
            <p className="collection-description text-neutral-600 mt-4 font-bold uppercase tracking-[0.3em] text-xs block whitespace-normal overflow-wrap-anywhere">
              {t('userCollection', { name: username })}
            </p>
          </div>

          <div className="collection-image-wrapper hidden md:block relative z-10 w-32 h-32 lg:w-40 lg:h-40 ml-4 mr-4 rounded-2xl overflow-hidden">
            <NextImage
              src="/images/other/collection.png"
              alt=""
              fill
              className="collection-image object-contain"
              sizes="160px"
              priority
            />
          </div>

          <div className="decorative-circle absolute top-0 right-0 w-64 h-64 bg-primary-green/5 rounded-full -mr-32 -mt-32" />
        </div>
      </header>

      <div className="plants-grid-container overflow-hidden">
        <HomePageClient plants={fakePlants} hideTitle />
      </div>
    </div>
  );
}
