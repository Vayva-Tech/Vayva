/**
 * COOKIE CONSENT BANNER COMPONENT
 * 
 * GDPR-compliant cookie consent banner with granular controls
 * Zero external dependencies - fully self-built
 */
'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { X, Settings, Check, Info } from 'lucide-react';
import {
  getConsentState,
  saveConsentState,
  acceptAll,
  resetConsent,
  isCookieAllowed,
  loadThirdPartyScripts,
  COOKIES,
  CookieConsentState,
} from './cookie-consent';

type CookieButtonProps = {
  onClick?: () => void;
  className?: string;
  "aria-label"?: string;
  children: ReactNode;
};

function CookieButton(props: CookieButtonProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={props.onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") props.onClick?.();
      }}
      className={props.className}
      aria-label={props["aria-label"]}
    >
      {props.children}
    </div>
  );
}

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsent] = useState<CookieConsentState | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    queueMicrotask(() => {
      setConsent(getConsentState());
      const hasMadeChoice = localStorage.getItem('vayva_cookie_consent');
      if (!hasMadeChoice) {
        timer = setTimeout(() => setIsVisible(true), 2000);
      }
    });
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleAcceptAll = () => {
    const newConsent = acceptAll();
    setConsent(newConsent);
    setIsVisible(false);
    
    // Track in backend analytics
    if (typeof window !== 'undefined') {
      const visitorId = generateVisitorId();
      
      fetch('/api/analytics/cookie-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId,
          sessionId: getSessionId(),
          choice: 'accept',
          categories: {
            essential: true,
            functional: true,
            analytics: true,
            marketing: true,
          },
          userAgent: navigator.userAgent,
          referer: window.location.href,
        }),
      }).catch(err => console.error('Failed to track consent:', err));
    }
  };

  const handleRejectAll = () => {
    const newConsent = resetConsent();
    setConsent(newConsent);
    setIsVisible(false);
    
    // Track in backend analytics
    if (typeof window !== 'undefined') {
      const visitorId = generateVisitorId();
      
      fetch('/api/analytics/cookie-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId,
          sessionId: getSessionId(),
          choice: 'reject',
          categories: {
            essential: true,
            functional: false,
            analytics: false,
            marketing: false,
          },
          userAgent: navigator.userAgent,
          referer: window.location.href,
        }),
      }).catch(err => console.error('Failed to track consent:', err));
    }
  };

  const handleSaveSettings = () => {
    if (consent) {
      saveConsentState(consent);
      loadThirdPartyScripts(consent);
      setShowSettings(false);
      setIsVisible(false);
      
      // Track in backend analytics
      if (typeof window !== 'undefined') {
        const visitorId = generateVisitorId();
        
        fetch('/api/analytics/cookie-consent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visitorId,
            sessionId: getSessionId(),
            choice: 'customize',
            categories: {
              essential: true,
              functional: consent.functional,
              analytics: consent.analytics,
              marketing: consent.marketing,
            },
            userAgent: navigator.userAgent,
            referer: window.location.href,
          }),
        }).catch(err => console.error('Failed to track consent:', err));
      }
    }
  };
  
  // Helper functions for tracking
  function generateVisitorId(): string {
    if (typeof window === 'undefined') return '';
    let id = localStorage.getItem('vayva_visitor_id');
    if (!id) {
      id = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('vayva_visitor_id', id);
    }
    return id;
  }
  
  function getSessionId(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('vayva_session_id') || null;
  }
  
  function detectRegion(): string | null {
    // This is a placeholder - implement proper IP geolocation
    // For now, return null and let backend detect from IP
    return null;
  }

  const toggleCategory = (category: keyof CookieConsentState) => {
    if (category === 'essential' || !consent) return;
    
    setConsent({
      ...consent,
      [category]: !consent[category],
    });
  };

  if (!isVisible || !consent) return null;

  return (
    <>
      {/* Main Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl lg:max-w-4xl lg:left-1/2 lg:-translate-x-1/2 lg:bottom-4 lg:rounded-lg">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Info className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  We value your privacy
                </h3>
                <p className="text-sm text-gray-600">
                  We use cookies to enhance your browsing experience and analyze our traffic.
                </p>
              </div>
            </div>
            <CookieButton
              onClick={() => setIsVisible(false)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close banner"
            >
              <X className="w-5 h-5" />
            </CookieButton>
          </div>

          {/* Description */}
          <p className="mb-6 text-sm text-gray-700 leading-relaxed">
            By clicking &quot;Accept All&quot;, you agree to our use of cookies for analytics and marketing. 
            You can customize your preferences or reject non-essential cookies. 
            Learn more in our{' '}
            <a href="/legal/cookie-policy" className="text-blue-600 hover:underline" target="_blank">
              Cookie Policy
            </a>.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <CookieButton
              onClick={handleAcceptAll}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Accept All
            </CookieButton>
            <CookieButton
              onClick={handleRejectAll}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Reject Non-Essential
            </CookieButton>
            <CookieButton
              onClick={() => setShowSettings(!showSettings)}
              className="flex-1 px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors flex items-center justify-center gap-2"
            >
              <Settings className="w-5 h-5" />
              Customize
            </CookieButton>
          </div>

          {/* Privacy Notice */}
          <p className="text-xs text-gray-500 text-center">
            Your choices apply to vayva.ng and are stored for 12 months. You can change them anytime.
          </p>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <h4 className="text-base font-semibold text-gray-900 mb-4">
              Cookie Preferences
            </h4>
            
            <div className="space-y-4">
              {/* Essential Cookies */}
              <div className="flex items-start justify-between p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-medium text-gray-900">Essential Cookies</h5>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                      Always Active
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Required for basic functionality (login, shopping cart, security)
                  </p>
                  <ul className="mt-2 text-xs text-gray-500 space-y-1">
                    {COOKIES.essential.map((cookie) => (
                      <li key={cookie.name}>• {cookie.name}: {cookie.purpose}</li>
                    ))}
                  </ul>
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-not-allowed"
                />
              </div>

              {/* Functional Cookies */}
              <div className="flex items-start justify-between p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-medium text-gray-900">Functional Cookies</h5>
                  </div>
                  <p className="text-sm text-gray-600">
                    Remember your preferences (language, currency, recently viewed)
                  </p>
                  <ul className="mt-2 text-xs text-gray-500 space-y-1">
                    {COOKIES.functional.map((cookie) => (
                      <li key={cookie.name}>• {cookie.name}: {cookie.duration}</li>
                    ))}
                  </ul>
                </div>
                <input
                  type="checkbox"
                  checked={consent.functional}
                  onChange={() => toggleCategory('functional')}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start justify-between p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-medium text-gray-900">Analytics Cookies</h5>
                  </div>
                  <p className="text-sm text-gray-600">
                    Help us understand how visitors use our website (Google Analytics, Hotjar)
                  </p>
                  <ul className="mt-2 text-xs text-gray-500 space-y-1">
                    {COOKIES.analytics.map((cookie) => (
                      <li key={cookie.name}>• {cookie.name}: {cookie.duration}</li>
                    ))}
                  </ul>
                </div>
                <input
                  type="checkbox"
                  checked={consent.analytics}
                  onChange={() => toggleCategory('analytics')}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-start justify-between p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-medium text-gray-900">Marketing Cookies</h5>
                  </div>
                  <p className="text-sm text-gray-600">
                    Used to deliver relevant ads and measure campaign performance (Facebook, Google, TikTok)
                  </p>
                  <ul className="mt-2 text-xs text-gray-500 space-y-1">
                    {COOKIES.marketing.map((cookie) => (
                      <li key={cookie.name}>• {cookie.name}: {cookie.duration}</li>
                    ))}
                  </ul>
                </div>
                <input
                  type="checkbox"
                  checked={consent.marketing}
                  onChange={() => toggleCategory('marketing')}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-6 flex justify-end gap-3">
              <CookieButton
                onClick={() => setShowSettings(false)}
                className="px-6 py-2 text-gray-700 font-medium hover:text-gray-900 transition-colors"
              >
                Cancel
              </CookieButton>
              <CookieButton
                onClick={handleSaveSettings}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Preferences
              </CookieButton>
            </div>
          </div>
        )}
      </div>

      {/* Mobile-friendly overlay when settings open */}
      {showSettings && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowSettings(false)}
        />
      )}
    </>
  );
}
