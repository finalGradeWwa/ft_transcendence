import { getTranslations } from 'next-intl/server';
import { UserGardensClient } from './UserGardensClient';
import NextImage from 'next/image';

interface UserGardensPageProps {
  params: Promise<{
    locale: string;
    username: string;
  }>;
}

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
).replace(/\/$/, '');

async function getUserGardens(username: string) {
  try {
    const response = await fetch(
      `${API_URL}/api/garden/?username=${encodeURIComponent(username)}`,
      { cache: 'no-store' }
    );
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

export default async function UserGardensPage({
  params,
}: UserGardensPageProps) {
  const { username } = await params;
  const tProfile = await getTranslations('ProfilePage');
  const tGardens = await getTranslations('GardensPage');
  const gardensData = await getUserGardens(username);

  const gardensDataMapped = gardensData.map((g: any) => {
    const ownerFromTitle = g.name.includes("'s")
      ? g.name.split("'s")[0]
      : username;

    const isDefault =
      g.name.includes("'s Garden") || g.name === 'Default Garden';
    const displayName = isDefault ? tGardens('defaultGardenName') : g.name;

    const envMap: Record<string, string> = {
      i: 'indoor',
      o: 'outdoor',
      g: 'greenhouse',
    };

    const rawValue = String(g.environment || '')
      .toLowerCase()
      .charAt(0);
    const envKey = envMap[rawValue] || 'indoor';
    const translatedEnv = tGardens(`environments.${envKey}` as any);

    const rawImage = g.thumbnail || g.image_url || g.image;
    let finalImage = '/images/garden/garden-placeholder.webp';

    if (rawImage) {
      finalImage = rawImage.startsWith('http')
        ? rawImage
        : `${API_URL}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
    }

    return {
      id: g.garden_id,
      name: displayName,
      owner: ownerFromTitle,
      plantsCount: g.plant_count || 0,
      styleName: translatedEnv,
      image: finalImage,
      isDefault: isDefault,
    };
  });

  const gardens = [...gardensDataMapped].reverse();

  return (
    <div className="user-gardens-page min-h-screen bg-main-gradient pb-20 overflow-hidden">
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
                  {tProfile('stats.gardens') || 'Gardens'}
                </span>
              </span>
            </h1>
            <div className="profile-accent-bar h-2 w-24 bg-primary-green mt-6 rounded-full" />
            <p className="profile-description text-neutral-600 mt-4 font-bold uppercase tracking-[0.3em] text-xs block whitespace-normal overflow-wrap-anywhere">
              {tProfile('profileDescription')}
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
        <UserGardensClient
          gardens={gardens}
          initialCurrentUser={null}
          profileUsername={username}
        />
      </div>
    </div>
  );
}
