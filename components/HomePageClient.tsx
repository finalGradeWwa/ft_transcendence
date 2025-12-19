'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/Input';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { FaSearch, FaUser, FaPlus, FaBars, FaTimes } from 'react-icons/fa';

// --- TYPY ---

// definiujemy typ dla funkcji tłumaczącej, aby uniknąć 'any'
type TranslationFn = ReturnType<typeof useTranslations>;

type PlantType = {
  id: number;
  author: string;
  latinName: string;
  commonName: string;
  averageRating: string;
};

// --- KOMPONENTY POMOCNICZE ---

const HeaderControls = ({
  onSearchClick,
  onLoginClick,
}: {
  onSearchClick: () => void;
  onLoginClick: () => void;
}) => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const changeLanguage = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex items-center justify-center flex-wrap gap-x-6 gap-y-6">
      <div className="language-selector flex items-baseline gap-2">
        <select
          id="lang-select"
          value={locale}
          onChange={e => changeLanguage(e.target.value)}
          className="bg-container-light text-neutral-900 p-1 rounded cursor-pointer border border-secondary-beige focus:outline-none focus:ring-2 focus:ring-primary-green text-sm"
        >
          <option value="pl">Polski</option>
          <option value="en">English</option>
          <option value="de">Deutsch</option>
          <option value="ar">العربية</option>
        </select>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onSearchClick}
          className="p-2 rounded-full bg-secondary-beige text-neutral-900 hover:text-primary-green shadow-md"
        >
          <FaSearch size={18} />
        </button>
        <button
          onClick={onLoginClick}
          className="p-2 rounded-full bg-secondary-beige text-neutral-900 hover:text-primary-green shadow-md"
        >
          <FaPlus size={18} />
        </button>
        <button
          onClick={onLoginClick}
          className="p-2 rounded-full bg-secondary-beige text-neutral-900 hover:text-primary-green shadow-md"
        >
          <FaUser size={18} />
        </button>
      </div>
    </div>
  );
};

const LoginModal = ({
  isVisible,
  onClose,
  t,
}: {
  isVisible: boolean;
  onClose: () => void;
  t: TranslationFn; // Poprawiony typ zamiast any
}) => {
  const usernameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isVisible && usernameInputRef.current) {
      usernameInputRef.current.focus();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-container-light p-6 rounded-lg shadow-2xl w-full max-w-sm border border-primary-green relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 end-3 p-2 text-neutral-900 hover:text-red-800"
        >
          <FaTimes size={20} />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-neutral-900">
          {t('login')}
        </h2>
        <form className="space-y-4">
          <Input
            ref={usernameInputRef}
            label={t('nick')}
            name="username"
            id="login-username"
            placeholder="..."
            required
          />
          <Input
            label={t('password')}
            type="password"
            name="password"
            id="login-password"
            placeholder="..."
            required
          />
          <button
            type="submit"
            className="w-full bg-primary-green hover:bg-green-700 text-white font-bold py-2 rounded mt-4"
          >
            {t('loginBtn')}
          </button>
        </form>
        <button
          onClick={onClose}
          className="mt-4 w-full text-sm text-neutral-900 hover:text-red-800"
        >
          {t('cancel')}
        </button>
        <p className="mt-4 text-center text-sm text-neutral-900">
          {t('noAccount')}{' '}
          <Link href="/rejestracja" className="font-bold text-primary-green">
            {t('register')}
          </Link>
        </p>
      </div>
    </div>
  );
};

// --- GŁÓWNY KOMPONENT ---

