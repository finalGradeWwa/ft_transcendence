/**
 * PL: Mechanizm Middleware dla next-intl. Pełni rolę "strażnika ruchu", który analizuje
 * każde żądanie przed wyrenderowaniem strony, obsługując wykrywanie języka,
 * automatyczne przekierowania oraz zarządzanie ciasteczkami lokalizacji.
 * * EN: Middleware mechanism for next-intl. Acts as a "traffic guardian" that analyzes
 * every request before rendering the page, handling language detection,
 * automatic redirects, and locale cookie management.
 */

import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/navigation';

export default createMiddleware(routing);

/**
 * PL: Konfiguracja matchera definiująca, które ścieżki powinny być procesowane przez Middleware.
 * EN: Matcher configuration defining which paths should be processed by the Middleware.
 */
export const config = {
  matcher: ['/', '/(pl|en|de|ar)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};

/* 
	Ten plik to "strażnik ruchu" (Middleware). Działa on na serwerze i analizuje każde zapytanie, które wpada do strony, zanim Next.js wyśle jakiekolwiek dane do przeglądarki.

	1. Automatyczne przekierowania (Routing)
		Odczytuje język z przeglądarki użytkownika.
		Jeśli wykryje polski, automatycznie przekieruje go na /pl.
		Jeśli wejdzie na /en, middleware dopilnuje, aby załadowały się teksty z pliku en.json.

	2. Wykrywanie języka
		Dzięki createMiddleware(routing), skrypt wie:
		Jakie języki są obsługiwane (pl, en, de, ar).
		Który język jest domyślny.
		Czy ma zapisywać wybór języka w ciasteczkach (cookies), żeby przy kolejnej wizycie użytkownik od razu widział swoją wersję.

	3. Sekcja config.matcher?
		To jest lista filtrów. Mówi ona serwerowi: "Uruchamiaj middleware tylko dla tych adresów".
		'/': Sprawdzaj stronę główną.
		'/(pl|en|de|ar)/:path*': Obsługuj wszystkie ścieżki, które zaczynają się od tych języków.
		'/((?!api|_next|_vercel|.*\\..*).*)': To jest tzw. negative lookahead. Mówi serwerowi: "NIE uruchamiaj middleware dla:"
			plików w api/ (bo tam nie potrzebujemy tłumaczeń stron),
			plików systemowych _next i _vercel,
			plików z kropką w nazwie (np. favicon.ico, logo.png, style.css).

	Bez tego pliku:
		Wpisanie /en w pasku adresu wyrzuciłoby błąd 404 (bo fizycznie nie ma takiego folderu, Next.js symuluje go dzięki middleware).
		Nie działałaby automatyczna zmiana języka po wykryciu lokalizacji użytkownika.
		Przeglądarka próbowałaby tłumaczyć obrazki i skrypty, co mogłoby spowolnić stronę.
*/
