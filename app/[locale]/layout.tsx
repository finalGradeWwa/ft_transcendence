import '@/app/globals.css';
import { Metadata } from 'next'; // Dodaj ten import
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/navigation';

// Konfiguracja metadanych i favicon
export const metadata: Metadata = {
  title: 'Weed be better together',
  description: 'Twoje centrum wiedzy o roślinach',
  icons: {
    icon: [
      { url: '/images/favicon/favicon.ico' }, // Podstawowa ikona
      {
        url: '/images/favicon/favicon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
      },
      { url: '/images/favicon/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/images/favicon/apple-touch-icon.png' }, // Ikona dla urządzeń Apple
    ],
  },
  manifest: '/images/favicon/site.webmanifest',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Walidacja języka
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  // Pobranie wiadomości z plików JSON
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
