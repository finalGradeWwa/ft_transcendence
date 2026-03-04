/**
 * PL: Definicje typów dla danych roślin oraz ustawień kierunku tekstu.
 * Te typy są współdzielone między komponentami galerii i stronami profilu.
 * * EN: Type definitions for plant data and text direction settings.
 * These types are shared across gallery components and profile pages.
 */

/**
 * PL: Reprezentuje szczegółowe dane rośliny pobierane z API lub danych testowych.
 * EN: Represents detailed plant data fetched from an API or mock data.
 */
export type PlantType = {
  id: number;
  author: string;
  latinName: string;
  commonName: string;
  averageRating: string; // PL: Ocena przechowywana jako tekst / EN: Rating stored as a string
  totalReviews: number;
  loadingType?: 'eager' | 'lazy'; // PL: Opcjonalny typ ładowania obrazu / EN: Optional image loading type
};

/**
 * PL: Określa kierunek renderowania treści (od lewej do prawej lub od prawej do lewej).
 * EN: Specifies the content rendering direction (left-to-right or right-to-left).
 */
export type DirectionType = 'ltr' | 'rtl';
