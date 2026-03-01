/**
 * PL: Mechanizm Middleware dla next-intl. Pełni rolę "strażnika ruchu", który analizuje
 * każde żądanie przed wyrenderowaniem strony, obsługując wykrywanie języka,
 * automatyczne przekierowania oraz zarządzanie ciasteczkami lokalizacji.
 * Dodatkowo odświeża token JWT i przekazuje access token do Server Components.
 *
 * EN: Middleware mechanism for next-intl. Acts as a "traffic guardian" that analyzes
 * every request before rendering the page, handling language detection,
 * automatic redirects, and locale cookie management.
 * Additionally refreshes the JWT token and passes the access token to Server Components.
 */

import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/navigation';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
).replace(/\/$/, '');

/** PL: Zapas czasu (sekundy) przed wygaśnięciem, po którym wymuszamy odświeżenie.
 *  EN: Leeway (seconds) before expiry at which we proactively refresh. */
const REFRESH_LEEWAY_SECONDS = 60;

/**
 * PL: Inicjalizacja bazowego middleware dla next-intl.
 * EN: Initialization of the base next-intl middleware.
 */
const handleI18nRouting = createMiddleware(routing);

/**
 * PL: Dekoduje pole `exp` z JWT bez weryfikacji podpisu.
 *     Zwraca timestamp (sekundy od epoch) lub null przy błędzie.
 * EN: Decodes the `exp` field from a JWT without signature verification.
 *     Returns timestamp (seconds since epoch) or null on error.
 */
function getJwtExp(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    // base64url → base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    const data = JSON.parse(json) as { exp?: unknown };
    return typeof data.exp === 'number' ? data.exp : null;
  } catch {
    return null;
  }
}

/**
 * PL: Sprawdza, czy access token jest wciąż ważny z zadanym zapasem czasu.
 * EN: Checks whether the access token is still valid with the given leeway.
 */
function isAccessTokenFresh(token: string): boolean {
  const exp = getJwtExp(token);
  if (exp === null) return false;
  return exp - Math.floor(Date.now() / 1000) > REFRESH_LEEWAY_SECONDS;
}

/**
 * PL: Odświeża access token na podstawie refresh_token cookie.
 *     Zwraca { access, newRefresh } lub null przy błędzie.
 * EN: Refreshes the access token using the refresh_token cookie.
 *     Returns { access, newRefresh } or null on failure.
 */
