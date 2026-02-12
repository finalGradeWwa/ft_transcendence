'use client';

/**
 * PL: Główny komponent logiczny profilu użytkownika (Client Component).
 * Zarządza stanem obserwowania, paginacją pinów oraz weryfikacją uprawnień właściciela.
 * * EN: Main logical component for the user profile (Client Component).
 * Manages following state, pin pagination, and owner permission verification.
 */

import { useState, useEffect } from 'react';
import { UserProfileProps, ProfileContent } from './UserProfileComponents';

export default function UserProfileClient({
  user,
  currentLoggedUser,
}: UserProfileProps) {
  /** PL: Stan bieżącej strony w galerii pinów | EN: Current page state in the pins gallery */
  const [currentPage, setCurrentPage] = useState(1);

  /** PL: Czy zalogowany użytkownik jest właścicielem profilu | EN: Is the logged-in user the profile owner */
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  /** PL: Czy zalogowany użytkownik obserwuje ten profil | EN: Does the logged-in user follow this profile */
  const [isFollowing, setIsFollowing] = useState(false);

  /** PL: Licznik obserwujących (zarządzany lokalnie    dla natychmiastowego UI) | EN: Followers count (managed locally for instant UI update) */
  const [followersCount, setFollowersCount] = useState(user?.followers || 0);

  /** PL: Stan ładowania akcji (follow/unfollow) | EN: Loading state for actions (follow/unfollow) */
  const [isActionLoading, setIsActionLoading] = useState(false);

  const pins = user?.pins || [];
  const totalPages = Math.ceil(pins.length / 4) || 1;
  const isLoggedIn = !!currentLoggedUser;

  /**
   * PL: Synchronizacja stanu profilu na podstawie zalogowanego użytkownika.
   * EN: Profile state synchronization based on the logged-in user.
   */
  useEffect(() => {
    setIsOwnProfile(
      !!(currentLoggedUser && user && currentLoggedUser === user.username)
    );
    setFollowersCount(user?.followers || 0);
  }, [user, currentLoggedUser]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  /**
   * PL: Obsługuje proces obserwowania lub przestawania obserwowania użytkownika.
   * EN: Handles the process of following or unfollowing a user.
   */
  const handleFollowAction = async () => {
    if (!user || isActionLoading || !isLoggedIn) return;

    const currentFollowing = isFollowing;
    const action = currentFollowing ? 'unfollow' : 'follow';
    const url = `${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}/${action}/`;

    setIsActionLoading(true);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({}),
      });

      if (response.ok) {
        const data = await response.json().catch(() => null);
        if (
          data &&
          typeof data.isFollowing === 'boolean' &&
          typeof data.followersCount === 'number'
        ) {
          setIsFollowing(data.isFollowing);
          setFollowersCount(data.followersCount);
        } else {
          setIsFollowing(!currentFollowing);
          setFollowersCount(prev => (currentFollowing ? prev - 1 : prev + 1));
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <ProfileContent
      user={user}
      isOwnProfile={isOwnProfile}
      isFollowing={isFollowing}
      handleFollowAction={handleFollowAction}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      pins={pins}
      totalPages={totalPages}
      followersCount={followersCount}
      isActionLoading={isActionLoading}
      isLoggedIn={isLoggedIn}
    />
  );
}
