"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@vayva/ui";
import { X } from "@phosphor-icons/react/ssr";

export function ConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("vayva_consent");
    if (!consent) {
      setTimeout(() => setIsVisible(true), 0);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("vayva_consent", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-xl p-4 md:p-6 transition-transform duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1 pr-8">
          <h3 className="font-semibold text-text-primary mb-1">
            We value your privacy
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            We use cookies to enhance your experience, analyze site usage, and
            ensure secure operation. By continuing to browser, you agree to our{" "}
            <Link
              href="/legal/cookies"
              className="text-blue-600 hover:underline"
            >
              Cookie Policy
            </Link>
            .
          </p>
        </div>
        <div className="flex items-center gap-3 whitespace-nowrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsVisible(false)}
          >
            Config
          </Button>
          <Button
            size="sm"
            onClick={handleAccept}
            className="bg-text-primary text-white hover:bg-text-primary"
          >
            Accept All
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 text-text-tertiary hover:text-text-secondary md:hidden h-auto w-auto p-1"
          aria-label="Close consent banner"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
