import { GardensPageClient } from '../GardensPageClient';
import { getTranslations } from 'next-intl/server';

/**
 * PL: Serwerowy komponent strony globalnej listy ogrodów.
 * EN: Server-side component for the global gardens list page.
 */

export default async function GlobalGardensPage() {
  // Dane testowe do zastąpienia:
  const fakeGardens = [
    { id: 1, name: 'Miejska Dżungla', owner: 'user1', plantsCount: 12 },
    { id: 2, name: 'Balkon Południowy', owner: 'plant_lover', plantsCount: 5 },
    { id: 3, name: 'Ogród wertykalny', owner: 'stefan_green', plantsCount: 24 },
    { id: 4, name: 'Ziołowy zakątek', owner: 'kuchnia_mamy', plantsCount: 8 },
    { id: 5, name: 'Miejska Dżungla', owner: 'user1', plantsCount: 12 },
    { id: 6, name: 'Balkon Południowy', owner: 'plant_lover', plantsCount: 5 },
    { id: 7, name: 'Ogród wertykalny', owner: 'stefan_green', plantsCount: 24 },
    { id: 8, name: 'Ziołowy zakątek', owner: 'kuchnia_mamy', plantsCount: 8 },
    { id: 9, name: 'Miejska Dżungla', owner: 'user1', plantsCount: 12 },
    { id: 10, name: 'Balkon Południowy', owner: 'plant_lover', plantsCount: 5 },
    {
      id: 11,
      name: 'Ogród wertykalny',
      owner: 'stefan_green',
      plantsCount: 24,
    },
    { id: 12, name: 'Ziołowy zakątek', owner: 'kuchnia_mamy', plantsCount: 8 },
    { id: 13, name: 'Miejska Dżungla', owner: 'user1', plantsCount: 12 },
    { id: 14, name: 'Balkon Południowy', owner: 'plant_lover', plantsCount: 5 },
    {
      id: 15,
      name: 'Ogród wertykalny',
      owner: 'stefan_green',
      plantsCount: 24,
    },
    { id: 16, name: 'Ziołowy zakątek', owner: 'kuchnia_mamy', plantsCount: 8 },
  ];

  return (
    <div className="bg-main-gradient">
      <GardensPageClient gardens={fakeGardens} />
    </div>
  );
}
