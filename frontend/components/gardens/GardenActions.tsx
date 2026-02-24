'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { Icon } from '@/components/icons/ui/Icon';
import { apiFetch } from '@/lib/auth';

export function GardenActions({
  gardenId,
  username,
  isDefault,
  members,
  owner,
  tAddPlant,
  tAddGardener,
  tManageGarden,
}: {
  gardenId: string;
  username: string;
  isDefault: boolean;
  members: { id: number; username: string }[];
  owner: string;
  tAddPlant: string;
  tAddGardener: string;
  tManageGarden: string;
}) {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/auth/me/')
      .then(res => res.json())
      .then(data => {
        setCurrentUser(data.username);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return null;

  const isMember = members.some(m => m.username === currentUser);
  const isOwner = currentUser === owner;

  return (
    <div className="flex flex-wrap gap-4 items-center bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-primary-green/10 shadow-sm">
      {isMember && (
        <Link
          href={`/plants/create?gardenId=${gardenId}`}
          className="flex items-center gap-2 bg-primary-green text-white px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-primary-green/90 transition shadow-lg shadow-primary-green/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-header-main focus-visible:outline-offset-2"
        >
          <Icon name="plus" size={14} />
          {tAddPlant}
        </Link>
      )}
      {currentUser && (
        <Link
          href={`/profiles/${username}/gardens/${gardenId}/members`}
          className="flex items-center gap-2 bg-primary-green text-white px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-primary-green/90 transition shadow-lg shadow-primary-green/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-header-main focus-visible:outline-offset-2"
        >
          <Icon name="user-plus" size={14} />
          {tAddGardener}
        </Link>
      )}
      {!isDefault && isOwner && (
        <Link
          href={`/profiles/${username}/gardens/${gardenId}/edit`}
          className="flex items-center gap-2 bg-secondary-beige text-dark-text px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-secondary-beige/80 transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-header-main focus-visible:outline-offset-2"
        >
          <Icon name="edit" size={14} />
          {tManageGarden}
        </Link>
      )}
    </div>
  );
}
