import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  output: 'standalone',
};

// eksportujemy konfigurację "owiniętą" w plugin next-intl
export default withNextIntl(nextConfig);
