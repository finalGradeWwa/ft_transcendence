'use client';

/**
 * PL: Komponent kontenera modalu powiadomień. Obsługuje warstwę prezentacji (overlay),
 * interakcję z użytkownikiem oraz logikę dostępności (fokus i klawisz Escape).
 * EN: Notifications modal container component. Handles the presentation layer (overlay),
 * user interaction, and accessibility logic (focus and Escape key).
 */

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/icons/ui/Icon';
import { apiFetch } from '@/lib/auth';

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  avatar?: string;
}

interface NotificationsModalProps {
  isVisible: boolean;
  onClose: () => void;
}

/**
 * PL: Komponent zarządzający widocznością i interakcjami modalu powiadomień.
 * EN: Component managing the visibility and interactions of the notifications modal.
 */
const NotificationsModal = ({
  isVisible,
  onClose,
}: NotificationsModalProps) => {
  const t = useTranslations('NotificationsModal');

  const router = useRouter();

  // State storing friend requests (User objects).
  const [requests, setRequests] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchRequests = async () => {
      if (!isVisible) {
        setRequests([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Request to backend
        const response = await apiFetch('/api/friend-requests/', {
          method: 'GET',
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Network response was not ok (${response.status})`);
        }

        const data = (await response.json()) as User[];
        setRequests(data);
      } catch (error) {
        if ((error as any)?.name !== 'AbortError') {
          console.error('Fetch requests error:', error);
          setRequests([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchRequests();
    return () => controller.abort();
  }, [isVisible]);

  const handleAccept = async (userId: number) => {
    setProcessingId(userId); // Disable buttons for this user while processing
    try {
      const response = await apiFetch(`/users/${userId}/accept/`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to accept request');
      }

      // Remove from list after successful accept
      setRequests(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error accepting friend request:', error);
    } finally {
      setProcessingId(null); // Enable buttons again after processing
    }
  };

  const handleReject = async (userId: number) => {
    setProcessingId(userId); // Disable buttons for this user while processing
    try {
      const response = await apiFetch(`/users/${userId}/reject/`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to reject request');
      }

      // Remove from list after successful rejection
      setRequests(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    } finally {
      setProcessingId(null); // Enable buttons again after processing
    }
  };

  const handleUserClick = (username: string) => {
    router.push(`/profiles/${username}`);
  };

  useEffect(() => {
    if (!isVisible) {
      setRequests([]);
    }
  }, [isVisible]);

  /**
   * PL: Efekt obsługujący nasłuchiwanie klawisza Escape.
   * EN: Effect handling Escape key listening.
   */
  useEffect(() => {
    if (!isVisible) return;

    /** PL: Funkcja zamykająca modal po naciśnięciu ESC. EN: Function closing the modal on ESC press. */
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      /** PL: Półprzezroczyste tło z efektem rozmycia. EN: Semi-transparent background with blur effect. */
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <section
        /** PL: Zatrzymanie bąbelkowania zdarzenia, aby kliknięcie wewnątrz modalu go nie zamykało.
            EN: Stopping event bubbling so clicking inside the modal doesn't close it. */
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md text-dark-text"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notifications-modal-title"
      >
        <div className="bg-secondary-beige rounded-lg shadow-xl border border-black/10">
          {/** Modal header with title and close button. */}
          <header className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2
              id="notifications-modal-title"
              className="text-xl font-semibold text-dark-text"
            >
              {t('title')}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-green"
              aria-label={t('close')}
            >
              <Icon name="close" size={20} />
            </button>
          </header>

          {/** Scrollable results container - displays requests, no requests, or loading. */}
          <nav className="max-h-96 overflow-y-auto">
            {loading && (
              <div className="px-4 pb-4 pt-8 text-center text-gray-500">
                <p>{t('loading')}</p>
              </div>
            )}

            {/** Display friend requests list. */}
            {!loading && requests.length > 0 && (
              <div className="px-4 pb-4 pt-4">
                {/** Mapping requests to clickable list items. */}
                <ul className="space-y-2">
                  {requests.map(user => (
                    <li key={user.id}>
                      <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors">
                        <button
                          onClick={() => handleUserClick(user.username)}
                          className="flex items-center gap-3 flex-1 text-left focus:outline-none focus:ring-2 focus:ring-primary-green rounded"
                        >
                          <div className="w-10 h-10 bg-primary-green rounded-full flex items-center justify-center text-white font-bold shrink-0 overflow-hidden">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={`${user.username}'s avatar`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              user.username[0].toUpperCase() // probablly not needed when everything will be correct
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-gray-900 truncate">
                              {user.username}
                            </span>
                            {/* Displays first_name and last_name if exists */}
                            {(user.first_name || user.last_name) && (
                              <span className="text-xs text-gray-500 truncate">
                                {user.first_name} {user.last_name}
                              </span>
                            )}
                          </div>
                        </button>

                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleAccept(user.id)}
                            disabled={processingId === user.id}
                            className="p-2 bg-primary-green text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-green"
                            aria-label={t('accept')}
                          >
                            <Icon name="check" size={16} />
                          </button>
                          <button
                            onClick={() => handleReject(user.id)}
                            disabled={processingId === user.id}
                            className="p-2 bg-red-400 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-green"
                            aria-label={t('reject')}
                          >
                            <Icon name="close" size={16} />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/** No requests message. */}
            {!loading && requests.length === 0 && (
              <div className="px-4 pb-4 pt-8 text-center text-dark-text">
                <Icon
                  name="bell"
                  size={32}
                  className="mx-auto mb-2 text-primary-green"
                />
                <p>{t('noRequests')}</p>
              </div>
            )}
          </nav>
        </div>
      </section>
    </div>
  );
};

export default NotificationsModal;
