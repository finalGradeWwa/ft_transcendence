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
  images: {
    deviceSizes: [480, 828, 1200, 1920],
    imageSizes: [96, 256, 384],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
    ],
  },
};

/**
 * PL: Eksport finalnej konfiguracji owiniętej w funkcję pluginu.
 * EN: Export of the final configuration wrapped in the plugin function.
 */
export default withNextIntl(nextConfig);
