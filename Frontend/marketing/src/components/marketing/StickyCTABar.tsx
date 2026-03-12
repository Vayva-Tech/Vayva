"use client";

import React, { useState, useEffect } from "react";
import * as motion from "framer-motion/client";
import { Button } from "@vayva/ui";
import { IconBrandWhatsapp as WhatsappLogo, IconX as X } from "@tabler/icons-react";
import { APP_URL } from "@/lib/constants";

export function StickyCTABar(): React.JSX.Element | null {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 30% of viewport height
      const scrollPercent = (window.scrollY / window.innerHeight) * 100;
      setIsVisible(scrollPercent > 30);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible || isDismissed) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border shadow-2xl"
    >
      <div className="max-w-[1760px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Left: Message */}
        <div className="hidden md:block">
          <p className="text-sm font-bold text-foreground">
            Ready to turn WhatsApp chats into cash? 🚀
          </p>
          <p className="text-xs text-muted-foreground">
            Join 500+ Nigerian sellers using Vayva
          </p>
        </div>

        {/* Right: CTAs */}
        <div className="flex items-center gap-3 flex-1 md:flex-initial">
          <a
            href={`${APP_URL}/signup`}
            className="flex-1 md:flex-initial"
          >
            <Button className="w-full md:w-auto px-6 py-2.5 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 font-bold text-sm">
              Start Free Trial
            </Button>
          </a>
          <a
            href="https://wa.me/2349160000000?text=Hi%20Vayva%2C%20I'm%20interested%20in%20starting%20a%20free%20trial"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:block"
          >
            <Button variant="outline" className="px-4 py-2.5 border-emerald-500 text-emerald-700 hover:bg-emerald-50 text-sm">
              <WhatsappLogo className="w-4 h-4 mr-2" />
              Ask on WhatsApp
            </Button>
          </a>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-2 hover:bg-muted rounded-full transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
