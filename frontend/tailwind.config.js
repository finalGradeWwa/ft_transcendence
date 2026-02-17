/**
 * PL: Konfiguracja Tailwind CSS dla projektu. Definiuje ścieżki do plików zawierających
 * klasy użytkowe oraz rozszerza domyślną paletę kolorów o niestandardowe motywy
 * używane w interfejsie użytkownika.
 * * EN: Tailwind CSS configuration for the project. Defines paths to files containing
 * utility classes and extends the default color palette with custom themes
 * used in the user interface.
 */

import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
const tailwindConfig = {
  /**
   * PL: Ścieżki do wszystkich komponentów i stron, które Tailwind ma skanować w poszukiwaniu klas.
   * EN: Paths to all components and pages that Tailwind should scan for classes.
   */
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './frontend/app/**/*.{js,ts,jsx,tsx,mdx}',
    './frontend/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': {
            opacity: '1',
            maxHeight: '64px',
            marginBottom: '1.5rem',
            paddingTop: '0.75rem',
            paddingBottom: '0.75rem',
          },
          '70%': {
            opacity: '0',
            maxHeight: '0',
            marginBottom: '-1rem',
            paddingTop: '0',
            paddingBottom: '0',
          },
          '100%': {
            opacity: '0',
            maxHeight: '0',
            marginBottom: '0',
            paddingTop: '0',
            paddingBottom: '0',
          },
        },
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-out forwards',
        'fade-out': 'fadeOut 0.44s ease-in forwards',
      },
      /**
       * PL: Niestandardowa paleta kolorów zdefiniowana dla zachowania spójności wizualnej marki.
       * EN: Custom color palette defined to maintain brand visual consistency.
       */
      colors: {
        'light-bg': '#F8F8F8',
        'dark-bg': '#131513',
        'gray-green-text': '#7d847d',
        'dark-text': '#0d0b0b',
        'container-light': '#ebddd0',
        'container-light2': '#c7c1bc',
        'primary-green': '#186618',
        'secondary-beige': '#e7dcc7',
        'subtle-gray': '#E0E0E0',
        'border-gray': '#adadad',
        'header-main': '#fff',
      },
    },
  },
  plugins: [typography],
};

// PL: Eksport domyślny zgodny ze standardem ES Modules (pasuje do "import" na górze pliku).
// EN: Default export compatible with ES Modules standard (matches "import" at the top).
export default tailwindConfig;
