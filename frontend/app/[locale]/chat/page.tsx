'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { useTranslations, useLocale } from 'next-intl';


// same as models.py
type User = {
  id: number;
  username: string;
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

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: otherUser,
      recipient: currentUser,
      content: 'Hello! Welcome to the chat.',
      timestamp: new Date().toISOString(),
      is_read: true,
    },
  ]);

  // State to track the current input field value
  const [inputValue, setInputValue] = useState('');

  // Scrolls the chat to the bottom to show the latest message
  //-----
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  //-----

  // Handles sending a new message when the form is submitted
  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();

    // Ignore empty messages
    if (!inputValue.trim()) return;

        // Capture current input value and clear the input field
    const messageContent = inputValue;
    setInputValue('');

    // Add message to the list using the functional updater to avoid stale state
    setMessages((prevMessages) => {
      const nextId =
        prevMessages.length > 0
          ? prevMessages[prevMessages.length - 1].id + 1
          : 1;

      const newMessage: Message = {
        id: nextId,
        sender: currentUser,
        recipient: otherUser,
        content: messageContent,
        timestamp: new Date().toISOString(),
        is_read: false,
      };

      return [...prevMessages, newMessage];
    });

    // Simulate a response after 1 second (replace with real backend call later)
    //-------
    setTimeout(() => {
      setMessages((prevMessages) => {
        const nextId =
          prevMessages.length > 0
            ? prevMessages[prevMessages.length - 1].id + 1
            : 1;

        const responseMessage: Message = {
          id: nextId,
          sender: otherUser,
          recipient: currentUser,
          content: 'This is a demo response.',
          timestamp: new Date().toISOString(),
          is_read: false,
        };

        return [...prevMessages, responseMessage];
      });
    }, 1000);
	//-------

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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-secondary-beige backdrop-blur-sm rounded-lg shadow-xl border border-secondary-beige flex flex-col h-[600px]">
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
  );
}
