'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Icon } from '@/components/icons/ui/Icon';
import Image from 'next/image';

const HeaderControls = dynamic(
  () => import('./HeaderControls').then(mod => mod.HeaderControls),
  { ssr: true }
);

const Logo = ({ title }: { title: string }) => {
  const t = useTranslations('HomePage');
  const navItems = t.raw('nav');
  return (
    <Link
      href="/"
      className="flex flex-col min-[320px]:flex-row items-center gap-y-4 min-[320px]:gap-y-0 min-[320px]:gap-x-6 rounded-lg focus-visible:ring-2 focus-visible:ring-header-main focus-visible:ring-offset-2 focus-visible:ring-offset-black outline-none border border-transparent"
      aria-label={navItems[0]}
    >
      <h1 className="text-3xl md:text-4xl font-bold text-header-main text-center min-[320px]:text-left">
        {title}
      </h1>
      <div className="relative w-16 h-16 shrink-0">
        <Image
          src="/images/favicon/fav_480.webp"
          alt=""
          fill
          sizes="64px"
          priority
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
            className="inline-block text-white hover:text-primary-green hover:bg-secondary-beige/90 focus-visible:bg-secondary-beige/90 focus-visible:text-primary-green font-medium px-4 py-2 rounded-lg transition-all duration-300 focus-visible:ring-2 focus-visible:ring-header-main focus-visible:ring-offset-2 focus-visible:ring-offset-black outline-none border border-transparent hover:border-primary-green"
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
        className="text-white p-2 rounded-lg focus-visible:ring-2 focus-visible:ring-header-main focus-visible:ring-offset-2 focus-visible:ring-offset-black outline-none border border-transparent hover:border-primary-green transition-colors"
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
        aria-label={t('aria.mainNavigation')}
      >
        <NavList items={items} />
      </nav>
    </>
  );
};

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

  return (
    <header className="py-6 border-b border-subtle-gray">
      <Suspense fallback={null}>
        <AuthTrigger onLoginClick={props.onLoginClick} />
      </Suspense>

      <div className="flex flex-col md:flex-row justify-between items-center space-y-10 md:space-y-0 md:gap-8">
        <Logo title={t('title')} />
        <HeaderControls {...props} />
      </div>
      <MobileMenu items={t.raw('nav')} />
    </header>
  );
};
