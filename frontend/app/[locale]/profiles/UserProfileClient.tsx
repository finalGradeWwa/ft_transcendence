'use client';

/**
 * PL: Główny komponent logiczny profilu użytkownika (Client Component).
 * Zarządza paginacją pinów oraz weryfikacją uprawnień właściciela.
 * EN: Main logical component for the user profile (Client Component).
 * Manages pin pagination, and owner permission verification.
 */

import { useState, useEffect, useRef } from 'react';
import { UserProfileProps, ProfileContent } from './UserProfileComponents';
import { apiFetch } from '@/lib/auth';

export default function UserProfileClient({
  user,
  currentLoggedUser: serverUser,
}: UserProfileProps) {
  /** PL: Aktualnie zalogowany użytkownik | EN: Currently logged in user */
  const [currentLoggedUser, setCurrentLoggedUser] = useState<string | null>(
    serverUser || null
  );

  const [pins, setPins] = useState<any[]>(user?.pins || []);

  /** PL: Stan bieżącej strony w galerii pinów | EN: Current page state in the pins gallery */
  const [currentPage, setCurrentPage] = useState(1);

  /** PL: Czy zalogowany użytkownik jest właścicielem profilu | EN: Is the logged-in user the profile owner */
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  const totalPages = Math.ceil(pins.length / 4) || 1;
  const isLoggedIn = !!currentLoggedUser;
  const pinsRef = useRef<HTMLDivElement | null>(null);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    if (pinsRef.current) {
      pinsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentPage]);

  /**
   * PL: Pobiera aktualnie zalogowanego użytkownika z sessionStorage.
   * EN: Fetches the currently logged in user from sessionStorage.
   */
  useEffect(() => {
    apiFetch('/api/auth/me/')
      .then(res => res.json())
      .then(data => setCurrentLoggedUser(data.username))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user?.id || !currentLoggedUser) return;
    apiFetch(`/api/pins/?owner=${user.id}`)
      .then(res => res.json())
      .then(data => setPins(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [user?.id, currentLoggedUser]);

  /**
   * PL: Synchronizacja stanu profilu na podstawie zalogowanego użytkownika.
   * EN: Profile state synchronization based on the logged-in user.
   */
  useEffect(() => {
    setIsOwnProfile(
      !!(currentLoggedUser && user && currentLoggedUser === user.username)
    );
  }, [user, currentLoggedUser]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  return (
    <ProfileContent
      user={user}
      isOwnProfile={isOwnProfile}
      currentPage={currentPage}
      setCurrentPage={handlePageChange}
      pins={pins}
      totalPages={totalPages}
      currentLoggedUser={currentLoggedUser}
      onDeletedPin={id => setPins(prev => prev.filter(p => p.id !== id))}
      pinsRef={pinsRef}
    />
  );
}
