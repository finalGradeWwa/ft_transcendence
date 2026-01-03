/**
 * PL: Komponent opakowujący (Wrapper) odpowiedzialny za dynamiczne ustawianie kierunku tekstu (RTL/LTR).
 * Działa jako warstwa pośrednia, która przekazuje dane roślin do głównego klienta strony,
 * dostosowując kierunek wyświetlania na podstawie aktualnej lokalizacji.
 * * EN: Wrapper component responsible for dynamic text direction (RTL/LTR) configuration.
 * Acts as an intermediary layer that passes plant data to the main page client,
 * adjusting the display direction based on the current locale.
 */

'use client';

import { HomePageClient } from '@/app/[locale]/HomePageClient';
import { PlantType } from '../app/types/plantTypes';

/**
 * PL: Interfejs definiujący właściwości dla RtlWrapper - lista roślin oraz aktualny język.
 * EN: Interface defining props for RtlWrapper - plant list and current locale.
 */
interface RtlWrapperProps {
  plants: Array<PlantType>;
  locale: string;
}

export const RtlWrapper = ({ plants, locale }: RtlWrapperProps) => {
  return (
    /**
     * PL: Kontener ustawiający atrybut 'dir' dla całej zawartości strony głównej.
     * EN: Container setting the 'dir' attribute for the entire home page content.
     */
    <div dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <HomePageClient plants={plants} />
    </div>
  );
};
