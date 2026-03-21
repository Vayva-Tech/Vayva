/* eslint-disable no-restricted-syntax */
"use client";

import React from "react";
import Link from "next/link";
import { Button, Icon, cn } from "@vayva/ui";
import { SoftCard } from "./SoftCard";

export interface AIAssistantBlockProps {
  conversations: number;
  conversions: number;
  isLive?: boolean;
}

export function AIAssistantBlock({
  conversations,
  conversions,
  isLive = true,
}: AIAssistantBlockProps) {
  return (
    <SoftCard 
      className="bg-status-success/10 border-status-success/20"
      role="region"
      aria-label="AI Assistant Statistics"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-full bg-status-success flex items-center justify-center"
            aria-hidden="true"
          >
            <Icon name="Sparkle" className="text-white h-4 w-4" />
          </div>
          <span className="font-heading font-bold text-gray-900">
            Vayva AI
          </span>
        </div>
        {isLive && (
          <div 
            className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-status-success/20 border border-status-success/30"
            role="status"
            aria-live="polite"
            aria-label="AI Assistant is live and active"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" aria-hidden="true" />
            <span className="text-[10px] font-bold text-status-success uppercase tracking-tight">
              Live
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            Conversations
          </div>
          <div className="text-2xl font-black text-gray-900">
            {conversations}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            Conversions
          </div>
          <div className="text-2xl font-black text-gray-900">
            {conversions}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-status-success/20">
        <Link href="/dashboard/ai/chat">
          <Button className="w-full">
            View Conversations
            <Icon name="ArrowRight" className="h-3 w-3 ml-2" />
          </Button>
        </Link>
      </div>
    </SoftCard>
  );
}
