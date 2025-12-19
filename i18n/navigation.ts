import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

// definiujemy routing - to musi być spójne z middleware
export const routing = defineRouting({
  locales: ['pl', 'en', 'de', 'ar'],
  defaultLocale: 'pl',
});

// eksportujemy gotowe komponenty i hooki
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
