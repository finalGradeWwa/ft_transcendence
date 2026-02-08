export async function refreshAccessToken(): Promise<string> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  const res = await fetch(`${apiUrl}/api/auth/token/refresh/`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) throw new Error("REFRESH_FAILED");

  const data = (await res.json()) as { access: string };
  if (!data?.access) throw new Error("REFRESH_EMPTY");

  return data.access;
}

type CurrentUser = {
  username: string;
  email?: string;
};

export async function fetchCurrentUser(accessToken: string): Promise<CurrentUser> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  const res = await fetch(`${apiUrl}/api/auth/me/`, {
    method: "GET",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) throw new Error("ME_FETCH_FAILED");

  const data = (await res.json()) as CurrentUser;
  if (!data?.username) throw new Error("ME_FETCH_EMPTY");

  return data;
}
