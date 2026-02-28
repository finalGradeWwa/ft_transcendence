/**
 * PL: Mapa strony (sitemap.xml) generowana dynamicznie przez Next.js App Router.
 * Zawiera publiczne URL-e serwisu we wszystkich obsługiwanych językach.
 * EN: Dynamically generated sitemap.xml via Next.js App Router.
 * Contains public URLs of the service in all supported locales.
 */

import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000';

const locales = ['pl', 'en', 'de', 'ar'];

/**
 * PL: Publiczne ścieżki widoczne dla wyszukiwarek.
 * EN: Public paths visible to search engines.
 */
const publicPaths = [
  '/',
  '/gardens',
  '/about-us',
  '/contact',
  '/terms',
  '/privacy-policy',
];

/**
 * PL: Stabilny znacznik czasu budowania – ustawiany raz, nie zmienia się między żądaniami.
 * EN: Stable build timestamp – set once at module load, does not change between requests.
 */
const BUILD_TIMESTAMP = process.env.NEXT_PUBLIC_BUILD_TIME
  ? new Date(process.env.NEXT_PUBLIC_BUILD_TIME)
  : undefined;

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const path of publicPaths) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}${path === '/' ? '' : path}`,
        ...(BUILD_TIMESTAMP && { lastModified: BUILD_TIMESTAMP }),
        changeFrequency: path === '/' ? 'daily' : 'monthly',
        priority: path === '/' ? 1.0 : 0.7,
      });
    }
  }

  return entries;
}
