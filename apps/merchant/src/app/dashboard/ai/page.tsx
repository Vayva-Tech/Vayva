'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { AIChat } from '../../components/ai-chat';

const AIChatPage = () => {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('query');

  // TODO: Get merchant ID from auth context
  const merchantId = 'merchant_123'; // Placeholder

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-white/40 hover:text-white transition-colors">
              ← Back
            </a>
            <h1 className="text-2xl font-bold text-white">AI Assistant</h1>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="h-[calc(100vh-200px)]">
          <AIChat merchantId={merchantId} />
        </div>
      </div>
    </div>
  );
};

export default AIChatPage;
