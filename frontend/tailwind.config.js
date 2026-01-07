/**
 * PL: Konfiguracja Tailwind CSS dla projektu. Definiuje ścieżki do plików zawierających
 * klasy użytkowe oraz rozszerza domyślną paletę kolorów o niestandardowe motywy
 * używane w interfejsie użytkownika.
 * * EN: Tailwind CSS configuration for the project. Defines paths to files containing
 * utility classes and extends the default color palette with custom themes
 * used in the user interface.
 */

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
      /**
       * PL: Niestandardowa paleta kolorów zdefiniowana dla zachowania spójności wizualnej marki.
       * EN: Custom color palette defined to maintain brand visual consistency.
       */
      colors: {
        'light-bg': '#F8F8F8',
        'dark-text': '#333333',
        'container-light': '#dad5d0',
        'container-light2': '#c7c1bc',
        'primary-green': '#186618',
        'secondary-beige': '#e7dcc7',
        'subtle-gray': '#E0E0E0',
        'border-gray': '#adadad',
        'header-main': '#ffffff',
      },
    },
  },
  plugins: [],
};

module.exports = tailwindConfig;
