/**
 * PL: Konfiguracja robots.txt generowana dynamicznie przez Next.js App Router.
 * Definiuje reguły dostępu robotów wyszukiwarek do poszczególnych sekcji serwisu.
 * EN: Dynamically generated robots.txt configuration via Next.js App Router.
 * Defines search engine crawler access rules for different site sections.
 */

import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/*/chat/', '/*/profiles/*/edit/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
