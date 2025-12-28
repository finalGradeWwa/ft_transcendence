'use client';

/**
 * PL: Komponent kliencki profilu użytkownika. Odpowiada za wyświetlanie pełnego widoku profilu,
 * w tym nagłówka z awatarem, statystyk (rośliny, znajomi), galerii roślin oraz interaktywnej
 * nawigacji z możliwością zmiany języka.
 * * EN: User profile client component. Responsible for rendering the complete profile view,
 * including the header with avatar, statistics (plants, friends), plant gallery,
 * and interactive navigation with language switching capabilities.
 */

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import {
  FaSearch,
  FaUser,
  FaPlus,
  FaBars,
  FaTimes,
  FaLeaf,
  FaUsers,
} from 'react-icons/fa';
import { IconType } from 'react-icons';

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

type TFunction = (key: string) => string;

interface UserProfileClientProps {
  dynamicUsername: string;
}

interface ProfileHeaderProps {
  t: TFunction;
  userData: UserData;
}

interface UserStatProps {
  Icon: IconType;
  label: string;
  value: number;
}

interface PlantsGalleryProps {
  t: TFunction;
  userPlants: UserPlant[];
}

/**
 * PL: Interfejs dla głównej sekcji treści.
 * EN: Interface for the main content section.
 */
interface MainContentProps {
  t: ReturnType<typeof useTranslations>;
  userData: UserData;
}

/**
 * PL: Dane zwracane przez hook profilu.
 * EN: Data returned by the profile hook.
 */
interface UserProfileData {
  t: ReturnType<typeof useTranslations>;
  commonT: ReturnType<typeof useTranslations>;
  userData: UserData;
  navItems: string[];
  isNavOpen: boolean;
  toggleNav: () => void;
}

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

// --- HOOKI / HOOKS ---

/**
 * PL: Obsługuje zmianę języka i pobiera bieżącą lokalizację.
 * EN: Handles language switching and retrieves current locale.
 */
const useLanguageSwitcher = () => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const changeLanguage = useCallback(
    (newLocale: string) => {
      router.replace(pathname, { locale: newLocale });
    },
    [router, pathname]
  );

  return { locale, changeLanguage };
};

/**
 * PL: Główny hook przygotowujący dane i stan dla profilu użytkownika.
 * EN: Main hook preparing data and state for the user profile.
 */
const useUserProfile = (dynamicUsername: string): UserProfileData => {
  const t = useTranslations('ProfilePage');
  const commonT = useTranslations('HomePage');
  const [isNavOpen, setIsNavOpen] = useState(false);

  return {
    t,
    commonT,
    userData: getMockUserData(dynamicUsername),
    navItems: commonT.raw('nav') as string[],
    isNavOpen,
    toggleNav: () => setIsNavOpen(prev => !prev),
  };
};

// --- KOMPONENTY / COMPONENTS ---

/**
 * PL: Opcja w rozwijanej liście języków.
 * EN: Option in the language dropdown list.
 */
const LanguageOption = ({ value, label }: { value: string; label: string }) => (
  <option value={value}>{label}</option>
);

/**
 * PL: Lista dostępnych języków.
 * EN: List of available languages.
 */
const LanguageOptions = () => (
  <>
    <LanguageOption value="pl" label="Polski" />
    <LanguageOption value="en" label="English" />
    <LanguageOption value="de" label="Deutsch" />
    <LanguageOption value="ar" label="العربية" />
  </>
);

/**
 * PL: Selektor języka (element select).
 * EN: Language selector (select element).
 */
const LanguageSelect = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    className="bg-container-light text-neutral-900 p-1 rounded cursor-pointer border border-secondary-beige focus:outline-none focus:ring-2 focus:ring-primary-green text-sm"
  >
    <LanguageOptions />
  </select>
);

/**
 * PL: Kontener selektora języka.
 * EN: Language selector container.
 */
const LanguageSelector = ({
  locale,
  onChange,
}: {
  locale: string;
  onChange: (v: string) => void;
}) => (
  <div className="language-selector flex items-baseline gap-2">
    <LanguageSelect value={locale} onChange={onChange} />
  </div>
);

