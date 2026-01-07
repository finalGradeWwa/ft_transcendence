'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
// Importujemy Twój komponent Icon
import { Icon } from '@/components/icons/ui/Icon';

interface HeaderControlsProps {
  onLoginClick?: () => void;
  onSearchClick?: () => void;
}

// Komponent dla przycisku z ikoną - teraz przyjmuje iconName (string)
const IconButton = ({
  onClick,
  iconName,
  ariaLabel,
}: {
  onClick?: () => void;
  iconName: 'search' | 'plus' | 'user'; // Ścisłe typowanie nazw
  ariaLabel: string;
}) => (
  <button
    onClick={onClick}
    className="p-2 rounded-full bg-secondary-beige text-neutral-900 hover:text-primary-green shadow-md transition-all focus-visible:ring-2 focus-visible:ring-primary-green outline-none"
    aria-label={ariaLabel}
  >
    {/* Używamy Twojego komponentu Icon */}
    <Icon name={iconName} size={18} aria-hidden="true" />
  </button>
);

const languageOptions = [
  { value: 'pl', label: 'Polski' },
  { value: 'en', label: 'English' },
  { value: 'de', label: 'Deutsch' },
  { value: 'ar', label: 'العربية' },
];

export const HeaderControls = ({
  onLoginClick,
  onSearchClick,
}: HeaderControlsProps) => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    router.replace(pathname, { locale: event.target.value });
  };

  return (
    <div className="flex items-center justify-center flex-wrap gap-x-6 gap-y-6">
      <select
        id="language-switcher"
        name="language"
        value={locale}
        onChange={handleLanguageChange}
        aria-label="Wybierz język strony"
        className="bg-container-light text-neutral-900 p-1 rounded cursor-pointer border border-secondary-beige focus:outline-none focus:ring-2 focus:ring-primary-green text-sm"
      >
        {languageOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <div
        className="flex gap-3"
        role="group"
        aria-label="Narzędzia użytkownika"
      >
        {/* Przekazujemy nazwy ikon zgodne z Twoim Icon.tsx */}
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
      </div>
    </div>
  );
};
