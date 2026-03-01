import { headers } from 'next/headers';

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
).replace(/\/$/, '');

/**
 * PL: Odczytuje access token z nagłówka x-access-token ustawionego przez middleware.
 *     Middleware odświeża token JWT i przekazuje go do Server Components.
 * EN: Reads the access token from the x-access-token header set by middleware.
 *     Middleware refreshes the JWT token and passes it to Server Components.
 */
async function getServerAccessToken(): Promise<string | null> {
  try {
    const headerStore = await headers();
    return headerStore.get('x-access-token') ?? null;
  } catch {
    return null;
  }
}

/**
 * PL: Fetch uwierzytelniony po stronie serwera (Server Components).
 *     Automatycznie dołącza token JWT z middleware do nagłówka Authorization.
 * EN: Authenticated fetch for Server Components.
 *     Automatically attaches JWT token from middleware to the Authorization header.
 *
 * @param path  — ścieżka API, np. '/api/garden/'
 * @param init  — opcjonalny RequestInit (method, headers, body, …)
 */
export async function serverFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const accessToken = await getServerAccessToken();

  const url = path.startsWith('http') ? path : `${API_URL}${path}`;

  return fetch(url, {
    ...init,
    headers: {
      ...init?.headers,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    cache: 'no-store',
  });
}
