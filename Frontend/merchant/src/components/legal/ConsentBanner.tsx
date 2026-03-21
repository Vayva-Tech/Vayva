"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@vayva/ui";
import { X } from "@phosphor-icons/react/ssr";

export function ConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: true,
    performance: true,
  });

  useEffect(() => {
    const consent = localStorage.getItem("vayva_consent");
    const storedPrefs = localStorage.getItem("vayva_consent_preferences");
    if (storedPrefs) {
      try {
        const parsed = JSON.parse(storedPrefs);
        // Use queueMicrotask to avoid cascading renders (satisfies react-compiler)
        queueMicrotask(() => setPreferences((prev) => ({ ...prev, ...parsed })));
      } catch {
        // ignore malformed data
      }
    }
    if (!consent) {
      setTimeout(() => setIsVisible(true), 0);
    }
  }, []);

  const handleAccept = () => {
    const updated = Object.fromEntries(
      Object.keys(preferences).map((key) => [key, true]),
    );
    setPreferences(updated as typeof preferences);
    localStorage.setItem("vayva_consent", "true");
    localStorage.setItem("vayva_consent_preferences", JSON.stringify(updated));
    setIsVisible(false);
  };

  const handleSave = () => {
    localStorage.setItem("vayva_consent", "true");
    localStorage.setItem("vayva_consent_preferences", JSON.stringify(preferences));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const preferenceDetails: { key: keyof typeof preferences; title: string; description: string; locked?: boolean }[] = [
    {
      key: "essential",
      title: "Essential",
      description: "Keeps your account secure and sessions running.",
      locked: true,
    },
    {
      key: "analytics",
      title: "Analytics",
      description: "Helps us understand usage so we can improve features.",
    },
    {
      key: "performance",
      title: "Performance",
      description: "Remembers preferences and keeps things fast.",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border border-studio-border/70 bg-white/95  shadow-[0_20px_80px_-30px_rgba(15,23,42,0.45)] px-4 py-5 md:px-8 transition-transform duration-300">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1 md:pr-8">
            <h3 className="font-semibold text-gray-900 text-base mb-1">
              We value your privacy
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              We use cookies to enhance your experience, analyze site usage, and ensure secure operation. By
              continuing to browser, you agree to our{" "}
              <a
                href="https://vayva.com/legal/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-500 font-semibold hover:underline"
              >
                Cookie Policy
              </a>
              .
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0" aria-live="polite">
            {!showPreferences && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreferences(true)}
                  className="border-studio-border text-gray-900 hover:bg-studio-gray"
                >
                  Configure
                </Button>
                <Button size="sm" onClick={handleAccept} className="bg-green-500 text-white hover:bg-green-600">
                  Accept all
                </Button>
              </>
            )}
            {showPreferences && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreferences(false)}
                className="text-gray-500 hover:text-gray-900"
              >
                Back
              </Button>
            )}
          </div>
        </div>

        {showPreferences && (
          <div className="rounded-2xl border border-studio-border bg-white/90 p-4 md:p-6 shadow-[0_25px_90px_-35px_rgba(15,23,42,0.35)] space-y-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <h4 className="text-base font-semibold text-gray-900">Manage cookie preferences</h4>
                <p className="text-sm text-gray-500">
                  Toggle the non-essential categories to control how we personalize your experience.
                </p>
              </div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Optional</span>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {preferenceDetails.map(({ key, title, description, locked }) => (
                <label
                  key={key}
                  className="flex items-start gap-3 rounded-2xl border border-studio-border bg-white px-4 py-3 shadow-[0_10px_40px_-25px_rgba(15,23,42,0.45)]"
                >
                  <input
                    type="checkbox"
                    checked={preferences[key]}
                    disabled={locked}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPreferences((prev) => ({
                        ...prev,
                        [key]: e.target.checked,
                      }))
                    }
                    className="mt-1 h-4 w-4 rounded border-studio-border text-green-500 focus:ring-green-500 focus:ring-offset-0"
                    aria-label={`${title} cookies`}
                  />
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900 capitalize flex items-center gap-2">
                      {title}
                      {locked && (
                        <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 text-[10px] font-semibold px-2 py-0.5">
                          Required
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex flex-wrap justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreferences(false)}
                className="border-studio-border text-gray-900 hover:bg-studio-gray"
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} className="bg-green-500 text-white hover:bg-green-600">
                Save preferences
              </Button>
            </div>
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsVisible(false)}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 md:hidden h-auto w-auto p-1"
        aria-label="Close consent banner"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
