const DEFAULT_API_URL = 'https://localhost:8443';
const ACCESS_TOKEN_KEY = 'accessToken';

/**
 * PL: Pobiera bazowy URL API z zmiennej środowiskowej lub wartości domyślnej.
 * EN: Gets the base API URL from environment variable or default value.
 */
export function getApiUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(
    /\/$/,
    ''
  );
}

/**
 * PL: Zarządzanie tokenem dostępu w sessionStorage.
 * EN: Access token management in sessionStorage.
 */
export function setAccessToken(token: string) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
}

/**
 * PL: Sprawdza, czy token dostępu nie wygasa (< 3s.).
 * EN: Checks if the access token does not expire. (< 3s.)
 */
function isTokenExpired(token: string): boolean {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const { exp } = JSON.parse(jsonPayload);
    return Date.now() >= exp * 1000 - 3000;
  } catch {
    return true;
  }
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearAccessToken() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}

/**
 * PL: Wylogowanie użytkownika — najpierw wywołuje endpoint backendu, potem czyści lokalne dane.
 * EN: User logout — first calls backend endpoint, then clears local session data.
 */
export async function logout(): Promise<void> {
  // PL: Pobierz token PRZED czyszczeniem, aby backend mógł zweryfikować użytkownika
  // EN: Get token BEFORE clearing, so backend can verify the user
  const token = getAccessToken();

  // PL: Usuń tokeny lokalnie przed requestem — zapobiega pętlom refresh
  // EN: Clear tokens locally before request — prevents refresh loops
  clearAccessToken();
  if (typeof window !== 'undefined') {
    localStorage.removeItem('username');
  }

  // PL: Wywołaj backend z tokenem w headerze Authorization (best-effort)
  // EN: Call backend with token in Authorization header (best-effort)
  await fetch(`${getApiUrl()}/api/auth/logout/`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).catch(() => {});
}

let refreshPromise: Promise<string | null> | null = null;

type RefreshResponse = { access?: string };

/**
 * PL: Odświeża token dostępu używając refresh_token z cookie.
 * W przypadku błędu wylogowuje użytkownika i przekierowuje na stronę logowania.
 * EN: Refreshes the access token using refresh_token from cookie.
 * On failure, logs out the user and redirects to the login page.
 */
export async function refreshAccessToken(
  skipRedirect = false
): Promise<string | null> {
  const apiUrl = getApiUrl();

  const res = await fetch(`${apiUrl}/api/auth/token/refresh/`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    clearAccessToken();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('username');
    }
    if (!skipRedirect && typeof window !== 'undefined') {
      const locale = window.location.pathname.split('/')[1] || 'pl';
      window.location.href = `/${locale}?showLogin=true`;
    }
    return null;
  }

  const data = (await res.json()) as RefreshResponse;
  if (!data?.access) return null;

  setAccessToken(data.access);

  return data.access;
}

/**
 * PL: Zwraca ważny token dostępu — z sessionStorage lub przez odświeżenie.
 * Deduplicuje równoległe wywołania refresh za pomocą współdzielonego Promise.
 * EN: Returns a valid access token — from sessionStorage or by refreshing.
 * Deduplicates parallel refresh calls using a shared Promise.
 */
export async function getValidAccessToken(
  skipRedirect = false
): Promise<string | null> {
  const existing = getAccessToken();
  if (existing && !isTokenExpired(existing)) {
    return existing;
  }

  if (!refreshPromise) {
    refreshPromise = refreshAccessToken(skipRedirect);
    refreshPromise.finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

/**
 * PL: Uniwersalna funkcja do wywołań API — automatycznie dołącza token Bearer
 * i obsługuje jego odświeżenie przy błędzie 401.
 * EN: Universal API fetch function — automatically attaches Bearer token
 * and handles its refresh on 401 error.
 */
export async function apiFetch(
  path: string,
  init: RequestInit & { skipRedirect?: boolean } = {}
): Promise<Response> {
  const { skipRedirect, ...fetchInit } = init;
  const apiUrl = getApiUrl();
  const url = path.startsWith('http') ? path : `${apiUrl}${path}`;

  const token = await getValidAccessToken(skipRedirect);

  const doRequest = (access: string | null) => {
    const headers = new Headers(fetchInit.headers);

    if (access) {
      headers.set('Authorization', `Bearer ${access}`);
    }

    const body = (fetchInit as RequestInit).body;
    if (body && !(body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    return fetch(url, {
      ...fetchInit,
      credentials: 'include',
      headers,
    });
  };

  let res = await doRequest(token);

  /** PL: Przy błędzie 401 próbujemy odświeżyć token i ponowić żądanie (o ile to nie było od razu na guestcie). */
  if (res.status === 401 && token) {
    clearAccessToken();
    const fresh = await getValidAccessToken(skipRedirect);
    if (fresh) {
      res = await doRequest(fresh);
    }
  }

  return res;
}

type CurrentUser = {
  username: string;
  email?: string;
};

/**
 * PL: Pobiera dane aktualnie zalogowanego użytkownika z API.
 * EN: Fetches currently logged-in user data from the API.
 */
export async function fetchCurrentUser(): Promise<CurrentUser> {
  const res = await apiFetch('/api/auth/me/', { method: 'GET' });

  if (!res.ok) {
    const body = await safeReadText(res);
    throw new Error(`ME_FETCH_FAILED:${res.status}:${body}`);
  }

  const data = (await res.json()) as Partial<CurrentUser>;
  if (!data?.username) throw new Error('ME_FETCH_EMPTY');

  return data as CurrentUser;
}

/** PL: Bezpiecznie odczytuje treść odpowiedzi bez rzucania błędów. EN: Safely reads response body without throwing errors. */
async function safeReadText(res: Response): Promise<string> {
  try {
    return (await res.text()).slice(0, 300);
  } catch {
    return '';
  }
}
