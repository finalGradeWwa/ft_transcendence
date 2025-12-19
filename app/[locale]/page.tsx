import { Background } from '@/components/Background';
import { RtlWrapper } from '@/components/RtlWrapper';
import { PlantType } from '../types/plantTypes';

import '../globals.css';

const dummyPlants: Array<PlantType> = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  author: `user_${(i % 5) + 1}`,
  latinName: `Plantae magnificum ${i + 1}`,
  commonName: `Roslina Zwykla ${i + 1}`,
  averageRating: (((i * 0.4) % 6) + 1).toFixed(1),
  totalReviews: Math.floor(Math.random() * 50) + 1,
}));

// SSR: Next.js automatycznie przekaże 'params' do tej funkcji
export default async function FinalPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = await params;

  return (
    <Background>
      {/* przekazujemy locale jako prop, aby "użyć" zmiennej */}
      <RtlWrapper plants={dummyPlants} locale={locale} />
    </Background>
  );
}
