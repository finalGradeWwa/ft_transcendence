'use client';

/**
 * PL: Główny komponent logiczny profilu użytkownika (Client Component).
 * Zarządza paginacją pinów oraz weryfikacją uprawnień właściciela.
 * EN: Main logical component for the user profile (Client Component).
 * Manages pin pagination, and owner permission verification.
 */

import { useState, useEffect, useRef } from 'react';
import { UserProfileProps, ProfileContent } from './UserProfileComponents';

export default function UserProfileClient({
  user: initialUser,
  currentLoggedUser,
  initialFriendStatus,
}: UserProfileProps) {
  const [pins, setPins] = useState<any[]>(initialUser?.pins || []);

  /** PL: Stan bieżącej strony w galerii pinów | EN: Current page state in the pins gallery */
  const [currentPage, setCurrentPage] = useState(1);

  /** PL: Czy zalogowany użytkownik jest właścicielem profilu | EN: Is the logged-in user the profile owner */
  const isOwnProfile = !!(
    currentLoggedUser &&
    initialUser &&
    currentLoggedUser === initialUser.username
  );

  const totalPages = Math.ceil(pins.length / 4) || 1;
  const safePage = currentPage > totalPages ? totalPages : currentPage;
  const pinsRef = useRef<HTMLDivElement | null>(null);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    if (pinsRef.current) {
      pinsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [safePage]);

  return (
    <ProfileContent
      user={initialUser}
      isOwnProfile={isOwnProfile}
      currentPage={safePage}
      setCurrentPage={handlePageChange}
      pins={pins}
      totalPages={totalPages}
      currentLoggedUser={currentLoggedUser}
      initialFriendStatus={initialFriendStatus ?? null}
      onDeletedPin={id => setPins(prev => prev.filter(p => p.id !== id))}
      pinsRef={pinsRef}
    />
  );
}
