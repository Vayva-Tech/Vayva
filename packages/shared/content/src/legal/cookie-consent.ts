/**
 * COOKIE CONSENT REGISTRY & BANNER SYSTEM
 * 
 * GDPR/ePrivacy Directive compliant cookie consent management
 * Zero external dependencies - fully self-built
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type CookieCategory = 'essential' | 'functional' | 'analytics' | 'marketing';

export interface CookieDefinition {
  name: string;
  purpose: string;
  duration: string;
  category: CookieCategory;
  provider: string;
}

export interface CookieConsentState {
  essential: boolean; // Always true - cannot be disabled
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  lastUpdated: string;
  version: string;
}

// ============================================================================
// COOKIE DEFINITIONS - COMPLETE INVENTORY
// ============================================================================

export const COOKIES: Record<CookieCategory, CookieDefinition[]> = {
  essential: [
    {
      name: 'session_id',
      purpose: 'Maintains your login session and shopping cart',
      duration: 'Browser session (deleted when you close browser)',
      category: 'essential',
      provider: 'Vayva',
    },
    {
      name: 'auth_token',
      purpose: 'Keeps you logged in securely',
      duration: '30 days',
      category: 'essential',
      provider: 'Vayva',
    },
    {
      name: 'csrf_token',
      purpose: 'Protects against CSRF attacks and verifies request authenticity',
      duration: '1 year',
      category: 'essential',
      provider: 'Vayva',
    },
    {
      name: 'cookie_consent',
      purpose: 'Stores your cookie consent preferences',
      duration: '12 months',
      category: 'essential',
      provider: 'Vayva',
    },
  ],
  
  functional: [
    {
      name: 'preferred_language',
      purpose: 'Remembers your language preference',
      duration: '1 year',
      category: 'functional',
      provider: 'Vayva',
    },
    {
      name: 'preferred_currency',
      purpose: 'Remembers your preferred currency for pricing display',
      duration: '1 year',
      category: 'functional',
      provider: 'Vayva',
    },
    {
      name: 'recently_viewed',
      purpose: 'Shows products you recently viewed for easy return',
      duration: '30 days',
      category: 'functional',
      provider: 'Vayva',
    },
  ],
  
  analytics: [
    {
      name: '_ga',
      purpose: 'Google Analytics - distinguishes unique users',
      duration: '26 months',
      category: 'analytics',
      provider: 'Google LLC',
    },
    {
      name: '_gid',
      purpose: 'Google Analytics - tracks page views and session data',
      duration: '24 hours',
      category: 'analytics',
      provider: 'Google LLC',
    },
    {
      name: '_gat',
      purpose: 'Google Analytics - throttles request rate',
      duration: '1 minute',
      category: 'analytics',
      provider: 'Google LLC',
    },
    {
      name: '_hjSession_XXXXX',
      purpose: 'Hotjar - tracks session information for heatmaps',
      duration: '30 minutes',
      category: 'analytics',
      provider: 'Hotjar Ltd.',
    },
    {
      name: '_hjAbsoluteSessionInProgress',
      purpose: 'Hotjar - detects first pageview session',
      duration: '30 minutes',
      category: 'analytics',
      provider: 'Hotjar Ltd.',
    },
  ],
  
  marketing: [
    {
      name: '_gcl_au',
      purpose: 'Google Ads - measures ad performance and conversions',
      duration: '540 days (90 days + 450 day lookback)',
      category: 'marketing',
      provider: 'Google LLC',
    },
    {
      name: '_gcl_aw',
      purpose: 'Google Ads - links clicks to conversions',
      duration: '90 days',
      category: 'marketing',
      provider: 'Google LLC',
    },
    {
      name: '_fbp',
      purpose: 'Facebook Pixel - delivers targeted ads and tracks conversions',
      duration: '180 days',
      category: 'marketing',
      provider: 'Meta Platforms Inc.',
    },
    {
      name: '_ttp',
      purpose: 'TikTok Pixel - tracks conversions from TikTok ads',
      duration: '180 days',
      category: 'marketing',
      provider: 'TikTok Ltd.',
    },
    {
      name: 'li_fat_id',
      purpose: 'LinkedIn Insight Tag - tracks conversions and retargeting',
      duration: '90 days',
      category: 'marketing',
      provider: 'LinkedIn Corporation',
    },
    {
      name: 'MUID',
      purpose: 'Microsoft Advertising - unique user identification',
      duration: '1 year',
      category: 'marketing',
      provider: 'Microsoft Corporation',
    },
  ],
};

// ============================================================================
// DEFAULT CONSENT STATE
// ============================================================================

export const DEFAULT_CONSENT: CookieConsentState = {
  essential: true, // Cannot be disabled
  functional: false, // Opt-in required
  analytics: false, // Opt-in required (GDPR)
  marketing: false, // Opt-in required (GDPR)
  lastUpdated: new Date().toISOString(),
  version: '1.0',
};

// ============================================================================
// CONSENT MANAGEMENT FUNCTIONS
// ============================================================================

const CONSENT_COOKIE_NAME = 'vayva_cookie_consent';

/**
 * Get current consent state from localStorage
 */
