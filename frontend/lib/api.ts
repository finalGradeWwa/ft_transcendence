/**
 * PL: Uniwersalny helper do zapytań API.
 * EN: Universal API helper.
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const token =
    typeof window !== 'undefined'
      ? sessionStorage.getItem('accessToken')
      : null;

  const headers = new Headers(options.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // PL: Nie ustawiamy Content-Type dla FormData (zdjęcia), Next zrobi to sam.
  // EN: Don't set Content-Type for FormData (images), Next will do it automatically.
  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  const config = {
    ...options,
    headers,
  };

  return fetch(`${apiUrl}${endpoint}`, config);
}
