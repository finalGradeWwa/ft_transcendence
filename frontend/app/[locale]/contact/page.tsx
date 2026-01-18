'use client';

/**
 * PL: Strona kontaktowa wyświetlająca dane firmy oraz link maila.
 * EN: Contact page displaying business details and email link.
 */

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/icons/ui/Icon';

const LoginModal = dynamic(() => import('@/components/LoginModal'), {
  ssr: false,
});

const CONTACT_EMAIL = 'j.weeder@example.com';
const NIP_VALUE = '111-111-11-11';

/**
 * PL: Uniwersalny komponent karty informacyjnej.
 * EN: Universal information card component.
 */
const InfoCard = ({ id, icon, title, children }: any) => (
  <section
    className="bg-secondary-beige p-8 rounded-2xl shadow-xl border border-subtle-gray flex flex-col items-center text-center"
    aria-labelledby={id}
  >
    <div className="bg-primary-green/10 p-4 rounded-full mb-6">
      <Icon name={icon} size={40} className="text-primary-green" />
    </div>
    <h2 id={id} className="text-2xl font-bold text-neutral-900 mb-4">
      {title}
    </h2>
    {children}
  </section>
);

/**
 * PL: Treść karty z danymi firmy (NIP, adres).
 * EN: Business details card content (NIP, address).
 */
const BizContent = ({ t }: any) => (
  <div className="space-y-3 text-neutral-900">
    <p>
      <span className="font-bold">{t('contact.nipLabel')}:</span> {NIP_VALUE}
    </p>
    <p className="italic">{t('contact.address')}</p>
  </div>
);

/**
 * PL: Treść karty z kontaktem mailowym.
 * EN: Email contact card content.
 */
const MailContent = ({ t }: any) => (
  <>
    <p className="text-neutral-900 mb-6">{t('contact.emailDescription')}</p>
    <a
      href={`mailto:${CONTACT_EMAIL}`}
      className="w-full inline-block bg-primary-green text-white font-bold px-4 py-3 rounded-lg transition-transform hover:scale-[1.02] outline-none break-all"
    >
      {CONTACT_EMAIL}
    </a>
  </>
);

/**
 * PL: Kontener siatki dla kart kontaktowych.
 * EN: Grid container for contact cards.
 */
const ContactView = ({ t }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
    <InfoCard id="biz-info" icon="user" title={t('contact.name')}>
      <BizContent t={t} />
    </InfoCard>
    <InfoCard id="mail-info" icon="mail" title={t('contact.emailTitle')}>
      <MailContent t={t} />
    </InfoCard>
  </div>
);

/**
 * PL: Główny komponent strony kontaktu zarządzający układem i stanem modalu.
 * EN: Main contact page component managing layout and modal state.
 */
export default function ContactPage() {
  const t = useTranslations('HomePage');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 pb-12 flex flex-col justify-center h-full flex-grow">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-header-main mb-4">
          {t('nav.4') || 'Kontakt'}
        </h1>
        <div className="h-1 w-24 bg-primary-green mx-auto rounded-full" />
      </header>

      <ContactView t={t} />

      <footer className="mt-12 text-center text-white">
        <p>
          {t('contact.officeOpen')}:{' '}
          <span className="font-bold">{t('contact.officeHours')}</span>
        </p>
      </footer>

      <LoginModal
        isVisible={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        t={t}
      />
    </div>
  );
}
