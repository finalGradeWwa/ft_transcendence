import '@/app/globals.css';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/navigation';
import { Background } from '@/components/Background';
import { Footer } from '@/components/Footer';

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
    <html
      lang={locale}
      dir={direction}
      className={`${inter.variable} scroll-smooth`}
    >
      <body className="antialiased font-sans">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Background>
            <div className="flex flex-col min-h-screen">
              <main className="flex-grow" id="main-content">
                {children}
              </main>
              <Footer />
            </div>
          </Background>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