async function refreshAccessToken(
  refreshToken: string
): Promise<{ access: string; newRefresh?: string } | null> {
  try {
    const res = await fetch(`${API_URL}/api/auth/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `refresh_token=${refreshToken}`,
      },
      cache: 'no-store',
    });
    if (!res.ok) return null;

    const data = await res.json();
    const access = data.access as string | undefined;
    if (!access) return null;

    // PL: Odczytaj nowy refresh token z Set-Cookie (backend ustawia go po rotacji)
    // EN: Read new refresh token from Set-Cookie (backend sets it after rotation)
    let newRefresh: string | undefined;
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      const match = setCookie.match(/refresh_token=([^;]+)/);
      if (match) newRefresh = match[1];
    }

    return { access, newRefresh };
  } catch {
    return null;
  }
}

/**
 * PL: Dołącza access token do nagłówków odpowiedzi tak, by był dostępny w Server Components.
 * EN: Attaches the access token to response headers so Server Components can read it.
 */
function applyAccessTokenHeader(response: NextResponse, access: string): void {
  const existingOverrides = response.headers.get('x-middleware-override-headers') || '';
  const overrideList = existingOverrides ? existingOverrides.split(',') : [];
  if (!overrideList.includes('x-access-token')) {
    overrideList.push('x-access-token');
  }
  response.headers.set('x-middleware-override-headers', overrideList.join(','));
  response.headers.set('x-middleware-request-x-access-token', access);
}

/**
 * PL: Rozszerzona logika middleware o blokadę dostępu do stron logowania/rejestracji dla zalogowanych
 *     oraz odświeżanie tokenów JWT dla Server Components.
 * EN: Extended middleware logic blocking access to login/register pages for authenticated users
 *     and refreshing JWT tokens for Server Components.
 */
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // PL: Sprawdzamy 'refresh_token' (zgodnie z Twoimi ciasteczkami w przeglądarce)
  const refreshToken = request.cookies.get('refresh_token')?.value;
  const hasSession = !!refreshToken;

  const authPages = ['/login', '/register'];
  const isAuthPage = authPages.some(page =>
    pathname.match(new RegExp(`^/(pl|en|de|ar)${page}$`))
  );

  if (hasSession && isAuthPage) {
    const locale = pathname.split('/')[1] || 'pl';
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // PL: Chronione ścieżki - tylko dla zalogowanych. EN: Protected routes - logged in users only.
  const protectedPages = ['/profiles', '/plants', '/gardens', '/chat'];
  const isProtectedPage = protectedPages.some(page =>
    pathname.match(new RegExp(`^/(pl|en|de|ar)${page}`))
  );

  if (!hasSession && isProtectedPage) {
    const locale = pathname.split('/')[1] || 'pl';
    return NextResponse.redirect(
      new URL(`/${locale}?showLogin=true`, request.url)
    );
  }

  // PL: Dla zalogowanych użytkowników przekaż access token do Server Components,
  //     odświeżając go tylko gdy wygasł lub niedługo wygaśnie.
  // EN: For authenticated users, forward the access token to Server Components,
  //     refreshing only when it has expired or is about to expire.
  if (hasSession && refreshToken) {
    const cachedAccess = request.cookies.get('access_token')?.value;

    // PL: Jeśli mamy świeży access token w cookie — użyj go bez roundtripa do backendu.
    // EN: If there is a fresh access token in the cookie — use it without a backend roundtrip.
    if (cachedAccess && isAccessTokenFresh(cachedAccess)) {
      const response = handleI18nRouting(request);
      applyAccessTokenHeader(response, cachedAccess);
      return response;
    }

    // PL: Access token wygasł lub nie istnieje — odśwież.
    // EN: Access token expired or missing — refresh.
    const result = await refreshAccessToken(refreshToken);

    if (result) {
      const response = handleI18nRouting(request);
      applyAccessTokenHeader(response, result.access);

      // PL: Zapisz nowy access token w krótkotrwałym httpOnly cookie.
      // EN: Persist the new access token in a short-lived httpOnly cookie.
      const exp = getJwtExp(result.access);
      const maxAge = exp
        ? Math.max(0, exp - Math.floor(Date.now() / 1000))
        : 300; // fallback: 5 min
      response.cookies.set('access_token', result.access, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge,
      });

      // PL: Jeśli backend zrotował refresh token, ustaw nowe cookie w odpowiedzi
      // EN: If backend rotated the refresh token, set new cookie on the response
      if (result.newRefresh) {
        response.cookies.set('refresh_token', result.newRefresh, {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 86400,
        });
      }

      return response;
    }

    // PL: Odświeżenie nie powiodło się (wygasły/nieprawidłowy refresh token, backend niedostępny).
    //     Usuń oba ciasteczka i przekieruj do strony logowania, by uniknąć:
    //     - wielokrotnych żądań refresh przy każdym zapytaniu,
    //     - stanu "zalogowany" z ciągłymi błędami 401 w Server Components.
    // EN: Refresh failed (expired/invalid refresh token, backend unavailable).
    //     Clear both cookies and redirect to login to avoid:
    //     - repeated refresh calls on every request,
    //     - "logged-in" navigation state with constant 401 errors in Server Components.
    const locale = request.nextUrl.pathname.split('/')[1] || 'pl';
    const redirectResponse = NextResponse.redirect(
      new URL(`/${locale}?showLogin=true`, request.url)
    );
    redirectResponse.cookies.delete('refresh_token');
    redirectResponse.cookies.delete('access_token');
    return redirectResponse;
  }

  return handleI18nRouting(request);
}

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
