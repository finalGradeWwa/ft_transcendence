import ProfilePageClient from './ProfilePageClient';

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  return <ProfilePageClient username={username} />;
}
