import { serverFetch } from '@/lib/serverAuth';
import EditProfileClientPage from './EditProfileClientPage';

type EditableUserData = {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  avatar_photo: string;
};

export default async function EditProfilePage({
  params,
}: {
  params: Promise<{ locale: string; username: string }>;
}) {
  const { locale, username } = await params;

  let initialUserData: EditableUserData = {
    first_name: '',
    last_name: '',
    username,
    email: '',
    avatar_photo: '',
  };

  try {
    const response = await serverFetch('/api/auth/me/', { method: 'GET' });
    if (response.ok) {
      const data = (await response.json()) as Partial<EditableUserData>;
      initialUserData = {
        first_name: data.first_name ?? '',
        last_name: data.last_name ?? '',
        username: data.username ?? username,
        email: data.email ?? '',
        avatar_photo: data.avatar_photo ?? '',
      };
    }
  } catch {
    initialUserData = {
      first_name: '',
      last_name: '',
      username,
      email: '',
      avatar_photo: '',
    };
  }

  return (
    <EditProfileClientPage
      locale={locale}
      initialUserData={initialUserData}
    />
  );
}
