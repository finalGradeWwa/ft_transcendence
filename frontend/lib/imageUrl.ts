export function buildImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;

  if (path.startsWith('http')) {
    try {
      const u = new URL(path);
      if (u.pathname.startsWith('/media/')) return u.pathname;
    } catch { /* ignore */ }
    return path;
  }

  if (path.startsWith('/media/') || path.startsWith('/')) {
    return path;
  }

  const baseUrl = (
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
  ).replace(/\/$/, '');

  return `${baseUrl}/${path}`;
}
