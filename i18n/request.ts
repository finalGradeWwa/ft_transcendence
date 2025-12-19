import { getRequestConfig } from 'next-intl/server';
import { routing } from './navigation';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // sprawdzamy, czy locale jest poprawne, rzutując na typ z naszej konfiguracji
  if (
    !locale ||
    !routing.locales.includes(locale as (typeof routing.locales)[number])
  ) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
