'use client';

/**
 * PL: Główny komponent nawigacji. Zarządza logotypem, menu mobilnym, linkami oraz integracją z logowaniem.
 * EN: Main navigation component. Manages logo, mobile menu, links, and login integration.
 */

import { useState, useEffect, Suspense } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/icons/ui/Icon';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const HeaderControls = dynamic(
  () => import('./HeaderControls').then(mod => mod.HeaderControls),
  { ssr: true }
);

/**
 * PL: Link ułatwiający dostępność (Accessibility), pozwalający pominąć nawigację klawiaturą.
 * EN: Skip link for accessibility, allowing keyboard users to bypass navigation.
 */
const SkipLink = () => {
  const t = useTranslations('HomePage');
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-1/2 focus:-translate-x-1/2 focus:z-[100] focus:bg-secondary-beige focus:text-primary-green focus:px-6 focus:py-3 focus:rounded-xl focus:font-bold focus:ring-4 focus:ring-primary-green focus:shadow-2xl outline-none"
    >
      {t('aria.skipToContent')}
    </a>
  );
};

/**
 * PL: Komponent logotypu z nazwą strony i obrazkiem favicon.
 * EN: Logo component with site title and favicon image.
 */
const Logo = ({ title }: { title: string }) => {
  return (
    <Link
      href="/"
      className="logo-container flex flex-col min-[320px]:flex-row items-center gap-y-4 min-[320px]:gap-y-0 min-[320px]:gap-x-6 rounded-lg focus-visible:ring-2 focus-visible:ring-header-main focus-visible:ring-offset-2 focus-visible:ring-offset-black outline-none border border-transparent"
    >
      <h1 className="logo-title text-3xl md:text-4xl font-bold text-header-main text-center min-[320px]:text-left">
        {title}
      </h1>
      <div className="logo-image-wrapper relative w-16 h-16 shrink-0">
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

/**
 * PL: Lista linków nawigacyjnych generowana na podstawie tablicy tłumaczeń.
 * EN: Navigation links list generated based on a translation array.
 */
const NavList = ({ items }: { items: string[] }) => {
  const paths = ['/', '/gardens', '/about-us', '/terms', '/contact'];
  if (!Array.isArray(items)) return null;

  return (
    <ul className="nav-menu-list flex flex-col items-center gap-4 md:flex-row md:justify-center md:gap-8">
      {items.map((item, index) => (
        <li key={item} className="nav-menu-item my-1">
          <Link
            href={paths[index] || '/'}
            className="nav-link inline-block text-white hover:text-primary-green hover:bg-secondary-beige/90 focus-visible:bg-secondary-beige/90 focus-visible:text-primary-green font-medium px-4 py-2 rounded-lg transition-all duration-300 focus-visible:ring-2 focus-visible:ring-header-main focus-visible:ring-offset-2 focus-visible:ring-offset-black outline-none border border-transparent hover:border-primary-green"
          >
            {item}
          </Link>
        </li>
      ))}
    </ul>
  );
};

/**
 * PL: Przycisk otwierający/zamykający menu mobilne (Hamburger).
 * EN: Toggle button for opening/closing the mobile menu (Hamburger).
 */
const MenuToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  const t = useTranslations('HomePage');
  return (
    <div className="mobile-toggle-wrapper flex justify-center mt-4 md:hidden">
      <button
        onClick={onClick}
        className="mobile-menu-btn text-white p-2 rounded-lg focus-visible:ring-2 focus-visible:ring-header-main focus-visible:ring-offset-2 focus-visible:ring-offset-black outline-none border border-transparent hover:border-primary-green transition-colors"
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

/**
 * PL: Kontener menu mobilnego zarządzający stanem otwarcia.
 * EN: Mobile menu container managing its open state.
 */
const MobileMenu = ({ items }: { items: string[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('HomePage');

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <>
      <MenuToggle isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
      <nav
        id="mobile-navigation"
        className={`mobile-nav-container mt-6 transition-all duration-300 overflow-hidden md:max-h-full md:opacity-100 md:block ${
          isOpen
            ? 'max-h-96 opacity-100'
            : 'max-h-0 opacity-0 md:max-h-full md:opacity-100'
        }`}
        aria-label={t('aria.mainNavigation')}
        {...(!isOpen ? { 'aria-hidden': undefined } : {})}
      >
        <NavList items={items} />
      </nav>
    </>
  );
};

/**
 * PL: Główny komponent nawigacji eksportowany do layoutu.
 * EN: Main navigation component exported to the layout.
 */
export const Navigation = () => {
  const t = useTranslations('HomePage');

  let navItems = [];
  try {
    navItems = t.raw('nav');
    if (!Array.isArray(navItems)) navItems = [];
  } catch (e) {
    navItems = [];
  }

  return (
    <header className="main-header py-6 border-b border-subtle-gray relative z-20">
      <SkipLink />

      <div className="header-top-wrapper flex flex-col md:flex-row justify-between items-center space-y-10 md:space-y-0 md:gap-8">
        <Logo title={t('title')} />
        <HeaderControls />
      </div>
      <MobileMenu items={navItems} />
    </header>
  );
};
