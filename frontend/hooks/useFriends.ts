import { useCallback, useEffect, useState } from 'react';

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

interface UseFriendsOptions {
  userId?: number;
  fetchPendingRequests?: boolean;
}

interface UseFriendsReturn {
  friends: User[];
  pendingRequests: User[];
  isFriend: boolean;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  addFriend: (userId: number) => Promise<void>;
  removeFriend: (userId: number) => Promise<void>;
  acceptFriendRequest: (userId: number) => Promise<void>;
  rejectFriendRequest: (userId: number) => Promise<void>;
  checkIsFriend: (userId: number, targetId: number) => Promise<boolean>;
}

export const useFriends = (options: UseFriendsOptions | number = {}): UseFriendsReturn => {
  // Support both old and new API: useFriends(123) or useFriends({ userId: 123 })
  const opts: UseFriendsOptions = typeof options === 'number' ? { userId: options } : options;
  const { userId, fetchPendingRequests: shouldFetchPendingRequests = false } = opts;
  const [friends, setFriends] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<User[]>([]);
  const [loadingCount, setLoadingCount] = useState(0);
  const [fetchingCount, setFetchingCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const isFriend = false;
  const isLoading = loadingCount > 0;
  const isFetching = fetchingCount > 0;

  const beginLoading = useCallback(() => {
    setLoadingCount((current) => current + 1);
  }, []);

  const endLoading = useCallback(() => {
    setLoadingCount((current) => Math.max(0, current - 1));
  }, []);

  const beginFetching = useCallback(() => {
    setFetchingCount((current) => current + 1);
  }, []);

  const endFetching = useCallback(() => {
    setFetchingCount((current) => Math.max(0, current - 1));
  }, []);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Get auth token from localStorage
  const getAuthToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }, []);

  // Fetch friends list
  const fetchFriends = useCallback(async () => {
    if (!userId) return;

    beginFetching();
    try {
      const res = await fetch(`${API_URL}/users/${userId}/friends/`);
      if (!res.ok) throw new Error('Failed to fetch friends');
      const data = await res.json();
      setFriends(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      endFetching();
    }
  }, [userId, API_URL, beginFetching, endFetching]);

  // Fetch pending friend requests
  const fetchPendingRequests = useCallback(async () => {
    beginFetching();
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Not authenticated');
        return;
      }
      const res = await fetch(`${API_URL}/api/friend-requests/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch pending requests');
      const data = await res.json();
      setPendingRequests(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      endFetching();
    }
  }, [API_URL, getAuthToken, beginFetching, endFetching]);

  // Check if users are friends
  const checkIsFriend = useCallback(
    async (userId: number, targetId: number): Promise<boolean> => {
      beginLoading();
      try {
        const res = await fetch(
          `${API_URL}/users/${userId}/is-friend/?target_id=${targetId}`
        );
        if (!res.ok) throw new Error('Failed to check friend status');
      	const data = await res.json();
        setError(null);
        return data.is_friend;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return false;
      } finally {
        endLoading();
      }
    },
    [API_URL, beginLoading, endLoading]
  );

  // Add friend (follow user)
  const addFriend = useCallback(
    async (targetUserId: number) => {
      beginLoading();
      try {
        const token = getAuthToken();
        if (!token) {
          setError('Not authenticated');
          throw new Error('Not authenticated');
        }
        const res = await fetch(`${API_URL}/users/${targetUserId}/follow/`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) throw new Error('Failed to add friend');
        setError(null);
        if (userId) await fetchFriends();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        throw err;
      } finally {
        endLoading();
      }
    },
    [API_URL, getAuthToken, userId, fetchFriends, beginLoading, endLoading]
  );

  // Remove friend (removes both follow directions)
  const removeFriend = useCallback(
    async (targetUserId: number) => {
      beginLoading();
      try {
        const token = getAuthToken();
        if (!token) {
          setError('Not authenticated');
          throw new Error('Not authenticated');
        }
        const res = await fetch(`${API_URL}/users/${targetUserId}/unfriend/`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) throw new Error('Failed to remove friend');
        setError(null);
        if (userId) await fetchFriends();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        throw err;
      } finally {
        endLoading();
      }
    },
    [API_URL, getAuthToken, userId, fetchFriends, beginLoading, endLoading]
  );

  // Accept friend request (follow them back)
  const acceptFriendRequest = useCallback(
    async (targetUserId: number) => {
      beginLoading();
      try {
        const token = getAuthToken();
        if (!token) {
          setError('Not authenticated');
          throw new Error('Not authenticated');
        }
        const res = await fetch(`${API_URL}/users/${targetUserId}/follow/`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) throw new Error('Failed to accept friend request');
        setError(null);
        await fetchPendingRequests();
        if (userId) await fetchFriends();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        throw err;
      } finally {
        endLoading();
      }
    },
    [API_URL, getAuthToken, fetchPendingRequests, userId, fetchFriends, beginLoading, endLoading]
  );

  // Reject friend request (block/ignore)
  const rejectFriendRequest = useCallback(
    async (targetUserId: number) => {
      beginLoading();
      try {
        const token = getAuthToken();
        if (!token) {
          setError('Not authenticated');
          throw new Error('Not authenticated');
        }
        const res = await fetch(`${API_URL}/users/${targetUserId}/reject/`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) throw new Error('Failed to reject friend request');
        setError(null);
        await fetchPendingRequests();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        throw err;
      } finally {
        endLoading();
      }
    },
    [API_URL, getAuthToken, fetchPendingRequests, beginLoading, endLoading]
  );

  // Initial fetch
  useEffect(() => {
    if (userId) {
      fetchFriends();
    }
    if (shouldFetchPendingRequests) {
      fetchPendingRequests();
    }
  }, [userId, shouldFetchPendingRequests, fetchFriends, fetchPendingRequests]);

  return {
    friends,
    pendingRequests,
    isFriend,
    isLoading,
    isFetching,
    error,
    addFriend,
    removeFriend,
    acceptFriendRequest,
    rejectFriendRequest,
    checkIsFriend,
  };
};
