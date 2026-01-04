/**
 * PL: Konfiguracja PostCSS dla projektu. Definiuje wtyczki odpowiedzialne za
 * przetwarzanie stylów Tailwind CSS oraz automatyczne dodawanie vendor-prefixów (Autoprefixer),
 * co zapewnia kompatybilność stylów z różnymi przeglądarkami.
 * * EN: PostCSS configuration for the project. Defines plugins responsible for
 * processing Tailwind CSS styles and automatically adding vendor prefixes (Autoprefixer),
 * ensuring style compatibility across different browsers.
 */

module.exports = {
  /**
   * PL: Lista wtyczek PostCSS używanych w procesie kompilacji stylów.
   * EN: List of PostCSS plugins used in the style compilation process.
   */
  plugins: {
    /**
     * PL: Silnik Tailwind CSS przetwarzający klasy użytkowe na surowy kod CSS.
     * EN: Tailwind CSS engine processing utility classes into raw CSS code.
     */
    tailwindcss: {},

    /**
     * PL: Narzędzie dodające przedrostki (np. -webkit-) dla starszych przeglądarek.
     * EN: Tool adding prefixes (e.g., -webkit-) for older browsers.
     */
    autoprefixer: {},
  },
};
