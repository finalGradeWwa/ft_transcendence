const DEFAULT_API_URL = 'http://localhost:8000';
const ACCESS_TOKEN_KEY = 'accessToken';

export function getApiUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(
    /\/$/,
    ''
  );
}

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

let refreshPromise: Promise<string> | null = null;

type RefreshResponse = { access?: string };

export async function refreshAccessToken(): Promise<string> {
  const apiUrl = getApiUrl();

  const res = await fetch(`${apiUrl}/api/auth/token/refresh/`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const body = await safeReadText(res);
    throw new Error(`REFRESH_FAILED:${res.status}:${body}`);
  }

  const data = (await res.json()) as RefreshResponse;
  if (!data?.access) throw new Error('REFRESH_EMPTY');

  setAccessToken(data.access);

  return data.access;
}

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

export async function apiFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const apiUrl = getApiUrl();
  const url = path.startsWith('http') ? path : `${apiUrl}${path}`;

  const token = await getValidAccessToken();

  const doRequest = (access: string) => {
    const headers = new Headers(init.headers);

    // Always attach the access token
    headers.set('Authorization', `Bearer ${access}`);

    // If body is present and it's not FormData, default to JSON content type
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

async function safeReadText(res: Response): Promise<string> {
  try {
    return (await res.text()).slice(0, 300);
  } catch {
    return '';
  }
}
