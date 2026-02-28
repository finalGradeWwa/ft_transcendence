/**
 * PL: O nas — Server Component z SSR.
 * EN: About us — Server Component with SSR.
 */

import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

const TEAM_MEMBERS = [
  { id: 1, img: '/images/about/01.webp' },
  { id: 2, img: '/images/about/02.webp' },
  { id: 3, img: '/images/about/03.webp' },
  { id: 4, img: '/images/about/04.webp' },
  { id: 5, img: '/images/about/05.webp' },
];

/**
 * PL: Nagłówek strony.
 * EN: Page header.
 */
const PageHeader = ({ title }: { title: string }) => (
  <header className="text-center mb-12 mt-10">
    <h1 className="text-4xl md:text-5xl font-bold text-header-main mb-4">
      {title}
    </h1>
    <div className="h-1 w-24 bg-primary-green mx-auto rounded-full" />
  </header>
);

/**
 * PL: Wizytówka członka zespołu.
 * EN: Team member card.
 */
const MemberCard = ({ img }: { img: string }) => (
  <div className="relative w-full aspect-[4/5] overflow-hidden rounded-xl border border-border-gray shadow-sm">
    <Image
      src={img}
      alt="Team member"
      fill
      sizes="(max-width: 768px) 100vw, 250px"
      className="object-cover object-top transition-transform hover:scale-105 duration-300"
    />
  </div>
);

/**
 * PL: Sekcja dolna: hasło końcowe oraz zdjęcie dekoracyjne.
 * EN: Footer section: final slogan and decorative image.
 */
const FooterSection = ({
  text,
  imageAlt,
}: {
  text: string;
  imageAlt: string;
}) => (
  <div className="w-full max-w-[600px] mx-auto flex flex-col items-center">
    <p className="mb-6 text-white font-bold text-xl text-center">{text}</p>
    <div className="relative w-full aspect-video overflow-hidden rounded-2xl shadow-2xl border-2 border-secondary-beige">
      <Image
        src="/images/about/about-img.webp"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
        alt={imageAlt}
        className="object-cover"
      />
    </div>
  </div>
);

/**
 * PL: Generuje metadane SEO dla strony "O nas" na podstawie wybranego języka.
 * EN: Generates SEO metadata for the "About us" page based on the selected locale.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: t('aboutUs'),
    description: t('aboutUsDescription'),
  };
}

/**
 * PL: Główny komponent strony "O nas" (Server Component). Zarządza układem siatki i treścią dynamiczną.
 * EN: Main "About us" page component (Server Component). Manages grid layout and dynamic content.
 */
export default async function AboutUsPage() {
  const t = await getTranslations('AboutUs');

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 pb-12 flex flex-col justify-center h-full flex-grow">
      <PageHeader title={t('title')} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 w-full mb-12">
        {TEAM_MEMBERS.map(m => (
          <MemberCard key={m.id} img={m.img} />
        ))}
      </div>

      <article className="max-w-3xl mx-auto text-center mb-16 text-white leading-relaxed text-lg">
        <p>{t('description')}</p>
      </article>

      <FooterSection text={t('footerText')} imageAlt={t('about_image_alt')} />
    </div>
  );
}
