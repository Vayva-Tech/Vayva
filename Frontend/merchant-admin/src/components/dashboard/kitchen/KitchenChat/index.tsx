'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRealTimeKDS } from '@/hooks/useRealTimeKDS';
import { MessageSquare, Send, ChefHat, Clock } from 'lucide-react';

interface KitchenChatProps {
  storeId: string;
  stationId?: string;
  userId: string;
  userName: string;
}

interface ChatMessage {
  id: string;
  storeId: string;
  stationId?: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: number;
  type: 'text' | 'alert' | 'system';
}

/**
 * KitchenChat Component
 * 
 * Real-time chat for kitchen staff with:
 * - Station-specific channels
 * - Quick message templates
 * - Typing indicators
 * - Audio alerts integration
 */
export function KitchenChat({ storeId, stationId, userId, userName }: KitchenChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Quick message templates for kitchen
  const quickMessages = [
    '🔥 Behind!',
    '⏰ Need expo!',
    '✅ 86\'d item',
    '📋 Order up!',
    '⚠️ Allergy alert!',
    '🔄 Remake needed',
  ];

  /**
   * Scroll to bottom when new messages arrive
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Send message via WebSocket
   */
  const sendMessage = (msg: string) => {
    if (!msg.trim()) return;

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      storeId,
      stationId,
      userId,
      userName,
      message: msg,
      timestamp: Date.now(),
      type: 'text',
    };

    setMessages(prev => [...prev, newMessage]);

    // Broadcast via WebSocket (would integrate with real backend)
    window.dispatchEvent(new CustomEvent('kds:chat-message', { detail: newMessage }));

    setMessage('');
  };

  /**
   * Handle typing indicator
   */
  const handleTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Emit typing event
    window.dispatchEvent(new CustomEvent('kds:typing', {
      storeId,
      stationId,
      userId,
      userName,
    }));

    typingTimeoutRef.current = setTimeout(() => {
      // Stop typing indicator after 2 seconds
    }, 2000);
  };

  /**
   * Listen for incoming messages
   */
  useEffect(() => {
    const handleMessage = (event: CustomEvent) => {
      const msg: ChatMessage = event.detail;
      if (msg.storeId === storeId && (!stationId || msg.stationId === stationId)) {
        setMessages(prev => [...prev, msg]);
      }
    };

    const handleTypingUser = (event: CustomEvent) => {
      const { userId: typingUserId, userName: typingUserName } = event.detail;
      if (typingUserId !== userId) {
        setTypingUsers(prev => [...prev.filter(id => id !== typingUserId), typingUserName]);
        
        // Clear typing indicator after 2 seconds
        setTimeout(() => {
          setTypingUsers(prev => prev.filter(name => name !== typingUserName));
        }, 2000);
      }
    };

    window.addEventListener('kds:chat-message', handleMessage as EventListener);
    window.addEventListener('kds:typing', handleTypingUser as EventListener);

    return () => {
      window.removeEventListener('kds:chat-message', handleMessage as EventListener);
      window.removeEventListener('kds:typing', handleTypingUser as EventListener);
    };
  }, [storeId, stationId, userId]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Toggle Button */}
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <MessageSquare className="h-6 w-6" />
          {messages.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {messages.length}
            </span>
          )}
        </button>
      ) : (
        /* Chat Window */
        <div className="w-80 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChefHat className="h-5 w-5" />
              <span className="font-semibold">Kitchen Chat</span>
              {typingUsers.length > 0 && (
                <span className="text-xs text-blue-200">
                  {typingUsers.join(', ')} typing...
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-blue-200 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="h-64 overflow-y-auto p-3 space-y-2 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.userId === userId ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-lg ${
                    msg.userId === userId
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  {msg.type === 'alert' ? (
                    <div className="flex items-center gap-1 text-red-600 font-semibold">
                      ⚠️ {msg.message}
                    </div>
                  ) : (
                    <>
                      <p className="text-sm">{msg.message}</p>
                      <p className={`text-xs mt-1 ${
                        msg.userId === userId ? 'text-blue-200' : 'text-gray-500'
                      }`}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </>
                  )}
                </div>
                {msg.userId !== userId && (
                  <span className="text-xs text-gray-500 mt-1 ml-1">
                    {msg.userName}
                  </span>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Messages */}
          <div className="p-2 bg-gray-100 border-t border-gray-200">
            <div className="flex flex-wrap gap-1 mb-2">
              {quickMessages.map((quickMsg) => (
                <button
                  key={quickMsg}
                  onClick={() => sendMessage(quickMsg)}
                  className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  {quickMsg}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-200 flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  sendMessage(message);
                }
              }}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => sendMessage(message)}
              disabled={!message.trim()}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