export const HomePageClient = ({ plants }: { plants: Array<PlantType> }) => {
  const t = useTranslations('HomePage');

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);

  // bezpieczne rzutowanie na tablicę stringów
  const navItems = t.raw('nav') as string[];

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
      <header className="py-6 border-b border-subtle-gray">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-10 md:space-y-0 md:gap-8">
          <div className="flex items-center gap-x-6 flex-wrap justify-center md:justify-start">
            <h1 className="text-3xl md:text-4xl font-bold text-header-main text-center md:text-start">
              {t('title')}
            </h1>
            <div className="relative w-16 h-16">
              <Image
                src="/images/favicon/fav_480.webp"
                alt="Logo"
                fill
                className="rounded-full object-cover border border-primary-green"
              />
            </div>
          </div>
          <HeaderControls
            onSearchClick={() => setIsSearchOpen(true)}
            onLoginClick={() => setIsLoginModalOpen(true)}
          />
        </div>

        <div className="flex justify-center mt-4 md:hidden">
          <button
            onClick={() => setIsNavOpen(!isNavOpen)}
            className="text-white p-2"
          >
            {isNavOpen ? <FaTimes size={32} /> : <FaBars size={32} />}
          </button>
        </div>

        <nav
          className={`mt-6 transition-all duration-300 overflow-hidden md:max-h-full md:opacity-100 md:block ${isNavOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <ul className="flex flex-col items-center gap-4 md:flex-row md:justify-center md:gap-8">
            {navItems.map((item, idx) => (
              <li key={idx} className="my-1">
                <Link
                  href="/"
                  className="text-white hover:text-primary-green font-medium px-4 py-2"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="py-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white-text">
          {t('recommended')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plants.map((plant, idx) => (
            <article
              key={plant.id}
              className="bg-secondary-beige p-4 rounded-xl shadow-lg border border-subtle-gray transition transform hover:scale-[1.02] duration-300"
            >
              <div className="relative w-full h-48 mb-3">
                <Image
                  src={`/images/temp/plant_${(plant.id % 5) + 1}.jpg`}
                  alt={plant.commonName}
                  fill
                  sizes="25vw"
                  className="object-cover rounded-lg"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />
              </div>
              <div className="space-y-1 text-sm">
                <h3 className="text-xl font-bold text-primary-green">
                  {plant.commonName}
                </h3>
                <p className="text-xs italic text-neutral-900 opacity-80">
                  {plant.latinName}
                </p>
                <p className="text-neutral-900 font-medium">
                  {t('author')}{' '}
                  <span className="font-bold text-amber-900">
                    {plant.author}
                  </span>
                </p>
                <div className="flex items-center pt-2">
                  <span className="font-bold text-lg text-red-800">
                    {t('rating')} {plant.averageRating}
                  </span>
                  <FaUser size={14} className="ms-2 text-neutral-900" />
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="text-center mt-8">
          <button className="bg-subtle-gray hover:bg-gray-500 text-neutral-900 font-bold py-2 px-6 rounded-full">
            {t('showMore')}
          </button>
        </div>
      </main>

      <footer className="py-4 border-t border-subtle-gray flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:gap-x-8 text-sm font-bold bg-secondary-beige mt-8">
        <p className="text-neutral-900 text-center">
          &copy; {new Date().getFullYear()} Plant Portal. {t('rights')}
        </p>
        <Link
          href="/documents/privacy_policy.pdf"
          target="_blank"
          className="text-primary-green hover:text-primary-green transition duration-150 text-center"
        >
          {t('privacy')}
        </Link>
        <Link
          href="/documents/terms_of_service.pdf"
          target="_blank"
          className="text-primary-green hover:text-primary-green transition duration-150 text-center"
        >
          {t('terms')}
        </Link>
      </footer>

      <LoginModal
        isVisible={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        t={t}
      />

      {isSearchOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm"
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            className="bg-container-light p-8 rounded-lg w-full max-w-xl"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-neutral-900 mb-4">
              {t('searchPlaceholder')}
            </h2>
            <p className="text-neutral-900">{t('searchInfo')}</p>
            <button
              className="mt-4 bg-primary-green text-white py-2 px-4 rounded"
              onClick={() => setIsSearchOpen(false)}
            >
              {t('close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
