'use client';

import { HomePageClient } from '@/components/HomePageClient';
import { PlantType } from '../app/types/plantTypes';

// definiujemy dokładnie, co ten komponent przyjmuje
interface RtlWrapperProps {
  plants: Array<PlantType>;
  locale: string;
}

export const RtlWrapper = ({ plants, locale }: RtlWrapperProps) => {
  return (
    <div dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <HomePageClient plants={plants} />
    </div>
  );
};
