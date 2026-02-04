'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname, Link } from '@/i18n/navigation';
import { Icon } from '@/components/icons/ui/Icon';

const BTN_S =
  'p-2 rounded-full bg-secondary-beige text-neutral-900 hover:text-primary-green shadow-md transition-all focus-visible:ring-2 focus-visible:ring-[#ffffff] focus-visible:ring-offset-2 focus-visible:ring-offset-black outline-none shrink-0 flex items-center justify-center';

interface HeaderControlsProps {
  onLoginClick?: () => void;
  onSearchClick?: () => void;
  username?: string;
}

function useClickOutside(callback: () => void, active: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!active) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) callback();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [active, callback]);
  return ref;
}

const IconButton = ({
  onClick,
  iconName,
  ariaLabel,
  href,
}: {
  onClick?: () => void;
  iconName: 'search' | 'plus' | 'user';
  ariaLabel: string;
  href?: any;
}) => {
  const content = <Icon name={iconName} size={18} aria-hidden="true" />;

  return href ? (
    <Link href={href} className={BTN_S} aria-label={ariaLabel} scroll={false}>
      {content}
    </Link>
  ) : (
    <button
      type="button"
      onClick={onClick}
      className={BTN_S}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
};

const AddPlantDropdown = ({
  username,
  labelPlant,
  labelGarden,
  onClose,
}: {
  username: string;
  labelPlant: string;
  labelGarden: string;
  onClose: () => void;
}) => (
  <div className="absolute end-[-48px] mt-4 w-64 bg-primary-green rounded-xl shadow-2xl hover:opacity-95 transition-all overflow-hidden z-[100]">
    <ul className="py-1">
      <li>
        <Link
          href={`/profiles/${username}/plants/add`}
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-white outline-none hover:bg-black/10"
        >
          <Icon name="plus" size={14} />
          {labelPlant}
        </Link>
      </li>
      <div className="border-t border-white/30 mx-2 my-1" />
      <li>
        <Link
          href={`/profiles/${username}/gardens/add`}
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-white outline-none hover:bg-black/10"
        >
          <Icon name="plus" size={14} />
          {labelGarden}
        </Link>
      </li>
    </ul>
  </div>
);

const languageOptions = [
  { value: 'pl', label: 'Polski' },
  { value: 'en', label: 'English' },
  { value: 'de', label: 'Deutsch' },
  { value: 'ar', label: 'العربية' },
];

export function HeaderControls({
  onSearchClick,
  username = 'user1',
}: HeaderControlsProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const tAria = useTranslations('HomePage.aria');
  const tPlant = useTranslations('AddPlantPage');
  const tGarden = useTranslations('GardensPage');
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  const menuRef = useClickOutside(() => setIsAddMenuOpen(false), isAddMenuOpen);

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-x-6 gap-y-4">
      <select
        value={locale}
        onChange={e => router.replace(pathname, { locale: e.target.value })}
        aria-label={tAria('selectLanguage')}
        className="bg-container-light text-neutral-900 p-1 rounded cursor-pointer border border-secondary-beige outline-none focus-visible:ring-2 focus-visible:ring-[#ffffff] focus-visible:ring-offset-2 focus-visible:ring-offset-black text-sm w-full min-[320px]:w-auto min-w-[100px]"
      >
        {languageOptions.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <nav className="flex flex-wrap md:flex-nowrap items-center justify-center gap-3">
        <IconButton
          onClick={onSearchClick}
          iconName="search"
          ariaLabel={tAria('searchBtn')}
        />

        <div className="relative" ref={menuRef}>
          <IconButton
            onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
            iconName="plus"
            ariaLabel={tAria('add')}
          />
          {isAddMenuOpen && (
            <AddPlantDropdown
              username={username}
              labelPlant={tPlant('title')}
              labelGarden={tGarden('title')}
              onClose={() => setIsAddMenuOpen(false)}
            />
          )}
        </div>

        <IconButton
          href={{ pathname, query: { showLogin: 'true' } }}
          iconName="user"
          ariaLabel={tAria('profile')}
        />
      </nav>
    </div>
  );
}
