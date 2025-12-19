// /types/plantTypes.ts

// eksportujemy definicje typów, aby byly dostepne globalnie.
export type PlantType = {
  id: number;
  author: string;
  latinName: string;
  commonName: string;
  averageRating: string; // ocena jest stringiem
  totalReviews: number;
  loadingType?: 'eager' | 'lazy';
};

export type DirectionType = 'ltr' | 'rtl';
