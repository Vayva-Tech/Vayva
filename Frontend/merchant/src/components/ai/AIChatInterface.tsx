/**
 * Enhanced AI Chat Interface - ChatGPT Style
 * Features conversation history, threading, and smart context awareness
 */
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  PaperPlaneRight, 
  ChatCircle, 
  User, 
  Robot, 
  Sparkle,
  Trash,
  ArrowClockwise,
  ThumbsUp,
  ThumbsDown,
  Warning,
  CheckCircle,
  Clock,
  DotsThree,
  MagnifyingGlass,
  Funnel
} from '@phosphor-icons/react';
import { useAccessControl } from '@/hooks/use-access-control';
import { getThemeColors } from '@/lib/design-system/theme-components';
import { IndustrySlug } from '@/lib/templates/types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  thinking?: string;
  confidence?: number;
  tokensUsed?: number;
}

interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  industry: IndustrySlug;
}

interface AIChatInterfaceProps {
  industry: IndustrySlug;
  storeId: string;
  merchantId: string;
}

export function AIChatInterface({ industry, storeId, merchantId }: AIChatInterfaceProps) {
  void merchantId;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'today' | 'week'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const colors = getThemeColors(industry);

  // Load conversations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`ai_conversations_${storeId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(parsed.map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        })));
      } catch (e) {
        console.error('Failed to parse conversations:', e);
      }
    }
  }, [storeId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  // Save conversations to localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem(`ai_conversations_${storeId}`, JSON.stringify(conversations));
    }
  }, [conversations, storeId]);

  const createNewConversation = () => {
    const newConv: Conversation = {
      id: `conv_${Date.now()}`,
      title: 'New Conversation',
      messages: [{
        id: 'welcome-1',
        role: 'system',
        content: `Hello! I'm your AI assistant for ${industry.replace(/[-_]/g, ' ')} business. I can help you with:\n• Business insights and recommendations\n• Customer service automation\n• Marketing strategy suggestions\n• Operational efficiency tips\n• Industry-specific advice\n\nWhat would you like to discuss today?`,
        timestamp: new Date()
      }],
      createdAt: new Date(),
      updatedAt: new Date(),
      industry
    };
    
    setConversations(prev => [newConv, ...prev]);
    setActiveConversation(newConv);
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeConversation || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    // Update conversation with user message
    const updatedConversation = {
      ...activeConversation,
      messages: [...activeConversation.messages, userMessage],
      updatedAt: new Date(),
      title: activeConversation.title === 'New Conversation' 
        ? input.slice(0, 30) + (input.length > 30 ? '...' : '')
        : activeConversation.title
    };

    setActiveConversation(updatedConversation);
    setConversations(prev => 
      prev.map(conv => 
        conv.id === activeConversation.id ? updatedConversation : conv
      )
    );

    setInput('');
    setIsLoading(true);
    setIsThinking(true);

    // Simulate AI thinking process
    const thinkingSteps = [
      "Analyzing your question...",
      "Retrieving relevant business context...",
      "Generating personalized response...",
      "Reviewing for accuracy and relevance..."
    ];

    let thinkingIndex = 0;
    const thinkingInterval = setInterval(() => {
      if (thinkingIndex < thinkingSteps.length) {
        // Update UI with thinking process (would be implemented with real AI)
        thinkingIndex++;
      } else {
        clearInterval(thinkingInterval);
        setIsThinking(false);
      }
    }, 800);

    try {
      const res = await fetch('/merchant/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...updatedConversation.messages, userMessage]
            .filter(m => m.role !== 'system')
            .map(m => ({ role: m.role, content: m.content })),
          conversationId: updatedConversation.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to get AI response');
      }

      const data = await res.json();
      const assistantText =
        typeof data?.message === 'string'
          ? data.message
          : typeof data?.data?.message === 'string'
            ? data.data.message
            : "I'm not sure how to help with that.";

      const aiResponse: ChatMessage = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: assistantText,
        timestamp: new Date(),
      };

      const finalConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, aiResponse],
        updatedAt: new Date()
      };

      setActiveConversation(finalConversation);
      setConversations(prev => 
        prev.map(conv => 
          conv.id === activeConversation.id ? finalConversation : conv
        )
      );
    } catch (error) {
      console.error('AI response error:', error);
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content:
          error instanceof Error
            ? error.message
            : "I apologize, I'm experiencing some technical difficulties right now. Please try again in a moment.",
        timestamp: new Date()
      };

      const errorConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, errorMessage],
        updatedAt: new Date()
      };

      setActiveConversation(errorConversation);
      setConversations(prev => 
        prev.map(conv => 
          conv.id === activeConversation.id ? errorConversation : conv
        )
      );
    } finally {
      setIsLoading(false);
      setIsThinking(false);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.messages.some(msg => 
                           msg.content.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    if (filter === 'today') {
      return matchesSearch && isToday(conv.updatedAt);
    } else if (filter === 'week') {
      return matchesSearch && isThisWeek(conv.updatedAt);
    }
    return matchesSearch;
  });

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isThisWeek = (date: Date) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return date > weekAgo;
  };

  return (
    <div className="flex h-[calc(100vh-200px)] max-h-[800px] bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Sidebar - Conversations List */}
      <div className="w-80 border-r border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Sparkle className="h-5 w-5 text-green-500" />
              AI Assistant
            </h2>
            <Button 
              size="sm" 
              onClick={createNewConversation}
              className="h-8"
              style={{ backgroundColor: colors.primary }}
            >
              <ChatCircle className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>
          
          <div className="relative mb-3">
            <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-100 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <div className="flex gap-1">
            {(['all', 'today', 'week'] as const).map((option) => (
              <Button
                key={option}
                onClick={() => setFilter(option)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  filter === option 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-100'
                }`}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence>
            {filteredConversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors ${
                  activeConversation?.id === conversation.id ? 'bg-gray-100' : ''
                }`}
                onClick={() => setActiveConversation(conversation)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-sm truncate flex-1">
                    {conversation.title}
                  </h3>
                  <span
                    className="inline-flex items-center rounded-md border border-gray-100 px-2 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: `${colors.primary}15`,
                      color: colors.primary,
                    }}
                  >
                    {conversation.industry.replace(/[-_]/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate mb-2">
                  {conversation.messages.length} messages
                </p>
                <p className="text-xs text-gray-500">
                  {conversation.updatedAt.toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredConversations.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <ChatCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No conversations found</p>
              <p className="text-xs mt-1">Start a new chat to begin</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{activeConversation.title}</h3>
                <p className="text-sm text-gray-500">
                  {activeConversation.messages.length} messages • Last updated{' '}
                  {activeConversation.updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Trash className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <AnimatePresence>
                {activeConversation.messages
                  .filter(msg => msg.role !== 'system')
                  .map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex gap-3 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                          <Robot className="h-4 w-4 text-green-500" />
                        </div>
                      )}
                      
                      <div 
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-green-500 text-white rounded-br-md'
                            : 'bg-gray-100'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        
                        {message.confidence && (
                          <div className="flex items-center gap-2 mt-2 text-xs opacity-80">
                            <span>Confidence: {(message.confidence * 100).toFixed(0)}%</span>
                            {message.tokensUsed && (
                              <span>{message.tokensUsed} tokens</span>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 mt-2 text-xs opacity-60">
                          <Clock className="h-3 w-3" />
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                      
                      {message.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                    </motion.div>
                  ))
                }
              </AnimatePresence>
              
              {isThinking && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <Robot className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <DotsThree className="h-4 w-4 animate-pulse" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Ask me anything about your business..."
                  className="flex-1 resize-none"
                  disabled={isLoading}
                  rows={3}
                />
                <Button 
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="self-end h-12"
                  style={{ backgroundColor: colors.primary }}
                >
                  <PaperPlaneRight className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-6"
              >
                <div 
                  className="w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${colors.primary}15` }}
                >
                  <Sparkle className="h-12 w-12" style={{ color: colors.primary }} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Welcome to AI Assistant</h3>
                <p className="text-gray-500">
                  Get business insights, automate customer service, and optimize your operations with AI-powered assistance tailored to your {industry.replace(/[-_]/g, ' ')} business.
                </p>
              </motion.div>
              
              <div className="grid grid-cols-2 gap-3 mt-8">
                {[
                  "Analyze sales trends",
                  "Optimize pricing strategy", 
                  "Improve customer retention",
                  "Automate responses"
                ].map((suggestion, index) => (
                  <motion.button
                    key={suggestion}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => {
                      setInput(suggestion);
                      if (!activeConversation) createNewConversation();
                    }}
                    className="p-3 text-left rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors text-sm"
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
              
              <Button 
                onClick={createNewConversation}
                className="mt-6"
                size="lg"
                style={{ backgroundColor: colors.primary }}
              >
                <ChatCircle className="h-5 w-5 mr-2" />
                Start New Conversation
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Note: previously simulated responses were removed; this component now calls `/api/merchant/ai-chat`.