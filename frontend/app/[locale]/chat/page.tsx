'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { useTranslations, useLocale } from 'next-intl';
//class UserFriendsListAPIView(APIView):

// same as models.py
type User = {
  id: number;
  username: string;
};

type Friend = {
  id: number;
  username: string;
  isOnline: boolean;
};

type Message = {
  id: number;
  sender: User;
  recipient: User;
  content: string;
  timestamp: string;
  is_read: boolean;
};

export default function ChatPage() {
  const t = useTranslations('ChatPage');
  const locale = useLocale();

  // mock data
  const currentUser: User = { id: 1, username: 'currentUser' };
  const otherUser: User = { id: 2, username: 'otherUser' };

  // mock friends list
  const [friends, setFriends] = useState<Friend[]>([
    { id: 2, username: 'otherUser', isOnline: true },
    { id: 3, username: 'Andrzej', isOnline: true },
    { id: 4, username: 'Marek', isOnline: false },
    { id: 5, username: 'Epipremniara', isOnline: true },
    { id: 6, username: 'bazyl', isOnline: false },
  ]);

  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(friends[0] || null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: otherUser,
      recipient: currentUser,
      content: 'Hello! Welcome to the chat.',
      timestamp: '2026-02-18T12:00:00.000Z',
      is_read: true,
    },
  ]);

  // State to track the current input field value
  const [inputValue, setInputValue] = useState('');

  // WebSocket connection
  const wsRef = useRef<WebSocket | null>(null);

  // WebSocket Setup
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/chat/');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received:', data);

      // Handle message or status update
      if (data.type === 'new_message') {
        // Add new message to the list
        const newMessage: Message = {
          id: data.id,
          sender: data.sender,
          recipient: data.recipient,
          content: data.content,
          timestamp: data.timestamp,
          is_read: false, // idk if we want it to stay
        };
        setMessages((prev) => [...prev, newMessage]);
      } else if (data.type === 'status_update') {
        // Update friend's online status
        setFriends((prev) =>
          prev.map((f) =>
            f.id === data.user_id ? { ...f, isOnline: data.is_online } : f
          )
        );
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    // Cleanup: close WebSocket when component unmounts
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  // Scrolls the chat to the bottom to show the latest message
  //-----
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    const container = messagesEndRef.current?.parentElement;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  //-----

  // Handles sending a new message when the form is submitted
  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();

    // Ignore empty messages
    if (!inputValue.trim() || !selectedFriend) return;

    // Capture current input value and clear the input field
    const messageContent = inputValue;
    setInputValue('');

    // Send message via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'send_message',
          recipient_id: selectedFriend.id,
          content: messageContent,
        })
      );
    } else {
      console.error('WebSocket is not connected');
    }

    // Optimistically add message to UI (will be confirmed by server)
    setMessages((prevMessages) => {
      const nextId =
        prevMessages.length > 0
          ? prevMessages[prevMessages.length - 1].id + 1
          : 1;

      const newMessage: Message = {
        id: nextId,
        sender: currentUser,
        recipient: { id: selectedFriend.id, username: selectedFriend.username },
        content: messageContent,
        timestamp: new Date().toISOString(),
        is_read: false,
      };

      return [...prevMessages, newMessage];
    });
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
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex gap-4 h-[600px]">

          {/* Friends List Sidebar */}
          <div className="w-80 bg-secondary-beige backdrop-blur-sm rounded-lg shadow-xl border border-secondary-beige flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-gray-800">Friends</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className={`p-4 border-b border-gray-700 hover:bg-gray-700/50 transition-colors ${
                    selectedFriend?.id === friend.id ? 'bg-gray-700/70' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center font-bold">
                          {friend.username[0].toUpperCase()}
						  {/* to be changed to avatar */}
                        </div>
                        <div
                          className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-secondary-beige ${
                            friend.isOnline ? 'bg-green-500' : 'bg-gray-500'
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{friend.username}</p>
                        <p className="text-xs text-gray-600">
                          {friend.isOnline ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedFriend(friend)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Message
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 bg-secondary-beige backdrop-blur-sm rounded-lg shadow-xl border border-secondary-beige flex flex-col">
            {selectedFriend && (
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center font-bold">
                      {selectedFriend.username[0].toUpperCase()}
                    </div>
                    <div
                      className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-secondary-beige ${
                        selectedFriend.isOnline ? 'bg-green-500' : 'bg-gray-500'
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-bold text-gray-700">{selectedFriend.username}</p>
                    <p className="text-xs text-gray-500">
                      {selectedFriend.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (

              <div
                key={message.id}
                className={`flex ${
                  message.sender.id === currentUser.id
				  ? 'justify-end'
				  : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-4 ${
                    message.sender.id === currentUser.id
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
            ))}
			<div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-700 p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t('typeMessage')}
                className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-600"
              />
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
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