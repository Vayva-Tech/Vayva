"use client";

import React from "react";
import { ChatCircle as MessageCircle } from "@phosphor-icons/react/ssr";
import { Button } from "@vayva/ui";

interface WhatsAppShareProps {
  text: string;
  url?: string;
}

export function WhatsAppShare({
  text,
  url,
}: WhatsAppShareProps): React.JSX.Element {
  const handleShare = () => {
    const shareUrl =
      url || (typeof window !== "undefined" ? window.location.href : "");
    const encodedText = encodeURIComponent(`${text}\n${shareUrl}`);
    window.open(`https://wa.me/?text=${encodedText}`, "_blank");
  };

  return (
    <div className="fixed bottom-24 right-4 z-40 md:static md:z-auto">
      <Button
        onClick={handleShare}
        className="rounded-full w-14 h-14 md:w-auto md:h-10 md:rounded-lg md:px-4 bg-[#25D366] hover:bg-[#128C7E] text-white shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95"
        aria-label="Share on WhatsApp"
      >
        <MessageCircle size={24} className="md:w-5 md:h-5" />
        <span className="hidden md:inline font-bold">Share</span>
      </Button>
    </div>
  );
}
