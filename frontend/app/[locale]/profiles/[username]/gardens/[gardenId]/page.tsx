import { GardenDetailClient } from './GardenDetailClient';

export default async function GardenPage({
  params,
}: {
  params: Promise<{ username: string; gardenId: string }>;
}) {
  const { username, gardenId } = await params;

  return <GardenDetailClient gardenId={gardenId} username={username} />;
}
