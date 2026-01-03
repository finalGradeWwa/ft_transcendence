/**
 * PL: Główna konfiguracja Next.js rozszerzona o plugin next-intl.
 * Integruje bibliotekę i18n z procesem budowania aplikacji oraz definiuje
 * ustawienia wyjściowe dla środowiska produkcyjnego (standalone).
 * * EN: Main Next.js configuration extended with the next-intl plugin.
 * Integrates the i18n library with the build process and defines
 * output settings for the production environment (standalone).
 */

import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

/**
 * PL: Inicjalizacja pluginu next-intl, który automatycznie konfiguruje aliasy i ładowanie wiadomości.
 * EN: Initialization of the next-intl plugin, which automatically configures aliases and message loading.
 */
const withNextIntl = createNextIntlPlugin();

/**
 * PL: Podstawowa konfiguracja Next.js. Opcja 'standalone' optymalizuje rozmiar obrazu Docker.
 * EN: Basic Next.js configuration. The 'standalone' option optimizes the Docker image size.
 */
const nextConfig: NextConfig = {
  output: 'standalone',
};

/**
 * PL: Eksport finalnej konfiguracji owiniętej w funkcję pluginu.
 * EN: Export of the final configuration wrapped in the plugin function.
 */
export default withNextIntl(nextConfig);
