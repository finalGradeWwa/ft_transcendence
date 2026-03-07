'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { apiFetch, getValidAccessToken } from '@/lib/auth';

// same as models.py
type User = {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  isOnline?: boolean;
};

type Message = {
  id: number;
  sender: User;
  recipient: User;
  content: string;
  timestamp: string;
  is_read: boolean;
};

type Me = {
  id: number;
  username: string;
};

type ConversationResponse = {
  other_user: User;
  messages: Message[];
};

type StatusUpdatePayload = {
  type: 'status_update';
  user_id: number;
  is_online: boolean;
};

export default function ChatPage() {
  const t = useTranslations('ChatPage');
  const locale = useLocale();
  const websocketRef = useRef<WebSocket | null>(null);
  const selectedFriendRef = useRef<User | null>(null);

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [friends, setFriends] = useState<User[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSocketReady, setIsSocketReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // State to track the current input field value
  const [inputValue, setInputValue] = useState('');

  // Scrolls the chat to the bottom to show the latest message
  //-----
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  //-----

  useEffect(() => {
    selectedFriendRef.current = selectedFriend;
  }, [selectedFriend]);

  const buildWebSocketUrl = (token: string) => {
    const wsBase = (
      process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:8000'
    ).replace(/\/$/, '');
    const basePath = wsBase.endsWith('/ws')
      ? `${wsBase}/chat/`
      : `${wsBase}/ws/chat/`;
    return `${basePath}?token=${encodeURIComponent(token)}`;
  };

  useEffect(() => {
    const loadFriends = async () => {
      setIsLoadingFriends(true);
      setErrorMessage(null);

      try {
        const meRes = await apiFetch('/api/auth/me/', { method: 'GET' });
        if (!meRes.ok) {
          throw new Error(`ME_FETCH_FAILED:${meRes.status}`);
        }

        const me = (await meRes.json()) as Me;
        setCurrentUserId(me.id);

        const followingRes = await apiFetch(`/api/friends/`, {
          method: 'GET',
        });
        if (!followingRes.ok) {
          throw new Error(`FRIENDS_FETCH_FAILED:${followingRes.status}`);
        }
        const following = (await followingRes.json()) as Array<
          User & { is_online?: boolean }
        >;

        const mapped = following.map(f => ({ ...f, isOnline: f.is_online ?? false }));
        setFriends(mapped);

        if (following.length > 0) {
          setSelectedFriend(prev => {
            if (prev && following.some(friend => friend.id === prev.id)) {
              return prev;
            }
            return following[0];
          });
        } else {
          setSelectedFriend(null);
        }
      } catch (error) {
        console.error('Failed to load friends list', error);
        setErrorMessage(t('friendsLoadError'));
      } finally {
        setIsLoadingFriends(false);
      }
    };

    loadFriends();
  }, [t]);

  useEffect(() => {
    let cancelled = false;

    const connectSocket = async () => {
      if (currentUserId === null) return;

      try {
        const accessToken = await getValidAccessToken();
        if (cancelled || !accessToken) return;

        const socketUrl = buildWebSocketUrl(accessToken);
        const socket = new WebSocket(socketUrl);
        websocketRef.current = socket;

        socket.onopen = () => {
          if (!cancelled) {
            setIsSocketReady(true);
          }
        };

        socket.onclose = () => {
          if (!cancelled) {
            setIsSocketReady(false);
          }
        };

        socket.onerror = () => {
          if (!cancelled) {
            setIsSocketReady(false);
            setErrorMessage(t('socketConnectionError'));
          }
        };

        socket.onmessage = event => {
          try {
            const payload = JSON.parse(event.data) as {
              type?: string;
              message?: Message;
              error?: string;
            };

            if (payload.error) {
              setErrorMessage(payload.error);
              setIsSending(false);
              return;
            }

            if (payload.type === 'message_sent' && payload.message) {
              setMessages(prevMessages => [
                ...prevMessages,
                payload.message as Message,
              ]);
              setIsSending(false);
              return;
            }

            if (payload.type === 'new_message' && payload.message) {
              const incomingMessage = payload.message as Message;
              const senderUsername = incomingMessage.sender?.username;
              const activeFriend = selectedFriendRef.current;

              if (activeFriend && senderUsername === activeFriend.username) {
                setMessages(prevMessages => [...prevMessages, incomingMessage]);
              }
              return;
            }

            if (payload.type === 'status_update') {
              const statusPayload = payload as StatusUpdatePayload;
              const user_id = typeof statusPayload.user_id === 'number' ? statusPayload.user_id : null;
              const is_online = Boolean(statusPayload.is_online);

              if (user_id !== null) {
                setFriends(prev =>
                  prev.map(f =>
                    f.id === user_id ? { ...f, isOnline: is_online } : f
                  )
                );

                if (selectedFriendRef.current?.id === user_id) {
                  setSelectedFriend(prev =>
                    prev ? { ...prev, isOnline: is_online } : prev
                  );
                }
              }
              return;
            }
          } catch (error) {
            console.error('Invalid websocket payload', error);
          }
        };
      } catch (error) {
        console.error('Failed to connect websocket', error);
        if (!cancelled) {
          setIsSocketReady(false);
          setErrorMessage(t('socketConnectionError'));
        }
      }
    };

    connectSocket();

    return () => {
      cancelled = true;
      setIsSocketReady(false);
      if (websocketRef.current) {
        websocketRef.current.close();
        websocketRef.current = null;
      }
    };
  }, [currentUserId, t]);

  useEffect(() => {
    const loadConversation = async () => {
      if (!selectedFriend) {
        setMessages([]);
        return;
      }

      setIsLoadingMessages(true);
      setErrorMessage(null);

      try {
        const conversationRes = await apiFetch(
          `/chat/chat/${encodeURIComponent(selectedFriend.username)}/`,
          { method: 'GET' }
        );

        if (!conversationRes.ok) {
          throw new Error(
            `CONVERSATION_FETCH_FAILED:${conversationRes.status}`
          );
        }

        const data = (await conversationRes.json()) as ConversationResponse;
        setMessages(data.messages ?? []);
      } catch (error) {
        console.error('Failed to load conversation', error);
        setMessages([]);
        setErrorMessage(t('conversationLoadError'));
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadConversation();
  }, [selectedFriend, t]);

  // Handles sending a new message when the form is submitted
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();

    // Ignore empty messages
    if (!inputValue.trim() || !selectedFriend || isSending) return;

    const messageContent = inputValue.trim();
    setInputValue('');
    setIsSending(true);
    setErrorMessage(null);

    try {
      const socket = websocketRef.current;
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: 'chat_message',
            message: messageContent,
            recipient_username: selectedFriend.username,
          })
        );
        return;
      }

      const sendRes = await apiFetch(
        `/chat/chat/${encodeURIComponent(selectedFriend.username)}/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: messageContent }),
        }
      );

      if (!sendRes.ok) {
        throw new Error(`SEND_MESSAGE_FAILED:${sendRes.status}`);
      }

      const createdMessage = (await sendRes.json()) as Message;
      setMessages(prevMessages => [...prevMessages, createdMessage]);
      setIsSending(false);
    } catch (error) {
      console.error('Failed to send message', error);
      setErrorMessage(t('messageSendError'));
      setInputValue(messageContent);
      setIsSending(false);
    } finally {
      // state is reset in websocket onmessage for successful send
    }
  };

  // Formats timestamp string into a readable time string (HH:MM)
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-900 via-beige-800 to-beige-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-secondary-beige backdrop-blur-sm rounded-lg shadow-xl border border-secondary-beige flex h-[600px] overflow-hidden">
          <aside
            aria-label={t('friendsTitle')}
            className="w-72 border-r border-primary-green/20 p-4 overflow-y-auto bg-black/5"
          >
            <h2 className="text-lg text-primary-green font-semibold mb-4">
              {t('friendsTitle')}
            </h2>

            {isLoadingFriends ? (
              <p className="text-sm text-gray-900 font-semibold">
                {t('loadingFriends')}
              </p>
            ) : friends.length === 0 ? (
              <p className="text-sm text-gray-900 font-semibold">
                {t('noFriends')}
              </p>
            ) : (
              <ul className="space-y-2">
                {friends.map(friend => {
                  const fullName =
                    `${friend.first_name ?? ''} ${friend.last_name ?? ''}`.trim();
                  const isSelected = selectedFriend?.id === friend.id;

                  return (
                    <li key={friend.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedFriend(friend)}
                        className={`w-full rounded-lg px-3 py-2 text-left transition-colors ${
                          isSelected
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-700 text-gray-100 hover:bg-gray-600'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <p className="font-medium">{friend.username}</p>
                          {friend.isOnline != null && (
                            <span
                              className={`text-xs font-semibold ml-2 ${
                                friend.isOnline ? 'text-green-400' : 'text-gray-400'
                              }`}
                            >
                              {friend.isOnline ? t('online') : t('offline')}
                            </span>
                          )}
                        </div>
                        {fullName && (
                          <p className="text-xs opacity-80">{fullName}</p>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </aside>

          <div className="flex-1 flex flex-col">
            {selectedFriend && (
              <div className="border-b border-gray-700 px-6 py-3 bg-black/20">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-white">
                    {selectedFriend.username}
                  </p>
                  {selectedFriend.isOnline != null && (
                    <span
                      className={`text-xs font-semibold ml-2 ${
                        selectedFriend.isOnline ? 'text-green-400' : 'text-gray-400'
                      }`}
                    >
                      {selectedFriend.isOnline ? t('online') : t('offline')}
                    </span>
                  )}
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="px-6 pt-4">
                <p className="text-sm text-red-300">{errorMessage}</p>
              </div>
            )}

            {/* Messages Area */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
              {!selectedFriend ? (
                <p className="text-gray-900 font-semibold text-sm">
                  {t('selectFriend')}
                </p>
              ) : isLoadingMessages ? (
                <p className="text-gray-300 text-sm">{t('loadingMessages')}</p>
              ) : (
                messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender.id === currentUserId
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-4 ${
                        message.sender.id === currentUserId
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 text-gray-100'
                      }`}
                    >
                      <p className="text-xs font-semibold mb-1 opacity-80">
                        {message.sender.username}
                      </p>
                      <p className="text-sm md:text-base">{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-700 p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  maxLength={600}
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder={t('typeMessage')}
                  disabled={!selectedFriend || isSending}
                  className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-3 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black focus-visible:ring-2 focus-visible:ring-white"
                />
                <button
                  type="submit"
                  disabled={!selectedFriend || isSending}
                  className="bg-primary-green hover:opacity-90 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black focus-visible:ring-2 focus-visible:ring-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('send')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
