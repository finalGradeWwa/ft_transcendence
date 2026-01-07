'use client';

import { useState } from 'react'; // DODANO: potrzebne do stanu modalu
import dynamic from 'next/dynamic'; // DODANO: do optymalizacji
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/icons/ui/Icon';
import { Navigation } from '@/components/Navigation';

// DODANO: Dynamiczny import (kod pobierany tylko po kliknięciu w nawigacji)
const LoginModal = dynamic(() => import('@/components/LoginModal'), {
  ssr: false,
});

// --- TYPY / TYPES ---
type UserPlant = {
  id: number;
  genus: string;
  species: string;
  imageUrl: string;
};

type UserData = {
  username: string;
  avatarUrl: string;
  plantsCount: number;
  friendsCount: number;
};

// --- DANE TESTOWE / MOCK DATA ---
const MOCK_USER_PLANTS: UserPlant[] = [
  {
    id: 1,
    genus: 'Monstera',
    species: 'Deliciosa',
    imageUrl: '/images/temp/plant_1.jpg',
  },
  {
    id: 2,
    genus: 'Ficus',
    species: 'Lyrata',
    imageUrl: '/images/temp/plant_2.jpg',
  },
  {
    id: 3,
    genus: 'Sansevieria',
    species: 'Trifasciata',
    imageUrl: '/images/temp/plant_3.jpg',
  },
  {
    id: 4,
    genus: 'Aloe',
    species: 'Vera',
    imageUrl: '/images/temp/plant_4.jpg',
  },
];

const getMockUserData = (username: string): UserData => ({
  username,
  avatarUrl: '/images/temp/avatar_placeholder.jpg',
  plantsCount: 24,
  friendsCount: 152,
});

// --- KOMPONENTY POMOCNICZE ---
const UserStat = ({
  iconName,
  label,
  value,
}: {
  iconName: any;
  label: string;
  value: number;
}) => (
  <div className="flex items-center justify-center md:justify-start gap-3 text-lg text-neutral-900">
    <Icon name={iconName} className="text-primary-green" size={20} />
    <span>
      {label}: <strong>{value}</strong>
    </span>
  </div>
);

const ProfileHeader = ({ t, userData }: { t: any; userData: UserData }) => (
  <section className="bg-secondary-beige/95 rounded-2xl p-6 shadow-xl border border-primary-green mb-10 backdrop-blur-sm">
    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
      <div className="relative w-32 h-32 md:w-40 md:h-40 shrink-0">
        <div className="w-full h-full rounded-full border-4 border-primary-green overflow-hidden relative shadow-lg bg-secondary-beige flex items-center justify-center text-primary-green">
          <Icon name="user" size={64} aria-hidden="true" />
        </div>
      </div>
      <div className="flex flex-col space-y-4 text-center md:text-start pt-2">
        <h2 className="text-3xl font-bold text-neutral-900 italic">
          {userData.username}
        </h2>
        <div className="flex flex-col space-y-2">
          <UserStat
            iconName="leaf"
            label={t('plantsCount')}
            value={userData.plantsCount}
          />
          <UserStat
            iconName="people"
            label={t('friendsCount')}
            value={userData.friendsCount}
          />
        </div>
        <button className="mt-2 bg-primary-green hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg self-center md:self-start transition shadow-md active:scale-95">
          {t('editProfile')}
        </button>
      </div>
    </div>
  </section>
);

const PlantsGallery = ({
  t,
  userPlants,
}: {
  t: any;
  userPlants: UserPlant[];
}) => (
  <section className="pb-20">
    <h3 className="text-2xl md:text-3xl font-bold mb-8 text-white-text flex items-center gap-3 drop-shadow-md">
      <Icon name="leaf" size={28} /> {t('userPlantsTitle')}
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-neutral-900">
      {userPlants.map((plant, index) => (
        <Link key={plant.id} href={`/plants/${plant.id}`} className="group">
          <article className="bg-secondary-beige/95 p-4 rounded-xl shadow-lg border border-subtle-gray transition transform group-hover:scale-[1.03] duration-300 h-full backdrop-blur-sm">
            <div className="relative w-full h-48 mb-4 overflow-hidden rounded-lg">
              <Image
                src={plant.imageUrl}
                alt={plant.species}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                priority={index < 4}
                className="object-cover transition transform group-hover:scale-110 duration-500"
                decoding="async"
              />
            </div>
            <p className="text-sm text-amber-900 font-bold uppercase tracking-wider">
              {plant.genus}
            </p>
            <h4 className="text-xl font-bold text-primary-green italic uppercase">
              {plant.species}
            </h4>
          </article>
        </Link>
      ))}
    </div>
  </section>
);

// --- GŁÓWNY KOMPONENT ---
export const UserProfileClient = ({
  dynamicUsername,
}: {
  dynamicUsername: string;
}) => {
  const t = useTranslations('ProfilePage');
  const tHome = useTranslations('HomePage'); // Potrzebne dla przycisku login w nawigacji
  const userData = getMockUserData(dynamicUsername);

  // DODANO: Obsługa stanu modalu
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <div
      className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8"
      {...(isLoginModalOpen ? { 'aria-hidden': true, inert: true } : {})}
    >
      <Navigation onLoginClick={() => setIsLoginModalOpen(true)} />

      <main className="py-8">
        <ProfileHeader t={t} userData={userData} />
        <PlantsGallery t={t} userPlants={MOCK_USER_PLANTS} />
      </main>

      {/* DODANO: Modal logowania */}
      <LoginModal
        isVisible={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        t={tHome}
      />
    </div>
  );
};
