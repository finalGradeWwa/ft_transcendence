export function buildImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const baseUrl = (
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
  ).replace(/\/$/, '');
  if (path.startsWith('http')) return path;
  return `${baseUrl}${path}`;
}