export function getConsentState(): CookieConsentState {
  if (typeof window === 'undefined') {
    return DEFAULT_CONSENT;
  }
  
  try {
    const stored = localStorage.getItem(CONSENT_COOKIE_NAME);
    if (!stored) {
      return DEFAULT_CONSENT;
    }
    return JSON.parse(stored) as CookieConsentState;
  } catch (error) {
    console.error('Failed to parse cookie consent:', error);
    return DEFAULT_CONSENT;
  }
}

/**
 * Save consent state to localStorage
 */
export function saveConsentState(consent: CookieConsentState): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  consent.lastUpdated = new Date().toISOString();
  localStorage.setItem(CONSENT_COOKIE_NAME, JSON.stringify(consent));
  
  // Dispatch custom event for other components to listen
  window.dispatchEvent(new CustomEvent('cookie-consent-change', { detail: consent }));
}

/**
 * Check if specific cookie category is allowed
 */
export function isCookieAllowed(category: CookieCategory): boolean {
  if (category === 'essential') return true;
  
  const consent = getConsentState();
  return consent[category] ?? false;
}

/**
 * Load third-party scripts based on consent
 */
export function loadThirdPartyScripts(consent: CookieConsentState): void {
  // Google Analytics
  if (consent.analytics && typeof window !== 'undefined') {
    const gaScript = document.createElement('script');
    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
    gaScript.async = true;
    document.head.appendChild(gaScript);
    
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    gtag('js', new Date());
    gtag('config', 'GA_MEASUREMENT_ID', {
      anonymize_ip: true, // GDPR requirement
    });
  }
  
  // Hotjar
  if (consent.analytics && typeof window !== 'undefined') {
    const hjScript = document.createElement('script');
    hjScript.innerHTML = `
      (function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:YOUR_HOTJAR_ID,hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
      })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
    `;
    document.head.appendChild(hjScript);
  }
  
  // Facebook Pixel
  if (consent.marketing && typeof window !== 'undefined') {
    const fbScript = document.createElement('script');
    fbScript.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', 'YOUR_PIXEL_ID');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(fbScript);
  }
  
  // Add more scripts as needed (TikTok, LinkedIn, etc.)
}

/**
 * Reset all consent (for "Reject All" button)
 */
export function resetConsent(): CookieConsentState {
  const reset = { ...DEFAULT_CONSENT };
  saveConsentState(reset);
  return reset;
}

/**
 * Accept all cookies (for "Accept All" button)
 */
export function acceptAll(): CookieConsentState {
  const all = {
    essential: true,
    functional: true,
    analytics: true,
    marketing: true,
    lastUpdated: new Date().toISOString(),
    version: '1.0',
  };
  saveConsentState(all);
  loadThirdPartyScripts(all);
  return all;
}
