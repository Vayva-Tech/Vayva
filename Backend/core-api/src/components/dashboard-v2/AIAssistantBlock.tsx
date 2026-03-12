"use client";

import React from "react";
import { Icon, Button } from "@vayva/ui";
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
    <SoftCard className="bg-emerald-500/10 border-emerald-500/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
            <Icon name="Sparkle" className="text-white h-4 w-4" />
          </div>
          <span className="font-heading font-bold text-emerald-900">
            Vayva AI
          </span>
        </div>
        {isLive && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-tight">
              Live
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] font-bold text-emerald-700/60 uppercase tracking-widest mb-1">
            Conversations
          </div>
          <div className="text-2xl font-black text-emerald-900">
            {conversations}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-emerald-700/60 uppercase tracking-widest mb-1">
            Conversions
          </div>
          <div className="text-2xl font-black text-emerald-900">
            {conversions}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-emerald-500/20">
        <Button
          className="w-full h-9 bg-emerald-500 hover:bg-emerald-600 text-white border-none"
          size="sm"
        >
          View Conversations
          <Icon name="ArrowRight" className="h-3 w-3 ml-2" />
        </Button>
      </div>
    </SoftCard>
  );
}
