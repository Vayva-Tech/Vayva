"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button, Icon, cn } from "@vayva/ui";
import { motion, AnimatePresence } from "framer-motion";
import { VAYVA_CONSENT_CHANGED_EVENT } from "@/lib/analytics";

function notifyConsentChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(VAYVA_CONSENT_CHANGED_EVENT));
  }
}

export const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem("vayva_cookie_consent");
    if (!consent) {
      setTimeout(() => setIsVisible(true), 0);
    }
  }, []);

  const handleAcceptAll = () => {
    const consent = {
      necessary: true,
      analytics: true,
      marketing: true,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem("vayva_cookie_consent", JSON.stringify(consent));
    notifyConsentChanged();
    setIsVisible(false);
  };

  const handleRejectNonEssential = () => {
    const consent = {
      necessary: true,
      analytics: false,
      marketing: false,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem("vayva_cookie_consent", JSON.stringify(consent));
    notifyConsentChanged();
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    const consent = { ...preferences, updatedAt: new Date().toISOString() };
    localStorage.setItem("vayva_cookie_consent", JSON.stringify(consent));
    notifyConsentChanged();
    setIsVisible(false);
    setShowPreferences(false);
  };

  if (!isVisible) return null;

  return (
    <>
      <AnimatePresence>
        {isVisible && !showPreferences && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-6 right-6 z-[100] md:left-auto md:right-6 md:translate-x-0 md:w-[420px]"
          >
            <div className="bg-white/[0.22] backdrop-blur-2xl border border-white/[0.40] shadow-card rounded-2xl p-4 md:p-4">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-foreground mb-1">
                    Cookies & Privacy
                  </h3>
                  <p className="text-xs text-muted-foreground leading-snug">
                    We use cookies to enhance your browsing experience, serve
                    personalized ads or content, and analyze our traffic. By
                    clicking "Accept All", you consent to our use of cookies.
                    Read our{" "}
                    <Link
                      href="/legal/cookies"
                      className="text-foreground underline font-medium"
                    >
                      Cookie Policy
                    </Link>
                    .
                  </p>
                </div>
                <div className="flex flex-col gap-2 w-full md:w-auto shrink-0">
                  <Button
                    type="button"
                    onClick={handleAcceptAll}
                    className="!bg-foreground !text-background !rounded-lg h-8 text-xs whitespace-nowrap px-4"
                  >
                    Accept All
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRejectNonEssential}
                      className="flex-1 text-muted-foreground hover:text-foreground h-7 text-xs px-2"
                    >
                      Reject
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPreferences(true)}
                      className="flex-1 text-muted-foreground hover:text-foreground h-7 text-xs px-2"
                    >
                      Manage
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preferences Modal */}
      <AnimatePresence>
        {showPreferences && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/[0.22] backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/[0.40] w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-border/60 flex items-center justify-between">
                <h3 className="font-bold text-lg">Cookie Preferences</h3>
                <Button
                  type="button"
                  onClick={() => setShowPreferences(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  aria-label="Close cookie preferences"
                >
                  <Icon name="X" size={20} />
                </Button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm">Necessary Cookies</h4>
                    <p className="text-xs text-muted-foreground">
                      Essential for the website to function.
                    </p>
                  </div>
                  <div className="w-10 h-5 bg-foreground rounded-full relative">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm">Analytics</h4>
                    <p className="text-xs text-muted-foreground">
                      Help us understand how visitors interact with the site.
                    </p>
                  </div>
                  <Button
                    type="button"
                    role="switch"
                    aria-checked={preferences.analytics}
                    aria-label="Analytics cookies"
                    onClick={() =>
                      setPreferences({
                        ...preferences,
                        analytics: !preferences.analytics,
                      })
                    }
                    className={cn(
                      "w-10 h-5 rounded-full relative transition-colors",
                      preferences.analytics ? "bg-foreground" : "bg-muted",
                    )}
                  >
                    <div
                      className={cn(
                        "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                        preferences.analytics ? "right-1" : "left-1",
                      )}
                    ></div>
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm">Marketing</h4>
                    <p className="text-xs text-muted-foreground">
                      Used to deliver more relevant advertisements.
                    </p>
                  </div>
                  <Button
                    type="button"
                    role="switch"
                    aria-checked={preferences.marketing}
                    aria-label="Marketing cookies"
                    onClick={() =>
                      setPreferences({
                        ...preferences,
                        marketing: !preferences.marketing,
                      })
                    }
                    className={cn(
                      "w-10 h-5 rounded-full relative transition-colors",
                      preferences.marketing ? "bg-foreground" : "bg-muted",
                    )}
                  >
                    <div
                      className={cn(
                        "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                        preferences.marketing ? "right-1" : "left-1",
                      )}
                    ></div>
                  </Button>
                </div>
              </div>
              <div className="p-6 bg-muted/50 flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowPreferences(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSavePreferences}
                  className="flex-1 !bg-foreground !text-background"
                >
                  Save Preferences
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
