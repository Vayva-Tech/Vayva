"use client";

import React from "react";
import { urls } from "@vayva/shared";
import { IconBrandWhatsapp as WhatsappLogo, IconShare as ShareNetwork } from "@tabler/icons-react";

interface WhatsAppShareProps {
  url?: string;
  title?: string;
  description?: string;
  className?: string;
  variant?: "button" | "icon" | "floating";
}

export function WhatsAppShareButton({
  url = urls.marketingBase(),
  title = "Check out Vayva",
  description = "Turns WhatsApp into a real business! Accept Paystack payments, manage orders, get daily payouts in Naira.",
  className = "",
  variant = "button",
}: WhatsAppShareProps): React.JSX.Element {
  const shareText = encodeURIComponent(`${title}\n\n${description}\n\n${url}`);
  const whatsappUrl = `https://wa.me/?text=${shareText}`;

  if (variant === "icon") {
    return (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white transition-colors ${className}`}
        aria-label="Share on WhatsApp"
      >
        <WhatsappLogo className="w-5 h-5" />
      </a>
    );
  }

  if (variant === "floating") {
    return (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed bottom-24 right-4 z-30 flex items-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all ${className}`}
      >
        <ShareNetwork className="w-5 h-5" />
        <span className="text-sm font-bold hidden sm:inline">Share</span>
      </a>
    );
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors ${className}`}
    >
      <WhatsappLogo className="w-5 h-5" />
      <span>Share on WhatsApp</span>
    </a>
  );
}

// Pre-configured share buttons for specific contexts
export function ShareTestimonial({
  merchantName,
  quote,
}: {
  merchantName: string;
  quote: string;
}): React.JSX.Element {
  const site = urls.marketingBase();
  const shareText = encodeURIComponent(
    `"${quote}" — ${merchantName} using Vayva to sell on WhatsApp 💚\n\nStart your own WhatsApp store: ${site}`,
  );
  const whatsappUrl = `https://wa.me/?text=${shareText}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
    >
      <WhatsappLogo className="w-3.5 h-3.5" />
      Share this story
    </a>
  );
}

export function SharePage({ className = "" }: { className?: string }): React.JSX.Element {
  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 ${className}`}>
      <span className="text-sm font-medium text-foreground">Know a seller who needs this?</span>
      <WhatsAppShareButton
        title="Vayva — WhatsApp Business Platform for Nigeria"
        description="Accept Paystack payments, manage orders, get Naira payouts. Built for Nigerian merchants."
        variant="button"
      />
    </div>
  );
}