/**
 * PL: Przycisk otwierający wyszukiwarkę.
 * EN: Button to open the search tool.
 */
const SearchButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="p-2 rounded-full bg-secondary-beige text-neutral-900 hover:text-primary-green shadow-md"
  >
    <FaSearch size={18} />
  </button>
);

/**
 * PL: Przycisk dodawania nowej rośliny.
 * EN: Button to add a new plant.
 */
const AddButton = () => (
  <button className="p-2 rounded-full bg-secondary-beige text-neutral-900 hover:text-primary-green shadow-md">
    <FaPlus size={18} />
  </button>
);

/**
 * PL: Przycisk skrótu do konta użytkownika.
 * EN: Shortcut button to the user account.
 */
const UserButton = () => (
  <button className="p-2 rounded-full bg-primary-green text-white shadow-md">
    <FaUser size={18} />
  </button>
);

/**
 * PL: Zbiór przycisków akcji w nagłówku.
 * EN: Collection of action buttons in the header.
 */
const ActionButtons = ({ onSearchClick }: { onSearchClick(): void }) => (
  <div className="flex gap-3">
    <SearchButton onClick={onSearchClick} />
    <AddButton />
    <UserButton />
  </div>
);

/**
 * PL: Kontrolki nagłówka: język i przyciski akcji.
 * EN: Header controls: language and action buttons.
 */
const HeaderControls = ({ onSearchClick }: { onSearchClick(): void }) => {
  const { locale, changeLanguage } = useLanguageSwitcher();
  return (
    <div className="flex items-center justify-center flex-wrap gap-x-6 gap-y-6">
      <LanguageSelector locale={locale} onChange={changeLanguage} />
      <ActionButtons onSearchClick={onSearchClick} />
    </div>
  );
};

/**
 * PL: Pojedynczy wiersz statystyki (np. liczba roślin).
 * EN: Single statistic row (e.g., plants count).
 */
const UserStat = ({ Icon, label, value }: UserStatProps) => (
  <div className="flex items-center justify-center md:justify-start gap-3 text-lg text-neutral-900">
    <Icon className="text-primary-green" />
    <span>
      {label}: <strong>{value}</strong>
    </span>
  </div>
);

/**
 * PL: Okrągły awatar użytkownika.
 * EN: Circular user avatar.
 */
const UserAvatar = () => (
  <div className="relative w-32 h-32 md:w-40 md:h-40 shrink-0">
    <div className="w-full h-full rounded-full border-4 border-primary-green overflow-hidden relative shadow-lg bg-secondary-beige flex items-center justify-center text-primary-green">
      <FaUser size={64} />
    </div>
  </div>
);

/**
 * PL: Lista statystyk użytkownika.
 * EN: List of user statistics.
 */
const UserStatsGroup = ({ t, userData }: ProfileHeaderProps) => (
  <div className="flex flex-col space-y-2">
    <UserStat
      Icon={FaLeaf}
      label={t('plantsCount')}
      value={userData.plantsCount}
    />
    <UserStat
      Icon={FaUsers}
      label={t('friendsCount')}
      value={userData.friendsCount}
    />
  </div>
);

/**
 * PL: Informacje tekstowe profilu i przycisk edycji.
 * EN: Profile text info and edit button.
 */
const UserInfoContent = ({ t, userData }: ProfileHeaderProps) => (
  <div className="flex flex-col space-y-4 text-center md:text-start pt-2">
    <h2 className="text-3xl font-bold text-neutral-900 italic">
      {userData.username}
    </h2>
    <UserStatsGroup t={t} userData={userData} />
    <button className="mt-2 bg-primary-green hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg self-center md:self-start transition shadow-md active:scale-95">
      {t('editProfile')}
    </button>
  </div>
);

/**
 * PL: Sekcja górna profilu (wizytówka).
 * EN: Profile header section (business card).
 */
const ProfileHeader = ({ t, userData }: ProfileHeaderProps) => (
  <section className="bg-container-light/90 rounded-2xl p-6 shadow-xl border border-primary-green mb-10 backdrop-blur-sm">
    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
      <UserAvatar />
      <UserInfoContent t={t} userData={userData} />
    </div>
  </section>
);

