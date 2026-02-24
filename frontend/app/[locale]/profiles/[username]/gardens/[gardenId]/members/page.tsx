'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/auth';
import { Icon } from '@/components/icons/ui/Icon';
import { Link } from '@/i18n/navigation';

export default function MembersPage({
  params,
}: {
  params: Promise<{ username: string; gardenId: string }>;
}) {
  const { username, gardenId } = use(params);
  const t = useTranslations('MembersPage');

  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [gardenOwner, setGardenOwner] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    apiFetch('/api/auth/me/')
      .then(res => res.json())
      .then(data => setCurrentUser(data.username))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!gardenId) return;
    apiFetch(`/api/garden/${gardenId}/`)
      .then(res => res.json())
      .then(data => {
        setMembers(data.members || []);
        setGardenOwner(data.owner || null);
      })
      .catch(() => {});
  }, [gardenId, message]);

  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await apiFetch(
          `/users/search/?search=${encodeURIComponent(search)}`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const isOwner = currentUser === gardenOwner;

  const handleAdd = async (userId: number) => {
    try {
      const res = await apiFetch(`/api/garden/${gardenId}/add_user/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      if (res.ok) {
        setMessage(t('addSuccess'));
        setResults([]);
        setSearch('');
      }
    } catch {
      setMessage(t('addError'));
    }
  };

  const handleRemove = async (userId: number) => {
    if (
      !confirm(
        t('confirmRemove') ||
          'Czy na pewno chcesz usunąć tego użytkownika z ogrodu?'
      )
    )
      return;
    try {
      const res = await apiFetch(`/api/garden/${gardenId}/remove_user/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      if (res.ok || res.status === 204) {
        setMessage(t('removeSuccess'));
      }
    } catch {
      setMessage(t('removeError'));
    }
  };

  return (
    <div className="bg-main-gradient pb-20 pt-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href={`/profiles/${username}/gardens/${gardenId}`}
            className="bg-primary-green text-white font-black uppercase text-[10px] tracking-widest px-6 py-2.5 rounded-full shadow-xl hover:opacity-90 transition-all flex items-center gap-2 w-fit outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-[3px] focus:transition-none active:outline-none text-center max-w-full overflow-hidden"
          >
            <span>←</span>
            <span>{t('back')}</span>
          </Link>
        </div>

        <div className="bg-secondary-beige rounded-3xl shadow-2xl p-8 border border-primary-green/10">
          <h1 className="text-3xl font-black text-dark-text uppercase tracking-tighter mb-8">
            {t('title')}
          </h1>

          {message && (
            <div className="mb-6 p-3 font-bold text-primary-green text-center">
              {message}
            </div>
          )}

          {isOwner && (
            <>
              <input
                maxLength={100}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full bg-white border border-primary-green/20 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-green text-dark-text font-medium mb-6"
              />

              {(() => {
                const memberIds = new Set(members.map((m: any) => m.id));
                const filteredResults = results.filter(
                  (u: any) => !memberIds.has(u.id)
                );

                return (
                  filteredResults.length > 0 && (
                    <div className="space-y-2 mb-8">
                      {filteredResults.map((user: any) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-3 rounded-xl border border-primary-green"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 shrink-0">
                              {user.avatar_photo ? (
                                <img
                                  src={user.avatar_photo}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary-green/10 text-primary-green text-xs font-bold uppercase">
                                  {user.username.substring(0, 2)}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-dark-text">
                                {user.username}
                              </span>
                              {(user.first_name || user.last_name) && (
                                <span className="text-xs text-gray-500">
                                  {user.first_name} {user.last_name}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleAdd(user.id)}
                            className="flex items-center gap-1 bg-primary-green text-white px-4 py-2 rounded-lg font-bold uppercase text-[10px] tracking-widest hover:opacity-90 transition"
                          >
                            <Icon name="plus" size={12} />
                            {t('add')}
                          </button>
                        </div>
                      ))}
                    </div>
                  )
                );
              })()}
            </>
          )}

          {members.map((member: any) => {
            const avatarSrc = member.avatar_photo
              ? `http://localhost:8000${member.avatar_photo}`
              : null;

            return (
              <div
                key={member.id}
                className="flex items-center gap-3 bg-secondary-beige p-[2px] rounded-xl mt-1 "
              >
                <Link
                  href={`/profiles/${member.username}`}
                  className="flex items-center gap-3 flex-1 hover:opacity-80 transition outline-primary-green focus-visible:ring-2 focus-visible:ring-primary-green offset-2"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 shrink-0">
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary-green/10 text-primary-green text-xs font-bold uppercase">
                        {member.username.substring(0, 2)}
                      </div>
                    )}
                  </div>
                  <span className="font-bold text-dark-text">
                    {member.username}
                  </span>
                </Link>
                {isOwner && member.username !== gardenOwner && (
                  <button
                    onClick={() => handleRemove(member.id)}
                    className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg font-bold uppercase text-[10px] tracking-widest hover:opacity-85 transition outline-black focus-visible:outline-black focus-visible:outline-2 focus-visible:outline-offset-[3px]"
                  >
                    {t('remove')}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
