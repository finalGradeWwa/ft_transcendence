/**
 * PL: Konfiguracja żądań i18n dla środowiska serwerowego (getRequestConfig).
 * Odpowiada za dynamiczne ładowanie odpowiednich plików tłumaczeń (JSON) na podstawie
 * aktualnej lokalizacji oraz zapewnia walidację języka przy każdym żądaniu.
 * * EN: i18n request configuration for the server environment (getRequestConfig).
 * Responsible for dynamically loading appropriate translation files (JSON) based on
 * the current locale and ensuring language validation for every request.
 */

import { getRequestConfig } from 'next-intl/server';
import { routing } from './navigation';

export default getRequestConfig(async ({ requestLocale }) => {
  /**
   * PL: Oczekiwanie na pobranie lokalizacji z żądania.
   * EN: Awaiting the retrieval of the locale from the request.
   */
  let locale = await requestLocale;

  /**
   * PL: Walidacja lokalizacji. Jeśli język jest nieobsługiwany, następuje powrót do języka domyślnego.
   * EN: Locale validation. If the language is unsupported, it falls back to the default locale.
   */
  if (
    !locale ||
    !routing.locales.includes(locale as (typeof routing.locales)[number])
  ) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    /**
     * PL: Dynamiczny import pliku JSON z tłumaczeniami dla zweryfikowanego języka.
     * EN: Dynamic import of the JSON translation file for the verified locale.
     */
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
