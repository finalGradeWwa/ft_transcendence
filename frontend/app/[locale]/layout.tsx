import '@/app/globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/navigation';

/**
 * PL: Główny układ strony z obsługą lokalizacji (i18n).
 * Odpowiada za konfigurację języka, walidację lokalizacji oraz dostarczanie tłumaczeń do komponentów klienckich.
 * * EN: Main layout component with internationalization (i18n) support.
 * Responsible for language configuration, locale validation, and providing translations to client components.
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  /**
   * PL: Oczekiwanie na parametry lokalizacji i walidacja dostępnych języków.
   * EN: Awaiting locale parameters and validating available languages.
   */
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  /**
   * PL: Pobieranie wiadomości tłumaczeń dla danego języka.
   * EN: Fetching translation messages for the given locale.
   */
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
