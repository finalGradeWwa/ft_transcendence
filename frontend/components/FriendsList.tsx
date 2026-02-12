import React, { useState } from 'react';
import { useFriends } from '@/hooks/useFriends';

interface FriendsListProps {
  userId?: number;
  onFriendRemoved?: (userId: number) => void;
}

export const FriendsList: React.FC<FriendsListProps> = ({
  userId,
  onFriendRemoved,
}) => {
  const { friends, isLoading, error, removeFriend } = useFriends(userId);
  const [removing, setRemoving] = useState<number | null>(null);

  const handleRemove = async (friendId: number) => {
    try {
      setRemoving(friendId);
      await removeFriend(friendId);
      onFriendRemoved?.(friendId);
    } catch (err) {
      console.error('Failed to remove friend:', err);
    } finally {
      setRemoving(null);
    }
  };

  if (isLoading) {
    return <div className="text-center text-gray-500">Loading friends...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (friends.length === 0) {
    return <div className="text-center text-gray-500">No friends yet</div>;
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-lg mb-4">Friends ({friends.length})</h3>
      {friends.map((friend) => (
        <div
          key={friend.id}
          className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300"
        >
          <div className="flex-1">
            <p className="font-medium text-gray-900">
              {friend.first_name} {friend.last_name}
            </p>
            <p className="text-sm text-gray-600">@{friend.username}</p>
          </div>
          <button
            onClick={() => handleRemove(friend.id)}
            disabled={removing === friend.id}
            className="px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
          >
            {removing === friend.id ? 'Removing...' : 'Remove'}
          </button>
        </div>
      ))}
    </div>
  );
};

interface FriendRequestsProps {
  onRequestHandled?: () => void;
}

export const FriendRequests: React.FC<FriendRequestsProps> = ({
  onRequestHandled,
}) => {
  const { pendingRequests, isLoading, error, acceptFriendRequest, rejectFriendRequest } =
   useFriends({ fetchPendingRequests: true });
  const [handling, setHandling] = useState<{ id: number; action: 'accept' | 'reject' } | null>(
    null
  );

  const handleAccept = async (userId: number) => {
    try {
      setHandling({ id: userId, action: 'accept' });
      await acceptFriendRequest(userId);
      onRequestHandled?.();
    } catch (err) {
      console.error('Failed to accept request:', err);
    } finally {
      setHandling(null);
    }
  };

  const handleReject = async (userId: number) => {
    try {
      setHandling({ id: userId, action: 'reject' });
      await rejectFriendRequest(userId);
      onRequestHandled?.();
    } catch (err) {
      console.error('Failed to reject request:', err);
    } finally {
      setHandling(null);
    }
  };

  if (isLoading) {
    return <div className="text-center text-gray-500">Loading requests...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (pendingRequests.length === 0) {
    return <div className="text-center text-gray-500">No pending friend requests</div>;
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-lg mb-4">Friend Requests ({pendingRequests.length})</h3>
      {pendingRequests.map((user) => (
        <div
          key={user.id}
          className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
        >
          <div className="flex-1">
            <p className="font-medium text-gray-900">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-sm text-gray-600">@{user.username}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleAccept(user.id)}
              disabled={handling?.id === user.id}
              className="px-3 py-1 text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 rounded transition disabled:opacity-50"
            >
              {handling?.id === user.id && handling.action === 'accept' ? 'Accepting...' : 'Accept'}
            </button>
            <button
              onClick={() => handleReject(user.id)}
              disabled={handling?.id === user.id}
              className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded transition disabled:opacity-50"
            >
              {handling?.id === user.id && handling.action === 'reject' ? 'Rejecting...' : 'Reject'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

interface AddFriendButtonProps {
  userId: number;
  onFriendAdded?: () => void;
}

export const AddFriendButton: React.FC<AddFriendButtonProps> = ({ userId, onFriendAdded }) => {
  const { addFriend } = useFriends();
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    try {
      setAdding(true);
      await addFriend(userId);
      setError(null);
      onFriendAdded?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add friend');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleAdd}
        disabled={adding}
        className="px-4 py-2 bg-blue-500 text-white font-medium rounded hover:bg-blue-600 transition disabled:opacity-50"
      >
        {adding ? 'Adding...' : 'Add Friend'}
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};
