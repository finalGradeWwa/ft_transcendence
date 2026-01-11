'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { Icon } from '@/components/icons/ui/Icon';

interface HeaderControlsProps {
  onLoginClick?: () => void;
  onSearchClick?: () => void;
}

const IconButton = ({
  onClick,
  iconName,
  ariaLabel,
}: {
  onClick?: () => void;
  iconName: 'search' | 'plus' | 'user';
  ariaLabel: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="p-2 rounded-full bg-secondary-beige text-neutral-900 hover:text-primary-green shadow-md transition-all focus-visible:ring-2 focus-visible:ring-[#ffffff] focus-visible:ring-offset-2 focus-visible:ring-offset-black outline-none shrink-0"
    aria-label={ariaLabel}
  >
    <Icon name={iconName} size={18} aria-hidden="true" />
  </button>
);

const languageOptions = [
  { value: 'pl', label: 'Polski' },
  { value: 'en', label: 'English' },
  { value: 'de', label: 'Deutsch' },
  { value: 'ar', label: 'العربية' },
];

export function HeaderControls({
  onLoginClick,
  onSearchClick,
}: HeaderControlsProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    router.replace(pathname, { locale: event.target.value });
  };

  return (
    <div className="flex flex-col min-[320px]:flex-row items-center justify-center gap-x-6 gap-y-4 min-[320px]:gap-y-0">
      <select
        id="language-switcher"
        name="language"
        value={locale}
        onChange={handleLanguageChange}
        aria-label="Wybierz język strony"
        className="bg-container-light text-neutral-900 p-1 rounded cursor-pointer border border-secondary-beige outline-none focus-visible:ring-2 focus-visible:ring-[#ffffff] focus-visible:ring-offset-2 focus-visible:ring-offset-black text-sm w-full min-[320px]:w-auto min-w-[100px]"
      >
        {languageOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <nav
        className="flex flex-col min-[200px]:flex-row gap-3"
        aria-label="Narzędzia użytkownika"
      >
        <IconButton
          onClick={onSearchClick}
          iconName="search"
          ariaLabel="Szukaj"
        />
        <IconButton iconName="plus" ariaLabel="Dodaj nową roślinę" />
        <IconButton
          onClick={onLoginClick}
          iconName="user"
          ariaLabel="Profil użytkownika"
        />
      </nav>
    </div>
  );
}
