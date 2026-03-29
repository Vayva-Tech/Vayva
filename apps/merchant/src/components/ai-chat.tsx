'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAIQuery, useChatHistory, ChatMessage } from '../../lib/ml-gateway';

interface AIChatProps {
  merchantId: string;
  className?: string;
}

export const AIChat: React.FC<AIChatProps> = ({ merchantId, className = '' }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { queryAIPromise, isPending } = useAIQuery();
  const { data: history } = useChatHistory(merchantId);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await queryAIPromise({
        query: input.trim(),
        merchantId,
      });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer,
        timestamp: new Date(),
        source: response.source,
        cost: response.cost,
        latency_ms: response.latency_ms,
        context_used: response.context_used,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI query failed:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your query. Please try again.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const suggestedQueries = [
    "What were my sales yesterday?",
    "Show me my best selling products",
    "Which customers bought the most?",
    "Calculate my profit margin",
  ];

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white">AI Assistant</h2>
        <p className="text-sm text-white/60 mt-1">
          Ask questions about your business data
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-400/20 to-blue-400/20 flex items-center justify-center">
              <span className="text-3xl">🤖</span>
            </div>
            <h3 className="text-white font-medium mb-2">How can I help?</h3>
            <p className="text-sm text-white/60 mb-6">
              Ask me anything about your sales, products, or customers
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl mx-auto">
              {suggestedQueries.map((query) => (
                <button
                  key={query}
                  onClick={() => setInput(query)}
                  className="px-4 py-3 text-sm text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-white/80"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white/10 text-white'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  
                  {message.role === 'assistant' && (
                    <div className="mt-2 flex items-center gap-2 text-xs opacity-60">
                      <span>
                        {message.source === 'local' ? '🏠 Local' : '🌐 Internet'}
                      </span>
                      {message.latency_ms && (
                        <span>• {Math.round(message.latency_ms)}ms</span>
                      )}
                      {message.cost !== undefined && message.cost > 0 && (
                        <span>• ${message.cost.toFixed(4)}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isPending && (
              <div className="flex justify-start">
                <div className="bg-white/10 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your business..."
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-400 transition-colors"
            disabled={isPending}
          />
          
          <button
            type="submit"
            disabled={isPending || !input.trim()}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-white/10 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
          >
            {isPending ? '⏳' : 'Send'}
          </button>
        </div>
        
        <p className="text-xs text-white/40 mt-2 text-center">
          AI-powered insights from your business data
        </p>
      </form>
    </div>
  );
};
