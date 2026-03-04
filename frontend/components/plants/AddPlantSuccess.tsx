'use client';

/** * PL: Widok sukcesu po poprawnym dodaniu nowej rośliny.
 * EN: Success view displayed after a plant has been successfully added.
 */

import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface AddPlantSuccessProps {
  username: string;
}

export function AddPlantSuccess({ username }: AddPlantSuccessProps) {
  const t = useTranslations('AddPlantPage');

  return (
    <div className="text-center space-y-6">
      {/** PL: Ikona wizualna sukcesu. EN: Visual success icon. */}
      <div className="text-6xl">🌿</div>

      {/** PL: Tytuł potwierdzający operację. EN: Operation confirmation title. */}
      <h2 className="text-2xl font-bold text-primary-green uppercase tracking-wider">
        {t('success.title') || 'Roślina dodana!'}
      </h2>

      {/** PL: Szczegółowy komunikat dla użytkownika. EN: Detailed message for the user. */}
      <p className="text-neutral-600">{t('success.message')}</p>

      {/** PL: Przycisk nawigacyjny do kolekcji roślin użytkownika. EN: Navigation button to user's plant collection. */}
      <div className="pt-4">
        <Link
          href={`/profiles/${username}/plants`}
          className="bg-primary-green text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-lg"
        >
          {t('success.button') || 'Zobacz swoją kolekcję'}
        </Link>
      </div>
    </div>
  );
}
