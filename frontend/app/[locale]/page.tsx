/**
 * PL: Główny komponent strony (FinalPage) wykorzystujący renderowanie po stronie serwera (SSR).
 * Odpowiada za przygotowanie zestawu danych testowych (dummy data) oraz wyświetlenie
 * głównego widoku z obsługą kierunku tekstu (RTL) wewnątrz dedykowanego tła.
 * * EN: Main page component (FinalPage) utilizing server-side rendering (SSR).
 * Responsible for preparing mock data and rendering the primary view with
 * RTL (Right-to-Left) support inside a dedicated background component.
 */

import { Background } from '@/components/Background';
import { RtlWrapper } from '@/components/RtlWrapper';
import { PlantType } from '../types/plantTypes';

import '../globals.css';

/**
 * PL: Dane testowe roślin generowane dynamicznie dla celów demonstracyjnych.
 * EN: Mock plant data generated dynamically for demonstration purposes.
 */
const dummyPlants: Array<PlantType> = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  author: `user_${(i % 5) + 1}`,
  latinName: `Plantae magnificum ${i + 1}`,
  commonName: `Roslina Zwykla ${i + 1}`,
  averageRating: (((i * 0.4) % 6) + 1).toFixed(1),
  totalReviews: Math.floor(Math.random() * 50) + 1,
}));

/**
 * PL: Komponent strony końcowej renderowany po stronie serwera (SSR).
 * Przyjmuje parametry lokalizacji i renderuje opakowanie RTL wraz z tłem i danymi roślin.
 * * EN: Final page component rendered on the server side (SSR).
 * It receives locale parameters and renders the RTL wrapper along with the background and plant data.
 */
export default async function FinalPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  /**
   * PL: Oczekiwanie na parametry ścieżki i parametry wyszukiwania (wymagane w Next.js 15+).
   * EN: Awaiting path parameters and search parameters (required in Next.js 15+).
   */
  const { locale } = await params;
  const { showLogin, registered } = await searchParams;

  return (
    <Background>
      <RtlWrapper
        plants={dummyPlants}
        locale={locale}
        showLogin={showLogin === 'true'}
        isRegistered={registered === 'true'}
      />
    </Background>
  );
}