/**
 * PL: Zdjęcie rośliny z efektem hover.
 * EN: Plant image with hover effect.
 */
const PlantImage = ({ url, name }: { url: string; name: string }) => (
  <div className="relative w-full h-48 mb-4 overflow-hidden rounded-lg">
    <Image
      src={url}
      alt={name}
      fill
      sizes="(max-width: 768px) 100vw, 25vw"
      className="object-cover transition transform group-hover:scale-110 duration-500"
    />
  </div>
);

/**
 * PL: Nazwa botaniczna rośliny.
 * EN: Botanical name of the plant.
 */
const PlantInfo = ({ genus, species }: { genus: string; species: string }) => (
  <div className="space-y-1">
    <p className="text-sm text-amber-900 font-bold uppercase tracking-wider">
      {genus}
    </p>
    <h4 className="text-xl font-bold text-primary-green italic uppercase">
      {species}
    </h4>
  </div>
);

/**
 * PL: Opakowanie karty rośliny obsługujące nawigację.
 * EN: Plant card wrapper handling navigation.
 */
const PlantCardWrapper = ({
  id,
  children,
}: {
  id: number;
  children: React.ReactNode;
}) => (
  <Link href={`/plants/${id}`} className="group">
    <article className="bg-secondary-beige/95 p-4 rounded-xl shadow-lg border border-subtle-gray transition transform group-hover:scale-[1.03] duration-300 h-full backdrop-blur-sm">
      {children}
    </article>
  </Link>
);

/**
 * PL: Kompletna karta rośliny.
 * EN: Complete plant card.
 */
const PlantCard = ({ plant }: { plant: UserPlant }) => (
  <PlantCardWrapper id={plant.id}>
    <PlantImage url={plant.imageUrl} name={`${plant.genus} ${plant.species}`} />
    <PlantInfo genus={plant.genus} species={plant.species} />
  </PlantCardWrapper>
);

/**
 * PL: Nagłówek galerii roślin.
 * EN: Plant gallery header.
 */
const GalleryHeader = ({ title }: { title: string }) => (
  <h3 className="text-2xl md:text-3xl font-bold mb-8 text-white-text flex items-center gap-3 drop-shadow-md">
    <FaLeaf /> {title}
  </h3>
);

/**
 * PL: Siatka kart roślin.
 * EN: Plant card grid.
 */
const PlantGrid = ({ plants }: { plants: UserPlant[] }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-neutral-900">
    {plants.map(plant => (
      <PlantCard key={plant.id} plant={plant} />
    ))}
  </div>
);

/**
 * PL: Sekcja galerii roślin użytkownika.
 * EN: User plant gallery section.
 */
const PlantsGallery = ({ t, userPlants }: PlantsGalleryProps) => (
  <section className="pb-20">
    <GalleryHeader title={t('userPlantsTitle')} />
    <PlantGrid plants={userPlants} />
  </section>
);

/**
 * PL: Stopka z prawami autorskimi i linkami prawnymi.
 * EN: Footer with copyright and legal links.
 */
const AppFooter = ({ commonT }: { commonT: TFunction }) => (
  <footer className="py-4 border-t border-subtle-gray flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:gap-x-8 text-sm font-bold bg-secondary-beige mt-8">
    <p className="text-neutral-900 text-center">
      &copy; {new Date().getFullYear()} Plant Portal. {commonT('rights')}
    </p>
    <div className="flex gap-4">
      <Link
        href="/documents/privacy_policy.pdf"
        target="_blank"
        className="text-primary-green hover:underline"
      >
        {commonT('privacy')}
      </Link>
      <Link
        href="/documents/terms_of_service.pdf"
        target="_blank"
        className="text-primary-green hover:underline"
      >
        {commonT('terms')}
      </Link>
    </div>
  </footer>
);

/**
 * PL: Dynamiczna ikona nawigacji mobilnej.
 * EN: Dynamic mobile navigation icon.
 */
const NavIcon = ({ isOpen }: { isOpen: boolean }) =>
  isOpen ? <FaTimes size={32} /> : <FaBars size={32} />;

