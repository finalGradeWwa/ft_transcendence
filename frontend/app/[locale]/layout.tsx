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

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
});

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

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();
  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={direction} className={inter.variable}>
      <body className="antialiased font-sans">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Background>
            <div className="flex flex-col min-h-screen">
              <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex-grow flex flex-col">
                <Navigation />

                <main
                  className="flex-grow outline-none flex flex-col"
                  id="main-content"
                  tabIndex={-1}
                >
                  {children}
                </main>

                <Footer />
              </div>
              <GlobalModalProvider />
            </div>
          </Background>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
