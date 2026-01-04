'use client';

import { useState, useEffect, Suspense } from 'react'; // Dodano useEffect, Suspense
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation'; // Dodano useSearchParams
// Importujemy Twój komponent Icon
import { Icon } from '@/components/icons/ui/Icon';
import Image from 'next/image';
import { HeaderControls } from './HeaderControls';

const Logo = ({ title }: { title: string }) => {
  const t = useTranslations('HomePage');
  return (
    <Link
      href="/"
      className="flex items-center gap-x-6"
      aria-label={`${title} - ${t('aria.homePageLink')}`}
    >
      <h1 className="text-3xl md:text-4xl font-bold text-header-main">
        {title}
      </h1>
      <div className="relative w-16 h-16">
        <Image
          src="/images/favicon/fav_480.webp"
          alt=""
          fill
          sizes="64px"
          className="rounded-full object-cover border border-primary-green"
        />
      </div>
    </Link>
  );
};

const NavList = ({ items }: { items: string[] }) => {
  const paths = ['/', '/gallery', '/about-us', '/terms', '/contact'];

  return (
    <ul className="flex flex-col items-center gap-4 md:flex-row md:justify-center md:gap-8">
      {items.map((item, index) => (
        <li key={item} className="my-1">
          <Link
            href={paths[index]}
            className="inline-block text-white hover:text-primary-green hover:bg-secondary-beige/90 font-medium px-4 py-2 rounded-lg transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary-green outline-none"
          >
            {item}
          </Link>
        </li>
      ))}
    </ul>
  );
};

const MenuToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  const t = useTranslations('HomePage');
  return (
    <div className="flex justify-center mt-4 md:hidden">
      <button
        onClick={onClick}
        className="text-white p-2 focus-visible:ring-2 focus-visible:ring-primary-green outline-none"
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        aria-label={isOpen ? t('aria.closeMenu') : t('aria.openMenu')}
      >
        {isOpen ? (
          <Icon name="close" size={32} aria-hidden="true" />
        ) : (
          <Icon name="menu" size={32} aria-hidden="true" />
        )}
      </button>
    </div>
  );
};

const MobileMenu = ({ items }: { items: string[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('HomePage');

  const baseClass =
    'mt-6 transition-all duration-300 overflow-hidden md:max-h-full md:opacity-100 md:block';
  const stateClass = isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0';

  return (
    <>
      <MenuToggle isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
      <nav
        id="mobile-navigation"
        className={`${baseClass} ${stateClass}`}
        // Usunięto inert i aria-hidden, które blokowały linki na desktopie
        aria-label={t('aria.mainNavigation')}
      >
        <NavList items={items} />
      </nav>
    </>
  );
};

/**
 * PL: Komponent pomocniczy do obsługi parametrów URL (wymagany Suspense w Next.js).
 * EN: Helper component to handle URL parameters (requires Suspense in Next.js).
 */
const AuthTrigger = ({ onLoginClick }: { onLoginClick?: () => void }) => {
  const searchParams = useSearchParams();

  useEffect(() => {
    const showLogin = searchParams.get('showLogin');
    if (showLogin === 'true' && onLoginClick) {
      onLoginClick();
    }
  }, [searchParams, onLoginClick]);

  return null;
};

export const Navigation = (props: {
  onLoginClick?: () => void;
  onSearchClick?: () => void;
}) => {
  const t = useTranslations('HomePage');

  const Brand = <Logo title={t('title')} />;
  const Actions = <HeaderControls {...props} />;
  const Menu = <MobileMenu items={t.raw('nav')} />;

  return (
    <header className="py-6 border-b border-subtle-gray" role="banner">
      {/** * PL: Sprawdzanie czy w URL jest parametr showLogin=true po rejestracji.
       * EN: Checking if URL has showLogin=true parameter after registration.
       */}
      <Suspense fallback={null}>
        <AuthTrigger onLoginClick={props.onLoginClick} />
      </Suspense>

      <div className="flex flex-col md:flex-row justify-between items-center space-y-10 md:space-y-0 md:gap-8">
        {Brand}
        {Actions}
      </div>
      {Menu}
    </header>
  );
};