/**
 * PL: Przycisk menu mobilnego.
 * EN: Mobile menu button.
 */
const MobileNavButton = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="flex justify-center mt-4 md:hidden text-white p-2 mx-auto"
  >
    <NavIcon isOpen={isOpen} />
  </button>
);

/**
 * PL: Element nawigacyjny profilu.
 * EN: Profile navigation item.
 */
const NavItem = ({ label }: { label: string }) => (
  <li>
    <Link
      href="/"
      className="text-white hover:text-primary-green font-medium px-4 py-2"
    >
      {label}
    </Link>
  </li>
);

/**
 * PL: Lista linków nawigacyjnych.
 * EN: List of navigation links.
 */
const NavList = ({ items }: { items: string[] }) => (
  <ul className="flex flex-col items-center gap-4 md:flex-row md:justify-center md:gap-8">
    {items.map(item => (
      <NavItem key={item} label={item} />
    ))}
  </ul>
);

/**
 * PL: Sekcja nawigacji sterowana stanem otwartości.
 * EN: Navigation section controlled by openness state.
 */
const DesktopNav = ({
  items,
  isOpen,
}: {
  items: string[];
  isOpen: boolean;
}) => {
  const visibilityClass = isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0';
  return (
    <nav
      className={`mt-6 transition-all duration-300 overflow-hidden md:max-h-full md:opacity-100 md:block ${visibilityClass}`}
    >
      <NavList items={items} />
    </nav>
  );
};

/**
 * PL: Logo serwisu.
 * EN: Service logo.
 */
const PortalLogo = () => (
  <Link
    href="/"
    className="text-3xl md:text-4xl font-bold text-header-main hover:opacity-80 transition"
  >
    Plant Portal
  </Link>
);

/**
 * PL: Górny pasek nagłówka.
 * EN: Top header bar.
 */
const TopBar = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col md:flex-row justify-between items-center space-y-10 md:space-y-0 md:gap-8">
    {children}
  </div>
);

/**
 * PL: Sekcja marki w nagłówku.
 * EN: Brand section in the header.
 */
const BrandSection = () => (
  <TopBar>
    <PortalLogo />
    <HeaderControls onSearchClick={() => {}} />
  </TopBar>
);

/**
 * PL: Obszar nawigacji (mobilnej i desktopowej).
 * EN: Navigation area (mobile and desktop).
 */
const NavSection = ({
  isOpen,
  toggle,
  items,
}: {
  isOpen: boolean;
  toggle: () => void;
  items: string[];
}) => (
  <>
    <MobileNavButton isOpen={isOpen} onClick={toggle} />
    <DesktopNav items={items} isOpen={isOpen} />
  </>
);

/**
 * PL: Pełna sekcja nagłówka strony.
 * EN: Full page header section.
 */
const ProfileHeaderSection = ({
  isOpen,
  toggle,
  navItems,
}: {
  isOpen: boolean;
  toggle: () => void;
  navItems: string[];
}) => (
  <header className="py-6 border-b border-subtle-gray">
    <BrandSection />
    <NavSection isOpen={isOpen} toggle={toggle} items={navItems} />
  </header>
);

/**
 * PL: Kontener na główną zawartość profilu.
 * EN: Container for the main profile content.
 */
const MainContent = ({ t, userData }: MainContentProps) => (
  <main className="py-8">
    <ProfileHeader t={t} userData={userData} />
    <PlantsGallery t={t} userPlants={MOCK_USER_PLANTS} />
  </main>
);

/**
 * PL: Główny komponent widoku profilu użytkownika.
 * EN: Main user profile view component.
 */
export const UserProfileClient = ({
  dynamicUsername,
}: UserProfileClientProps) => {
  const { isNavOpen, toggleNav, navItems, t, userData, commonT } =
    useUserProfile(dynamicUsername);

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
      <ProfileHeaderSection
        isOpen={isNavOpen}
        toggle={toggleNav}
        navItems={navItems}
      />
      <MainContent t={t} userData={userData} />
      <AppFooter commonT={commonT} />
    </div>
  );
};
