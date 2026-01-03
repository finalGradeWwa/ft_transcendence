/**
 * PL: Konfiguracja nawigacji i routingu dla biblioteki next-intl.
 * Definiuje obsługiwane języki oraz dostarcza gotowe komponenty (Link) i hooki (usePathname, useRouter),
 * które automatycznie uwzględniają aktualny język w adresach URL.
 * * EN: Navigation and routing configuration for the next-intl library.
 * Defines supported locales and provides ready-to-use components (Link) and hooks (usePathname, useRouter)
 * that automatically handle the current locale in URLs.
 */

import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

/**
 * PL: Definicja dostępnych języków oraz domyślnej lokalizacji dla całej aplikacji.
 * EN: Definition of available locales and the default locale for the entire application.
 */
export const routing = defineRouting({
  locales: ['pl', 'en', 'de', 'ar'],
  defaultLocale: 'pl',
});

/**
 * PL: Eksport opakowanych narzędzi do nawigacji, które są zgodne z konfiguracją i18n.
 * EN: Export of wrapped navigation utilities compliant with the i18n configuration.
 */
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
