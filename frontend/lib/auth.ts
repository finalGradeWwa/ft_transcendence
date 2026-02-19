const DEFAULT_API_URL = 'http://localhost:8000';
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

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearAccessToken() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}

/**
 * PL: Wylogowanie użytkownika — czyści lokalne dane sesji i wywołuje endpoint backendu.
 * EN: User logout — clears local session data and calls backend endpoint.
 */
export async function logout(): Promise<void> {
  clearAccessToken();
  if (typeof window !== 'undefined') {
    localStorage.removeItem('username');
  }

  await fetch(`${getApiUrl()}/api/auth/logout/`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  }).catch(() => {});
}

let refreshPromise: Promise<string> | null = null;

type RefreshResponse = { access?: string };

/**
 * PL: Odświeża token dostępu używając refresh_token z cookie.
 * W przypadku błędu wylogowuje użytkownika i przekierowuje na stronę logowania.
 * EN: Refreshes the access token using refresh_token from cookie.
 * On failure, logs out the user and redirects to the login page.
 */
export async function refreshAccessToken(): Promise<string> {
  const apiUrl = getApiUrl();

  const res = await fetch(`${apiUrl}/api/auth/token/refresh/`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    await logout();
    if (typeof window !== 'undefined') {
      const locale = window.location.pathname.split('/')[1] || 'pl';
      window.location.href = `/${locale}?showLogin=true`;
    }
    return new Promise(() => {});
  }

  const data = (await res.json()) as RefreshResponse;
  if (!data?.access) throw new Error('REFRESH_EMPTY');

  setAccessToken(data.access);

  return data.access;
}

/**
 * PL: Zwraca ważny token dostępu — z sessionStorage lub przez odświeżenie.
 * Deduplicuje równoległe wywołania refresh za pomocą współdzielonego Promise.
 * EN: Returns a valid access token — from sessionStorage or by refreshing.
 * Deduplicates parallel refresh calls using a shared Promise.
 */
export async function getValidAccessToken(): Promise<string> {
  const existing = getAccessToken();
  if (existing) return existing;

  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
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
  init: RequestInit = {}
): Promise<Response> {
  const apiUrl = getApiUrl();
  const url = path.startsWith('http') ? path : `${apiUrl}${path}`;

  const token = await getValidAccessToken();

  const doRequest = (access: string) => {
    const headers = new Headers(init.headers);

    headers.set('Authorization', `Bearer ${access}`);

    const body = (init as RequestInit).body;
    if (body && !(body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    return fetch(url, {
      ...init,
      credentials: 'include',
      headers,
    });
  };

  let res = await doRequest(token);

  /** PL: Przy błędzie 401 próbujemy odświeżyć token i ponowić żądanie. EN: On 401 error, try to refresh the token and retry the request. */
  if (res.status === 401) {
    clearAccessToken();
    const fresh = await getValidAccessToken();
    res = await doRequest(fresh);
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
