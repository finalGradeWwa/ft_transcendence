/**
 * PL: Główny layout aplikacji definiujący strukturę HTML, czcionki oraz globalnych dostawców stanów.
 * Zarządza internacjonalizacją (i18n), metadanymi oraz warstwowym układem komponentów (Background, Navigation, Footer).
 * * EN: Main application layout defining HTML structure, fonts, and global state providers.
 * Manages internationalization (i18n), metadata, and the layered component layout (Background, Navigation, Footer).
 */

import '@/app/globals.css';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/navigation';
import { Background } from '@/components/Background';
import { Footer } from '@/components/Footer';
import { Navigation } from '@/components/Navigation';
import { GlobalModalProvider } from '@/components/GlobalModalProvider';

/**
 * PL: Konfiguracja fontu Inter z obsługą polskich znaków i zmienną CSS.
 * EN: Inter font configuration with Latin-ext support and CSS variable.
 */
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
});

/**
 * PL: Generuje metadane strony (tytuł, opis) na podstawie wybranego języka.
 * EN: Generates page metadata (title, description) based on the selected locale.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'HomePage' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

/**
 * PL: Główny layout aplikacji obsługujący internacjonalizację i strukturę wizualną.
 * EN: Main application layout supporting internationalization and visual structure.
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // PL: Walidacja czy dany język jest obsługiwany przez konfigurację routingu.
  // EN: Validation to check if the locale is supported by the routing configuration.
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();
  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={direction} className={inter.variable}>
      <body className="antialiased font-sans">
        {/** PL: Dostawca treści tłumaczeń dla komponentów klienckich. EN: Translation messages provider for client components. */}
        <NextIntlClientProvider messages={messages} locale={locale}>
          {/** PL: Komponent tła z własnym kontekstem warstw (z-index). EN: Background component with its own stacking context (z-index). */}
          <Background>
            <div className="flex flex-col min-h-screen">
              <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex-grow flex flex-col">
                <Navigation />

                {/** PL: Główny obszar treści z obsługą dostępności (skip link target). EN: Main content area with accessibility support (skip link target). */}
                <main
                  className="flex-grow outline-none flex flex-col"
                  id="main-content"
                  tabIndex={-1}
                >
                  {children}
                </main>

                <Footer />
              </div>
            </div>
          </Background>

          {/** * PL: Globalny dostawca modali umieszczony poza Background, aby uniknąć problemów z z-index.
           * EN: Global modal provider placed outside Background to avoid z-index issues.
           */}
          <GlobalModalProvider />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
